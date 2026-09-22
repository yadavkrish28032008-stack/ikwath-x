const fs = require('fs');
const path = require('path');

console.log('================================================================');
console.log('iKWATH-X VERIFICATION: MULTI-STAGE SIMULATION & COMPLETION');
console.log('================================================================');

const monitorDir = path.join(__dirname, '..', 'iKwath_ML', 'evaporation_monitor');

function createMockEnvironment() {
    const dom = {
        monitorTemperature: { textContent: '' },
        currentVolume: { textContent: '' },
        flowCurrentVolume: { textContent: '' },
        evaporationRate: { textContent: '' },
        elapsedTime: { textContent: '' },
        remainingTime: { textContent: '' },
        progressBar: { style: { width: '' } },
        progressText: { textContent: '' },
        preparationStatus: { textContent: '', className: '' },
        startButton: { disabled: false, textContent: '' },
        completionBox: { style: { display: 'none' } },
        tempChartCurrentBadge: { textContent: '' },
        volumeChartCurrentBadge: { textContent: '' },
        temperatureSlider: { value: '90', min: '0', max: '100' },
        temperatureInput: { value: '90', min: '0', max: '100' },
        temperatureValue: { textContent: '' },
        temperatureStatus: { textContent: '', className: '' },
        estimatedPrepTime: { textContent: '' },
        estimatedPrepTimeNote: { textContent: '' },
        estTimeBadge: { textContent: '' },
        step3EstimatedTimeCard: { classList: { add: () => {}, remove: () => {} } },
        monitorRecommendedTempValue: { textContent: '90°C' },
        recommendedTempValue: { textContent: '90°C' },
        readyMessage: { textContent: '' },
        finalVolume: { textContent: '' },
        finalPreparationTime: { textContent: '' },
        finalTemperature: { textContent: '' },
        heatingStatus: { textContent: '' },
        evaporationStatus: { textContent: '' }
    };

    const mockWindow = {
        scrollTo: () => {},
        setInterval: (fn, ms) => 999,
        clearInterval: () => {},
        preparationData: {
            formulation: 'Amrtottara Kwatha Curna',
            ingredients: ['Sunthi', 'Amrta', 'Abhaya'],
            powder: 48,
            water: 384,
            targetVolume: 96,
            target_volume: 96
        },
        detectedFormulation: 'Amrtottara Kwatha Curna'
    };

    const mockDoc = {
        getElementById: (id) => dom[id] || null,
        querySelectorAll: () => [],
        addEventListener: () => {}
    };

    return { dom, mockWindow, mockDoc };
}

const env = createMockEnvironment();
global.window = env.mockWindow;
global.document = env.mockDoc;
global.localStorage = { getItem: () => null, setItem: () => {} };

eval(fs.readFileSync(path.join(monitorDir, 'batch_history.js'), 'utf8'));
eval(fs.readFileSync(path.join(monitorDir, 'script.js'), 'utf8'));

setTemperature(90);

console.log('\n--- 1. STARTING PREPARATION (384 mL -> 96 mL, 90°C) ---');
startPreparation();

console.log('T0 Current Temperature:', env.dom.monitorTemperature.textContent);
console.log('T0 Current Volume:', env.dom.currentVolume.textContent);
console.log('T0 Evaporation Rate:', env.dom.evaporationRate.textContent);
console.log('T0 Elapsed Time:', env.dom.elapsedTime.textContent);
console.log('T0 Remaining Time:', env.dom.remainingTime.textContent);
console.log('T0 Status:', env.dom.preparationStatus.textContent);

if (env.dom.monitorTemperature.textContent !== '0.0°C') {
    console.error('FAIL: T0 Temperature is not 0.0°C');
    process.exit(1);
}
if (env.dom.evaporationRate.textContent !== '0.00 mL/min') {
    console.error('FAIL: T0 Evaporation rate is not 0.00 mL/min');
    process.exit(1);
}
console.log('✓ PASS: Start state initialized correctly at 0.0°C and 0.00 mL/min');

console.log('\n--- 2. PHASE 1: HEATING TRANSITION ---');
let enteredHoldingPhase = false;
for (let t = 1; t <= 15; t++) {
    updateMonitoring();
    const temp = parseFloat(env.dom.monitorTemperature.textContent);
    const vol = parseFloat(env.dom.currentVolume.textContent);
    const rate = env.dom.evaporationRate.textContent;
    const status = env.dom.preparationStatus.textContent;

    if (temp < 90) {
        if (vol !== 384) {
            console.error(`FAIL: Volume changed during heating phase at tick ${t}: ${vol} mL`);
            process.exit(1);
        }
        if (rate !== '0.00 mL/min') {
            console.error(`FAIL: Evaporation rate active during heating phase at tick ${t}: ${rate}`);
            process.exit(1);
        }
    } else {
        if (!enteredHoldingPhase) {
            enteredHoldingPhase = true;
            console.log(`Phase 2 (Hold & Reduction) entered at tick ${t} with Temp = ${temp}°C!`);
        }
    }
}
if (!enteredHoldingPhase) {
    console.error('FAIL: Never entered holding phase');
    process.exit(1);
}
console.log('✓ PASS: Phase 1 (Heating) kept volume stable and evaporation at 0.00 mL/min until 90°C');

console.log('\n--- 3. PHASE 2: HOLD & MONOTONIC REDUCTION ---');
let prevVol = parseFloat(env.dom.currentVolume.textContent);
for (let t = 16; t <= 35; t++) {
    updateMonitoring();
    const curVol = parseFloat(env.dom.currentVolume.textContent);
    const temp = parseFloat(env.dom.monitorTemperature.textContent);

    if (curVol > prevVol) {
        console.error(`FAIL: Volume increased during reduction at tick ${t}: ${prevVol} -> ${curVol}`);
        process.exit(1);
    }
    if (temp !== 90.0) {
        console.error(`FAIL: Temperature deviated from 90°C during hold at tick ${t}: ${temp}`);
        process.exit(1);
    }
    prevVol = curVol;
}
console.log(`After 35 ticks: Temp = ${env.dom.monitorTemperature.textContent}, Vol = ${env.dom.currentVolume.textContent}, Rate = ${env.dom.evaporationRate.textContent}, Status = ${env.dom.preparationStatus.textContent}`);
console.log('✓ PASS: Phase 2 (Hold & Reduction) maintains 90°C hold and monotonic volume decrease');

console.log('\n--- 4. PHASE 3: COMPLETION TRIGGER (Target Volume 96 mL) ---');
// Fast-forward simulation to reach completion threshold
window.setCurrentVolume(96.0);
updateMonitoring();

console.log('Completion Final Volume:', env.dom.currentVolume.textContent);
console.log('Completion Remaining Time:', env.dom.remainingTime.textContent);
console.log('Completion Progress:', env.dom.progressText.textContent);
console.log('Completion Status Text:', env.dom.preparationStatus.textContent);
console.log('Completion Status Class:', env.dom.preparationStatus.className);
console.log('Final Temperature:', env.dom.finalTemperature.textContent);

if (parseFloat(env.dom.currentVolume.textContent) !== 96.0) {
    console.error('FAIL: Completion volume is not 96.00 mL');
    process.exit(1);
}
if (env.dom.remainingTime.textContent !== '00:00') {
    console.error('FAIL: Completion remaining time is not 00:00');
    process.exit(1);
}
if (env.dom.progressText.textContent !== '100%') {
    console.error('FAIL: Completion progress is not 100%');
    process.exit(1);
}
if (!env.dom.preparationStatus.textContent.includes('Preparation Complete')) {
    console.error('FAIL: Completion status text incorrect');
    process.exit(1);
}
if (!env.dom.preparationStatus.className.includes('complete')) {
    console.error('FAIL: Completion status class is not complete');
    process.exit(1);
}
if (env.dom.finalTemperature.textContent !== '90°C') {
    console.error('FAIL: Final temperature is not 90°C');
    process.exit(1);
}

console.log('\n================================================================');
console.log('ALL MULTI-STAGE SIMULATION TESTS PASSED! ZERO VIOLATIONS! ✓');
console.log('================================================================');
