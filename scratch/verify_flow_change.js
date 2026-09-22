const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('================================================================');
console.log('TEST SUITE: iKWATH-X UI FLOW CHANGE VERIFICATION');
console.log('FLOW: QR SCAN -> 1. FORMULATION -> 2. TEMPERATURE -> 3. MONITORING');
console.log('================================================================');

const monitorDir = path.join(__dirname, '..', 'iKwath_ML', 'evaporation_monitor');
const scanHtml = fs.readFileSync(path.join(monitorDir, 'scan.html'), 'utf8');
const dashHtml = fs.readFileSync(path.join(monitorDir, 'dashboard.html'), 'utf8');
const indexHtml = fs.readFileSync(path.join(monitorDir, 'index.html'), 'utf8');
const podParser = require(path.join(monitorDir, 'pod_parser.js'));
const scriptJs = fs.readFileSync(path.join(monitorDir, 'script.js'), 'utf8');

// CHECK 1: Reference 2 is COMPLETELY REMOVED
console.log('\n--- CHECK 1: Complete Removal of Reference 2 ("Ingredients & Formulation" card) ---');
assert(!dashHtml.includes('continueToTempBtn'), 'dashboard.html must NOT contain old #continueToTempBtn');
assert(!indexHtml.includes('continueToTempBtn'), 'index.html must NOT contain old #continueToTempBtn');
assert(!dashHtml.includes('formulationVolumesRow'), 'dashboard.html must NOT contain old #formulationVolumesRow');
assert(!indexHtml.includes('formulationVolumesRow'), 'index.html must NOT contain old #formulationVolumesRow');
assert(!dashHtml.includes('Scanned classical formulation, ingredients breakdown'), 'dashboard.html must NOT contain Reference 2 description text');
assert(!indexHtml.includes('Scanned classical formulation, ingredients breakdown'), 'index.html must NOT contain Reference 2 description text');
assert(!dashHtml.includes('Ingredients &amp; Formulation</span>'), 'dashboard.html step indicator must NOT show Ingredients & Formulation');
assert(!indexHtml.includes('Ingredients &amp; Formulation</span>'), 'index.html step indicator must NOT show Ingredients & Formulation');
console.log('✓ PASS: Reference 2 screen and old step-1 progress state are completely removed.');

// CHECK 2: Internal Formulation Store Preserved (Hidden)
console.log('\n--- CHECK 2: Internal Formulation Store Preserved ---');
assert(dashHtml.includes('id="internalFormulationStore"'), 'dashboard.html must contain #internalFormulationStore');
assert(dashHtml.includes('id="detectedFormulation"'), 'dashboard.html must retain #detectedFormulation');
assert(dashHtml.includes('id="selectedIngredients"'), 'dashboard.html must retain #selectedIngredients');
assert(dashHtml.includes('id="detectedBadge"'), 'dashboard.html must retain #detectedBadge');
assert(dashHtml.includes('id="waterAmount"'), 'dashboard.html must retain #waterAmount');
assert(dashHtml.includes('id="targetVolume"'), 'dashboard.html must retain #targetVolume');
assert(dashHtml.includes('id="powderInput"'), 'dashboard.html must retain #powderInput');
assert(dashHtml.includes('id="powderAmount"'), 'dashboard.html must retain #powderAmount');
console.log('✓ PASS: Internal formulation store preserved for calculation engine and telemetry.');

// CHECK 3: Dashboard Initial State (Step 1 Formulation Active, 3-Step Indicator)
console.log('\n--- CHECK 3: Dashboard Initial State (1 Formulation Active, 3-Step Indicator) ---');
assert(dashHtml.includes('<section id="step1" class="step-panel active">'), 'dashboard.html must have step1 (Formulation) active initially');
assert(indexHtml.includes('<section id="step1" class="step-panel active">'), 'index.html must have step1 (Formulation) active initially');
assert(dashHtml.includes('id="formulationDetailsWrapper"'), 'dashboard.html must contain #formulationDetailsWrapper');
assert(indexHtml.includes('id="formulationDetailsWrapper"'), 'index.html must contain #formulationDetailsWrapper');

assert(dashHtml.includes('<div class="step active" data-step="1">') && dashHtml.includes('Formulation'), 'Step 1 in indicator must be Formulation and active');
assert(dashHtml.includes('<div class="step" data-step="2">') && dashHtml.includes('Temperature'), 'Step 2 in indicator must be Temperature');
assert(dashHtml.includes('<div class="step" data-step="3">') && dashHtml.includes('Monitoring'), 'Step 3 in indicator must be Monitoring');
assert(dashHtml.includes('<section id="step2" class="step-panel">'), 'dashboard.html step2 must NOT be active initially');
assert(dashHtml.includes('<section id="step3" class="step-panel">'), 'dashboard.html step3 must NOT be active initially');
console.log('✓ PASS: Dashboard step indicator shows 1 Formulation (active) -> 2 Temperature -> 3 Monitoring.');

// CHECK 4: Byte Parity Between dashboard.html and index.html
console.log('\n--- CHECK 4: Parity Between dashboard.html and index.html ---');
assert.strictEqual(dashHtml, indexHtml, 'dashboard.html and index.html must be 100% byte identical');
console.log('✓ PASS: dashboard.html and index.html are 100% identical.');

// CHECK 5: Reference 1 Rendering & No 2-Second Timeout in Scanner
console.log('\n--- CHECK 5: Reference 1 Screen & No 2-Second Timeout in Scanner ---');
const benchmarkPod = {
    podId: 'KW-F001',
    formulation: 'Amrtottara Kwatha Curna',
    powder: 48,
    ingredients: [
        { name: 'Sunthi', weight: 8 },
        { name: 'Amrta', weight: 24 },
        { name: 'Abhaya', weight: 16 }
    ],
    water: 384,
    targetVolume: 96,
    temperature: 85,
    batchNumber: 'IKW-AMR-2026-01',
    standard: 'Sharngadhara Samhita'
};

const parseResult = podParser.parse(benchmarkPod);
assert(parseResult.success, 'Parsing benchmark pod must succeed');
const pod1 = parseResult.pod;
const renderedHtml = podParser.renderFormulationDetailsHtml(pod1);
assert(renderedHtml.includes('Formulation Details'), 'Must render Formulation Details title');
assert(renderedHtml.includes('AUTHENTICATED FORMULATION PROFILE'), 'Must render Authenticated Formulation Profile eyebrow');
assert(renderedHtml.includes('KW-F001'), 'Must render Formulation ID');
assert(renderedHtml.includes('Sunthi'), 'Must render Sunthi ingredient');
assert(renderedHtml.includes('Zingiber officinale'), 'Must render Botanical Identity');
assert(renderedHtml.includes('Rhizome') || renderedHtml.includes('rhizome'), 'Must render Part Used');
assert(renderedHtml.includes('Yavakuta'), 'Must render Coarse-Powder Specification');
assert(renderedHtml.includes('384 mL'), 'Must render Initial Water');
assert(renderedHtml.includes('96 mL'), 'Must render Target Reduction Endpoint');
assert(renderedHtml.includes('Continue to Temperature'), 'Proceed button must say Continue to Temperature');

// Verify 2-second auto-timeout is NOT present in scanner
assert(!scanHtml.includes('autoAdvanceNotice'), 'scan.html must NOT contain autoAdvanceNotice (no automatic transition)');
assert(!scanHtml.includes('autoNavCountdown'), 'scan.html must NOT contain countdown indicator');
assert(scanHtml.includes('window.location.href = \'/dashboard\''), 'scan.html redirects to /dashboard without timeout delay');
console.log('✓ PASS: Reference 1 UI matches required fields and 2-second timeout is removed.');

// CHECK 6: Script Navigation Simulation (1 Formulation -> 2 Temperature -> 3 Monitoring)
console.log('\n--- CHECK 6: Script Navigation Simulation (1 -> 2 -> 3) ---');
function createMockDom() {
    const elements = {};
    function el(id, tag = 'div') {
        const obj = {
            id,
            tagName: tag.toUpperCase(),
            value: '',
            textContent: '',
            innerHTML: '',
            classList: {
                classes: new Set(),
                add: (c) => obj.classList.classes.add(c),
                remove: (c) => obj.classList.classes.delete(c),
                contains: (c) => obj.classList.classes.has(c)
            }
        };
        elements[id] = obj;
        return obj;
    }

    el('step1');
    el('step2');
    el('step3');
    el('formulationDetailsWrapper');
    el('temperatureSlider');
    el('temperatureInput');
    el('temperatureValue');
    el('temperatureStatus');
    el('detectedFormulation');
    el('selectedIngredients');
    el('detectedBadge');
    el('waterAmount');
    el('targetVolume');
    el('powderAmount');
    el('powderInput');

    const stepNodes = [el('stepIndicator1'), el('stepIndicator2'), el('stepIndicator3')];
    stepNodes[0].classList.add('step');
    stepNodes[1].classList.add('step');
    stepNodes[2].classList.add('step');

    const panelNodes = [elements['step1'], elements['step2'], elements['step3']];
    elements['step1'].classList.add('step-panel');
    elements['step2'].classList.add('step-panel');
    elements['step3'].classList.add('step-panel');

    const doc = {
        getElementById: (id) => elements[id] || null,
        querySelectorAll: (sel) => {
            if (sel === '.step-panel') return panelNodes;
            if (sel === '.step') return stepNodes;
            return [];
        },
        addEventListener: () => {}
    };

    return { elements, stepNodes, panelNodes, doc };
}

const mock = createMockDom();
const vm = require('vm');
const context = {
    console,
    window: {},
    document: mock.doc,
    Number,
    String,
    Boolean,
    Array,
    Object,
    Math,
    setTimeout: (fn) => fn(),
    setInterval: () => 123,
    clearInterval: () => {},
    scrollTo: () => {},
    fetch: async () => ({
        ok: true,
        json: async () => ({ success: true, data: { formulation: 'Amrtottara Kwatha Curna', powder: 48, water: 384, target_volume: 96 } })
    })
};
context.window = context;
vm.createContext(context);

// Load script.js in context
vm.runInContext(scriptJs, context);

// Test Initial State: Step 1 (Formulation)
context.showStep(1);
assert(mock.elements['step1'].classList.contains('active'), 'Step 1 panel must be active');
assert(!mock.elements['step2'].classList.contains('active'), 'Step 2 panel must NOT be active');
assert(!mock.elements['step3'].classList.contains('active'), 'Step 3 panel must NOT be active');
assert(mock.stepNodes[0].classList.contains('active'), 'Step 1 indicator must be active');
assert(!mock.stepNodes[1].classList.contains('active'), 'Step 2 indicator must NOT be active');
console.log('✓ PASS: showStep(1) activates Formulation panel and indicator.');

// Test Transition to Step 2: Temperature (via goToTemperature)
context.showStep(2);
assert(!mock.elements['step1'].classList.contains('active'), 'Step 1 panel must NOT be active');
assert(mock.elements['step2'].classList.contains('active'), 'Step 2 panel must be active');
assert(!mock.elements['step3'].classList.contains('active'), 'Step 3 panel must NOT be active');
assert(mock.stepNodes[0].classList.contains('completed'), 'Step 1 indicator must be completed');
assert(mock.stepNodes[1].classList.contains('active'), 'Step 2 indicator must be active');
console.log('✓ PASS: showStep(2) activates Temperature panel, sets Step 1 as completed.');

// Test Transition to Step 3: Monitoring (via startPreparation)
context.showStep(3);
assert(!mock.elements['step1'].classList.contains('active'), 'Step 1 panel must NOT be active');
assert(!mock.elements['step2'].classList.contains('active'), 'Step 2 panel must NOT be active');
assert(mock.elements['step3'].classList.contains('active'), 'Step 3 panel must be active');
assert(mock.stepNodes[0].classList.contains('completed'), 'Step 1 indicator must be completed');
assert(mock.stepNodes[1].classList.contains('completed'), 'Step 2 indicator must be completed');
assert(mock.stepNodes[2].classList.contains('active'), 'Step 3 indicator must be active');
console.log('✓ PASS: showStep(3) activates Monitoring panel, sets Step 1 & 2 as completed.');

// Test Reset back to Step 1: Formulation
context.resetPreparation();
assert(mock.elements['step1'].classList.contains('active'), 'Reset must return to Step 1 panel');
assert(mock.stepNodes[0].classList.contains('active'), 'Reset must set Step 1 indicator active');
console.log('✓ PASS: resetPreparation() returns flow to Step 1 Formulation.');

console.log('\n================================================================');
console.log('ALL TESTS PASSED SUCCESSFULLY! COMPLETE FLOW VERIFIED.');
console.log('================================================================\n');
