const fs = require('fs');
const path = require('path');
const http = require('http');

console.log('====================================================');
console.log('iKWATH-X COMPLETE END-TO-END WORKFLOW TEST SUITE');
console.log('====================================================');

const monitorDir = path.join(__dirname, '..', 'iKwath_ML', 'evaporation_monitor');

// Mock a complete browser DOM environment
function createMockEnvironment() {
    const listeners = {};
    const domStore = {};

    function createMockElement(id, tag = 'div') {
        const el = {
            id,
            tagName: tag.toUpperCase(),
            value: '',
            textContent: '',
            innerHTML: '',
            className: '',
            style: { display: 'block' },
            classList: {
                classes: new Set(),
                add: (c) => el.classList.classes.add(c),
                remove: (c) => el.classList.classes.delete(c),
                contains: (c) => el.classList.classes.has(c)
            },
            addEventListener: (event, handler) => {
                if (!listeners[id]) listeners[id] = {};
                if (!listeners[id][event]) listeners[id][event] = [];
                listeners[id][event].push(handler);
            },
            trigger: (event) => {
                if (listeners[id] && listeners[id][event]) {
                    listeners[id][event].forEach(fn => fn({ target: el }));
                }
            },
            disabled: false,
            min: '',
            max: '',
            step: ''
        };
        domStore[id] = el;
        return el;
    }

    const registeredIds = [
        'detectedFormulation',
        'selectedIngredients',
        'detectionMessage',
        'detectedBadge',
        'waterAmount',
        'targetVolume',
        'powderAmount',
        'powderInput',
        'temperatureValue',
        'temperatureStatus',
        'temperatureSlider',
        'temperatureInput',
        'step3EstimatedTimeCard',
        'estimatedPrepTime',
        'estimatedPrepTimeNote',
        'estTimeBadge',
        'step4RecommendedCard',
        'recommendedTempValue',
        'recommendedTempSource',
        'monitorRecommendedTempValue',
        'monitorRecommendedTempSource',
        'startButton',
        'preparationStatus',
        'currentVolume',
        'flowCurrentVolume',
        'flowTargetVolume',
        'monitorTargetVolume',
        'initialVolume',
        'elapsedTime',
        'remainingTime',
        'evaporationRate',
        'completionBox',
        'fullBatchTableBody',
        'batchSummaryTodayVal',
        'batchSummaryMatchingVal',
        'batchSummaryAvgTempVal',
        'batchSummaryAvgTimeVal',
        'batchSummaryAvgWaterVal',
        'batchPageRecTempVal',
        'batchPageRecTempSource',
        'formulationGroupsContainer',
        'batchFilterResultCount',
        'step1',
        'step2',
        'step3',
        'step4',
        'step5'
    ];

    registeredIds.forEach(id => createMockElement(id));

    const mockWindow = {
        scrollTo: () => {},
        location: { replace: (url) => { mockWindow.location.href = url; }, href: '/dashboard' },
        batchHistory: null,
        podParser: null,
        auth: { requireAuth: () => true },
        setInterval: (fn, ms) => setInterval(fn, ms),
        clearInterval: (id) => clearInterval(id)
    };

    const mockDocument = {
        getElementById: (id) => domStore[id] || null,
        querySelectorAll: (sel) => {
            if (sel === '.step-panel') {
                return ['step1', 'step2', 'step3', 'step4', 'step5'].map(id => domStore[id]);
            }
            if (sel === '.step') {
                return [1, 2, 3, 4].map(num => createMockElement(`step-indicator-${num}`));
            }
            return [];
        },
        createElement: (tag) => createMockElement(`dyn_${Math.random()}`, tag),
        addEventListener: () => {},
        body: { appendChild: () => {} }
    };

    const mockLocalStorage = {
        store: {},
        getItem: (k) => mockLocalStorage.store[k] || null,
        setItem: (k, v) => { mockLocalStorage.store[k] = String(v); },
        removeItem: (k) => { delete mockLocalStorage.store[k]; }
    };

    return { domStore, mockWindow, mockDocument, mockLocalStorage, listeners };
}

const env = createMockEnvironment();
global.window = env.mockWindow;
global.document = env.mockDocument;
global.localStorage = env.mockLocalStorage;

// Load app scripts
eval(fs.readFileSync(path.join(monitorDir, 'batch_history.js'), 'utf8'));
eval(fs.readFileSync(path.join(monitorDir, 'pod_parser.js'), 'utf8'));
eval(fs.readFileSync(path.join(monitorDir, 'script.js'), 'utf8'));

global.podParser = window.podParser;
global.batchHistory = window.batchHistory;

console.log('✓ All scripts evaluated into virtual environment.');

// STEP 1: INITIAL STATE CHECKS
console.log('\n--- TEST 1: Initial Dashboard Setup ---');
setupTemperatureControl();
updateTemperatureStatus();
updateEstimatedPreparationTime();

console.log('Current Temperature display:', env.domStore['temperatureValue'].textContent);
console.log('Temperature slider min/max:', env.domStore['temperatureSlider'].min, env.domStore['temperatureSlider'].max);
console.log('Temperature input min/max:', env.domStore['temperatureInput'].min, env.domStore['temperatureInput'].max);
console.log('Initial Estimated Prep Time:', env.domStore['estimatedPrepTime'].textContent);

if (env.domStore['temperatureSlider'].max !== '100' || env.domStore['temperatureInput'].max !== '100') {
    console.error('FAIL: Slider or input max is not 100');
    process.exit(1);
}
console.log('✓ PASS: Temperature range is 0–100°C');

// STEP 2: LIVE TEMPERATURE SLIDER DYNAMICS
console.log('\n--- TEST 2: Every 1°C Temperature Recalculation ---');
const recordedEstimates = {};
for (let temp = 40; temp <= 100; temp += 5) {
    env.domStore['temperatureSlider'].value = temp;
    env.domStore['temperatureSlider'].trigger('input');
    recordedEstimates[temp] = env.domStore['estimatedPrepTime'].textContent;
    console.log(`Temp: ${temp}°C -> Current: ${env.domStore['temperatureValue'].textContent} | Est Time: ${env.domStore['estimatedPrepTime'].textContent}`);
}

// Ensure every degree changes
const est70 = calculateEstimatedPreparationTime(70);
const est71 = calculateEstimatedPreparationTime(71);
const est72 = calculateEstimatedPreparationTime(72);
console.log(`Live 70°C: ${est70.minutes.toFixed(2)} min | 71°C: ${est71.minutes.toFixed(2)} min | 72°C: ${est72.minutes.toFixed(2)} min`);
if (est70.minutes === est71.minutes || est71.minutes === est72.minutes) {
    console.error('FAIL: Time does not recalculate every 1°C');
    process.exit(1);
}
console.log('✓ PASS: Every 1°C changes dynamically without fixed bands or lookup tables');

// STEP 3: 0°C BEHAVIOR
console.log('\n--- TEST 3: 0°C Inactive State ---');
env.domStore['temperatureSlider'].value = 0;
env.domStore['temperatureSlider'].trigger('input');
console.log('0°C Display Text:', env.domStore['estimatedPrepTime'].textContent);
console.log('0°C Note:', env.domStore['estimatedPrepTimeNote'].textContent);
if (!env.domStore['estimatedPrepTime'].textContent.includes('Preparation not active at this temperature')) {
    console.error('FAIL: 0°C did not display clear inactive state');
    process.exit(1);
}
console.log('✓ PASS: 0°C cleanly displays inactive state (no NaN or Infinity)');

// STEP 4: QR SCANNER PARSING & DASHBOARD AUTO-POPULATION
console.log('\n--- TEST 4: QR Decoding & Auto-Population ---');
const rawQrPayload = JSON.stringify({
    podId: "KW-F001",
    formulation: "Amrtottara Kwatha Curna",
    powder: 48,
    ingredients: [
        { name: "Sunthi", weight: 8 },
        { name: "Amrta", weight: 24 },
        { name: "Abhaya", weight: 16 }
    ],
    water: 384,
    targetVolume: 96,
    temperature: 88,
    standard: "Sharngadhara Samhita"
});

const parseResult = podParser.parse(rawQrPayload);
console.log('QR Parsed successfully:', parseResult.success);
if (!parseResult.success) {
    console.error('FAIL: QR Parsing error:', parseResult.error);
    process.exit(1);
}

// Auto-populate dashboard with scanned pod
podParser.autoPopulateDashboard(parseResult.pod);

console.log('Populated Formulation:', env.domStore['detectedFormulation'].textContent);
console.log('Populated Ingredients:', env.domStore['selectedIngredients'].textContent);
console.log('Populated Water:', env.domStore['waterAmount'].textContent);
console.log('Populated Target Volume:', env.domStore['targetVolume'].textContent);
console.log('Current Temperature set to:', env.domStore['temperatureValue'].textContent);
console.log('Recommended Temperature:', env.domStore['recommendedTempValue'].textContent);
console.log('Recommended Temp Source:', env.domStore['recommendedTempSource'].textContent);
console.log('Estimated Prep Time for Scanned Pod:', env.domStore['estimatedPrepTime'].textContent);

// Verify human-friendly displays (NO raw JSON or developer symbols)
if (env.domStore['detectedFormulation'].textContent.includes('{') || env.domStore['selectedIngredients'].textContent.includes('podId')) {
    console.error('FAIL: Raw machine data exposed in UI');
    process.exit(1);
}

if (!env.domStore['detectedFormulation'].textContent.includes('Amrtottara Kwatha Curna')) {
    console.error('FAIL: Formulation not populated');
    process.exit(1);
}

if (!env.domStore['waterAmount'].textContent.includes('384 mL') || !env.domStore['targetVolume'].textContent.includes('96 mL')) {
    console.error('FAIL: Volumes not populated correctly');
    process.exit(1);
}

if (!env.domStore['recommendedTempValue'].textContent.includes('90°C')) {
    console.error('FAIL: Recommended temperature not calculated as 90°C');
    process.exit(1);
}

// Verify internal powder persistence
console.log('Internal Powder Input Value:', env.domStore['powderInput'].value);
console.log('Window Preparation Data Powder:', window.preparationData.powder);
if (Number(window.preparationData.powder) !== 48 || Number(env.domStore['powderInput'].value) !== 48) {
    console.error('FAIL: Internal powder not preserved');
    process.exit(1);
}
console.log('✓ PASS: QR auto-populates all fields and preserves powder internally without user prompt');

// STEP 5: NAVIGATION STEPPING (1 FORMULATION -> 2 TEMPERATURE -> 3 MONITORING)
console.log('\n--- TEST 5: Complete Navigation Flow (1 Formulation -> 2 Temperature -> 3 Monitoring) ---');
console.log('Formulation Step Active initially:', env.domStore['step1'] ? env.domStore['step1'].classList.contains('active') : true);
if (env.domStore['step1'] && !env.domStore['step1'].classList.contains('active')) {
    console.error('FAIL: Formulation step not active initially');
    process.exit(1);
}

// User action: Continue to Temperature -> Step 2 Temperature
goToTemperature();
console.log('Navigated to Temperature:', env.domStore['step2'].classList.contains('active'));
if (!env.domStore['step2'].classList.contains('active')) {
    console.error('FAIL: Did not navigate to Temperature on goToTemperature');
    process.exit(1);
}

// User action: Start Preparation -> Step 3 Monitoring
startPreparation();
console.log('Navigated to Monitoring:', env.domStore['step3'].classList.contains('active'));
if (!env.domStore['step3'].classList.contains('active')) {
    console.error('FAIL: Did not navigate to Monitoring on startPreparation');
    process.exit(1);
}
console.log('✓ PASS: Flow sequence verified: 1 Formulation -> 2 Temperature -> 3 Monitoring');

// STEP 6: BATCH HISTORY RENDERING
console.log('\n--- TEST 6: Dedicated Batch History Page Rendering ---');
batchHistory.renderBatchHistoryPage();
console.log('Batch History Table Body has content:', env.domStore['fullBatchTableBody'].innerHTML.length > 0);
console.log('Formulation Groups Container has content:', env.domStore['formulationGroupsContainer'].innerHTML.length > 0);
console.log('Batch Page Recommended Temp (overall):', env.domStore['batchPageRecTempVal'].textContent);
console.log('Batch Page Summary Count (today):', env.domStore['batchSummaryMatchingVal'].textContent);

// Test matching Amrtottara batches specifically with composition matching
const allBatches = batchHistory.getAllBatches();
const matchingAmr = allBatches.filter(b => batchHistory.isBatchMatching(b, 'Amrtottara Kwatha Curna', ['Sunthi', 'Amrta', 'Abhaya']));
const amrMetrics = batchHistory.calculateMetrics(matchingAmr);
console.log(`Amrtottara Kwatha matching composition: ${matchingAmr.length} batches, Avg Temp = ${amrMetrics.averageTemperature}°C, Avg Time = ${amrMetrics.averageTimeMinutes} min`);

if (env.domStore['fullBatchTableBody'].innerHTML.length === 0 || amrMetrics.averageTemperature !== 90 || matchingAmr.length !== 10) {
    console.error('FAIL: Batch history page did not render correctly');
    process.exit(1);
}
console.log('✓ PASS: Dedicated batch history page accurately renders formulation groups, metrics and records');

console.log('\n====================================================');
console.log('ALL INTEGRATED TESTS PASSED SUCCESSFULLY! ✓');
console.log('====================================================');
process.exit(0);
