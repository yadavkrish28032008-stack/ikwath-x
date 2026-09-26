const { spawn } = require('child_process');
const http = require('http');
const path = require('path');
const fs = require('fs');

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchJson(url) {
    return new Promise((resolve, reject) => {
        http.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try { resolve(JSON.parse(data)); }
                catch (e) { reject(e); }
            });
        }).on('error', reject);
    });
}

class CDPClient {
    constructor(wsUrl) {
        this.ws = new WebSocket(wsUrl);
        this.id = 1;
        this.callbacks = new Map();
        this.ws.onmessage = (msg) => {
            const data = JSON.parse(msg.data);
            if (data.id && this.callbacks.has(data.id)) {
                const cb = this.callbacks.get(data.id);
                this.callbacks.delete(data.id);
                if (data.error) cb.reject(data.error);
                else cb.resolve(data.result);
            }
        };
    }
    async ready() {
        if (this.ws.readyState === WebSocket.OPEN) return;
        return new Promise((resolve, reject) => {
            this.ws.onopen = resolve;
            this.ws.onerror = reject;
        });
    }
    async send(method, params = {}) {
        await this.ready();
        return new Promise((resolve, reject) => {
            const id = this.id++;
            this.callbacks.set(id, { resolve, reject });
            this.ws.send(JSON.stringify({ id, method, params }));
        });
    }
    async eval(expr) {
        const res = await this.send('Runtime.evaluate', {
            expression: expr,
            returnByValue: true,
            awaitPromise: true
        });
        return res.result ? res.result.value : undefined;
    }
}

async function run() {
    const tempProfileDir = path.join(__dirname, 'chrome_vp_' + Date.now());
    fs.mkdirSync(tempProfileDir, { recursive: true });

    const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
    const chrome = spawn(chromePath, [
        '--headless=new',
        '--remote-debugging-port=9222',
        `--user-data-dir=${tempProfileDir}`,
        '--no-first-run',
        '--no-default-browser-check',
        'about:blank'
    ]);

    try {
        let versionData = null;
        for (let i = 0; i < 20; i++) {
            await sleep(300);
            try {
                versionData = await fetchJson('http://127.0.0.1:9222/json/version');
                if (versionData) break;
            } catch (e) {}
        }

        const targets = await fetchJson('http://127.0.0.1:9222/json/list');
        const pageTarget = targets.find(t => t.type === 'page') || targets[0];
        const cdp = new CDPClient(pageTarget.webSocketDebuggerUrl);

        await cdp.send('Page.enable');
        await cdp.send('DOM.enable');

        const viewports = [1440, 1280, 1100, 1024, 768, 480];

        for (const vp of viewports) {
            await cdp.send('Emulation.setDeviceMetricsOverride', {
                width: vp,
                height: 800,
                deviceScaleFactor: 1,
                mobile: vp <= 768
            });

            await cdp.send('Page.navigate', { url: 'http://127.0.0.1:5000/' });
            await sleep(1000);

            const metrics = await cdp.eval(`(() => {
                const nav = document.querySelector('nav');
                const brand = document.querySelector('.brand');
                const container = document.querySelector('.nav-container');
                const img = document.querySelector('.header-partner-logos');
                return {
                    vp: window.innerWidth,
                    containerWidth: container ? container.offsetWidth : 0,
                    containerHeight: container ? container.offsetHeight : 0,
                    brandWidth: brand ? brand.offsetWidth : 0,
                    brandHeight: brand ? brand.offsetHeight : 0,
                    navWidth: nav ? nav.offsetWidth : 0,
                    navDisplay: nav ? getComputedStyle(nav).display : 'none',
                    imgWidth: img ? img.offsetWidth : 0,
                    imgHeight: img ? img.offsetHeight : 0,
                    hasHorizontalScroll: document.documentElement.scrollWidth > window.innerWidth
                };
            })()`);

            console.log(`Viewport ${vp}px:`, JSON.stringify(metrics));

            const shot = await cdp.send('Page.captureScreenshot', {
                format: 'png',
                clip: {
                    x: 0,
                    y: 0,
                    width: vp,
                    height: 100,
                    scale: 1
                }
            });
            fs.writeFileSync(path.join(__dirname, `header_${vp}.png`), Buffer.from(shot.data, 'base64'));
        }
    } finally {
        chrome.kill();
        try { fs.rmSync(tempProfileDir, { recursive: true, force: true }); } catch (e) {}
    }
}

run().catch(err => {
    console.error(err);
    process.exit(1);
});
