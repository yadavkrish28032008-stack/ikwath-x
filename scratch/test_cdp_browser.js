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
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    reject(e);
                }
            });
        }).on('error', reject);
    });
}

class CDPClient {
    constructor(wsUrl) {
        this.ws = new WebSocket(wsUrl);
        this.id = 1;
        this.callbacks = new Map();
        this.events = [];
        this.consoleErrors = [];

        this.ws.onmessage = (msg) => {
            const data = JSON.parse(msg.data);
            if (data.id && this.callbacks.has(data.id)) {
                const cb = this.callbacks.get(data.id);
                this.callbacks.delete(data.id);
                if (data.error) cb.reject(data.error);
                else cb.resolve(data.result);
            } else if (data.method) {
                if (data.method === 'Runtime.consoleAPICalled') {
                    if (data.params.type === 'error') {
                        console.error('[Browser Console Error]', ...data.params.args.map(a => a.value || a.description));
                        this.consoleErrors.push(data.params.args.map(a => a.value || a.description).join(' '));
                    }
                } else if (data.method === 'Runtime.exceptionThrown') {
                    console.error('[Browser Exception]', data.params.exceptionDetails);
                    this.consoleErrors.push(data.params.exceptionDetails.text);
                }
                this.events.push(data);
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

async function runTests() {
    console.log('====================================================');
    console.log('STARTING CHROME HEADLESS CDP NAVIGATION VERIFICATION');
    console.log('====================================================');

    const tempProfileDir = path.join(__dirname, 'chrome_test_profile_' + Date.now());
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

    let cdp = null;

    try {
        // Wait for CDP port
        let versionData = null;
        for (let i = 0; i < 20; i++) {
            await sleep(500);
            try {
                versionData = await fetchJson('http://127.0.0.1:9222/json/version');
                if (versionData) break;
            } catch (e) {}
        }

        if (!versionData) {
            throw new Error('Chrome failed to start or expose debugging port 9222');
        }

        const targets = await fetchJson('http://127.0.0.1:9222/json/list');
        const pageTarget = targets.find(t => t.type === 'page');
        if (!pageTarget) throw new Error('No page target found');

        cdp = new CDPClient(pageTarget.webSocketDebuggerUrl);
        await cdp.ready();
        await cdp.send('Runtime.enable');
        await cdp.send('Page.enable');

        // Navigate to /scan
        console.log('\nNavigating to http://127.0.0.1:5000/scan ...');
        await cdp.send('Page.navigate', { url: 'http://127.0.0.1:5000/scan' });
        await sleep(1500);

        // --- TEST CASE 1 ---
        console.log('\n--- TEST CASE 1: Open Formulation A -> Back -> Open Formulation B ---');
        // Click Formulation A
        console.log('1. Clicking Scan Demo Pod (KW-F001) for Formulation A...');
        await cdp.eval(`document.getElementById('scanDemoPodBtn').click()`);
        await sleep(1000);

        let url = await cdp.eval(`window.location.pathname`);
        console.log('Current URL:', url);
        if (!url.includes('/dashboard')) throw new Error('Expected /dashboard, got ' + url);

        let formId = await cdp.eval(`document.getElementById('fieldFormulationId')?.textContent?.trim()`);
        let formName = await cdp.eval(`document.querySelector('.details-formulation-badge')?.textContent?.trim()`);
        let ingredientsText = await cdp.eval(`document.getElementById('fieldIngredients')?.textContent?.trim()`);
        console.log('Formulation A ID:', formId);
        console.log('Formulation A Name:', formName);
        console.log('Formulation A Ingredients:', ingredientsText);

        if (formId !== 'KW-F001') throw new Error('Expected KW-F001, got ' + formId);
        if (!ingredientsText.includes('Sunthi') || !ingredientsText.includes('Amrta') || !ingredientsText.includes('Abhaya')) {
            throw new Error('Formulation A missing required ingredients');
        }

        console.log('2. Pressing browser Back button to return to /scan...');
        await cdp.eval(`window.history.back()`);
        await sleep(1000);

        url = await cdp.eval(`window.location.pathname`);
        console.log('Returned URL:', url);
        if (!url.includes('/scan') && !url.includes('/pod-scanner')) throw new Error('Expected /scan, got ' + url);

        console.log('3. Clicking Scan Alternate Pod (KW-F002) for Formulation B WITHOUT refresh...');
        await cdp.eval(`document.getElementById('scanAltDemoPodBtn').click()`);
        await sleep(1000);

        url = await cdp.eval(`window.location.pathname`);
        console.log('Current URL:', url);
        if (!url.includes('/dashboard')) throw new Error('Expected /dashboard, got ' + url);

        formId = await cdp.eval(`document.getElementById('fieldFormulationId')?.textContent?.trim()`);
        formName = await cdp.eval(`document.querySelector('.details-formulation-badge')?.textContent?.trim()`);
        ingredientsText = await cdp.eval(`document.getElementById('fieldIngredients')?.textContent?.trim()`);
        console.log('Formulation B ID:', formId);
        console.log('Formulation B Name:', formName);
        console.log('Formulation B Ingredients:', ingredientsText);

        if (formId !== 'KW-F002') throw new Error('Expected KW-F002, got ' + formId);
        if (ingredientsText.includes('Sunthi') || ingredientsText.includes('Amrta') || ingredientsText.includes('Abhaya')) {
            throw new Error('Formulation B incorrectly contains Formulation A ingredients!');
        }
        if (!ingredientsText.includes('Aragvadha') || !ingredientsText.includes('Nimba')) {
            throw new Error('Formulation B missing required botanicals');
        }
        console.log('✓ PASS: TEST CASE 1 passed perfectly without page refresh!');

        // --- TEST CASE 2 ---
        console.log('\n--- TEST CASE 2: Open Formulation B -> Back -> Open Formulation C ---');
        console.log('1. Pressing browser Back button to return to /scan...');
        await cdp.eval(`window.history.back()`);
        await sleep(1000);

        console.log('2. Clicking Scan Third Pod (KW-F003) for Formulation C WITHOUT refresh...');
        await cdp.eval(`document.getElementById('scanThirdDemoPodBtn').click()`);
        await sleep(1000);

        url = await cdp.eval(`window.location.pathname`);
        console.log('Current URL:', url);
        formId = await cdp.eval(`document.getElementById('fieldFormulationId')?.textContent?.trim()`);
        formName = await cdp.eval(`document.querySelector('.details-formulation-badge')?.textContent?.trim()`);
        ingredientsText = await cdp.eval(`document.getElementById('fieldIngredients')?.textContent?.trim()`);
        console.log('Formulation C ID:', formId);
        console.log('Formulation C Name:', formName);
        console.log('Formulation C Ingredients:', ingredientsText);

        if (formId !== 'KW-F003') throw new Error('Expected KW-F003, got ' + formId);
        if (ingredientsText.includes('Aragvadha') || ingredientsText.includes('Nimba')) {
            throw new Error('Formulation C incorrectly contains Formulation B ingredients!');
        }
        if (!ingredientsText.includes('Punarnava') || !ingredientsText.includes('Brihati')) {
            throw new Error('Formulation C missing required botanicals');
        }
        console.log('✓ PASS: TEST CASE 2 passed perfectly without page refresh!');

        // --- TEST CASE 3 ---
        console.log('\n--- TEST CASE 3: Open Formulation C -> Back -> Open Formulation A ---');
        console.log('1. Pressing browser Back button to return to /scan...');
        await cdp.eval(`window.history.back()`);
        await sleep(1000);

        console.log('2. Clicking Scan Demo Pod (KW-F001) for Formulation A WITHOUT refresh...');
        await cdp.eval(`document.getElementById('scanDemoPodBtn').click()`);
        await sleep(1000);

        formId = await cdp.eval(`document.getElementById('fieldFormulationId')?.textContent?.trim()`);
        formName = await cdp.eval(`document.querySelector('.details-formulation-badge')?.textContent?.trim()`);
        ingredientsText = await cdp.eval(`document.getElementById('fieldIngredients')?.textContent?.trim()`);
        console.log('Formulation A ID:', formId);
        console.log('Formulation A Name:', formName);

        if (formId !== 'KW-F001') throw new Error('Expected KW-F001, got ' + formId);
        if (ingredientsText.includes('Punarnava') || ingredientsText.includes('Brihati')) {
            throw new Error('Formulation A incorrectly contains Formulation C ingredients!');
        }
        console.log('✓ PASS: TEST CASE 3 passed perfectly without page refresh!');

        // --- TEST CASE 4 ---
        console.log('\n--- TEST CASE 4: Full Multi-Hop Navigation A -> Back -> B -> Back -> C -> Back -> A ---');
        // Back -> B
        await cdp.eval(`window.history.back()`);
        await sleep(800);
        await cdp.eval(`document.getElementById('scanAltDemoPodBtn').click()`);
        await sleep(800);
        formId = await cdp.eval(`document.getElementById('fieldFormulationId')?.textContent?.trim()`);
        if (formId !== 'KW-F002') throw new Error('Expected KW-F002 in cycle, got ' + formId);

        // Back -> C
        await cdp.eval(`window.history.back()`);
        await sleep(800);
        await cdp.eval(`document.getElementById('scanThirdDemoPodBtn').click()`);
        await sleep(800);
        formId = await cdp.eval(`document.getElementById('fieldFormulationId')?.textContent?.trim()`);
        if (formId !== 'KW-F003') throw new Error('Expected KW-F003 in cycle, got ' + formId);

        // Back -> A
        await cdp.eval(`window.history.back()`);
        await sleep(800);
        await cdp.eval(`document.getElementById('scanDemoPodBtn').click()`);
        await sleep(800);
        formId = await cdp.eval(`document.getElementById('fieldFormulationId')?.textContent?.trim()`);
        if (formId !== 'KW-F001') throw new Error('Expected KW-F001 in cycle, got ' + formId);
        console.log('✓ PASS: TEST CASE 4 (continuous full-cycle transitions) passed without refresh!');

        // --- TEST CASE 5 ---
        console.log('\n--- TEST CASE 5: Full Workflow (Formulation -> Temp -> Monitor -> Back -> Formulation B) ---');
        // We are on Formulation A
        console.log('1. Currently on Formulation A Step 1. Clicking Continue to Temperature...');
        await cdp.eval(`document.getElementById('proceedDashboardBtn').click()`);
        await sleep(500);

        let step2Active = await cdp.eval(`document.getElementById('step2').classList.contains('active')`);
        console.log('Step 2 (Temperature) active:', step2Active);
        if (!step2Active) throw new Error('Step 2 did not become active');

        console.log('2. Clicking Start Preparation to begin monitoring...');
        await cdp.eval(`document.getElementById('startButton').click()`);
        await sleep(1000);

        let step3Active = await cdp.eval(`document.getElementById('step3').classList.contains('active')`);
        let prepRunning = await cdp.eval(`window.preparationRunning`);
        let prepStatusText = await cdp.eval(`document.getElementById('preparationStatus')?.textContent?.trim()`);
        console.log('Step 3 (Monitoring) active:', step3Active, '| Running:', prepRunning, '| Status:', prepStatusText);
        if (!step3Active) throw new Error('Step 3 did not become active');
        if (!prepRunning) throw new Error('Preparation is not running');

        console.log('3. Clicking browser Back button to return from running monitoring to /scan...');
        await cdp.eval(`window.history.back()`);
        await sleep(1000);

        url = await cdp.eval(`window.location.pathname`);
        console.log('Returned URL:', url);

        console.log('4. Clicking Formulation B without refresh...');
        await cdp.eval(`document.getElementById('scanAltDemoPodBtn').click()`);
        await sleep(1000);

        url = await cdp.eval(`window.location.pathname`);
        formId = await cdp.eval(`document.getElementById('fieldFormulationId')?.textContent?.trim()`);
        formName = await cdp.eval(`document.querySelector('.details-formulation-badge')?.textContent?.trim()`);
        let step1Active = await cdp.eval(`document.getElementById('step1').classList.contains('active')`);
        prepRunning = await cdp.eval(`window.preparationRunning`);
        console.log('New Loaded Formulation:', formId, formName);
        console.log('Step 1 Active:', step1Active, '| Preparation running:', prepRunning);

        if (formId !== 'KW-F002') throw new Error('Expected KW-F002, got ' + formId);
        if (!step1Active) throw new Error('Step 1 (Formulation Details) is not active');
        if (prepRunning) throw new Error('Previous preparation timer leaked into new formulation!');

        console.log('5. Clicking Continue to Temperature on new formulation...');
        await cdp.eval(`document.getElementById('proceedDashboardBtn').click()`);
        await sleep(500);

        step2Active = await cdp.eval(`document.getElementById('step2').classList.contains('active')`);
        console.log('Step 2 Active on new formulation:', step2Active);
        if (!step2Active) throw new Error('Step 2 did not become active on new formulation');

        console.log('✓ PASS: TEST CASE 5 passed with zero state leakage!');

        // Check console errors
        console.log('\n--- Console Errors Inspection ---');
        console.log('Total console errors recorded:', cdp.consoleErrors.length);
        if (cdp.consoleErrors.length > 0) {
            console.error('Console errors:', cdp.consoleErrors);
            throw new Error('Console errors encountered during testing!');
        }
        console.log('✓ PASS: Zero JavaScript console errors encountered throughout all tests!');

        console.log('\n====================================================');
        console.log('ALL 5 TEST CASES SUCCESSFULLY PASSED IN REAL CHROME! ✓');
        console.log('====================================================');

    } finally {
        if (chrome) {
            chrome.kill('SIGKILL');
        }
        try {
            fs.rmSync(tempProfileDir, { recursive: true, force: true });
        } catch (e) {}
    }
}

runTests().catch(err => {
    console.error('\n❌ TEST RUN FAILED:', err);
    process.exit(1);
});
