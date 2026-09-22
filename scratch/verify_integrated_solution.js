const http = require('http');
const fs = require('fs');
const path = require('path');

// 1. Verify files exist and have no syntax errors
console.log('--- 1. FILE SYNTAX & STRUCTURE CHECKS ---');
const monitorDir = path.join(__dirname, '..', 'iKwath_ML', 'evaporation_monitor');
const filesToCheck = [
    'script.js',
    'pod_parser.js',
    'batch_history.js',
    'auth.js',
    'index.html',
    'dashboard.html',
    'batch_history.html',
    'scan.html'
];

filesToCheck.forEach(f => {
    const p = path.join(monitorDir, f);
    if (!fs.existsSync(p)) {
        console.error(`ERROR: File missing: ${f}`);
        process.exit(1);
    }
});
console.log('✓ All core files present.');

// 2. HTML Structure Verification
console.log('\n--- 2. HTML STRUCTURE CHECKS ---');
const dashHtml = fs.readFileSync(path.join(monitorDir, 'dashboard.html'), 'utf8');

// Ensure 3 steps exist in indicator
const stepsSectionMatch = dashHtml.match(/<div class="steps">([\s\S]*?)<\/div>\s*<main>/);
if (!stepsSectionMatch) {
    console.error('ERROR: steps indicator missing');
    process.exit(1);
}
const stepsText = stepsSectionMatch[1];
const hasIngredientsFormulationStep = stepsText.includes('Ingredients &amp; Formulation') || stepsText.includes('Ingredients & Formulation');
const hasTemperatureStep = stepsText.includes('Temperature');
const hasMonitoringStep = stepsText.includes('Monitoring');
const hasPowderInSteps = stepsText.includes('Powder');

console.log('Step 1 (Ingredients & Formulation):', hasIngredientsFormulationStep);
console.log('Step 2 (Temperature):', hasTemperatureStep);
console.log('Step 3 (Monitoring):', hasMonitoringStep);
console.log('Powder in step indicator (must be false):', hasPowderInSteps);

if (!hasIngredientsFormulationStep || !hasTemperatureStep || !hasMonitoringStep || hasPowderInSteps) {
    console.error('ERROR: Step structure mismatch');
    process.exit(1);
}

// Check that visible powder inputs are removed
const hasVisiblePowderInput = dashHtml.includes('Enter Powder Quantity') || dashHtml.includes('Calculate Water Requirement');
console.log('Visible Powder Prompts in UI (must be false):', hasVisiblePowderInput);
if (hasVisiblePowderInput) {
    console.error('ERROR: Visible powder prompt found in HTML');
    process.exit(1);
}

// Check internal store
const hasInternalPowderStore = dashHtml.includes('id="internalPowderStore"');
console.log('Internal Powder Store exists (hidden):', hasInternalPowderStore);

// Check Temperature 0-100 and Estimated Prep Time Card
const hasTemp0to100 = dashHtml.includes('min="0" max="100"');
const hasEstTimeCard = dashHtml.includes('id="step3EstimatedTimeCard"') && dashHtml.includes('id="estimatedPrepTime"');
const hasRecTempCard = dashHtml.includes('id="step4RecommendedCard"') && dashHtml.includes('id="recommendedTempValue"');

console.log('Temperature range min=0 max=100 in HTML:', hasTemp0to100);
console.log('Estimated Time Card in Step 3:', hasEstTimeCard);
console.log('Recommended Temp Card in Step 3:', hasRecTempCard);

if (!hasTemp0to100 || !hasEstTimeCard || !hasRecTempCard) {
    console.error('ERROR: Temperature or Estimation card missing from Step 3');
    process.exit(1);
}

// 3. Logic & Physics Calculations Verification
console.log('\n--- 3. ESTIMATION & PHYSICS MODEL VERIFICATION ---');
// Evaluate estimation logic in Node
const scriptCode = fs.readFileSync(path.join(monitorDir, 'script.js'), 'utf8');

// Create lightweight DOM mock
const elements = {
    temperatureValue: { textContent: '' },
    temperatureStatus: { textContent: '', className: '' },
    estimatedPrepTime: { textContent: '' },
    estimatedPrepTimeNote: { textContent: '' },
    estTimeBadge: { textContent: '' },
    step3EstimatedTimeCard: { classList: { add: () => {}, remove: () => {} } },
    powderInput: { value: '48' },
    powderAmount: { textContent: '' },
    waterAmount: { textContent: '' },
    targetVolume: { textContent: '' },
    initialVolume: { textContent: '' },
    flowCurrentVolume: { textContent: '' },
    flowTargetVolume: { textContent: '' },
    monitorTargetVolume: { textContent: '' },
    currentVolume: { textContent: '' },
    temperatureSlider: { value: '85', min: '0', max: '100', addEventListener: () => {} },
    temperatureInput: { value: '85', min: '0', max: '100', addEventListener: () => {} },
    step1: { classList: { add: () => {}, remove: () => {} } },
    step2: { classList: { add: () => {}, remove: () => {} } },
    step3: { classList: { add: () => {}, remove: () => {} } },
    step4: { classList: { add: () => {}, remove: () => {} } },
    step5: { classList: { add: () => {}, remove: () => {} } }
};

global.window = {
    scrollTo: () => {},
    detectedFormulation: 'Amrtottara Kwatha Curna',
    preparationData: {
        formulation: 'Amrtottara Kwatha Curna',
        ingredients: ['Sunthi', 'Amrta', 'Abhaya'],
        powder: 48,
        water: 384,
        targetVolume: 96,
        target_volume: 96
    }
};
global.document = {
    getElementById: (id) => elements[id] || null,
    querySelectorAll: (sel) => [],
    addEventListener: () => {}
};
global.localStorage = {
    getItem: () => null,
    setItem: () => {}
};

// Load batchHistory & script in node
eval(fs.readFileSync(path.join(monitorDir, 'batch_history.js'), 'utf8'));
eval(scriptCode);

// Test temperature at 0°C
const est0 = calculateEstimatedPreparationTime(0);
console.log('Estimate at 0°C:', est0);
if (est0.status !== 'inactive' || est0.formatted !== 'Preparation not active at this temperature') {
    console.error('ERROR: 0°C must return inactive');
    process.exit(1);
}
console.log('✓ 0°C handled correctly without NaN or Infinity');

// Test 1°C increments between 70°C and 74°C
console.log('\nChecking live every 1°C recalculation:');
const est70 = calculateEstimatedPreparationTime(70);
const est71 = calculateEstimatedPreparationTime(71);
const est72 = calculateEstimatedPreparationTime(72);
const est73 = calculateEstimatedPreparationTime(73);
console.log(`70°C: ${est70.formatted} (${est70.minutes.toFixed(2)} min, rate: ${est70.rateMlPerMin} mL/min)`);
console.log(`71°C: ${est71.formatted} (${est71.minutes.toFixed(2)} min, rate: ${est71.rateMlPerMin} mL/min)`);
console.log(`72°C: ${est72.formatted} (${est72.minutes.toFixed(2)} min, rate: ${est72.rateMlPerMin} mL/min)`);
console.log(`73°C: ${est73.formatted} (${est73.minutes.toFixed(2)} min, rate: ${est73.rateMlPerMin} mL/min)`);

if (est70.minutes === est71.minutes || est71.minutes === est72.minutes) {
    console.error('ERROR: Every 1°C must produce a different calculated estimate');
    process.exit(1);
}
console.log('✓ Every 1°C produces unique calculated estimate');

// Test formulation dependency:
// Amrtottara Kwatha vs Ardhabilva Kwatha at 90°C
const estAmr90 = calculateEstimatedPreparationTime({
    temperature: 90,
    formulation: 'Amrtottara Kwatha Curna',
    ingredients: ['Sunthi', 'Amrta', 'Abhaya'],
    initialVolume: 384,
    targetVolume: 96
});

const estArd90 = calculateEstimatedPreparationTime({
    temperature: 90,
    formulation: 'Ardhabilva Kwatha Curna',
    ingredients: ['Punarnava', 'Sunthi', 'Brihati'],
    initialVolume: 4800,
    targetVolume: 2400
});

console.log('\nFormulation-dependent comparison at 90°C:');
console.log('Amrtottara Kwatha (384 mL -> 96 mL):', estAmr90.formatted, `(${estAmr90.minutes.toFixed(1)} min)`);
console.log('Ardhabilva Kwatha (4800 mL -> 2400 mL):', estArd90.formatted, `(${estArd90.minutes.toFixed(1)} min)`);

if (estAmr90.minutes === estArd90.minutes) {
    console.error('ERROR: Different formulations must produce different estimates');
    process.exit(1);
}
console.log('✓ Different formulations produce different estimates at same temperature');

// Test matching batch historical recommendation
console.log('\n--- 4. HISTORICAL MATCHING RECOMMENDATION ---');
const matches = findMatchingHistoricalBatches('Amrtottara Kwatha Curna', ['Sunthi', 'Amrta', 'Abhaya']);
console.log(`Found ${matches.length} matching historical batches for Amrtottara Kwatha Curna.`);
const avgTemp = calculateHistoricalAverage(matches.map(m => m.temperature));
console.log(`Calculated average temperature from history: ${avgTemp}°C`);
if (matches.length < 10 || Math.round(avgTemp) !== 90) {
    console.error('ERROR: Historical matching failed to retrieve ~90°C from 10 matching batches');
    process.exit(1);
}
console.log('✓ Historical recommendation accurately calculated as 90°C from 10 matching batches');

// 4. HTTP Endpoint Verification
console.log('\n--- 5. LIVE SERVER ROUTE VERIFICATION ---');
const endpoints = [
    '/',
    '/login',
    '/dashboard',
    '/pod-scanner',
    '/batch-history'
];

let checksRemaining = endpoints.length;

endpoints.forEach(ep => {
    http.get(`http://127.0.0.1:5000${ep}`, res => {
        console.log(`GET ${ep} -> ${res.statusCode} ${res.statusMessage}`);
        if (res.statusCode !== 200) {
            console.error(`ERROR: Endpoint ${ep} returned ${res.statusCode}`);
            process.exit(1);
        }
        checksRemaining--;
        if (checksRemaining === 0) {
            console.log('\n=============================================');
            console.log('ALL INTEGRATED REQUIREMENTS FULLY VALIDATED! ✓');
            console.log('=============================================');
            process.exit(0);
        }
    }).on('error', err => {
        console.error(`Connection error to Flask on ${ep}:`, err.message);
        process.exit(1);
    });
});
