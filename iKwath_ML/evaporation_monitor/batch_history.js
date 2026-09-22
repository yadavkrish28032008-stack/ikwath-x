/**
 * iKwath-X Batch History & Recommended Temperature Engine (Phase 4)
 * 
 * Provides:
 * 1. Client-side storage (localStorage + IndexedDB) for offline operation.
 * 2. Statistical averages and formulation + ingredient composition matching.
 * 3. Concise advisory recommended temperature for the Dashboard (/dashboard).
 * 4. Full historical intelligence, filtering (Today, Last 7 Days, All),
 *    formulation grouping, and 10-column batch list for the Batch History page (/batch-history).
 * 
 * Safety: Strictly informational guidance. Never alters machine controls or inputs.
 */

(function (window) {
    'use strict';

    const STORAGE_KEY = 'ikwath_batch_history';
    const DB_NAME = 'ikwath_db';
    const DB_VERSION = 2;
    const STORE_NAME = 'batch_history';
    const PODS_STORE_NAME = 'scanned_pods';

    // Active filters for Batch History page
    let activeTimeFilter = 'today';
    let activeFormulationFilter = 'all';

    // ----------------------------------------------------
    // INDEXEDDB STORAGE LAYER (OFFLINE RESILIENCE)
    // ----------------------------------------------------

    function openHistoryDatabase() {
        return new Promise((resolve) => {
            if (!window.indexedDB) {
                resolve(null);
                return;
            }
            try {
                const request = indexedDB.open(DB_NAME, DB_VERSION);
                request.onupgradeneeded = function (e) {
                    const db = e.target.result;
                    if (!db.objectStoreNames.contains(PODS_STORE_NAME)) {
                        db.createObjectStore(PODS_STORE_NAME, { keyPath: 'podId' });
                    }
                    if (!db.objectStoreNames.contains(STORE_NAME)) {
                        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
                    }
                };
                request.onsuccess = function (e) {
                    resolve(e.target.result);
                };
                request.onerror = function (e) {
                    console.warn('[iKwath BatchHistory] IndexedDB unavailable, using localStorage fallback:', e);
                    resolve(null);
                };
            } catch (err) {
                console.warn('[iKwath BatchHistory] IndexedDB open error:', err);
                resolve(null);
            }
        });
    }

    function persistBatchToIndexedDB(batch) {
        openHistoryDatabase().then(db => {
            if (!db) return;
            try {
                const tx = db.transaction(STORE_NAME, 'readwrite');
                const store = tx.objectStore(STORE_NAME);
                store.put(batch);
            } catch (err) {
                console.warn('[iKwath BatchHistory] IndexedDB put failed:', err);
            }
        });
    }

    // ----------------------------------------------------
    // SEED / DEMO DATASET GENERATOR
    // Exactly 30 preparations today.
    // 10 matching "Amrtottara Kwatha Curna" with [Sunthi, Amrta, Abhaya].
    // Recorded temps: [88, 90, 91, 89, 90, 90, 91, 89, 90, 92] -> Avg = exactly 90.0°C.
    // Durations: avg = 18 min. Water: avg = 384 mL.
    // ----------------------------------------------------

    function generateDemoBatches() {
        const today = new Date();
        const batches = [];

        function getTodayIso(hour, minute) {
            const d = new Date(today);
            d.setHours(hour, minute, 0, 0);
            return d.toISOString();
        }

        // --- 10 Matching Amrtottara Kwatha Curna Batches ---
        const amrtottaraTemps = [88, 90, 91, 89, 90, 90, 91, 89, 90, 92];
        const amrtottaraDurations = [18, 17, 19, 18, 18, 18, 19, 17, 18, 18];

        for (let i = 0; i < 10; i++) {
            const batchIdx = String(i + 1).padStart(2, '0');
            batches.push({
                id: `BATCH-${today.getFullYear()}${(today.getMonth() + 1).toString().padStart(2, '0')}${today.getDate().toString().padStart(2, '0')}-AMR${batchIdx}`,
                podId: `KW-F001`,
                batchNumber: `IKW-AMR-2026-${batchIdx}`,
                formulation: 'Amrtottara Kwatha Curna',
                ingredients: ['Sunthi', 'Amrta', 'Abhaya'],
                ingredientDetails: [
                    { name: 'Sunthi', weight: 8 },
                    { name: 'Amrta', weight: 24 },
                    { name: 'Abhaya', weight: 16 }
                ],
                powder: 48,
                water: 384,
                targetVolume: 96,
                finalVolume: 96,
                temperature: amrtottaraTemps[i],
                durationMinutes: amrtottaraDurations[i],
                durationSeconds: amrtottaraDurations[i] * 60,
                completedAt: getTodayIso(7 + Math.floor(i / 2), (i % 2) * 28 + 10),
                isDemo: true
            });
        }

        // --- 8 Batches for Aragvadhadi Kwatha Curna ---
        const aragvadhadiTemps = [85, 86, 87, 85, 86, 86, 87, 86];
        for (let i = 0; i < 8; i++) {
            const batchIdx = String(i + 1).padStart(2, '0');
            batches.push({
                id: `BATCH-DEMO-ARG${batchIdx}`,
                podId: `KW-F002`,
                batchNumber: `IKW-ARG-2026-${batchIdx}`,
                formulation: 'Aragvadhadi Kwatha Curna',
                ingredients: ['Aragvadha', 'Nimba', 'Patola', 'Katuka'],
                powder: 48,
                water: 384,
                targetVolume: 96,
                finalVolume: 96,
                temperature: aragvadhadiTemps[i],
                durationMinutes: 16,
                durationSeconds: 16 * 60,
                completedAt: getTodayIso(9, i * 6 + 5),
                isDemo: true
            });
        }

        // --- 8 Batches for Ardhabilva Kwatha Curna ---
        const ardhabilvaTemps = [87, 88, 89, 88, 87, 88, 89, 88];
        for (let i = 0; i < 8; i++) {
            const batchIdx = String(i + 1).padStart(2, '0');
            batches.push({
                id: `BATCH-DEMO-ARD${batchIdx}`,
                podId: `KW-F003`,
                batchNumber: `IKW-ARD-2026-${batchIdx}`,
                formulation: 'Ardhabilva Kwatha Curna',
                ingredients: ['Punarnava', 'Sunthi', 'Brihati', 'Kantakari', 'Apamarga', 'Duralabha'],
                powder: 48,
                water: 4800,
                targetVolume: 2400,
                finalVolume: 2400,
                temperature: ardhabilvaTemps[i],
                durationMinutes: 25,
                durationSeconds: 25 * 60,
                completedAt: getTodayIso(8, i * 7 + 2),
                isDemo: true
            });
        }

        // --- 2 Batches for Chinnodbhavadi Kwatha Curna ---
        for (let i = 0; i < 2; i++) {
            const batchIdx = String(i + 1).padStart(2, '0');
            batches.push({
                id: `BATCH-DEMO-CHI${batchIdx}`,
                podId: `KW-F004`,
                batchNumber: `IKW-CHI-2026-${batchIdx}`,
                formulation: 'Chinnodbhavadi Kwatha Curna',
                ingredients: ['Guduchi', 'Vasa', 'Kirataka', 'Parpata', 'Sunthi', 'Musta', 'Yavasaka'],
                powder: 48,
                water: 384,
                targetVolume: 96,
                finalVolume: 96,
                temperature: 87,
                durationMinutes: 17,
                durationSeconds: 17 * 60,
                completedAt: getTodayIso(10, i * 20 + 15),
                isDemo: true
            });
        }

        // --- 1 Batch: Amrtottara with DIFFERENT ingredient composition (Test 4 benchmark) ---
        batches.push({
            id: `BATCH-DEMO-AMR-DIFF-COMP`,
            podId: `KW-F001-ALT`,
            batchNumber: `IKW-AMR-ALT-01`,
            formulation: 'Amrtottara Kwatha Curna',
            ingredients: ['Sunthi', 'Amrta'], // Missing Abhaya
            powder: 48,
            water: 384,
            targetVolume: 96,
            finalVolume: 96,
            temperature: 89,
            durationMinutes: 18,
            durationSeconds: 18 * 60,
            completedAt: getTodayIso(6, 45),
            isDemo: true
        });

        // --- 1 Batch: Chinnodbhavadi with MISSING temperature (Test 5 benchmark) ---
        batches.push({
            id: `BATCH-DEMO-CHI-NOTEMP`,
            podId: `KW-F004`,
            batchNumber: `IKW-CHI-2026-03`,
            formulation: 'Chinnodbhavadi Kwatha Curna',
            ingredients: ['Guduchi', 'Vasa', 'Kirataka', 'Parpata', 'Sunthi', 'Musta', 'Yavasaka'],
            powder: 48,
            water: 384,
            targetVolume: 96,
            finalVolume: 96,
            temperature: null,
            durationMinutes: 17,
            durationSeconds: 17 * 60,
            completedAt: getTodayIso(6, 15),
            isDemo: true
        });

        return batches;
    }

    // ----------------------------------------------------
    // STORAGE ACCESS
    // ----------------------------------------------------

    function getAllBatches() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) {
                const demo = generateDemoBatches();
                localStorage.setItem(STORAGE_KEY, JSON.stringify(demo));
                demo.forEach(b => persistBatchToIndexedDB(b));
                return demo;
            }
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed) && parsed.length > 0) {
                return parsed;
            }
            const demo = generateDemoBatches();
            localStorage.setItem(STORAGE_KEY, JSON.stringify(demo));
            return demo;
        } catch (e) {
            console.error('[iKwath BatchHistory] Storage read failed:', e);
            return generateDemoBatches();
        }
    }

    function saveBatches(batches) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(batches));
        } catch (e) {
            console.error('[iKwath BatchHistory] Storage save failed:', e);
        }
    }

    // ----------------------------------------------------
    // NORMALIZATION & MATCHING LOGIC
    // ----------------------------------------------------

    function normalizeFormulation(name) {
        if (!name) return '';
        return String(name)
            .trim()
            .toLowerCase()
            .replace(/[-_]/g, ' ')
            .replace(/\s+/g, ' ');
    }

    function normalizeIngredients(ingredients) {
        if (!ingredients) return [];
        let list = [];
        if (Array.isArray(ingredients)) {
            list = ingredients.map(item => {
                if (typeof item === 'string') return item;
                if (typeof item === 'object' && item !== null) {
                    return item.name || item.ingredient || item.herb || item.title || '';
                }
                return String(item);
            });
        } else if (typeof ingredients === 'string') {
            list = ingredients.split(/[,;\n]+/);
        }
        return list
            .map(i => String(i).trim().toLowerCase())
            .filter(i => i.length > 0)
            .sort();
    }

    function isSameIngredientComposition(ings1, ings2) {
        const list1 = normalizeIngredients(ings1);
        const list2 = normalizeIngredients(ings2);
        if (list1.length === 0 || list2.length === 0) return false;
        if (list1.length !== list2.length) return false;
        for (let i = 0; i < list1.length; i++) {
            if (list1[i] !== list2[i]) return false;
        }
        return true;
    }

    function isBatchMatching(batch, targetFormulation, targetIngredients) {
        if (!batch || !targetFormulation) return false;

        const normBatch = normalizeFormulation(batch.formulation);
        const normTarget = normalizeFormulation(targetFormulation);
        if (normBatch !== normTarget) return false;

        if (targetIngredients && targetIngredients.length > 0) {
            if (!isSameIngredientComposition(batch.ingredients, targetIngredients)) {
                return false;
            }
        }
        return true;
    }

    // ----------------------------------------------------
    // HISTORICAL AVERAGES & STATISTICAL METRICS
    // ----------------------------------------------------

    function calculateMetrics(matchingBatches) {
        if (!matchingBatches || matchingBatches.length === 0) {
            return {
                count: 0,
                hasMatches: false,
                averageTemperature: null,
                averageTimeMinutes: null,
                averageWaterMl: null,
                validTempCount: 0
            };
        }

        const validTemps = matchingBatches
            .map(b => {
                const t = b.temperature !== undefined ? b.temperature : b.preparationTemperature;
                return (t !== null && t !== undefined && !isNaN(Number(t))) ? Number(t) : null;
            })
            .filter(t => t !== null && t > 0);

        const avgTemp = validTemps.length > 0
            ? (validTemps.reduce((acc, v) => acc + v, 0) / validTemps.length)
            : null;

        const validTimes = matchingBatches
            .map(b => {
                if (b.durationMinutes !== undefined && b.durationMinutes !== null && !isNaN(Number(b.durationMinutes))) {
                    return Number(b.durationMinutes);
                }
                if (b.durationSeconds !== undefined && b.durationSeconds !== null && !isNaN(Number(b.durationSeconds))) {
                    return Number(b.durationSeconds) / 60;
                }
                return null;
            })
            .filter(t => t !== null && t > 0);

        const avgTime = validTimes.length > 0
            ? (validTimes.reduce((acc, v) => acc + v, 0) / validTimes.length)
            : null;

        const validWater = matchingBatches
            .map(b => {
                const w = b.water !== undefined ? b.water : (b.waterQuantity || b.waterVolume);
                return (w !== null && w !== undefined && !isNaN(Number(w))) ? Number(w) : null;
            })
            .filter(w => w !== null && w > 0);

        const avgWater = validWater.length > 0
            ? (validWater.reduce((acc, v) => acc + v, 0) / validWater.length)
            : null;

        return {
            count: matchingBatches.length,
            hasMatches: true,
            validTempCount: validTemps.length,
            averageTemperature: avgTemp !== null ? Math.round(avgTemp) : null,
            averageTimeMinutes: avgTime !== null ? Math.round(avgTime) : null,
            averageWaterMl: avgWater !== null ? Math.round(avgWater) : null
        };
    }

    function isBatchToday(batch) {
        if (!batch || !batch.completedAt) return false;
        try {
            const d = new Date(batch.completedAt);
            const today = new Date();
            return d.getFullYear() === today.getFullYear() &&
                   d.getMonth() === today.getMonth() &&
                   d.getDate() === today.getDate();
        } catch (e) {
            return false;
        }
    }

    function isBatchLast7Days(batch) {
        if (!batch || !batch.completedAt) return false;
        try {
            const d = new Date(batch.completedAt).getTime();
            const now = new Date().getTime();
            const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
            return (now - d) <= sevenDaysMs && (now - d) >= 0;
        } catch (e) {
            return false;
        }
    }

    // ----------------------------------------------------
    // FILTERING HELPER (PHASE 4)
    // ----------------------------------------------------

    function getFilteredBatches(timeFilter, formulationFilter) {
        let batches = getAllBatches();

        // 1. Apply Time Filter
        if (timeFilter === 'today') {
            batches = batches.filter(isBatchToday);
        } else if (timeFilter === '7days') {
            batches = batches.filter(isBatchLast7Days);
        } // 'all' keeps all batches

        // 2. Apply Formulation Filter
        if (formulationFilter && formulationFilter !== 'all') {
            const normF = normalizeFormulation(formulationFilter);
            batches = batches.filter(b => normalizeFormulation(b.formulation) === normF);
        }

        return batches;
    }

    // ----------------------------------------------------
    // FORMULATION GROUPING (PHASE 4)
    // ----------------------------------------------------

    function getFormulationGroups(batches) {
        const groups = {};

        batches.forEach(b => {
            const formKey = b.formulation || 'Unknown Formulation';
            const ingsKey = normalizeIngredients(b.ingredients).join(', ');
            const groupKey = `${formKey}::${ingsKey}`;

            if (!groups[groupKey]) {
                groups[groupKey] = {
                    formulation: formKey,
                    ingredients: b.ingredients || [],
                    ingredientDetails: b.ingredientDetails || null,
                    batches: []
                };
            }
            groups[groupKey].batches.push(b);
        });

        return Object.values(groups).map(g => {
            const metrics = calculateMetrics(g.batches);
            return {
                formulation: g.formulation,
                ingredients: g.ingredients,
                ingredientDetails: g.ingredientDetails,
                count: metrics.count,
                averageTemperature: metrics.averageTemperature,
                averageWater: metrics.averageWaterMl,
                averageTime: metrics.averageTimeMinutes
            };
        });
    }

    // ----------------------------------------------------
    // DASHBOARD RECOMMENDATION SYNCHRONIZATION
    // Only updates concise advisory indicator near temperature controls
    // ----------------------------------------------------

    function updateDashboardRecommendation(contextFormulation, contextIngredients) {
        const allBatches = getAllBatches();

        let currentForm = contextFormulation;
        let currentIngs = contextIngredients;

        if (!currentForm) {
            if (window.preparationData && window.preparationData.formulation) {
                currentForm = window.preparationData.formulation;
                currentIngs = window.preparationData.ingredients;
            } else if (window.detectedFormulation) {
                currentForm = window.detectedFormulation;
            } else if (typeof window.podParser !== 'undefined' && typeof window.podParser.getActivePod === 'function') {
                const activePod = window.podParser.getActivePod();
                if (activePod) {
                    currentForm = activePod.formulation;
                    currentIngs = activePod.ingredients;
                }
            }
        }

        // Default to benchmark pod if none set
        if (!currentForm) {
            currentForm = 'Amrtottara Kwatha Curna';
            currentIngs = ['Sunthi', 'Amrta', 'Abhaya'];
        }

        const matchingBatches = allBatches.filter(b => isBatchMatching(b, currentForm, currentIngs));
        const metrics = calculateMetrics(matchingBatches);

        // Step 4 Recommended Temperature Card
        const step4RecVal = document.getElementById('recommendedTempValue');
        const step4RecSource = document.getElementById('recommendedTempSource');
        const step4Card = document.getElementById('step4RecommendedCard');

        if (step4RecVal && step4RecSource) {
            if (metrics.hasMatches && metrics.averageTemperature !== null) {
                step4RecVal.textContent = `${metrics.averageTemperature}°C`;
                step4RecSource.textContent = `Based on ${metrics.count} previous matching preparation${metrics.count === 1 ? '' : 's'}`;
                if (step4Card) step4Card.classList.remove('no-matches');
            } else {
                step4RecVal.textContent = 'No previous matching batches';
                step4RecSource.textContent = 'No matching batches for this formulation & composition';
                if (step4Card) step4Card.classList.add('no-matches');
            }
        }

        // Step 5 Live Monitor Recommended Temperature Bar
        const monRecVal = document.getElementById('monitorRecommendedTempValue');
        const monRecSource = document.getElementById('monitorRecommendedTempSource');

        if (monRecVal && monRecSource) {
            if (metrics.hasMatches && metrics.averageTemperature !== null) {
                monRecVal.textContent = `${metrics.averageTemperature}°C`;
                monRecSource.textContent = `Based on ${metrics.count} previous matching preparation${metrics.count === 1 ? '' : 's'}`;
            } else {
                monRecVal.textContent = 'No previous matching batches';
                monRecSource.textContent = 'No matching batches recorded';
            }
        }

        return metrics;
    }

    // ----------------------------------------------------
    // DEDICATED BATCH HISTORY PAGE RENDERER (/batch-history)
    // ----------------------------------------------------

    function renderBatchHistoryPage() {
        const fullTableBody = document.getElementById('fullBatchTableBody');
        if (!fullTableBody) {
            // Not on /batch-history page
            return;
        }

        const allBatches = getAllBatches();
        const filteredBatches = getFilteredBatches(activeTimeFilter, activeFormulationFilter);

        // 1. Preparations Today count (regardless of current active filter)
        const todayCount = allBatches.filter(isBatchToday).length;
        const todayEl = document.getElementById('batchSummaryTodayVal');
        if (todayEl) todayEl.textContent = todayCount;

        // 2. Filtered metrics
        const matchingCount = filteredBatches.length;
        const matchEl = document.getElementById('batchSummaryMatchingVal');
        if (matchEl) matchEl.textContent = matchingCount;

        const metrics = calculateMetrics(filteredBatches);

        const avgTempEl = document.getElementById('batchSummaryAvgTempVal');
        if (avgTempEl) {
            avgTempEl.textContent = metrics.averageTemperature !== null ? `${metrics.averageTemperature}°C` : '—';
        }

        const avgTimeEl = document.getElementById('batchSummaryAvgTimeVal');
        if (avgTimeEl) {
            avgTimeEl.textContent = metrics.averageTimeMinutes !== null ? `${metrics.averageTimeMinutes} min` : '—';
        }

        const avgWaterEl = document.getElementById('batchSummaryAvgWaterVal');
        if (avgWaterEl) {
            avgWaterEl.textContent = metrics.averageWaterMl !== null ? `${metrics.averageWaterMl} mL` : '—';
        }

        // 3. Recommended Temperature Intelligence Card
        const recTempEl = document.getElementById('batchPageRecTempVal');
        const recSourceEl = document.getElementById('batchPageRecTempSource');
        const recContextEl = document.getElementById('batchPageRecContext');

        if (metrics.hasMatches && metrics.averageTemperature !== null) {
            if (recTempEl) recTempEl.textContent = `${metrics.averageTemperature}°C`;
            if (recSourceEl) {
                recSourceEl.textContent = `Based on ${metrics.count} previous matching preparation${metrics.count === 1 ? '' : 's'}`;
            }
            if (recContextEl) {
                recContextEl.textContent = activeFormulationFilter !== 'all'
                    ? `Formulation: ${activeFormulationFilter}`
                    : `Filtered Records (${activeTimeFilter === 'today' ? 'Today' : (activeTimeFilter === '7days' ? 'Last 7 Days' : 'All History')})`;
            }
        } else {
            if (recTempEl) recTempEl.textContent = 'No previous matching batches';
            if (recSourceEl) recSourceEl.textContent = 'No records match current filter criteria';
            if (recContextEl) recContextEl.textContent = 'Historical process guidance';
        }

        // 4. Formulation History Grouping Cards
        const groupContainer = document.getElementById('formulationGroupsContainer');
        if (groupContainer) {
            const groups = getFormulationGroups(filteredBatches);
            if (groups.length === 0) {
                groupContainer.innerHTML = `<div class="empty-state-notice">No formulation records found for selected filter.</div>`;
            } else {
                groupContainer.innerHTML = groups.map(g => {
                    const ingsStr = Array.isArray(g.ingredients) ? g.ingredients.join(', ') : 'Standard composition';
                    return `
                        <div class="formulation-group-card">
                            <div class="form-group-header">
                                <span class="form-group-badge">🌿 ${g.count} Preparation${g.count === 1 ? '' : 's'}</span>
                                <h4 class="form-group-name">${g.formulation}</h4>
                                <div class="form-group-ings">${ingsStr}</div>
                            </div>
                            <div class="form-group-stats">
                                <div class="form-stat-item">
                                    <span>Avg Temp</span>
                                    <strong>${g.averageTemperature !== null ? g.averageTemperature + '°C' : '—'}</strong>
                                </div>
                                <div class="form-stat-item">
                                    <span>Avg Water</span>
                                    <strong>${g.averageWater !== null ? g.averageWater + ' mL' : '—'}</strong>
                                </div>
                                <div class="form-stat-item">
                                    <span>Avg Time</span>
                                    <strong>${g.averageTime !== null ? g.averageTime + ' min' : '—'}</strong>
                                </div>
                            </div>
                        </div>
                    `;
                }).join('');
            }
        }

        // 5. Full Batch History 10-Column Table
        if (filteredBatches.length === 0) {
            fullTableBody.innerHTML = `
                <tr>
                    <td colspan="10" class="table-empty-row">
                        No batch history yet for this filter selection.
                    </td>
                </tr>
            `;
        } else {
            // Newest batches first
            const sorted = filteredBatches.slice().reverse();
            fullTableBody.innerHTML = sorted.map(b => {
                const tempStr = b.temperature ? `${b.temperature}°C` : '—';
                const waterStr = b.water ? `${b.water} mL` : '—';
                const targetStr = b.targetVolume ? `${b.targetVolume} mL` : '—';
                const finalStr = b.finalVolume ? `${b.finalVolume} mL` : (b.targetVolume ? `${b.targetVolume} mL` : '—');
                const durStr = b.durationMinutes ? `${b.durationMinutes} min` : (b.durationSeconds ? `${Math.round(b.durationSeconds / 60)} min` : '—');
                
                let dateStr = 'Today';
                if (b.completedAt) {
                    try {
                        const d = new Date(b.completedAt);
                        dateStr = d.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ', ' +
                                  d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    } catch (e) {
                        dateStr = 'Today';
                    }
                }

                return `
                    <tr>
                        <td><strong>${b.id}</strong></td>
                        <td>${b.podId || '—'}</td>
                        <td>${b.formulation}</td>
                        <td>${dateStr}</td>
                        <td><strong>${tempStr}</strong></td>
                        <td>${waterStr}</td>
                        <td>${targetStr}</td>
                        <td>${finalStr}</td>
                        <td>${durStr}</td>
                        <td><span class="status-pill complete">✓ Completed</span></td>
                    </tr>
                `;
            }).join('');
        }

        // 6. Update results counter
        const counterEl = document.getElementById('batchFilterResultCount');
        if (counterEl) {
            counterEl.textContent = `Showing ${filteredBatches.length} of ${allBatches.length} batch records`;
        }
    }

    // ----------------------------------------------------
    // RECORD NEW COMPLETED PREPARATION
    // ----------------------------------------------------

    function recordCompletedBatch(data) {
        if (!data) return null;

        const allBatches = getAllBatches();
        const today = new Date();
        const batchNum = allBatches.length + 1;
        const padNum = String(batchNum).padStart(3, '0');

        let durationMin = null;
        if (data.durationSeconds !== undefined && data.durationSeconds !== null) {
            durationMin = Math.round(Number(data.durationSeconds) / 60);
        } else if (data.durationMinutes !== undefined && data.durationMinutes !== null) {
            durationMin = Number(data.durationMinutes);
        }

        const newRecord = {
            id: `BATCH-${today.getFullYear()}${(today.getMonth() + 1).toString().padStart(2, '0')}${today.getDate().toString().padStart(2, '0')}-${padNum}`,
            podId: data.podId || (window.podParser && window.podParser.getActivePod ? (window.podParser.getActivePod() || {}).podId : 'IKW-MANUAL'),
            batchNumber: data.batchNumber || `IKW-BATCH-2026-${padNum}`,
            formulation: data.formulation || window.detectedFormulation || 'Classical Kwatha',
            ingredients: data.ingredients || (window.preparationData ? window.preparationData.ingredients : []),
            ingredientDetails: data.ingredientDetails || null,
            powder: Number(data.powder || 48),
            water: Number(data.water || (data.initialVolume || 384)),
            targetVolume: Number(data.targetVolume || 96),
            finalVolume: Number(data.finalVolume || data.targetVolume || 96),
            temperature: Number(data.temperature || window.selectedTemperature || 85),
            durationSeconds: Number(data.durationSeconds || 0),
            durationMinutes: durationMin,
            completedAt: new Date().toISOString(),
            isDemo: false
        };

        allBatches.push(newRecord);
        saveBatches(allBatches);
        persistBatchToIndexedDB(newRecord);

        // Update active UI (Dashboard or Batch History)
        updateDashboardRecommendation(newRecord.formulation, newRecord.ingredients);
        renderBatchHistoryPage();

        console.log('[iKwath BatchHistory] Recorded completed batch:', newRecord.id);
        return newRecord;
    }

    // ----------------------------------------------------
    // EVENT BINDINGS FOR BATCH HISTORY PAGE
    // ----------------------------------------------------

    function initBatchHistoryPageEvents() {
        // Time filter buttons
        const todayBtn = document.getElementById('filterTodayBtn');
        const sevenDaysBtn = document.getElementById('filter7DaysBtn');
        const allBtn = document.getElementById('filterAllBtn');
        const formSelect = document.getElementById('formulationFilterSelect');

        function setActiveTimeBtn(btn) {
            [todayBtn, sevenDaysBtn, allBtn].forEach(b => {
                if (b) b.classList.remove('active');
            });
            if (btn) btn.classList.add('active');
        }

        if (todayBtn) {
            todayBtn.addEventListener('click', () => {
                activeTimeFilter = 'today';
                setActiveTimeBtn(todayBtn);
                renderBatchHistoryPage();
            });
        }

        if (sevenDaysBtn) {
            sevenDaysBtn.addEventListener('click', () => {
                activeTimeFilter = '7days';
                setActiveTimeBtn(sevenDaysBtn);
                renderBatchHistoryPage();
            });
        }

        if (allBtn) {
            allBtn.addEventListener('click', () => {
                activeTimeFilter = 'all';
                setActiveTimeBtn(allBtn);
                renderBatchHistoryPage();
            });
        }

        if (formSelect) {
            formSelect.addEventListener('change', () => {
                activeFormulationFilter = formSelect.value;
                renderBatchHistoryPage();
            });
        }
    }

    // ----------------------------------------------------
    // PUBLIC API
    // ----------------------------------------------------

    const batchHistory = {
        getAllBatches: getAllBatches,
        getFilteredBatches: getFilteredBatches,
        getFormulationGroups: getFormulationGroups,
        isBatchMatching: isBatchMatching,
        calculateMetrics: calculateMetrics,
        updateRecommendation: function (podOrFormulation, ingredients) {
            if (typeof podOrFormulation === 'object' && podOrFormulation !== null) {
                return updateDashboardRecommendation(podOrFormulation.formulation, podOrFormulation.ingredients);
            }
            return updateDashboardRecommendation(podOrFormulation, ingredients);
        },
        updateRecommendationForCurrentState: function () {
            return updateDashboardRecommendation();
        },
        renderBatchHistoryPage: renderBatchHistoryPage,
        recordCompletedBatch: recordCompletedBatch,
        resetDemoData: function () {
            localStorage.removeItem(STORAGE_KEY);
            updateDashboardRecommendation();
            renderBatchHistoryPage();
        }
    };

    window.batchHistory = batchHistory;

    // Automatic initialization based on current page
    document.addEventListener('DOMContentLoaded', function () {
        setTimeout(function () {
            updateDashboardRecommendation();
            initBatchHistoryPageEvents();
            renderBatchHistoryPage();
        }, 80);
    });

})(window);
