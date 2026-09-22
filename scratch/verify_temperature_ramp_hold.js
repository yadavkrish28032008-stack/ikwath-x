const fs = require('fs');
const path = require('path');

console.log('================================================================');
console.log('iKWATH-X VERIFICATION: TEMPERATURE RAMP & TEMPERATURE HOLD');
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
        recommendedTempValue: { textContent: '90°C' }
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

// Test function for a given target temperature
function testTargetTemperature(targetTemp) {
    console.log(`\n>>> Testing Target Temperature: ${targetTemp}°C <<<`);
    const env = createMockEnvironment();
    global.window = env.mockWindow;
    global.document = env.mockDoc;
    global.localStorage = { getItem: () => null, setItem: () => {} };

    eval(fs.readFileSync(path.join(monitorDir, 'batch_history.js'), 'utf8'));
    eval(fs.readFileSync(path.join(monitorDir, 'script.js'), 'utf8'));

    setTemperature(targetTemp);

    // 1. START PREPARATION
    startPreparation();

    const t0Temp = parseFloat(env.dom.monitorTemperature.textContent);
    console.log(`T=0s | Temp: ${env.dom.monitorTemperature.textContent} | Status: ${env.dom.preparationStatus.textContent} | Rate: ${env.dom.evaporationRate.textContent}`);

    if (t0Temp !== 0.0) {
        console.error(`FAIL: T=0 temperature must be 0.0°C, got ${t0Temp}°C`);
        process.exit(1);
    }
    console.log(`✓ Section 1 PASS: Temperature starts at exactly 0.0°C`);

    const recordedTemps = [t0Temp];
    let reachedTargetAt = null;

    // Run 30 ticks
    for (let tick = 1; tick <= 30; tick++) {
        updateMonitoring();
        const curTemp = parseFloat(env.dom.monitorTemperature.textContent);
        recordedTemps.push(curTemp);

        const prevTemp = recordedTemps[recordedTemps.length - 2];

        // Check monotonicity during ramp
        if (curTemp < prevTemp) {
            console.error(`FAIL: Temperature decreased during heating ramp at tick ${tick}: ${prevTemp}°C -> ${curTemp}°C`);
            process.exit(1);
        }

        // Check hold stability (no overshoot beyond targetTemp)
        if (curTemp > targetTemp) {
            console.error(`FAIL: Temperature overshot target ${targetTemp}°C at tick ${tick}: ${curTemp}°C`);
            process.exit(1);
        }

        if (curTemp === targetTemp && reachedTargetAt === null) {
            reachedTargetAt = tick;
            console.log(`  -> Target ${targetTemp}°C REACHED at tick ${tick}!`);
        }

        if (tick <= 15 || tick === 20 || tick === 25 || tick === 30) {
            console.log(`Tick ${String(tick).padStart(2, ' ')}s | Temp: ${env.dom.monitorTemperature.textContent.padStart(7, ' ')} | Vol: ${env.dom.currentVolume.textContent.padStart(9, ' ')} | Rate: ${env.dom.evaporationRate.textContent.padStart(12, ' ')} | Status: ${env.dom.preparationStatus.textContent}`);
        }
    }

    if (reachedTargetAt === null) {
        console.error(`FAIL: Did not reach target temperature ${targetTemp}°C within 30 ticks`);
        process.exit(1);
    }

    console.log(`✓ Section 2 & 3 PASS: Temperature ramped gradually from 0°C to ${targetTemp}°C`);

    // Verify temperature hold after reaching target
    for (let i = reachedTargetAt; i < recordedTemps.length; i++) {
        if (recordedTemps[i] !== targetTemp) {
            console.error(`FAIL: Temperature hold violated at tick ${i}: expected ${targetTemp}°C, got ${recordedTemps[i]}°C`);
            process.exit(1);
        }
    }
    console.log(`✓ Section 4 PASS: Temperature holds stably at exactly ${targetTemp}°C for all subsequent ticks without fluctuating or overshooting`);
}

// Test multiple targets as specified in Section 25:
[90, 70, 80, 100].forEach(t => testTargetTemperature(t));

console.log('\n================================================================');
console.log('ALL TEMPERATURE RAMP & HOLD TESTS PASSED! ZERO VIOLATIONS! ✓');
console.log('================================================================');
