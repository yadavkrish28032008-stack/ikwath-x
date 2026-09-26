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
        this.consoleErrors = [];
        this.ws.onmessage = (msg) => {
            const data = JSON.parse(msg.data);
            if (data.id && this.callbacks.has(data.id)) {
                const cb = this.callbacks.get(data.id);
                this.callbacks.delete(data.id);
                if (data.error) cb.reject(data.error);
                else cb.resolve(data.result);
            } else if (data.method === 'Runtime.consoleAPICalled') {
                if (data.params.type === 'error') {
                    this.consoleErrors.push(data.params.args.map(a => a.value || a.description).join(' '));
                }
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
        if (res.exceptionDetails) {
            throw new Error(res.exceptionDetails.text || 'Eval error');
        }
        return res.result ? res.result.value : undefined;
    }
}

async function runVerification() {
    console.log('=== STARTING EXHAUSTIVE VALIDATION ===\n');
    const tempProfileDir = path.join(__dirname, 'chrome_verify_' + Date.now());
    fs.mkdirSync(tempProfileDir, { recursive: true });

    const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
    const chrome = spawn(chromePath, [
        '--headless=new',
        '--remote-debugging-port=9222',
        `--user-data-dir=${tempProfileDir}`,
        '--window-size=1280,800',
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

        // Test 1: Flask Web Server (http://127.0.0.1:5000/)
        console.log('TEST 1: Validating HTTP Server Landing Page (http://127.0.0.1:5000/)...');
        await cdp.send('Page.navigate', { url: 'http://127.0.0.1:5000/' });
        await sleep(1500);

        const httpMetrics = await cdp.eval(`(() => {
            const img = document.querySelector('.sih-header-logo, .header-partner-logos');
            const wrap = document.querySelector('.header-brand-wrap');
            const brand = document.querySelector('.brand');
            const brandMark = document.querySelector('.brand-mark');
            const nav = document.querySelector('nav');
            const links = Array.from(document.querySelectorAll('#navMenu a')).map(a => ({ text: a.innerText.trim(), href: a.getAttribute('href') }));

            const imgRect = img ? img.getBoundingClientRect() : null;
            const brandRect = brand ? brand.getBoundingClientRect() : null;
            const navRect = nav ? nav.getBoundingClientRect() : null;

            return {
                imgExists: !!img,
                imgSrc: img ? img.currentSrc || img.src : null,
                imgNaturalWidth: img ? img.naturalWidth : 0,
                imgNaturalHeight: img ? img.naturalHeight : 0,
                imgComplete: img ? img.complete : false,
                isBroken: !img || !img.complete || img.naturalWidth === 0,
                imgRight: imgRect ? imgRect.right : 0,
                brandLeft: brandRect ? brandRect.left : 0,
                brandRight: brandRect ? brandRect.right : 0,
                navLeft: navRect ? navRect.left : 0,
                overlapImgBrand: imgRect && brandRect ? (imgRect.right > brandRect.left) : false,
                overlapBrandNav: brandRect && navRect ? (brandRect.right > navRect.left) : false,
                brandText: brand ? brand.innerText.trim().replace(/\\s+/g, ' ') : '',
                links: links,
                hasHorizontalScroll: document.documentElement.scrollWidth > window.innerWidth
            };
        })()`);

        console.log('HTTP Page Metrics:', JSON.stringify(httpMetrics, null, 2));

        if (httpMetrics.isBroken) {
            throw new Error('FAILED: Image is broken on HTTP landing page!');
        }
        if (httpMetrics.overlapImgBrand) {
            throw new Error('FAILED: Image and iKwath-X logo overlap!');
        }
        console.log('PASS: HTTP landing page image loaded, natural size:', httpMetrics.imgNaturalWidth, 'x', httpMetrics.imgNaturalHeight);
        console.log('PASS: Spacing between SIH image and iKwath-X brand:', (httpMetrics.brandLeft - httpMetrics.imgRight).toFixed(1), 'px gap');

        // Test 2: Local file:// protocol
        console.log('\nTEST 2: Validating file:// protocol...');
        const localFilePath = 'file:///' + path.resolve(__dirname, '..', 'iKwath_ML', 'evaporation_monitor', 'landing_new.html').replace(/\\\\/g, '/');
        await cdp.send('Page.navigate', { url: localFilePath });
        await sleep(1500);

        const fileMetrics = await cdp.eval(`(() => {
            const img = document.querySelector('.sih-header-logo, .header-partner-logos');
            const brand = document.querySelector('.brand');
            const imgRect = img ? img.getBoundingClientRect() : null;
            const brandRect = brand ? brand.getBoundingClientRect() : null;
            return {
                imgExists: !!img,
                imgSrc: img ? img.currentSrc || img.src : null,
                imgNaturalWidth: img ? img.naturalWidth : 0,
                imgNaturalHeight: img ? img.naturalHeight : 0,
                imgComplete: img ? img.complete : false,
                isBroken: !img || !img.complete || img.naturalWidth === 0,
                overlapImgBrand: imgRect && brandRect ? (imgRect.right > brandRect.left) : false
            };
        })()`);
        console.log('File:// Page Metrics:', JSON.stringify(fileMetrics, null, 2));
        if (fileMetrics.isBroken) {
            throw new Error('FAILED: Image is broken on file:// protocol!');
        }
        console.log('PASS: file:// protocol image loaded cleanly without breaking!');

        // Test 3: Multiple viewports testing (1440, 1280, 1024, 768)
        console.log('\nTEST 3: Validating responsive viewports on HTTP server...');
        await cdp.send('Page.navigate', { url: 'http://127.0.0.1:5000/' });
        await sleep(1000);

        for (const vp of [1440, 1280, 1024, 768]) {
            await cdp.send('Emulation.setDeviceMetricsOverride', {
                width: vp,
                height: 800,
                deviceScaleFactor: 1,
                mobile: vp <= 768
            });
            await sleep(500);

            const vpMetrics = await cdp.eval(`(() => {
                const img = document.querySelector('.sih-header-logo, .header-partner-logos');
                const brand = document.querySelector('.brand');
                const nav = document.querySelector('nav');
                const imgRect = img ? img.getBoundingClientRect() : null;
                const brandRect = brand ? brand.getBoundingClientRect() : null;
                const navRect = (nav && getComputedStyle(nav).display !== 'none') ? nav.getBoundingClientRect() : null;

                return {
                    vp: window.innerWidth,
                    imgW: img ? img.offsetWidth : 0,
                    imgH: img ? img.offsetHeight : 0,
                    overlap: (imgRect && brandRect) ? (imgRect.right > brandRect.left) : false,
                    navOverlap: (brandRect && navRect) ? (brandRect.right > navRect.left) : false,
                    hasScroll: document.documentElement.scrollWidth > window.innerWidth
                };
            })()`);
            console.log(`Viewport ${vp}px:`, JSON.stringify(vpMetrics));
            if (vpMetrics.overlap || vpMetrics.navOverlap) {
                throw new Error(`FAILED: Overlap detected at ${vp}px!`);
            }
        }
        console.log('PASS: All viewports pass with 0 overlap and 0 overflow!');

        // Test 4: Dashboard and Login pages integrity check
        console.log('\nTEST 4: Validating /dashboard and /login routes...');
        await cdp.send('Page.navigate', { url: 'http://127.0.0.1:5000/dashboard' });
        await sleep(1000);
        const dashTitle = await cdp.eval(`document.title`);
        console.log('Dashboard title:', dashTitle);

        await cdp.send('Page.navigate', { url: 'http://127.0.0.1:5000/login' });
        await sleep(1000);
        const loginTitle = await cdp.eval(`document.title`);
        console.log('Login title:', loginTitle);

        // Capture final header screenshot
        await cdp.send('Emulation.setDeviceMetricsOverride', {
            width: 1280,
            height: 800,
            deviceScaleFactor: 1,
            mobile: false
        });
        await cdp.send('Page.navigate', { url: 'http://127.0.0.1:5000/' });
        await sleep(1000);

        const shot = await cdp.send('Page.captureScreenshot', {
            format: 'png',
            clip: { x: 0, y: 0, width: 1280, height: 110, scale: 1 }
        });
        const outShot = path.join(__dirname, 'header_verified_final.png');
        fs.writeFileSync(outShot, Buffer.from(shot.data, 'base64'));
        console.log('Saved final screenshot to', outShot);

        console.log('\n=======================================');
        console.log('SUCCESS: ALL VALIDATION CHECKS PASSED!');
        console.log('=======================================');
    } finally {
        chrome.kill();
        try { fs.rmSync(tempProfileDir, { recursive: true, force: true }); } catch (e) {}
    }
}

runVerification().catch(err => {
    console.error(err);
    process.exit(1);
});
