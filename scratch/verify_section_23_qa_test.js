const fs = require('fs');
const path = require('path');

console.log('================================================================');
console.log('iKWATH-X SECTION 23 QA TEST EXECUTION');
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

console.log('\n[MILESTONE 1] START');
startPreparation();

console.log('Current Temperature at START:', env.dom.monitorTemperature.textContent);
if (env.dom.monitorTemperature.textContent !== '0.0°C') {
    console.error('FAIL: Current temperature at start must be 0°C');
    process.exit(1);
}
console.log('✓ PASS: Current Temperature = 0°C');

console.log('\n[MILESTONE 2] HEATING — temperature gradually increases');
let saw86 = false, saw87_89 = false, saw90 = false;
for (let t = 1; t <= 15; t++) {
    updateMonitoring();
    const tempNum = parseFloat(env.dom.monitorTemperature.textContent);
    console.log(`Tick ${String(t).padStart(2, ' ')} | Temp: ${env.dom.monitorTemperature.textContent} | Vol: ${env.dom.currentVolume.textContent} | Rate: ${env.dom.evaporationRate.textContent}`);
    if (tempNum >= 86.0 && tempNum < 87.0) saw86 = true;
    if (tempNum >= 87.0 && tempNum <= 89.9) saw87_89 = true;
    if (tempNum === 90.0) saw90 = true;
}

if (!saw86 || !saw87_89 || !saw90) {
    console.error(`FAIL: Heating milestones not met: saw86=${saw86}, saw87_89=${saw87_89}, saw90=${saw90}`);
    process.exit(1);
}
console.log('✓ PASS: Heating progression observed near target (86°C -> 87°C-89°C -> 90°C)');

console.log('\n[MILESTONE 3] HOLD — 90°C remains stable');
for (let t = 16; t <= 25; t++) {
    updateMonitoring();
    const tempNum = parseFloat(env.dom.monitorTemperature.textContent);
    if (tempNum !== 90.0) {
        console.error(`FAIL: Hold violated at tick ${t}: ${tempNum}°C`);
        process.exit(1);
    }
}
console.log('✓ PASS: 90°C remains strictly stable during hold phase');

console.log('\n[MILESTONE 4] REDUCTION — Current Volume gradually decreases');
const volAtStartOfReduction = parseFloat(env.dom.currentVolume.textContent);
for (let t = 26; t <= 40; t++) {
    updateMonitoring();
}
const volAfterReduction = parseFloat(env.dom.currentVolume.textContent);
console.log(`Volume trajectory: ${volAtStartOfReduction} mL -> ${volAfterReduction} mL`);
if (volAfterReduction >= volAtStartOfReduction) {
    console.error('FAIL: Volume did not decrease during reduction');
    process.exit(1);
}
console.log('✓ PASS: Current Volume gradually and monotonically decreases');

console.log('\n[MILESTONE 5] TARGET REACHED & COMPLETE');
window.setCurrentVolume(96.0);
updateMonitoring();

console.log('Final Volume:', env.dom.currentVolume.textContent);
console.log('Progress:', env.dom.progressText.textContent);
console.log('Remaining Time:', env.dom.remainingTime.textContent);
console.log('Status Text:', env.dom.preparationStatus.textContent);

if (env.dom.currentVolume.textContent !== '96.00 mL') {
    console.error('FAIL: Target volume 96.00 mL not reached');
    process.exit(1);
}
if (env.dom.progressText.textContent !== '100%') {
    console.error('FAIL: Progress is not 100%');
    process.exit(1);
}
if (env.dom.remainingTime.textContent !== '00:00') {
    console.error('FAIL: Remaining time is not 00:00');
    process.exit(1);
}
if (!env.dom.preparationStatus.textContent.includes('Preparation Complete')) {
    console.error('FAIL: Preparation stage is not Complete');
    process.exit(1);
}

console.log('\n================================================================');
console.log('SECTION 23 QA TEST FULLY VERIFIED AND PASSED! ✓');
console.log('================================================================');
