const fs = require('fs');
const path = require('path');

console.log('================================================================');
console.log('iKWATH-X REMAINING TIME MONOTONICITY & COUNTDOWN VERIFICATION');
console.log('================================================================');

const monitorDir = path.join(__dirname, '..', 'iKwath_ML', 'evaporation_monitor');

// Mock DOM elements for monitoring
const domElements = {
    currentVolume: { textContent: '' },
    flowCurrentVolume: { textContent: '' },
    evaporationRate: { textContent: '' },
    elapsedTime: { textContent: '' },
    remainingTime: { textContent: '' },
    progressBar: { style: { width: '' } },
    progressText: { textContent: '' },
    monitorTemperature: { textContent: '' },
    preparationStatus: { textContent: '', className: '' },
    temperatureValue: { textContent: '' },
    temperatureStatus: { textContent: '', className: '' },
    temperatureSlider: { value: '85', min: '0', max: '100' },
    temperatureInput: { value: '85', min: '0', max: '100' },
    estimatedPrepTime: { textContent: '' },
    estimatedPrepTimeNote: { textContent: '' },
    estTimeBadge: { textContent: '' },
    step3EstimatedTimeCard: { classList: { add: () => {}, remove: () => {} } },
    startButton: { disabled: false, textContent: '' },
    completionBox: { style: { display: 'none' } },
    step1: { classList: { add: () => {}, remove: () => {} } },
    step2: { classList: { add: () => {}, remove: () => {} } },
    step3: { classList: { add: () => {}, remove: () => {} } },
    step4: { classList: { add: () => {}, remove: () => {} } },
    readyMessage: { textContent: '' },
    finalVolume: { textContent: '' },
    finalPreparationTime: { textContent: '' },
    finalTemperature: { textContent: '' },
    heatingStatus: { textContent: '' },
    evaporationStatus: { textContent: '' }
};

let capturedIntervalCallback = null;

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
    },
    setInterval: (cb, ms) => {
        capturedIntervalCallback = cb;
        return 12345;
    },
    clearInterval: () => {
        capturedIntervalCallback = null;
    }
};

global.document = {
    getElementById: (id) => domElements[id] || null,
    querySelectorAll: (sel) => [],
    addEventListener: () => {}
};

global.localStorage = {
    getItem: () => null,
    setItem: () => {}
};

// Evaluate batch_history & script.js
eval(fs.readFileSync(path.join(monitorDir, 'batch_history.js'), 'utf8'));
eval(fs.readFileSync(path.join(monitorDir, 'script.js'), 'utf8'));

// Start Preparation
console.log('\n--- 1. STARTING PREPARATION ---');
startPreparation();

console.log('T0 - Elapsed Time:', domElements.elapsedTime.textContent);
console.log('T0 - Remaining Time:', domElements.remainingTime.textContent);
console.log('T0 - Current Volume:', domElements.currentVolume.textContent);
console.log('T0 - Evaporation Rate:', domElements.evaporationRate.textContent);

// Parse MM:SS to seconds
function parseTimeToSeconds(timeStr) {
    if (!timeStr || timeStr === '—' || timeStr === 'Calculating...') return null;
    const parts = timeStr.trim().split(':').map(Number);
    if (parts.length === 2) {
        return parts[0] * 60 + parts[1];
    }
    if (parts.length === 3) {
        return parts[0] * 3600 + parts[1] * 60 + parts[2];
    }
    return null;
}

let prevElapsedSec = parseTimeToSeconds(domElements.elapsedTime.textContent);
let prevRemainingSec = parseTimeToSeconds(domElements.remainingTime.textContent);
let prevProgress = 0;
let prevVolume = parseFloat(domElements.currentVolume.textContent);

console.log(`\nT0 seconds: Elapsed = ${prevElapsedSec}s, Remaining = ${prevRemainingSec}s`);

console.log('\n--- 2. RUNNING 60-SECOND CONTINUOUS LIVE SIMULATION ---');
console.log('Sec | Elapsed | Remaining | Rem (sec) | Volume    | Rate     | Temp | Status');
console.log('----+---------+-----------+-----------+-----------+----------+------+-------------------');

let monotonicityViolations = 0;

for (let tick = 1; tick <= 60; tick++) {
    // Inject Temperature Changes to test Section 6 & 17
    if (tick === 20) {
        console.log('>>> [EVENT] Operator decreases temperature from 85°C to 70°C at tick 20');
        setTemperature(70);
    }
    if (tick === 40) {
        console.log('>>> [EVENT] Operator increases temperature from 70°C to 95°C at tick 40');
        setTemperature(95);
    }

    // Advance 1 second tick
    updateMonitoring();

    const curElapsedStr = domElements.elapsedTime.textContent;
    const curRemainingStr = domElements.remainingTime.textContent;
    const curElapsedSec = parseTimeToSeconds(curElapsedStr);
    const curRemainingSec = parseTimeToSeconds(curRemainingStr);
    const curVolume = parseFloat(domElements.currentVolume.textContent);
    const curRate = domElements.evaporationRate.textContent;
    const curTemp = domElements.monitorTemperature.textContent;
    const curProgress = parseFloat(domElements.progressText.textContent || '0');

    let statusNote = 'OK';

    // Verification 1: Remaining Time MUST NEVER INCREASE (newRemaining <= prevRemaining)
    if (curRemainingSec > prevRemainingSec) {
        statusNote = `VIOLATION: JUMP UP (+${curRemainingSec - prevRemainingSec}s)!`;
        monotonicityViolations++;
        console.error(`ERROR at tick ${tick}: Remaining time jumped from ${prevRemainingSec}s to ${curRemainingSec}s!`);
    }

    // Verification 2: Elapsed Time must be monotonically increasing
    if (curElapsedSec < prevElapsedSec) {
        statusNote = `VIOLATION: Elapsed time moved backwards!`;
        monotonicityViolations++;
        console.error(`ERROR at tick ${tick}: Elapsed time moved backwards from ${prevElapsedSec}s to ${curElapsedSec}s!`);
    }

    // Verification 3: Volume must decrease
    if (curVolume > prevVolume) {
        statusNote = `VIOLATION: Volume increased!`;
        monotonicityViolations++;
    }

    // Print periodic telemetry
    if (tick <= 5 || tick % 5 === 0 || tick === 20 || tick === 21 || tick === 40 || tick === 41) {
        const line = `${String(tick).padStart(3, ' ')} | ${curElapsedStr.padStart(7, ' ')} | ${curRemainingStr.padStart(9, ' ')} | ${String(curRemainingSec).padStart(9, ' ')} | ${domElements.currentVolume.textContent.padStart(9, ' ')} | ${curRate.padStart(8, ' ')} | ${curTemp.padStart(4, ' ')} | ${statusNote}`;
        console.log(line);
    }

    prevElapsedSec = curElapsedSec;
    prevRemainingSec = curRemainingSec;
    prevVolume = curVolume;
    prevProgress = curProgress;
}

console.log('\n--- 3. COMPLETION SIMULATION ---');
// Fast-forward to target volume / completion to verify 00:00
completePreparation();
console.log('Target reached state:');
console.log('Current Volume:', domElements.currentVolume.textContent);
console.log('Remaining Time:', domElements.remainingTime.textContent);
console.log('Preparation Status:', domElements.preparationStatus.textContent);

if (domElements.remainingTime.textContent !== '00:00') {
    console.error('ERROR: Remaining time at completion is not 00:00');
    process.exit(1);
}
console.log('✓ PASS: Remaining Time reaches exactly 00:00 at completion.');

console.log('\n================================================================');
if (monotonicityViolations === 0) {
    console.log('ALL MONOTONICITY & TIMING TESTS PASSED! ZERO VIOLATIONS! ✓');
    console.log('Remaining Time is strictly non-increasing across all 60 seconds.');
    console.log('Temperature adjustments caused zero backward jumps.');
    console.log('================================================================');
    process.exit(0);
} else {
    console.error(`FAILED: ${monotonicityViolations} monotonicity violations recorded!`);
    process.exit(1);
}
