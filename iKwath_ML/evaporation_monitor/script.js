// ============================================================
// iKWATH - SMART PREPARATION ENGINE
// ============================================================


// ============================================================
// GLOBAL VARIABLES
// ============================================================

let detectedFormulation = null;

let preparationData = null;

let selectedTemperature = 85;
if (typeof window !== "undefined") {
    window.selectedTemperature = selectedTemperature;
}

let currentTemperature = 0;
if (typeof window !== "undefined") {
    window.currentTemperature = currentTemperature;
}

let simulatedStage = "Starting";
if (typeof window !== "undefined") {
    window.simulatedStage = simulatedStage;
}

let heatingCompleted = false;
if (typeof window !== "undefined") {
    window.heatingCompleted = heatingCompleted;
}

let initialVolume = 0;

let currentVolume = 0;

let targetVolume = 0;

let evaporationRate = 0;

let elapsedSeconds = 0;

let remainingSeconds = 0;

let preparationStartTime = null;

let estimatedTotalDurationSeconds = 0;

let lastRemainingSeconds = null;

let lastProgress = 0;

let preparationRunning = false;

let preparationTimer = null;

let chart = null;

let tempChart = null;

let volumeChart = null;


// ============================================================
// PAGE LOAD
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        setupTemperatureControl();

        updateTemperatureStatus();

        if (typeof updateEstimatedPreparationTime === "function") {
            updateEstimatedPreparationTime();
        }

    }
);


// ============================================================
// HELPER
// ============================================================

function updateText(
    id,
    value
) {

    const element =
        document.getElementById(id);


    if (element) {

        element.textContent =
            value;

    }

}


// ============================================================
// STEP NAVIGATION
// ============================================================

function showStep(
    stepNumber
) {
    let normalized = Number(stepNumber);
    let panelId;
    let indicatorStep;

    if (normalized === 1) {
        panelId = "step1";
        indicatorStep = 1;
    } else if (normalized === 2) {
        panelId = "step2";
        indicatorStep = 2;
    } else if (normalized === 3 || normalized === 4) {
        panelId = "step3";
        indicatorStep = 3;
    } else {
        panelId = "step" + normalized;
        indicatorStep = normalized;
    }

    const panels =
        document.querySelectorAll(
            ".step-panel"
        );


    panels.forEach(
        panel => {

            panel.classList.remove(
                "active"
            );

        }
    );


    const target =
        document.getElementById(
            panelId
        ) ||
        document.getElementById(
            "step" + normalized
        );


    if (target) {

        target.classList.add(
            "active"
        );

    }


    updateStepIndicator(
        indicatorStep
    );


    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

}


// ============================================================
// STEP INDICATOR
// ============================================================

function updateStepIndicator(
    activeStep
) {

    const steps =
        document.querySelectorAll(
            ".step"
        );


    steps.forEach(
        (step, index) => {

            const number =
                index + 1;


            step.classList.remove(
                "active",
                "completed"
            );


            if (
                number <
                activeStep
            ) {

                step.classList.add(
                    "completed"
                );

            }


            if (
                number ===
                activeStep
            ) {

                step.classList.add(
                    "active"
                );

            }

        }
    );

}


// ============================================================
// INGREDIENT DETECTION
// ============================================================

async function detectFormulation() {

    const input =
        document.getElementById(
            "ingredientInput"
        );


    const message =
        document.getElementById(
            "detectionMessage"
        );


    if (!input) {

        return;

    }


    const text =
        input.value.trim();


    if (!text) {

        if (message) {
            message.textContent =
                "Please enter the ingredients.";
            message.style.color =
                "#a04444";
        }

        return;

    }


    const ingredients =
        text
            .split(",")
            .map(
                item =>
                    item.trim()
            )
            .filter(
                item =>
                    item.length > 0
            );


    if (message) {
        message.textContent =
            "Detecting formulation...";
        message.style.color =
            "#76513a";
    }


    try {

        const response =
            await fetch(
                "/detect-formulation",
                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify({

                            ingredients:
                                ingredients

                        })

                }
            );


        const result =
            await response.json();


        if (!response.ok ||
            !result.success
        ) {

            if (message) {
                message.textContent =
                    result.error ||
                    "No matching formulation found.";
                message.style.color =
                    "#a04444";
            }

            return;

        }


        // ----------------------------------------------------
        // SAVE FORMULATION
        // ----------------------------------------------------

        detectedFormulation =
            result.formulation;


        // ----------------------------------------------------
        // SHOW FORMULATION
        // ----------------------------------------------------

        updateText(
            "detectedFormulation",
            result.formulation
        );


        updateText(
            "selectedIngredients",
            result.ingredients.join(
                ", "
            )
        );


        if (message) {
            message.textContent =
                "✓ Formulation detected successfully.";
            message.style.color =
                "#286a45";
        }

        // Update Batch History recommendation for newly detected formulation
        if (window.batchHistory && typeof window.batchHistory.updateRecommendation === 'function') {
            window.batchHistory.updateRecommendation(result.formulation, result.ingredients);
        }


        // ----------------------------------------------------
        // IN 3-STEP FLOW, FORMULATION IS REVIEWED IN STEP 1
        // ----------------------------------------------------

        setTimeout(
            function () {
                const card = document.getElementById("detectedFormulation");
                if (card && typeof card.scrollIntoView === "function") {
                    card.scrollIntoView({
                        behavior: "smooth",
                        block: "nearest"
                    });
                }
            },
            200
        );


    } catch (error) {

        console.error(
            error
        );


        if (message) {
            message.textContent =
                "Backend connection failed. Please check Flask.";
            message.style.color =
                "#a04444";
        }

    }

}


// ============================================================
// GO TO TEMPERATURE (STEP 3)
// ============================================================

async function goToTemperature() {

    if (!detectedFormulation && window.detectedFormulation) {
        detectedFormulation = window.detectedFormulation;
    }

    if (!detectedFormulation) {
        const activePod = (typeof window.podParser !== 'undefined' && typeof window.podParser.getActivePod === 'function')
            ? window.podParser.getActivePod()
            : null;
        if (activePod && activePod.formulation) {
            detectedFormulation = activePod.formulation;
            window.detectedFormulation = activePod.formulation;
        }
    }

    if (!detectedFormulation) {
        const detectedHeading = document.getElementById("detectedFormulation");
        if (detectedHeading && detectedHeading.textContent.trim() && detectedHeading.textContent.trim() !== "—") {
            detectedFormulation = detectedHeading.textContent.trim();
            window.detectedFormulation = detectedFormulation;
        }
    }

    if (!detectedFormulation) {

        alert(
            "Please scan a QR pod first to load ingredients and formulation."
        );

        return;

    }

    // Ensure volume state is initialized internally (without requiring user-facing powder input)
    if (!preparationData || !initialVolume || !targetVolume) {
        const powderVal = 48; // Standard prototype benchmark powder quantity
        try {
            const response = await fetch("/calculate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    formulation: detectedFormulation,
                    powder: powderVal
                })
            });
            const result = await response.json();
            if (response.ok && result.success && result.data) {
                applyPreparationState(result.data);
            } else {
                applyPreparationState({
                    formulation: detectedFormulation,
                    powder: powderVal,
                    water: powderVal * 8,
                    target_volume: (powderVal * 8) / 4
                });
            }
        } catch (err) {
            applyPreparationState({
                formulation: detectedFormulation,
                powder: powderVal,
                water: powderVal * 8,
                target_volume: (powderVal * 8) / 4
            });
        }
    }

    showStep(2);

    if (typeof updateEstimatedPreparationTime === "function") {
        updateEstimatedPreparationTime();
    }

    if (window.batchHistory && typeof window.batchHistory.updateRecommendation === "function") {
        window.batchHistory.updateRecommendation(detectedFormulation, preparationData ? preparationData.ingredients : []);
    }

}

function goToPowder() {
    return goToTemperature();
}


// ============================================================
// FORMAT HELPERS
// ============================================================

function formatVolume(val) {
    if (val === undefined || val === null || isNaN(val)) return "—";
    const num = Number(val);
    return (Number.isInteger(num) ? num : num.toFixed(2)) + " mL";
}

window.formatVolume = formatVolume;


// ============================================================
// APPLY PREPARATION STATE (SYNC QR OR BACKEND PREP DATA)
// ============================================================

function applyPreparationState(data) {

    if (!data) return;

    detectedFormulation =
        data.formulation ||
        detectedFormulation ||
        (window.detectedFormulation || null);

    const powderVal =
        Number(
            data.powder !== undefined ?
                data.powder :
                48
        );

    const waterVal =
        Number(
            data.water !== undefined ?
                data.water :
                (powderVal * 8)
        );

    const targetVal =
        Number(
            data.target_volume !== undefined ?
                data.target_volume :
                (data.targetVolume !== undefined ?
                    data.targetVolume :
                    (waterVal / 4))
        );

    preparationData = {
        formulation: detectedFormulation,
        ingredients: data.ingredients || (data.botanicals || []),
        powder: powderVal,
        water: waterVal,
        reduction: data.reduction || "1/4",
        target_volume: targetVal,
        targetVolume: targetVal
    };

    initialVolume = waterVal;
    currentVolume = initialVolume;
    targetVolume = targetVal;

    // Expose for external verification and sync
    window.detectedFormulation = detectedFormulation;
    window.preparationData = preparationData;
    window.initialVolume = initialVolume;
    window.currentVolume = currentVolume;
    window.targetVolume = targetVolume;

    // Synchronize UI values across all dashboard sections with clean integer/decimal formatting
    const formattedPowder = (Number.isInteger(powderVal) ? powderVal : powderVal.toFixed(1)) + " g";
    const formattedWater = formatVolume(initialVolume);
    const formattedTarget = formatVolume(targetVolume);

    updateText("powderAmount", formattedPowder);
    updateText("waterAmount", formattedWater);
    updateText("targetVolume", formattedTarget);
    updateText("initialVolume", formattedWater);
    updateText("flowCurrentVolume", formattedWater);
    updateText("flowTargetVolume", formattedTarget);
    updateText("monitorTargetVolume", formattedTarget);
    updateText("currentVolume", formattedWater);

    const powderInput = document.getElementById("powderInput");
    if (powderInput && (!powderInput.value || Number(powderInput.value) !== powderVal)) {
        powderInput.value = powderVal;
    }

    // Refresh Batch History recommendation
    if (window.batchHistory && typeof window.batchHistory.updateRecommendation === 'function') {
        window.batchHistory.updateRecommendation(detectedFormulation, preparationData ? preparationData.ingredients : []);
    }

    // Refresh Dynamic Estimated Preparation Time
    if (typeof updateEstimatedPreparationTime === 'function') {
        updateEstimatedPreparationTime();
    }
}

window.applyPreparationState = applyPreparationState;


// ============================================================
// CALCULATE PREPARATION
// ============================================================

async function calculatePreparation() {

    if (!detectedFormulation && window.detectedFormulation) {
        detectedFormulation = window.detectedFormulation;
    }

    if (!detectedFormulation) {

        alert(
            "Please detect the formulation first."
        );

        return;

    }


    const input =
        document.getElementById(
            "powderInput"
        );


    const powder =
        Number(
            input.value
        );


    if (
        isNaN(powder) ||
        powder <= 0
    ) {

        alert(
            "Please enter a valid powder quantity."
        );

        return;

    }


    try {

        const response =
            await fetch(
                "/calculate",
                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify({

                            formulation:
                                detectedFormulation,

                            powder:
                                powder

                        })

                }
            );


        const result =
            await response.json();


        if (!response.ok ||
            !result.success
        ) {

            alert(
                result.error ||
                "Calculation failed."
            );

            return;

        }


        applyPreparationState(result.data);


        // ----------------------------------------------------
        // SAVE VOLUMES
        // ----------------------------------------------------

        initialVolume =
            Number(
                preparationData.water
            );


        currentVolume =
            initialVolume;


        targetVolume =
            Number(
                preparationData.target_volume
            );


        // ----------------------------------------------------
        // UPDATE PREDICTION
        // ----------------------------------------------------

        updateText(
            "powderAmount",
            (Number.isInteger(preparationData.powder) ? preparationData.powder : preparationData.powder.toFixed(1)) +
            " g"
        );


        updateText(
            "waterAmount",
            formatVolume(initialVolume)
        );


        updateText(
            "targetVolume",
            formatVolume(targetVolume)
        );


        // ----------------------------------------------------
        // MONITOR VALUES
        // ----------------------------------------------------

        updateText(
            "initialVolume",
            formatVolume(initialVolume)
        );


        updateText(
            "flowCurrentVolume",
            formatVolume(initialVolume)
        );


        updateText(
            "flowTargetVolume",
            formatVolume(targetVolume)
        );


        updateText(
            "monitorTargetVolume",
            formatVolume(targetVolume)
        );


        updateText(
            "currentVolume",
            formatVolume(initialVolume)
        );


        // ----------------------------------------------------
        // GO TO TEMPERATURE (STEP 2)
        // ----------------------------------------------------

        showStep(2);

        if (typeof updateEstimatedPreparationTime === "function") {
            updateEstimatedPreparationTime();
        }


    } catch (error) {

        console.error(
            error
        );


        alert(
            "Unable to connect to Flask backend."
        );

    }

}


// ============================================================
// TEMPERATURE CONTROL (0°C → 100°C)
// ============================================================

function setupTemperatureControl() {

    const slider =
        document.getElementById(
            "temperatureSlider"
        );

    const input =
        document.getElementById(
            "temperatureInput"
        );

    if (slider) {
        slider.min = "0";
        slider.max = "100";
        slider.step = "1";
        slider.value = selectedTemperature;

        slider.addEventListener(
            "input",
            function () {
                setTemperature(slider.value, false);
            }
        );
    }

    if (input) {
        input.min = "0";
        input.max = "100";
        input.step = "1";
        input.value = selectedTemperature;

        input.addEventListener(
            "input",
            function () {
                setTemperature(input.value, false);
            }
        );
    }

}

function setTemperature(val, syncControls = true) {
    let num = Number(val);
    if (isNaN(num)) return;
    if (num < 0) num = 0;
    if (num > 100) num = 100;
    selectedTemperature = num;
    if (typeof window !== "undefined") {
        window.selectedTemperature = num;
    }

    const slider = document.getElementById("temperatureSlider");
    const input = document.getElementById("temperatureInput");
    if (slider && (syncControls || Number(slider.value) !== num)) slider.value = num;
    if (input && (syncControls || Number(input.value) !== num)) input.value = num;

    updateTemperatureStatus();
    if (typeof updateEstimatedPreparationTime === "function") {
        updateEstimatedPreparationTime();
    }

    // Controlled temperature change handling during active preparation (Section 6)
    if (preparationRunning) {
        // Do NOT reset preparationStartTime or elapsedSeconds!
        // Compute new estimate for the remaining reduction volume at the new temperature:
        const estNew = calculateEstimatedPreparationTime({
            temperature: selectedTemperature,
            formulation: detectedFormulation,
            ingredients: preparationData ? preparationData.ingredients : null,
            initialVolume: currentVolume,
            targetVolume: targetVolume
        });

        let newlyCalculatedRemaining = remainingSeconds;
        if (estNew && estNew.seconds && estNew.seconds > 0) {
            newlyCalculatedRemaining = estNew.seconds;
        }

        // Critical Rule: newRemaining = min(previousRemaining, newlyCalculatedRemaining)
        const previousRemaining = remainingSeconds;
        remainingSeconds = Math.min(previousRemaining, newlyCalculatedRemaining);
        lastRemainingSeconds = remainingSeconds;

        // Keep estimated total duration synchronized: elapsed + remaining
        estimatedTotalDurationSeconds = elapsedSeconds + remainingSeconds;

        updateText("remainingTime", formatTime(remainingSeconds));
    }
}
window.setTemperature = setTemperature;


// ============================================================
// TEMPERATURE STATUS
// ============================================================

function updateTemperatureStatus() {

    const display =
        document.getElementById(
            "temperatureValue"
        );

    if (display) {
        display.textContent =
            selectedTemperature +
            "°C";
    }

    const status =
        document.getElementById(
            "temperatureStatus"
        );

    if (!status) {
        return;
    }

    if (
        selectedTemperature >= 80 &&
        selectedTemperature <= 90
    ) {
        status.textContent =
            "✓ Within Recommended Range (80–90°C)";
        status.className =
            "temperature-status good";
    } else if (selectedTemperature < 40) {
        status.textContent =
            "⚠ Standby: Below Operating Temperature (<40°C)";
        status.className =
            "temperature-status warning";
    } else {
        status.textContent =
            "⚠ Outside Recommended Range (80–90°C)";
        status.className =
            "temperature-status warning";
    }

}


// ============================================================
// HISTORICAL BATCH MATCHING & AVERAGING HELPERS
// ============================================================

function findMatchingHistoricalBatches(formulation, ingredients) {
    if (!formulation) return [];
    if (window.batchHistory && typeof window.batchHistory.getAllBatches === "function") {
        const all = window.batchHistory.getAllBatches();
        if (typeof window.batchHistory.isBatchMatching === "function") {
            return all.filter(b => window.batchHistory.isBatchMatching(b, formulation, ingredients));
        }
        return all.filter(b => b.formulation === formulation);
    }
    return [];
}

function calculateHistoricalAverage(values) {
    if (!Array.isArray(values) || values.length === 0) return null;
    const valid = values.map(Number).filter(v => !isNaN(v) && v > 0);
    if (valid.length === 0) return null;
    const sum = valid.reduce((acc, v) => acc + v, 0);
    return sum / valid.length;
}


// ============================================================
// DYNAMIC ESTIMATED PREPARATION TIME (EVERY 1°C RECALCULATION)
// ============================================================

function calculateEstimatedPreparationTime(param) {
    if (typeof window !== "undefined" && window.selectedTemperature !== undefined) {
        selectedTemperature = Number(window.selectedTemperature);
    }
    let temp = selectedTemperature;
    let context = {};
    if (typeof param === "number") {
        temp = param;
    } else if (param && typeof param === "object") {
        context = param;
        if (param.temperature !== undefined) temp = Number(param.temperature);
    }

    // Determine formulation context
    const currentForm =
        context.formulation ||
        detectedFormulation ||
        window.detectedFormulation ||
        (preparationData ? preparationData.formulation : null) ||
        "Amrtottara Kwatha Curna";

    const currentIngs =
        context.ingredients ||
        (preparationData ? preparationData.ingredients : null) ||
        ["Sunthi", "Amrta", "Abhaya"];

    const initVol = Number(context.initialVolume || initialVolume || (preparationData ? preparationData.water : 384) || 384);
    const tgtVol = Number(context.targetVolume || targetVolume || (preparationData ? (preparationData.target_volume || preparationData.targetVolume) : 96) || 96);
    const deltaV = Math.max(0, initVol - tgtVol);

    // If temperature is below active boiling/simmering threshold (e.g. 0°C or < 40°C), active preparation is not occurring
    if (temp < 40) {
        return {
            status: "inactive",
            seconds: null,
            minutes: null,
            formatted: "Preparation not active at this temperature",
            shortFormatted: "Inactive at this temp",
            temperature: temp,
            deltaV: deltaV,
            rateMlPerMin: 0,
            historicalMatchesCount: 0
        };
    }

    // Benchmark intended duration (at nominal reference temperature 90°C)
    // Derived from formulation identity, matching historical batches, or classical benchmark
    const baseMinutesAt90 = (typeof getIntendedDurationMinutes === "function")
        ? getIntendedDurationMinutes(currentForm, currentIngs)
        : 18;

    // Matching historical records count for advisory context
    const matchingBatches = findMatchingHistoricalBatches(currentForm, currentIngs);

    // Continuous, physics-based thermal progression for every single 1°C:
    // Thermal factor: f(T) = ((T - 30) / (90 - 30))^1.35
    // At 90°C: f(T) = 1.0 -> time = baseMinutesAt90
    // Every 1°C increment produces a live continuous recalculation
    const thermalFactor = Math.pow((temp - 30) / 60, 1.35);
    const estimatedMinutes = baseMinutesAt90 / Math.max(0.01, thermalFactor);
    const estimatedSeconds = Math.round(estimatedMinutes * 60);

    // Human-friendly display format (e.g. "18 min", "1 hr 15 min", "2 hr 25 min")
    const hrs = Math.floor(estimatedMinutes / 60);
    const mins = Math.round(estimatedMinutes % 60);
    let formattedText = "";
    if (hrs > 0) {
        formattedText = `${hrs} hr ${mins} min`;
    } else {
        formattedText = `${Math.max(1, mins)} min`;
    }

    return {
        status: "active",
        seconds: estimatedSeconds,
        minutes: estimatedMinutes,
        formatted: formattedText,
        temperature: temp,
        deltaV: deltaV,
        rateMlPerMin: deltaV > 0 ? Number((deltaV / estimatedMinutes).toFixed(2)) : 16.0,
        baseMinutesAt90: baseMinutesAt90,
        historicalMatchesCount: matchingBatches ? matchingBatches.length : 0
    };
}

function updateEstimatedPreparationTime() {
    const est = calculateEstimatedPreparationTime(selectedTemperature);
    const timeEl = document.getElementById("estimatedPrepTime");
    const noteEl = document.getElementById("estimatedPrepTimeNote");
    const badgeEl = document.getElementById("estTimeBadge");
    const cardEl = document.getElementById("step3EstimatedTimeCard");

    if (timeEl) {
        timeEl.textContent = est.formatted;
    }
    if (cardEl) {
        if (est.status === "inactive") {
            cardEl.classList.add("inactive");
        } else {
            cardEl.classList.remove("inactive");
        }
    }
    if (badgeEl) {
        badgeEl.textContent = est.status === "inactive" ? "Standby" : "Live";
    }
    if (noteEl) {
        if (est.status === "inactive") {
            noteEl.textContent = "Evaporative decoction requires operating range (40°C–100°C)";
        } else if (est.historicalMatchesCount > 0) {
            noteEl.textContent = `Calibrated from ${est.historicalMatchesCount} matching batch${est.historicalMatchesCount === 1 ? "" : "es"} & thermal curve`;
        } else {
            noteEl.textContent = "Calculated from formulation reduction & thermal curve";
        }
    }
    return est;
}


// ============================================================
// START PREPARATION
// ============================================================

function startPreparation() {

    // Auto-recover state from window or active pod if available
    if (!preparationData) {
        if (window.preparationData) {
            applyPreparationState(window.preparationData);
        } else if (typeof window.podParser !== 'undefined' && typeof window.podParser.getActivePod === 'function') {
            const activePod = window.podParser.getActivePod();
            if (activePod && (activePod.water || activePod.powder)) {
                applyPreparationState(activePod);
            }
        }
    }

    if (!preparationData) {

        alert(
            "Please calculate the water quantity first."
        );

        return;

    }


    if (preparationRunning) {

        return;

    }


    // --------------------------------------------------------
    // RESET & SINGLE SOURCE OF TRUTH INITIALIZATION
    // --------------------------------------------------------

    if (preparationTimer) {
        clearInterval(preparationTimer);
        preparationTimer = null;
    }

    preparationRunning =
        true;
    window.preparationRunning = true;

    // 1. Capture preparationStartTime ONCE (Section 4)
    preparationStartTime = Date.now();

    const initVolRaw =
        preparationData
            ? (preparationData.water !== undefined
                ? preparationData.water
                : (preparationData.initialVolume !== undefined
                    ? preparationData.initialVolume
                    : initialVolume))
            : initialVolume;

    initialVolume =
        Number(initVolRaw || initialVolume || 384);

    currentVolume =
        initialVolume;

    const targetVolRaw =
        preparationData
            ? (preparationData.target_volume !== undefined
                ? preparationData.target_volume
                : (preparationData.targetVolume !== undefined
                    ? preparationData.targetVolume
                    : targetVolume))
            : targetVolume;

    targetVolume =
        Number(
            targetVolRaw ||
            targetVolume ||
            96
        );

    // 2. Calculate initial estimated total duration ONCE using current preparation context (Section 4)
    const initialEst = calculateEstimatedPreparationTime({
        temperature: selectedTemperature,
        formulation: detectedFormulation,
        ingredients: preparationData ? preparationData.ingredients : null,
        initialVolume: initialVolume,
        targetVolume: targetVolume
    });

    if (initialEst && initialEst.seconds && initialEst.seconds > 0) {
        estimatedTotalDurationSeconds = initialEst.seconds;
    } else {
        const baseMins = (typeof getIntendedDurationMinutes === "function")
            ? getIntendedDurationMinutes(detectedFormulation, preparationData ? preparationData.ingredients : null)
            : 18;
        estimatedTotalDurationSeconds = Math.round(baseMins * 60);
    }

    elapsedSeconds = 0;
    remainingSeconds = estimatedTotalDurationSeconds;
    lastRemainingSeconds = remainingSeconds;
    lastProgress = 0;

    const totalReduction = Math.max(0, initialVolume - targetVolume);
    const intendedDurationMinutes = estimatedTotalDurationSeconds > 0
        ? (estimatedTotalDurationSeconds / 60)
        : 18.0;

    const nominalRate = (totalReduction > 0 && intendedDurationMinutes > 0)
        ? (totalReduction / intendedDurationMinutes)
        : 16.0;

    // Initial thermal state starts at 0.0°C (Section 1)
    currentTemperature = 0.0;
    if (typeof window !== "undefined") {
        window.currentTemperature = 0.0;
    }
    simulatedStage = "Heating";
    if (typeof window !== "undefined") {
        window.simulatedStage = "Heating";
    }
    heatingCompleted = false;
    if (typeof window !== "undefined") {
        window.heatingCompleted = false;
    }

    // During initial heating phase before boiling, evaporation rate is 0.00 mL/min (Section 8)
    evaporationRate = 0.0;

    // --------------------------------------------------------
    // STATUS
    // --------------------------------------------------------

    updateText(
        "preparationStatus",
        "♨ Heating Phase (0.0°C → " + selectedTemperature + "°C)"
    );

    const status =
        document.getElementById(
            "preparationStatus"
        );

    if (status) {
        status.className =
            "preparation-status running";
    }

    // --------------------------------------------------------
    // START BUTTON
    // --------------------------------------------------------

    const button =
        document.getElementById(
            "startButton"
        );

    if (button) {
        button.disabled =
            true;
        button.textContent =
            "Preparation Running...";
    }

    // --------------------------------------------------------
    // INITIAL VALUES
    // --------------------------------------------------------

    updateText(
        "monitorTemperature",
        "0.0°C"
    );

    updateText(
        "currentVolume",
        formatVolume(currentVolume)
    );

    updateText(
        "flowCurrentVolume",
        formatVolume(currentVolume)
    );

    updateText(
        "elapsedTime",
        "00:00"
    );

    updateText(
        "remainingTime",
        formatTime(remainingSeconds)
    );

    updateText(
        "evaporationRate",
        "0.00 mL/min"
    );

    updateProgress(
        0
    );


    // --------------------------------------------------------
    // COMPLETION BOX HIDE
    // --------------------------------------------------------

    const completion =
        document.getElementById(
            "completionBox"
        );


    if (completion) {

        completion.style.display =
            "none";

    }


    // --------------------------------------------------------
    // CREATE CHARTS & INITIAL T=0 POINT (0.0°C)
    // --------------------------------------------------------

    createChart();

    updateChart(
        0,
        initialVolume,
        targetVolume,
        0.0
    );


    // --------------------------------------------------------
    // GO MONITORING (STEP 3)
    // --------------------------------------------------------

    showStep(3);


    // --------------------------------------------------------
    // START TIMER
    // --------------------------------------------------------

    preparationTimer =
        setInterval(
            updateMonitoring,
            1000
        );

}


// ============================================================
// INTENDED PREPARATION DURATION MODEL
//
// Extracts duration from active preparationData, historical
// batch intelligence (batchHistory.js), or known classical
// kwatha benchmarks (18 min for Amrtottara Kwatha).
// ============================================================

function getIntendedDurationMinutes(contextForm, contextIngs) {
    const currentForm =
        contextForm ||
        detectedFormulation ||
        (preparationData ? preparationData.formulation : null);

    const currentIngs =
        contextIngs ||
        (preparationData ? preparationData.ingredients : null);

    // 1. Explicit duration in preparationData if matching current formulation
    if (preparationData && (!contextForm || !preparationData.formulation || String(contextForm).trim().toLowerCase() === String(preparationData.formulation).trim().toLowerCase())) {
        if (
            preparationData.durationMinutes !== undefined &&
            preparationData.durationMinutes !== null &&
            !isNaN(Number(preparationData.durationMinutes)) &&
            Number(preparationData.durationMinutes) > 0
        ) {
            return Number(preparationData.durationMinutes);
        }
        if (
            preparationData.durationSeconds !== undefined &&
            preparationData.durationSeconds !== null &&
            !isNaN(Number(preparationData.durationSeconds)) &&
            Number(preparationData.durationSeconds) > 0
        ) {
            return Number(preparationData.durationSeconds) / 60;
        }
    }

    if (
        window.batchHistory &&
        typeof window.batchHistory.getAllBatches === "function" &&
        typeof window.batchHistory.calculateMetrics === "function"
    ) {
        try {
            const allBatches = window.batchHistory.getAllBatches();
            const matching = allBatches.filter(b => {
                if (typeof window.batchHistory.isBatchMatching === "function") {
                    return window.batchHistory.isBatchMatching(
                        b,
                        currentForm,
                        currentIngs
                    );
                }
                return b.formulation === currentForm;
            });
            const metrics = window.batchHistory.calculateMetrics(matching);
            if (
                metrics &&
                metrics.hasMatches &&
                metrics.averageTimeMinutes &&
                metrics.averageTimeMinutes > 0
            ) {
                return Number(metrics.averageTimeMinutes);
            }
        } catch (e) {
            console.warn("[iKwath] Error retrieving duration from batchHistory:", e);
        }
    }

    // 3. Known prototype preparation duration benchmarks (classical reference standard)
    const BENCHMARK_DURATIONS = {
        "amrtottara kwatha curna": 18,
        "aragvadhadi kwatha curna": 16,
        "chinnodbhavadi kwatha curna": 17,
        "ardhabilva kwatha curna": 25
    };

    if (currentForm) {
        const normKey = String(currentForm).trim().toLowerCase();
        if (BENCHMARK_DURATIONS[normKey]) {
            return BENCHMARK_DURATIONS[normKey];
        }
    }

    // 4. Default prototype benchmark preparation cycle duration (18 min)
    return 18;
}

window.getIntendedDurationMinutes = getIntendedDurationMinutes;


// ============================================================
// LIVE MONITORING
// ============================================================

function updateMonitoring() {

    if (!preparationRunning) {
        return;
    }

    // --------------------------------------------------------
    // 1. ELAPSED TIME (MONOTONICALLY INCREASING FROM FIXED START)
    // --------------------------------------------------------
    const now = Date.now();
    const wallElapsed = preparationStartTime
        ? Math.floor((now - preparationStartTime) / 1000)
        : (elapsedSeconds + 1);
    elapsedSeconds = Math.max(elapsedSeconds + 1, wallElapsed);

    // --------------------------------------------------------
    // 2. REMAINING TIME (AUTHORITATIVE SINGLE SOURCE OF TRUTH)
    // Formula: max(estimatedTotalDuration - elapsedPreparationTime, 0)
    // Guarantee: Remaining Time NEVER increases during an active cycle.
    // --------------------------------------------------------
    let candidateRemaining = Math.max(0, estimatedTotalDurationSeconds - elapsedSeconds);
    if (lastRemainingSeconds !== null) {
        candidateRemaining = Math.min(lastRemainingSeconds, candidateRemaining);
    }
    remainingSeconds = candidateRemaining;
    lastRemainingSeconds = remainingSeconds;

    // --------------------------------------------------------
    // 3. THERMAL RAMP & TEMPERATURE HOLD SIMULATION (Sections 1, 2, 3, 4)
    // --------------------------------------------------------
    let progress = lastProgress || 0;

    if (!heatingCompleted) {
        // PHASE 1 — INITIAL HEATING (0°C → selected target temperature)
        simulatedStage = "Heating";
        const remainingDelta = selectedTemperature - currentTemperature;
        let delta;
        if (currentTemperature < selectedTemperature * 0.70) {
            delta = (selectedTemperature / 10) * (0.90 + 0.35 * (currentTemperature / selectedTemperature));
        } else {
            delta = Math.max(0.6, remainingDelta * 0.48);
        }
        currentTemperature = Math.min(selectedTemperature, Number((currentTemperature + delta).toFixed(1)));
        if (selectedTemperature - currentTemperature < 0.4) {
            currentTemperature = selectedTemperature;
            heatingCompleted = true;
            if (typeof window !== "undefined") {
                window.heatingCompleted = true;
            }
        }

        // In Phase 1 (Heating), liquid volume is stable and boiling evaporation is 0.00 mL/min (Section 8)
        currentVolume = initialVolume;
        evaporationRate = 0.0;

        updateText(
            "preparationStatus",
            "♨ Heating Phase (" + currentTemperature.toFixed(1) + "°C → " + selectedTemperature + "°C)"
        );
        const statusEl = document.getElementById("preparationStatus");
        if (statusEl) {
            statusEl.className = "preparation-status running";
        }

        // Progress increases smoothly during heating (first 10% of total cycle) (Section 11)
        const thermalFraction = selectedTemperature > 0 ? (currentTemperature / selectedTemperature) : 1.0;
        progress = Math.max(lastProgress || 0, Math.min(10, thermalFraction * 10));
        lastProgress = progress;

    } else {
        // PHASE 2 — HOLD & ACTIVE REDUCTION (Section 4 & 8)
        if (currentTemperature < selectedTemperature) {
            // Smoothly heat towards higher setpoint if temperature raised during preparation
            const heatDelta = Math.max(0.6, (selectedTemperature - currentTemperature) * 0.48);
            currentTemperature = Math.min(selectedTemperature, Number((currentTemperature + heatDelta).toFixed(1)));
        } else if (currentTemperature > selectedTemperature) {
            // Smoothly cool towards lower setpoint if temperature lowered during preparation
            const coolDelta = Math.max(0.5, (currentTemperature - selectedTemperature) * 0.4);
            currentTemperature = Math.max(selectedTemperature, Number((currentTemperature - coolDelta).toFixed(1)));
        } else {
            // Stable hold at target temperature: no overshoot, no random fluctuations (Section 4)
            currentTemperature = selectedTemperature;
        }

        simulatedStage = "Holding";

        updateText(
            "preparationStatus",
            "♨ Holding at " + selectedTemperature + "°C — Active Reduction"
        );
        const statusEl = document.getElementById("preparationStatus");
        if (statusEl) {
            statusEl.className = "preparation-status running";
        }

        // --------------------------------------------------------
        // 4. EVAPORATION RATE (DETERMINISTIC PROCESS MODEL - Section 17)
        // --------------------------------------------------------
        const totalReduction = Math.max(0, initialVolume - targetVolume);
        const intendedDurationMinutes = estimatedTotalDurationSeconds > 0
            ? (estimatedTotalDurationSeconds / 60)
            : 18.0;

        const nominalRate = (totalReduction > 0 && intendedDurationMinutes > 0)
            ? (totalReduction / intendedDurationMinutes)
            : 16.0;

        let tempMultiplier = 1.0;
        if (selectedTemperature >= 80 && selectedTemperature <= 90) {
            tempMultiplier = 1.0;
        } else if (selectedTemperature < 80) {
            tempMultiplier = Math.max(0.1, Math.pow((selectedTemperature - 30) / 60, 1.35));
        } else {
            tempMultiplier = Math.pow((selectedTemperature - 30) / 60, 1.35);
        }

        evaporationRate = Number((nominalRate * tempMultiplier).toFixed(2));

        // --------------------------------------------------------
        // 5. VOLUME REDUCTION (DETERMINISTIC PER 1s TICK - Section 6, 16)
        // --------------------------------------------------------
        const volumeLoss = evaporationRate / 60;
        currentVolume = Math.max(
            targetVolume,
            Number((currentVolume - volumeLoss).toFixed(2))
        );

        // --------------------------------------------------------
        // 6. PROGRESS (MONOTONICALLY ADVANCING TOWARD 100% - Section 11)
        // --------------------------------------------------------
        const reductionDenominator = Math.max(0.001, initialVolume - targetVolume);
        const completedReduction = Math.max(0, initialVolume - currentVolume);
        const volumeProgress = 10 + (completedReduction / reductionDenominator) * 90;
        const timeProgress = estimatedTotalDurationSeconds > 0
            ? (elapsedSeconds / estimatedTotalDurationSeconds) * 100
            : 0;

        progress = Math.max(volumeProgress, timeProgress);
        progress = Math.max(lastProgress || 0, Math.min(100, progress));
        lastProgress = progress;
    }

    // Expose live telemetry state on window for testing and verification
    if (typeof window !== "undefined") {
        window.currentTemperature = currentTemperature;
        window.currentVolume = currentVolume;
        window.evaporationRate = evaporationRate;
        window.simulatedStage = simulatedStage;
    }

    // --------------------------------------------------------
    // 7. UPDATE UI (SINGLE SYNCHRONIZED TELEMETRY STATE - Section 9)
    // --------------------------------------------------------
    updateText(
        "monitorTemperature",
        currentTemperature.toFixed(1) + "°C"
    );

    updateText(
        "currentVolume",
        currentVolume.toFixed(2) + " mL"
    );

    updateText(
        "flowCurrentVolume",
        currentVolume.toFixed(2) + " mL"
    );

    updateText(
        "evaporationRate",
        evaporationRate.toFixed(2) + " mL/min"
    );

    updateText(
        "elapsedTime",
        formatTime(elapsedSeconds)
    );

    updateText(
        "remainingTime",
        formatTime(remainingSeconds)
    );

    updateProgress(progress);

    // --------------------------------------------------------
    // 8. CHARTS (DERIVED FROM UNIFIED TELEMETRY - Section 5, 7, 21)
    // --------------------------------------------------------
    updateChart(
        elapsedSeconds,
        currentVolume,
        targetVolume,
        currentTemperature
    );

    // --------------------------------------------------------
    // 9. TARGET REACHED / COMPLETION TRIGGER (Section 18)
    // --------------------------------------------------------
    if (currentVolume <= targetVolume || remainingSeconds <= 0) {
        currentVolume = targetVolume;
        remainingSeconds = 0;
        lastRemainingSeconds = 0;
        progress = 100;
        updateProgress(100);
        currentTemperature = selectedTemperature;
        simulatedStage = "Complete";
        if (typeof window !== "undefined") {
            window.simulatedStage = "Complete";
            window.currentTemperature = currentTemperature;
            window.currentVolume = currentVolume;
        }
        updateText("preparationStatus", "✓ Preparation Complete");
        const statusEl = document.getElementById("preparationStatus");
        if (statusEl) {
            statusEl.className = "preparation-status complete";
        }
        completePreparation();
    }
}


// ============================================================
// PROGRESS BAR
// ============================================================

function updateProgress(
    progress
) {

    const bar =
        document.getElementById(
            "progressBar"
        );


    const text =
        document.getElementById(
            "progressText"
        );


    if (bar) {

        bar.style.width =
            progress + "%";

    }


    if (text) {

        text.textContent =
            Math.round(progress) +
            "%";

    }

}


// ============================================================
// FORMAT TIME
// ============================================================

function formatTime(
    seconds
) {

    if (
        seconds === null ||
        seconds === undefined ||
        isNaN(seconds) ||
        !isFinite(seconds) ||
        seconds <= 0
    ) {

        return "00:00";

    }


    seconds =
        Math.max(
            0,
            Math.floor(
                seconds
            )
        );


    const hours =
        Math.floor(
            seconds / 3600
        );


    const minutes =
        Math.floor(
            (seconds % 3600) / 60
        );


    const remaining =
        seconds % 60;


    if (hours > 0) {

        return (
            String(hours)
                .padStart(2, "0")
            +
            ":"
            +
            String(minutes)
                .padStart(2, "0")
            +
            ":"
            +
            String(remaining)
                .padStart(2, "0")
        );

    }


    return (
        String(minutes)
            .padStart(2, "0")
        +
        ":"
        +
        String(remaining)
            .padStart(2, "0")
    );

}

window.formatTime = formatTime;


// ============================================================
// COMPLETE PREPARATION
// ============================================================

function completePreparation() {

    preparationRunning =
        false;
    window.preparationRunning = false;

    // --------------------------------------------------------
    // STOP TIMER
    // --------------------------------------------------------

    if (preparationTimer) {

        clearInterval(
            preparationTimer
        );

        preparationTimer =
            null;

    }


    // --------------------------------------------------------
    // FORCE EXACT TARGET & ZERO REMAINING
    // --------------------------------------------------------

    currentVolume =
        targetVolume;

    remainingSeconds = 0;
    lastRemainingSeconds = 0;
    lastProgress = 100;


    // --------------------------------------------------------
    // UPDATE FINAL VALUES
    // --------------------------------------------------------

    updateText(
        "currentVolume",
        targetVolume.toFixed(2) +
        " mL"
    );


    updateText(
        "flowCurrentVolume",
        targetVolume.toFixed(2) +
        " mL"
    );


    updateText(
        "remainingTime",
        "00:00"
    );


    updateText(
        "evaporationRate",
        "0.00 mL/min"
    );


    updateText(
        "elapsedTime",
        formatTime(
            elapsedSeconds
        )
    );


    updateProgress(
        100
    );


    // --------------------------------------------------------
    // STATUS
    // --------------------------------------------------------

    updateText(
        "preparationStatus",
        "✓ Preparation Complete"
    );


    const status =
        document.getElementById(
            "preparationStatus"
        );


    if (status) {

        status.className =
            "preparation-status complete";

    }


    // --------------------------------------------------------
    // BUTTON
    // --------------------------------------------------------

    const button =
        document.getElementById(
            "startButton"
        );


    if (button) {

        button.disabled =
            true;

        button.textContent =
            "Preparation Complete";

    }


    // --------------------------------------------------------
    // COMPLETION BOX
    // --------------------------------------------------------

    const completion =
        document.getElementById(
            "completionBox"
        );


    if (completion) {

        completion.style.display =
            "block";

    }


    // --------------------------------------------------------
    // FINAL INFORMATION
    // --------------------------------------------------------

    updateText(
        "readyMessage",
        "Your Kwatha is Ready"
    );


    updateText(
        "finalVolume",
        targetVolume.toFixed(2) +
        " mL"
    );


    updateText(
        "finalPreparationTime",
        formatTime(
            elapsedSeconds
        )
    );


    updateText(
        "finalTemperature",
        selectedTemperature +
        "°C"
    );


    updateText(
        "heatingStatus",
        "✓ Heating Stopped"
    );


    updateText(
        "evaporationStatus",
        "✓ Evaporation Stopped"
    );

    // --------------------------------------------------------
    // RECORD COMPLETED BATCH IN BATCH HISTORY
    // --------------------------------------------------------
    if (window.batchHistory && typeof window.batchHistory.recordCompletedBatch === 'function') {
        const activePod = (typeof window.podParser !== 'undefined' && typeof window.podParser.getActivePod === 'function')
            ? window.podParser.getActivePod()
            : null;

        window.batchHistory.recordCompletedBatch({
            podId: activePod ? activePod.podId : 'IKW-MANUAL',
            batchNumber: activePod ? activePod.batchNumber : null,
            formulation: detectedFormulation || (preparationData ? preparationData.formulation : 'Classical Kwatha'),
            ingredients: (preparationData && preparationData.ingredients && preparationData.ingredients.length > 0)
                ? preparationData.ingredients
                : (activePod ? activePod.ingredients : []),
            ingredientDetails: activePod ? activePod.ingredientDetails : null,
            powder: preparationData ? preparationData.powder : 48,
            water: initialVolume,
            targetVolume: targetVolume,
            finalVolume: currentVolume,
            temperature: selectedTemperature,
            durationSeconds: elapsedSeconds,
            durationMinutes: Math.round(elapsedSeconds / 60)
        });
    }


    // --------------------------------------------------------
    // FINAL CHART POINT
    // --------------------------------------------------------

    updateChart(
        elapsedSeconds,
        targetVolume,
        targetVolume,
        selectedTemperature
    );


    // --------------------------------------------------------
    // SCROLL TO COMPLETION
    // --------------------------------------------------------

    setTimeout(
        function () {

            if (completion && typeof completion.scrollIntoView === "function") {
                completion.scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                });
            }

        },
        300
    );

}


// ============================================================
// CHARTS (DUAL TELEMETRY: TEMPERATURE & VOLUME)
// ============================================================

function getActiveRecommendedTemperature() {
    const el =
        document.getElementById("monitorRecommendedTempValue") ||
        document.getElementById("recommendedTempValue");
    if (el && el.textContent) {
        const match = el.textContent.match(/(\d+(\.\d+)?)/);
        if (match) {
            return parseFloat(match[1]);
        }
    }
    return null;
}

function createChart() {

    const tempCanvas =
        document.getElementById("temperatureChart");

    const volCanvas =
        document.getElementById("volumeChart") ||
        document.getElementById("evaporationChart");

    if (tempChart) {
        tempChart.destroy();
        tempChart = null;
    }

    if (volumeChart) {
        volumeChart.destroy();
        volumeChart = null;
    }

    if (chart) {
        chart.destroy();
        chart = null;
    }

    const recTemp = getActiveRecommendedTemperature();

    // --------------------------------------------------------
    // 1. TEMPERATURE VS TIME CHART (SHARP SCIENTIFIC LINE STYLE)
    // --------------------------------------------------------
    if (tempCanvas) {
        const tempCtx = tempCanvas.getContext("2d");

        const tempDatasets = [
            {
                label: "Temperature (°C)",
                data: [],
                borderColor: "#b45309",
                borderWidth: 2,
                fill: false,
                tension: 0.05,
                pointRadius: 0,
                pointHoverRadius: 4,
                pointHoverBackgroundColor: "#b45309",
                pointHoverBorderColor: "#ffffff",
                pointHoverBorderWidth: 1.5
            }
        ];

        if (recTemp !== null && !isNaN(recTemp)) {
            tempDatasets.push({
                label: "Recommended (" + recTemp + "°C)",
                data: [],
                borderColor: "rgba(36, 50, 41, 0.40)",
                borderWidth: 1.5,
                borderDash: [5, 4],
                pointRadius: 0,
                pointHoverRadius: 0,
                fill: false
            });
        }

        const minTempBound = 0;
        const maxTempBound = Math.min(110, Math.max(100, Math.max(selectedTemperature, recTemp || selectedTemperature) + 8));

        tempChart = new Chart(tempCtx, {
            type: "line",
            data: {
                labels: [],
                datasets: tempDatasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: false,
                interaction: {
                    intersect: false,
                    mode: "index"
                },
                plugins: {
                    legend: {
                        display: true,
                        position: "top",
                        align: "end",
                        labels: {
                            boxWidth: 14,
                            boxHeight: 2,
                            usePointStyle: false,
                            color: "#243229",
                            font: {
                                family: "'Inter', sans-serif",
                                size: 11,
                                weight: "600"
                            },
                            padding: 12
                        }
                    },
                    tooltip: {
                        backgroundColor: "rgba(23, 63, 43, 0.94)",
                        titleColor: "#ffffff",
                        bodyColor: "#ffffff",
                        titleFont: { family: "'Inter', sans-serif", size: 11, weight: "600" },
                        bodyFont: { family: "'Inter', sans-serif", size: 11, weight: "500" },
                        padding: 8,
                        cornerRadius: 6,
                        boxPadding: 4,
                        usePointStyle: true,
                        borderColor: "rgba(255, 255, 255, 0.15)",
                        borderWidth: 1
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: "rgba(36, 50, 41, 0.04)",
                            tickLength: 4
                        },
                        ticks: {
                            color: "#718078",
                            font: { family: "'Inter', sans-serif", size: 10, weight: "500" },
                            maxRotation: 0,
                            autoSkip: true,
                            maxTicksLimit: 8
                        },
                        title: {
                            display: true,
                            text: "Elapsed Time",
                            color: "#243229",
                            font: { family: "'Inter', sans-serif", size: 11, weight: "600" }
                        }
                    },
                    y: {
                        min: 0,
                        suggestedMax: maxTempBound,
                        grid: {
                            color: "rgba(36, 50, 41, 0.04)"
                        },
                        ticks: {
                            color: "#718078",
                            font: { family: "'Inter', sans-serif", size: 10, weight: "500" }
                        },
                        title: {
                            display: true,
                            text: "Temperature (°C)",
                            color: "#243229",
                            font: { family: "'Inter', sans-serif", size: 11, weight: "600" }
                        }
                    }
                }
            }
        });
        tempChart._recTemp = recTemp;
    }

    // --------------------------------------------------------
    // 2. VOLUME REDUCTION VS TIME CHART (SHARP SCIENTIFIC LINE STYLE)
    // --------------------------------------------------------
    if (volCanvas) {
        const volCtx = volCanvas.getContext("2d");

        volumeChart = new Chart(volCtx, {
            type: "line",
            data: {
                labels: [],
                datasets: [
                    {
                        label: "Current Volume (mL)",
                        data: [],
                        borderColor: "#1b5e3a",
                        borderWidth: 2,
                        fill: false,
                        tension: 0.05,
                        pointRadius: 0,
                        pointHoverRadius: 4,
                        pointHoverBackgroundColor: "#1b5e3a",
                        pointHoverBorderColor: "#ffffff",
                        pointHoverBorderWidth: 1.5
                    },
                    {
                        label: "Target Volume (mL)",
                        data: [],
                        borderColor: "rgba(184, 138, 59, 0.70)",
                        borderWidth: 1.5,
                        borderDash: [5, 4],
                        pointRadius: 0,
                        pointHoverRadius: 0,
                        fill: false
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: false,
                interaction: {
                    intersect: false,
                    mode: "index"
                },
                plugins: {
                    legend: {
                        display: true,
                        position: "top",
                        align: "end",
                        labels: {
                            boxWidth: 14,
                            boxHeight: 2,
                            usePointStyle: false,
                            color: "#243229",
                            font: {
                                family: "'Inter', sans-serif",
                                size: 11,
                                weight: "600"
                            },
                            padding: 12
                        }
                    },
                    tooltip: {
                        backgroundColor: "rgba(23, 63, 43, 0.94)",
                        titleColor: "#ffffff",
                        bodyColor: "#ffffff",
                        titleFont: { family: "'Inter', sans-serif", size: 11, weight: "600" },
                        bodyFont: { family: "'Inter', sans-serif", size: 11, weight: "500" },
                        padding: 8,
                        cornerRadius: 6,
                        boxPadding: 4,
                        usePointStyle: true,
                        borderColor: "rgba(255, 255, 255, 0.15)",
                        borderWidth: 1
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: "rgba(36, 50, 41, 0.04)",
                            tickLength: 4
                        },
                        ticks: {
                            color: "#718078",
                            font: { family: "'Inter', sans-serif", size: 10, weight: "500" },
                            maxRotation: 0,
                            autoSkip: true,
                            maxTicksLimit: 8
                        },
                        title: {
                            display: true,
                            text: "Elapsed Time",
                            color: "#243229",
                            font: { family: "'Inter', sans-serif", size: 11, weight: "600" }
                        }
                    },
                    y: {
                        beginAtZero: true,
                        suggestedMax: initialVolume > 0 ? Math.ceil(initialVolume * 1.1) : 500,
                        grid: {
                            color: "rgba(36, 50, 41, 0.04)"
                        },
                        ticks: {
                            color: "#718078",
                            font: { family: "'Inter', sans-serif", size: 10, weight: "500" }
                        },
                        title: {
                            display: true,
                            text: "Volume (mL)",
                            color: "#243229",
                            font: { family: "'Inter', sans-serif", size: 11, weight: "600" }
                        }
                    }
                }
            }
        });

        chart = volumeChart;
    }
}


// ============================================================
// UPDATE CHART
// ============================================================

function updateChart(
    seconds,
    volume,
    target,
    temp
) {
    const timeLabel = formatTime(seconds);
    const curTemp = typeof temp === "number" ? temp : selectedTemperature;

    // 1. UPDATE TEMPERATURE CHART
    if (tempChart) {
        tempChart.data.labels.push(timeLabel);
        tempChart.data.datasets[0].data.push(Number(curTemp.toFixed(1)));
        if (tempChart.data.datasets.length > 1) {
            const rec = tempChart._recTemp;
            if (typeof rec === "number") {
                tempChart.data.datasets[1].data.push(rec);
            }
        }
        tempChart.update("none");
    }

    // 2. UPDATE VOLUME CHART
    if (volumeChart) {
        volumeChart.data.labels.push(timeLabel);
        volumeChart.data.datasets[0].data.push(Number(volume.toFixed(2)));
        volumeChart.data.datasets[1].data.push(Number(target.toFixed(2)));
        volumeChart.update("none");
    }

    // 3. UPDATE HEADER LIVE BADGES
    updateText("tempChartCurrentBadge", curTemp.toFixed(1) + "°C");
    updateText("volumeChartCurrentBadge", volume.toFixed(1) + " mL");
}


// ============================================================
// RESET
// ============================================================

function resetPreparation() {

    // --------------------------------------------------------
    // STOP TIMER
    // --------------------------------------------------------

    if (preparationTimer) {

        clearInterval(
            preparationTimer
        );

        preparationTimer =
            null;

    }


    // --------------------------------------------------------
    // RESET VARIABLES
    // --------------------------------------------------------

    preparationRunning =
        false;

    preparationData =
        null;

    detectedFormulation =
        null;

    window.preparationRunning = false;
    window.preparationData = null;
    window.detectedFormulation = null;

    initialVolume =
        0;

    currentVolume =
        0;

    currentTemperature =
        0;

    simulatedStage =
        "Starting";

    heatingCompleted =
        false;

    if (typeof window !== "undefined") {
        window.currentTemperature = 0;
        window.simulatedStage = "Starting";
        window.heatingCompleted = false;
        window.currentVolume = 0;
    }

    targetVolume =
        0;

    evaporationRate =
        0;

    elapsedSeconds =
        0;

    remainingSeconds =
        0;

    preparationStartTime = null;

    estimatedTotalDurationSeconds = 0;

    lastRemainingSeconds = null;

    lastProgress = 0;


    // --------------------------------------------------------
    // RESET INPUTS
    // --------------------------------------------------------

    const ingredientInput =
        document.getElementById(
            "ingredientInput"
        );


    const powderInput =
        document.getElementById(
            "powderInput"
        );


    if (ingredientInput) {

        ingredientInput.value =
            "";

    }


    if (powderInput) {

        powderInput.value =
            "";

    }


    // --------------------------------------------------------
    // RESET COMPLETION
    // --------------------------------------------------------

    const completion =
        document.getElementById(
            "completionBox"
        );


    if (completion) {

        completion.style.display =
            "none";

    }


    // --------------------------------------------------------
    // RESET BUTTON
    // --------------------------------------------------------

    const startButton =
        document.getElementById(
            "startButton"
        );


    if (startButton) {

        startButton.disabled =
            false;

        startButton.textContent =
            "▶ Start Preparation";

    }


    // --------------------------------------------------------
    // RESET CHARTS
    // --------------------------------------------------------

    if (tempChart) {
        tempChart.destroy();
        tempChart = null;
    }

    if (volumeChart) {
        volumeChart.destroy();
        volumeChart = null;
    }

    if (chart) {
        chart.destroy();
        chart = null;
    }

    updateText(
        "tempChartCurrentBadge",
        "—°C"
    );

    updateText(
        "volumeChartCurrentBadge",
        "— mL"
    );


    // --------------------------------------------------------
    // RESET VALUES
    // --------------------------------------------------------

    updateText(
        "currentVolume",
        "—"
    );


    updateText(
        "flowCurrentVolume",
        "—"
    );


    updateText(
        "initialVolume",
        "—"
    );


    updateText(
        "flowTargetVolume",
        "—"
    );


    updateText(
        "monitorTargetVolume",
        "—"
    );


    updateText(
        "evaporationRate",
        "—"
    );


    updateText(
        "elapsedTime",
        "00:00"
    );


    updateText(
        "remainingTime",
        "—"
    );

    updateText(
        "monitorTemperature",
        "—°C"
    );

    updateText(
        "preparationStatus",
        "Preparation Running"
    );

    const statusEl =
        document.getElementById(
            "preparationStatus"
        );

    if (statusEl) {
        statusEl.className =
            "preparation-status running";
    }

    updateProgress(
        0
    );


    // --------------------------------------------------------
    // RESET DETECTION MESSAGE
    // --------------------------------------------------------

    const message =
        document.getElementById(
            "detectionMessage"
        );


    if (message) {

        message.textContent =
            "";

    }


    // --------------------------------------------------------
    // RESET STEP
    // --------------------------------------------------------

    showStep(1);

}


// ============================================================
// EXPOSE ESSENTIAL WORKFLOW FUNCTIONS ON WINDOW
// ============================================================

window.applyPreparationState = applyPreparationState;
window.startPreparation = startPreparation;
window.calculatePreparation = calculatePreparation;
window.detectFormulation = detectFormulation;
window.goToTemperature = goToTemperature;
window.goToPowder = goToTemperature;
window.resetPreparation = resetPreparation;
window.showStep = showStep;
window.calculateEstimatedPreparationTime = calculateEstimatedPreparationTime;
window.updateEstimatedPreparationTime = updateEstimatedPreparationTime;
window.findMatchingHistoricalBatches = findMatchingHistoricalBatches;
window.calculateHistoricalAverage = calculateHistoricalAverage;
window.getCurrentTemperature = function () { return currentTemperature; };
window.setCurrentVolume = function (v) { currentVolume = Number(v); if (typeof window !== "undefined") window.currentVolume = currentVolume; };
window.getCurrentVolume = function () { return currentVolume; };
