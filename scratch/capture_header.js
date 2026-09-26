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
}

async function capture(outputFilename = 'header_capture.png', width = 1280, height = 800) {
    const tempProfileDir = path.join(__dirname, 'chrome_cap_' + Date.now());
    fs.mkdirSync(tempProfileDir, { recursive: true });

    const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
    const chrome = spawn(chromePath, [
        '--headless=new',
        '--remote-debugging-port=9222',
        `--user-data-dir=${tempProfileDir}`,
        `--window-size=${width},${height}`,
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
        if (!versionData) throw new Error('Chrome failed to start');

        const targets = await fetchJson('http://127.0.0.1:9222/json/list');
        const pageTarget = targets.find(t => t.type === 'page') || targets[0];
        const cdp = new CDPClient(pageTarget.webSocketDebuggerUrl);

        await cdp.send('Page.enable');
        await cdp.send('DOM.enable');
        await cdp.send('Emulation.setDeviceMetricsOverride', {
            width: width,
            height: height,
            deviceScaleFactor: 1,
            mobile: false
        });

        await cdp.send('Page.navigate', { url: 'http://127.0.0.1:5000/' });
        await sleep(1500);

        // Capture screenshot of the top 100px (header)
        const shot = await cdp.send('Page.captureScreenshot', {
            format: 'png',
            clip: {
                x: 0,
                y: 0,
                width: width,
                height: 120,
                scale: 1
            }
        });

        const outPath = path.join(__dirname, outputFilename);
        fs.writeFileSync(outPath, Buffer.from(shot.data, 'base64'));
        console.log(`Saved screenshot to ${outPath}`);
    } finally {
        chrome.kill();
        try { fs.rmSync(tempProfileDir, { recursive: true, force: true }); } catch (e) {}
    }
}

capture().catch(err => {
    console.error(err);
    process.exit(1);
});
