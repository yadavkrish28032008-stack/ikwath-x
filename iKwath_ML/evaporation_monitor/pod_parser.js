/**
 * iKwath-X Pod Parser & Storage Layer
 * 
 * Validates machine-readable QR payloads into structured Pod objects.
 * Manages client persistence and maps structured Pod data into the
 * existing approved dashboard fields without altering the dashboard structure.
 */

(function (window) {
    'use strict';

    const STORAGE_KEY = 'ikwath_active_pod';
    const DB_NAME = 'ikwath_db';
    const DB_VERSION = 1;
    const STORE_NAME = 'scanned_pods';

    // Supported classical formulations in the current system
    const REGISTERED_FORMULATIONS = [
        'Amrtottara Kwatha Curna',
        'Ardhabilva Kwatha Curna',
        'Aragvadhadi Kwatha Curna',
        'Chinnodbhavadi Kwatha Curna'
    ];

    // Classical / Pharmacopoeial reference profiles verified per AFI & API
    const VERIFIED_FORMULATION_PROFILES = {
        'Amrtottara Kwatha Curna': {
            formulationId: 'KW-F001',
            classicalReference: 'Ayurvedic Formulary of India (AFI Part I, 4:1) / Sahasrayogam',
            coarsePowderSpecification: 'Yavakuta (Coarse powder, passes sieve 10, not more than 40% passes sieve 44 per AFI)',
            waterMultiplier: '8×',
            preparationInstructions: 'Boil coarse powder (Yavakuta) in specified volume of potable water in an open vessel until reduced to target volume (1/4th); filter through clean four-fold muslin cloth.',
            targetReductionEndpoint: '96 mL (1/4th volume reduction)',
            postBrewAddition: 'Guda (Jaggery) & Pippali curna (per physician advice / Sahasrayogam)',
            rawMaterialApiReference: 'API Part I, Vol. I (Sunthi: p. 103, Amrta: p. 41, Abhaya: p. 47)',
            defaultRatio: {
                'sunthi': { ratio: '1 part (16.7%)', weightFraction: 1 / 6 },
                'amrta': { ratio: '3 parts (50.0%)', weightFraction: 3 / 6 },
                'abhaya': { ratio: '2 parts (33.3%)', weightFraction: 2 / 6 }
            }
        },
        'Aragvadhadi Kwatha Curna': {
            formulationId: 'KW-F002',
            classicalReference: 'Ayurvedic Formulary of India (AFI Part I, 4:2) / Ashtanga Hridaya',
            coarsePowderSpecification: 'Yavakuta (Coarse powder, passes sieve 10, not more than 40% passes sieve 44 per AFI)',
            waterMultiplier: '8×',
            preparationInstructions: 'Boil coarse powder (Yavakuta) in 8 parts water in an open vessel until reduced to 1/4th volume; filter through clean muslin cloth.',
            targetReductionEndpoint: '1/4th volume reduction',
            postBrewAddition: 'Not specified',
            rawMaterialApiReference: 'API Part I (Aragvadha: Vol. I p. 12, Nimba: Vol. II p. 115, Patola: Vol. III p. 149, Katuka: Vol. II p. 85)',
            defaultRatio: {
                'aragvadha': { ratio: '1 part (25%)', weightFraction: 0.25 },
                'nimba': { ratio: '1 part (25%)', weightFraction: 0.25 },
                'patola': { ratio: '1 part (25%)', weightFraction: 0.25 },
                'katuka': { ratio: '1 part (25%)', weightFraction: 0.25 }
            }
        },
        'Ardhabilva Kwatha Curna': {
            formulationId: 'KW-F003',
            classicalReference: 'Ayurvedic Formulary of India (AFI Part I) / Sahasrayogam',
            coarsePowderSpecification: 'Yavakuta (Coarse powder, passes sieve 10, not more than 40% passes sieve 44 per AFI)',
            waterMultiplier: '100×',
            preparationInstructions: 'Boil coarse powder in 100 parts water until reduced to half volume (1/2 reduction); filter through clean muslin cloth.',
            targetReductionEndpoint: '1/2 volume reduction',
            postBrewAddition: 'Not specified',
            rawMaterialApiReference: 'API Part I (Punarnava: Vol. I p. 95, Sunthi: Vol. I p. 103, Brihati: Vol. II p. 27, Kantakari: Vol. I p. 59, Apamarga: Vol. II p. 7, Duralabha: Vol. III p. 47)',
            defaultRatio: {
                'punarnava': { ratio: '1 part', weightFraction: 1 / 6 },
                'sunthi': { ratio: '1 part', weightFraction: 1 / 6 },
                'brihati': { ratio: '1 part', weightFraction: 1 / 6 },
                'kantakari': { ratio: '1 part', weightFraction: 1 / 6 },
                'apamarga': { ratio: '1 part', weightFraction: 1 / 6 },
                'duralabha': { ratio: '1 part', weightFraction: 1 / 6 }
            }
        },
        'Chinnodbhavadi Kwatha Curna': {
            formulationId: 'KW-F004',
            classicalReference: 'Ayurvedic Formulary of India (AFI Part I) / Sahasrayogam',
            coarsePowderSpecification: 'Yavakuta (Coarse powder, passes sieve 10, not more than 40% passes sieve 44 per AFI)',
            waterMultiplier: '8×',
            preparationInstructions: 'Boil coarse powder in 8 parts water in an open vessel until reduced to 1/4th volume; filter through clean muslin cloth.',
            targetReductionEndpoint: '1/4th volume reduction',
            postBrewAddition: 'Not specified',
            rawMaterialApiReference: 'API Part I (Guduchi, Vasa, Kirataka, Parpata, Sunthi, Musta, Yavasaka)',
            defaultRatio: {
                'guduchi': { ratio: '1 part', weightFraction: 1 / 7 },
                'vasa': { ratio: '1 part', weightFraction: 1 / 7 },
                'kirataka': { ratio: '1 part', weightFraction: 1 / 7 },
                'parpata': { ratio: '1 part', weightFraction: 1 / 7 },
                'sunthi': { ratio: '1 part', weightFraction: 1 / 7 },
                'musta': { ratio: '1 part', weightFraction: 1 / 7 },
                'yavasaka': { ratio: '1 part', weightFraction: 1 / 7 }
            }
        }
    };

    // Verified Ayurvedic botanical dictionary according to Ayurvedic Pharmacopoeia of India (API)
    const VERIFIED_BOTANICAL_LOOKUP = {
        'sunthi': { botanicalIdentity: 'Zingiber officinale Roscoe', partUsed: 'Dried rhizome', apiReference: 'API Part I, Vol. I, p. 103' },
        'shunthi': { botanicalIdentity: 'Zingiber officinale Roscoe', partUsed: 'Dried rhizome', apiReference: 'API Part I, Vol. I, p. 103' },
        'amrta': { botanicalIdentity: 'Tinospora cordifolia (Willd.) Miers', partUsed: 'Stem', apiReference: 'API Part I, Vol. I, p. 41' },
        'guduchi': { botanicalIdentity: 'Tinospora cordifolia (Willd.) Miers', partUsed: 'Stem', apiReference: 'API Part I, Vol. I, p. 41' },
        'abhaya': { botanicalIdentity: 'Terminalia chebula Retz.', partUsed: 'Pericarp of dried fruit', apiReference: 'API Part I, Vol. I, p. 47' },
        'haritaki': { botanicalIdentity: 'Terminalia chebula Retz.', partUsed: 'Pericarp of dried fruit', apiReference: 'API Part I, Vol. I, p. 47' },
        'aragvadha': { botanicalIdentity: 'Cassia fistula L.', partUsed: 'Fruit pulp / Stem bark', apiReference: 'API Part I, Vol. I, p. 12' },
        'nimba': { botanicalIdentity: 'Azadirachta indica A. Juss.', partUsed: 'Stem bark', apiReference: 'API Part I, Vol. II, p. 115' },
        'patola': { botanicalIdentity: 'Trichosanthes dioica Roxb.', partUsed: 'Whole plant / Leaf', apiReference: 'API Part I, Vol. III, p. 149' },
        'katuka': { botanicalIdentity: 'Picrorhiza kurroa Royle ex Benth.', partUsed: 'Rhizome', apiReference: 'API Part I, Vol. II, p. 85' },
        'punarnava': { botanicalIdentity: 'Boerhavia diffusa L.', partUsed: 'Root / Whole plant', apiReference: 'API Part I, Vol. I, p. 95' },
        'brihati': { botanicalIdentity: 'Solanum indicum L.', partUsed: 'Root / Whole plant', apiReference: 'API Part I, Vol. II, p. 27' },
        'kantakari': { botanicalIdentity: 'Solanum surattense Burm. f.', partUsed: 'Whole plant', apiReference: 'API Part I, Vol. I, p. 59' },
        'apamarga': { botanicalIdentity: 'Achyranthes aspera L.', partUsed: 'Whole plant', apiReference: 'API Part I, Vol. II, p. 7' },
        'duralabha': { botanicalIdentity: 'Fagonia cretica L.', partUsed: 'Whole plant', apiReference: 'API Part I, Vol. III, p. 47' },
        'vasa': { botanicalIdentity: 'Adhatoda vasica Nees', partUsed: 'Leaf', apiReference: 'API Part I, Vol. I, p. 115' },
        'kirataka': { botanicalIdentity: 'Swertia chirata Buch.-Ham.', partUsed: 'Whole plant', apiReference: 'API Part I, Vol. I, p. 67' },
        'parpata': { botanicalIdentity: 'Fumaria parviflora Lam.', partUsed: 'Whole plant', apiReference: 'API Part I, Vol. II, p. 137' },
        'musta': { botanicalIdentity: 'Cyperus rotundus L.', partUsed: 'Rhizome', apiReference: 'API Part I, Vol. III, p. 129' },
        'yavasaka': { botanicalIdentity: 'Alhagi pseudalhagi (Bieb.) Desv.', partUsed: 'Whole plant', apiReference: 'API Part I, Vol. III, p. 233' },
        'bilva': { botanicalIdentity: 'Aegle marmelos (L.) Correa', partUsed: 'Root / Stem bark', apiReference: 'API Part I, Vol. I, p. 27' },
        'agnimantha': { botanicalIdentity: 'Premna integrifolia L.', partUsed: 'Root bark', apiReference: 'API Part I, Vol. III, p. 3' },
        'syonaka': { botanicalIdentity: 'Oroxylum indicum (L.) Vent.', partUsed: 'Root bark', apiReference: 'API Part I, Vol. III, p. 211' },
        'gambhari': { botanicalIdentity: 'Gmelina arborea Roxb.', partUsed: 'Root / Stem bark', apiReference: 'API Part I, Vol. III, p. 61' },
        'patala': { botanicalIdentity: 'Stereospermum suaveolens (Roxb.) DC.', partUsed: 'Root bark', apiReference: 'API Part I, Vol. III, p. 147' },
        'shalaparni': { botanicalIdentity: 'Desmodium gangeticum (L.) DC.', partUsed: 'Root / Whole plant', apiReference: 'API Part I, Vol. III, p. 185' },
        'prishniparni': { botanicalIdentity: 'Uraria picta (Jacq.) Desv. ex DC.', partUsed: 'Root / Whole plant', apiReference: 'API Part I, Vol. III, p. 165' },
        'gokshura': { botanicalIdentity: 'Tribulus terrestris L.', partUsed: 'Dried fruit / Root', apiReference: 'API Part I, Vol. I, p. 38' },
        'ashwagandha': { botanicalIdentity: 'Withania somnifera (L.) Dunal', partUsed: 'Root', apiReference: 'API Part I, Vol. I, p. 19' },
        'tulasi': { botanicalIdentity: 'Ocimum sanctum L.', partUsed: 'Leaf / Whole plant', apiReference: 'API Part I, Vol. II, p. 165' },
        'yashtimadhu': { botanicalIdentity: 'Glycyrrhiza glabra L.', partUsed: 'Stolon / Root', apiReference: 'API Part I, Vol. I, p. 127' },
        'haridra': { botanicalIdentity: 'Curcuma longa L.', partUsed: 'Rhizome', apiReference: 'API Part I, Vol. I, p. 45' },
        'amalaki': { botanicalIdentity: 'Phyllanthus emblica L.', partUsed: 'Pericarp of dried fruit', apiReference: 'API Part I, Vol. I, p. 4' },
        'bibhitaka': { botanicalIdentity: 'Terminalia bellirica (Gaertn.) Roxb.', partUsed: 'Pericarp of dried fruit', apiReference: 'API Part I, Vol. I, p. 25' },
        'pippali': { botanicalIdentity: 'Piper longum L.', partUsed: 'Dried fruit', apiReference: 'API Part I, Vol. IV, p. 91' },
        'maricha': { botanicalIdentity: 'Piper nigrum L.', partUsed: 'Dried fruit', apiReference: 'API Part I, Vol. III, p. 115' },
        'twak': { botanicalIdentity: 'Cinnamomum verum J. Presl', partUsed: 'Inner stem bark', apiReference: 'API Part I, Vol. I, p. 113' },
        'ela': { botanicalIdentity: 'Elettaria cardamomum (L.) Maton', partUsed: 'Seed', apiReference: 'API Part I, Vol. I, p. 101' },
        'patra': { botanicalIdentity: 'Cinnamomum tamala (Buch.-Ham.) Nees & Eberm.', partUsed: 'Dried leaf', apiReference: 'API Part I, Vol. I, p. 111' }
    };

    // IndexedDB initialization
    function openDatabase() {
        return new Promise((resolve, reject) => {
            if (!window.indexedDB) {
                resolve(null);
                return;
            }
            const request = indexedDB.open(DB_NAME, DB_VERSION);
            request.onupgradeneeded = function (e) {
                const db = e.target.result;
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    db.createObjectStore(STORE_NAME, { keyPath: 'podId' });
                }
            };
            request.onsuccess = function (e) {
                resolve(e.target.result);
            };
            request.onerror = function (e) {
                console.warn('[iKwath DB] IndexedDB unavailable, fallback to localStorage:', e);
                resolve(null);
            };
        });
    }

    /**
     * Normalizes and validates raw QR payload into canonical Pod model.
     * Maps field aliases, supports nested preparationParams, resolves
     * formulation IDs, and calculates missing parameters from classical ratios.
     * @param {string|Object} rawPayload
     * @returns {{ success: boolean, pod?: Object, error?: string }}
     */
    function normalizePodPayload(rawPayload) {
        if (!rawPayload) {
            return { success: false, error: 'Unable to read this QR code.' };
        }

        let data;
        if (typeof rawPayload === 'string') {
            const trimmed = rawPayload.trim();
            if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) {
                return { success: false, error: 'Unable to read this QR code.' };
            }
            try {
                data = JSON.parse(trimmed);
            } catch (e) {
                return { success: false, error: 'Unable to read this QR code.' };
            }
        } else if (typeof rawPayload === 'object' && rawPayload !== null) {
            data = rawPayload;
        } else {
            return { success: false, error: 'Unable to read this QR code.' };
        }

        if (!data || typeof data !== 'object' || Array.isArray(data)) {
            return { success: false, error: 'Unable to read this QR code.' };
        }

        // 1. Resolve Pod ID
        const podId = data.podId || data.pod_id || data.podID || data.id || data.podCode || data.pod_code || data.batchId || data.batch_id || data.formulationId || data.formulation_id || data.code || (data.batchNumber ? String(data.batchNumber) : null);
        if (!podId) {
            return { success: false, error: 'Pod QR is valid, but Pod ID is missing.' };
        }

        // 2. Resolve Parameters Object (nested or flat)
        const prepParams = data.preparationParams || data.preparation_params || data.parameters || data.prepParams || data.params || data.preparation || {};

        // 3. Resolve Powder (netWeightGrams / powderWeightG / powder / etc.)
        let powderRaw = data.powder !== undefined ? data.powder :
                       (data.netWeightGrams !== undefined ? data.netWeightGrams :
                       (data.net_weight_grams !== undefined ? data.net_weight_grams :
                       (data.powderWeightG !== undefined ? data.powderWeightG :
                       (data.powder_weight_g !== undefined ? data.powder_weight_g :
                       (data.powderWeight !== undefined ? data.powderWeight :
                       (data.powder_weight !== undefined ? data.powder_weight :
                       (data.netWeight !== undefined ? data.netWeight :
                       (data.net_weight !== undefined ? data.net_weight :
                       (data.weight !== undefined ? data.weight :
                       (data.weightGrams !== undefined ? data.weightGrams :
                       (data.powderQuantity !== undefined ? data.powderQuantity :
                       (data.powder_qty !== undefined ? data.powder_qty :
                       (prepParams.powder !== undefined ? prepParams.powder :
                       (prepParams.netWeightGrams !== undefined ? prepParams.netWeightGrams :
                       (prepParams.powderWeightG !== undefined ? prepParams.powderWeightG : undefined)))))))))))))));

        let powderNum = NaN;
        if (powderRaw !== undefined && powderRaw !== null && powderRaw !== '') {
            if (typeof powderRaw === 'string') {
                powderNum = parseFloat(powderRaw.replace(/[^\d.]/g, ''));
            } else {
                powderNum = Number(powderRaw);
            }
        }

        // 4. Resolve Ingredients
        const ingredientsRaw = data.ingredients || data.botanicals || data.herbs || data.composition || data.ingredientsList || data.herbalComponents || data.components;
        let ingredients = [];
        let ingredientDetails = [];
        let ingredientWeightsSum = 0;
        let hasIngredientWeights = false;

        if (Array.isArray(ingredientsRaw)) {
            ingredientsRaw.forEach(item => {
                if (typeof item === 'string') {
                    const match = item.match(/^([^\d—(-]+)(?:[\s—(-]+(\d+(?:\.\d+)?)\s*g?)?/i);
                    if (match) {
                        const name = match[1].trim();
                        if (name) ingredients.push(name);
                        if (match[2]) {
                            const wt = parseFloat(match[2]);
                            ingredientDetails.push({ name: name, weight: wt });
                            ingredientWeightsSum += wt;
                            hasIngredientWeights = true;
                        } else {
                            ingredientDetails.push({ name: name, weight: null });
                        }
                    } else {
                        const clean = item.trim();
                        if (clean) {
                            ingredients.push(clean);
                            ingredientDetails.push({ name: clean, weight: null });
                        }
                    }
                } else if (typeof item === 'object' && item !== null) {
                    const name = item.name || item.ingredient || item.herb || item.botanical || item.item || item.title;
                    const wt = item.weight !== undefined ? item.weight :
                               (item.weightGrams !== undefined ? item.weightGrams :
                               (item.amount !== undefined ? item.amount :
                               (item.qty !== undefined ? item.qty : item.quantity)));
                    const bot = item.botanicalIdentity || item.botanical_identity || item.botanical || item.latinName || item.scientificName || null;
                    const part = item.partUsed || item.part_used || item.plantPart || item.plant_part || item.part || null;
                    const rat = item.ratio || item.proportion || item.parts || null;
                    const apiRef = item.apiReference || item.api_reference || item.rawMaterialApiReference || null;

                    if (name) {
                        const cleanName = String(name).trim();
                        ingredients.push(cleanName);
                        const detailObj = {
                            name: cleanName,
                            weight: (wt !== undefined && wt !== null && !isNaN(Number(wt))) ? Number(wt) : null,
                            botanicalIdentity: bot,
                            partUsed: part,
                            ratio: rat,
                            apiReference: apiRef
                        };
                        ingredientDetails.push(detailObj);
                        if (detailObj.weight !== null) {
                            ingredientWeightsSum += detailObj.weight;
                            hasIngredientWeights = true;
                        }
                    }
                }
            });
        } else if (typeof ingredientsRaw === 'object' && ingredientsRaw !== null) {
            Object.keys(ingredientsRaw).forEach(key => {
                const name = key.trim();
                if (name) {
                    ingredients.push(name);
                    const val = ingredientsRaw[key];
                    let wt = NaN;
                    let bot = null;
                    let part = null;
                    let rat = null;
                    let apiRef = null;

                    if (typeof val === 'number') {
                        wt = val;
                    } else if (typeof val === 'string') {
                        wt = parseFloat(val.replace(/[^\d.]/g, ''));
                    } else if (typeof val === 'object' && val !== null) {
                        wt = val.weight !== undefined ? Number(val.weight) : NaN;
                        bot = val.botanicalIdentity || val.botanical || null;
                        part = val.partUsed || val.part || null;
                        rat = val.ratio || null;
                        apiRef = val.apiReference || null;
                    }

                    const detailObj = {
                        name: name,
                        weight: !isNaN(wt) ? wt : null,
                        botanicalIdentity: bot,
                        partUsed: part,
                        ratio: rat,
                        apiReference: apiRef
                    };
                    ingredientDetails.push(detailObj);
                    if (detailObj.weight !== null) {
                        ingredientWeightsSum += detailObj.weight;
                        hasIngredientWeights = true;
                    }
                }
            });
        } else if (typeof ingredientsRaw === 'string') {
            ingredientsRaw.split(/[,;\n]+/).forEach(partStr => {
                const match = partStr.match(/^([^\d—(-]+)(?:[\s—(-]+(\d+(?:\.\d+)?)\s*g?)?/i);
                if (match) {
                    const name = match[1].trim();
                    if (name) {
                        ingredients.push(name);
                        if (match[2]) {
                            const wt = parseFloat(match[2]);
                            ingredientDetails.push({ name: name, weight: wt });
                            ingredientWeightsSum += wt;
                            hasIngredientWeights = true;
                        } else {
                            ingredientDetails.push({ name: name, weight: null });
                        }
                    }
                } else {
                    const clean = partStr.trim();
                    if (clean) {
                        ingredients.push(clean);
                        ingredientDetails.push({ name: clean, weight: null });
                    }
                }
            });
        }

        if ((isNaN(powderNum) || powderNum <= 0) && hasIngredientWeights && ingredientWeightsSum > 0) {
            powderNum = Math.round(ingredientWeightsSum * 100) / 100;
        }

        // 5. Resolve Formulation
        let formulationRaw = data.formulation || data.formulationName || data.formulation_name || data.name || data.title || data.kwatha || data.kwathaName || data.kwatha_name || data.product || data.productName;

        if (!formulationRaw && (data.formulationId || data.formulation_id || podId)) {
            const idToCheck = String(data.formulationId || data.formulation_id || podId).toUpperCase();
            if (idToCheck.includes('AMR') || idToCheck === 'KW-F001') {
                formulationRaw = 'Amrtottara Kwatha Curna';
            } else if (idToCheck.includes('ARG') || idToCheck === 'KW-F002') {
                formulationRaw = 'Aragvadhadi Kwatha Curna';
            } else if (idToCheck.includes('ARD') || idToCheck === 'KW-F003') {
                formulationRaw = 'Ardhabilva Kwatha Curna';
            } else if (idToCheck.includes('CHI') || idToCheck === 'KW-F004') {
                formulationRaw = 'Chinnodbhavadi Kwatha Curna';
            }
        }

        if (!formulationRaw && ingredients.length > 0) {
            const lowerIngs = ingredients.map(i => i.toLowerCase());
            if (lowerIngs.some(i => i.includes('sunthi') || i.includes('shunthi')) &&
                lowerIngs.some(i => i.includes('amrta') || i.includes('guduchi')) &&
                lowerIngs.some(i => i.includes('abhaya') || i.includes('haritaki'))) {
                formulationRaw = 'Amrtottara Kwatha Curna';
            }
        }

        if (!formulationRaw) {
            return { success: false, error: 'Pod QR is valid, but formulation is missing.' };
        }

        const cleanForm = String(formulationRaw).trim().toLowerCase().replace(/[-_]/g, ' ');
        let matchedFormulation = REGISTERED_FORMULATIONS.find(
            reg => reg.toLowerCase() === cleanForm ||
                   cleanForm.includes(reg.toLowerCase().replace(' kwatha curna', '')) ||
                   reg.toLowerCase().includes(cleanForm)
        );

        if (!matchedFormulation) {
            if (cleanForm.includes('amrtottara') || cleanForm.includes('amrutottara') || cleanForm.includes('amrithotharam')) {
                matchedFormulation = 'Amrtottara Kwatha Curna';
            } else if (cleanForm.includes('aragvadhadi') || cleanForm.includes('aragwadha')) {
                matchedFormulation = 'Aragvadhadi Kwatha Curna';
            } else if (cleanForm.includes('ardhabilva') || cleanForm.includes('ardhavilva')) {
                matchedFormulation = 'Ardhabilva Kwatha Curna';
            } else if (cleanForm.includes('chinnodbhavadi') || cleanForm.includes('chinnaruha')) {
                matchedFormulation = 'Chinnodbhavadi Kwatha Curna';
            } else {
                // Allow dynamic valid custom formulations from QR payloads
                matchedFormulation = String(formulationRaw).trim();
            }
        }

        if (!matchedFormulation) {
            return { success: false, error: 'This pod formulation is not registered in the current system.' };
        }

        const verifiedProf = VERIFIED_FORMULATION_PROFILES[matchedFormulation] || null;

        if (ingredients.length === 0) {
            if (matchedFormulation === 'Amrtottara Kwatha Curna') {
                ingredients = ['Sunthi', 'Amrta', 'Abhaya'];
            } else if (matchedFormulation === 'Aragvadhadi Kwatha Curna') {
                ingredients = ['Aragvadha', 'Nimba', 'Patola', 'Katuka'];
            } else if (matchedFormulation === 'Ardhabilva Kwatha Curna') {
                ingredients = ['Punarnava', 'Sunthi', 'Brihati', 'Kantakari', 'Apamarga', 'Duralabha'];
            } else if (matchedFormulation === 'Chinnodbhavadi Kwatha Curna') {
                ingredients = ['Guduchi', 'Vasa', 'Kirataka', 'Parpata', 'Sunthi', 'Musta', 'Yavasaka'];
            }
        }

        // Classical ingredient weight distribution if weights were omitted from QR payload
        if (ingredientDetails.length === 0 && matchedFormulation === 'Amrtottara Kwatha Curna') {
            const p = (!isNaN(powderNum) && powderNum > 0) ? powderNum : 48;
            // Sharngadhara Samhita ratio: Sunthi (1 part = 8g), Amrta (3 parts = 24g), Abhaya (2 parts = 16g) for 48g
            ingredientDetails = [
                { name: 'Sunthi', weight: Math.round((p * 1 / 6) * 100) / 100 },
                { name: 'Amrta', weight: Math.round((p * 3 / 6) * 100) / 100 },
                { name: 'Abhaya', weight: Math.round((p * 2 / 6) * 100) / 100 }
            ];
        }

        if (ingredients.length === 0) {
            return { success: false, error: 'Pod QR is valid, but ingredient list is missing.' };
        }

        if (isNaN(powderNum) || powderNum <= 0) {
            return { success: false, error: 'Pod QR is valid, but powder quantity is missing.' };
        }

        // 6. Preparation Parameters
        let waterRaw = prepParams.water !== undefined ? prepParams.water :
                      (prepParams.waterVolume !== undefined ? prepParams.waterVolume :
                      (prepParams.water_volume !== undefined ? prepParams.water_volume :
                      (prepParams.waterVolumeMl !== undefined ? prepParams.waterVolumeMl :
                      (prepParams.water_volume_ml !== undefined ? prepParams.water_volume_ml :
                      (prepParams.waterMl !== undefined ? prepParams.waterMl :
                      (data.water !== undefined ? data.water :
                      (data.waterVolume !== undefined ? data.waterVolume :
                      (data.water_volume !== undefined ? data.water_volume :
                      (data.waterVolumeMl !== undefined ? data.waterVolumeMl :
                      (data.water_ml !== undefined ? data.water_ml : undefined))))))))));

        let waterNum = null;
        if (waterRaw !== undefined && waterRaw !== null && waterRaw !== '') {
            const parsed = typeof waterRaw === 'string' ? parseFloat(waterRaw.replace(/[^\d.]/g, '')) : Number(waterRaw);
            if (!isNaN(parsed) && parsed > 0) waterNum = parsed;
        }

        if (waterNum === null) {
            if (matchedFormulation === 'Amrtottara Kwatha Curna' || matchedFormulation === 'Aragvadhadi Kwatha Curna' || matchedFormulation === 'Chinnodbhavadi Kwatha Curna') {
                waterNum = powderNum * 8;
            } else if (matchedFormulation === 'Ardhabilva Kwatha Curna') {
                waterNum = powderNum * 100;
            } else {
                waterNum = powderNum * 8;
            }
        }

        let targetRaw = prepParams.targetVolume !== undefined ? prepParams.targetVolume :
                       (prepParams.target_volume !== undefined ? prepParams.target_volume :
                       (prepParams.targetVolumeMl !== undefined ? prepParams.targetVolumeMl :
                       (prepParams.targetDecoction !== undefined ? prepParams.targetDecoction :
                       (prepParams.target_decoction !== undefined ? prepParams.target_decoction :
                       (prepParams.targetDecoctionMl !== undefined ? prepParams.targetDecoctionMl :
                       (prepParams.targetVol !== undefined ? prepParams.targetVol :
                       (data.targetVolume !== undefined ? data.targetVolume :
                       (data.target_volume !== undefined ? data.target_volume :
                       (data.targetDecoction !== undefined ? data.targetDecoction : undefined)))))))));

        let targetNum = null;
        if (targetRaw !== undefined && targetRaw !== null && targetRaw !== '') {
            const parsed = typeof targetRaw === 'string' ? parseFloat(targetRaw.replace(/[^\d.]/g, '')) : Number(targetRaw);
            if (!isNaN(parsed) && parsed > 0) targetNum = parsed;
        }

        if (targetNum === null) {
            if (matchedFormulation === 'Ardhabilva Kwatha Curna') {
                targetNum = waterNum / 2;
            } else {
                targetNum = waterNum / 4;
            }
        }

        let tempRaw = prepParams.temperature !== undefined ? prepParams.temperature :
                     (prepParams.temp !== undefined ? prepParams.temp :
                     (prepParams.temperatureC !== undefined ? prepParams.temperatureC :
                     (prepParams.targetTemperature !== undefined ? prepParams.targetTemperature :
                     (prepParams.targetTemp !== undefined ? prepParams.targetTemp :
                     (data.temperature !== undefined ? data.temperature :
                     (data.temp !== undefined ? data.temp :
                     (data.preparationTemperature !== undefined ? data.preparationTemperature : 85)))))));

        let tempNum = 85;
        if (tempRaw !== undefined && tempRaw !== null && tempRaw !== '') {
            const parsed = typeof tempRaw === 'string' ? parseFloat(tempRaw.replace(/[^\d.]/g, '')) : Number(tempRaw);
            if (!isNaN(parsed) && parsed >= 0 && parsed <= 100) {
                tempNum = Math.round(parsed);
            }
        }

        const batchNumber = data.batchNumber || data.batch_number || data.batchId || data.batch_id || data.lotNumber || 'IKW-POD-2026';
        const standard = data.standard || data.referenceStandard || data.reference_standard || (verifiedProf ? verifiedProf.classicalReference : 'Sharngadhara Samhita');

        // ============================================================
        // 7. Dynamic Ingredients Normalization & Botanical Mapping
        // ============================================================
        const normalizedIngredients = [];
        const compiledApiRefs = [];

        // Ensure each ingredient in the ingredients list is represented
        const resolvedDetails = ingredientDetails.length > 0
            ? ingredientDetails
            : ingredients.map(ing => ({ name: ing, weight: null }));

        resolvedDetails.forEach(detail => {
            const cleanName = detail.name.trim();
            const lookupKey = cleanName.toLowerCase().replace(/[^a-z]/g, '');
            const botanicalEntry = VERIFIED_BOTANICAL_LOOKUP[lookupKey] || null;

            // Priority: QR item value -> Verified Botanical Dictionary -> 'Not specified'
            const botanicalId = detail.botanicalIdentity ||
                               (botanicalEntry ? botanicalEntry.botanicalIdentity : 'Not specified');

            const partUsedVal = detail.partUsed ||
                               (botanicalEntry ? botanicalEntry.partUsed : 'Not specified');

            const herbApiRef = detail.apiReference ||
                              (botanicalEntry ? botanicalEntry.apiReference : null);
            if (herbApiRef && !compiledApiRefs.includes(herbApiRef)) {
                compiledApiRefs.push(`${cleanName}: ${herbApiRef.replace('API Part I, ', '')}`);
            }

            // Ratio resolution
            let ratioVal = detail.ratio || null;
            if (!ratioVal && verifiedProf && verifiedProf.defaultRatio && verifiedProf.defaultRatio[lookupKey]) {
                ratioVal = verifiedProf.defaultRatio[lookupKey].ratio;
            }
            if (!ratioVal && detail.weight !== null && powderNum > 0) {
                const pct = Math.round((detail.weight / powderNum) * 1000) / 10;
                ratioVal = `${detail.weight} g (${pct}%)`;
            }
            if (!ratioVal) {
                ratioVal = detail.weight !== null ? `${detail.weight} g` : 'Not specified';
            }

            normalizedIngredients.push({
                name: cleanName,
                botanicalIdentity: botanicalId,
                partUsed: partUsedVal,
                ratio: ratioVal,
                weight: detail.weight !== null ? detail.weight : 'Not specified',
                apiReference: herbApiRef || 'Not specified'
            });
        });

        // ============================================================
        // 8. 13-Field Normalized Formulation Profile Object
        // ============================================================
        const formulationIdVal = data.formulationId || data.formulation_id || data.formulationCode ||
                                (String(podId).startsWith('KW-') ? podId : null) ||
                                (verifiedProf ? verifiedProf.formulationId : podId);

        const classicalRefVal = data.classicalReference || data.classical_reference ||
                               data.afiReference || data.afi_reference ||
                               data.referenceStandard || data.reference_standard ||
                               (data.standard && data.standard !== 'Sharngadhara Samhita' ? data.standard : null) ||
                               (verifiedProf ? verifiedProf.classicalReference : (data.standard || 'Not specified'));

        const coarsePowderSpecVal = data.coarsePowderSpecification || data.coarse_powder_specification ||
                                   data.powderSpecification || data.powder_specification ||
                                   data.meshSpecification || data.sieveSpecification ||
                                   (verifiedProf ? verifiedProf.coarsePowderSpecification : 'Not specified');

        const waterMultiplierVal = data.waterMultiplier || data.water_multiplier ||
                                  data.waterFactor || data.water_factor ||
                                  (verifiedProf ? verifiedProf.waterMultiplier :
                                  (powderNum > 0 && waterNum > 0 ? `${Math.round(waterNum / powderNum)}×` : 'Not specified'));

        const prepInstructionsVal = data.preparationInstructions || data.preparation_instructions ||
                                   data.instructions || data.method ||
                                   (verifiedProf ? verifiedProf.preparationInstructions : 'Not specified');

        const targetReductionVal = data.targetReductionEndpoint || data.target_reduction_endpoint ||
                                  (targetNum !== null ? `${targetNum} mL` : (verifiedProf ? verifiedProf.targetReductionEndpoint : 'Not specified'));

        const postBrewAdditionVal = data.postBrewAddition || data.post_brew_addition ||
                                   data.prakshepa || data.prakshepaDravya ||
                                   (verifiedProf ? verifiedProf.postBrewAddition : 'Not specified');

        let rawMaterialApiVal = data.rawMaterialApiReference || data.raw_material_api_reference ||
                                data.apiReference || data.api_reference || null;
        if (!rawMaterialApiVal) {
            if (verifiedProf && verifiedProf.rawMaterialApiReference) {
                rawMaterialApiVal = verifiedProf.rawMaterialApiReference;
            } else if (compiledApiRefs.length > 0) {
                rawMaterialApiVal = `API Part I (${compiledApiRefs.join('; ')})`;
            } else {
                rawMaterialApiVal = 'Not specified';
            }
        }

        const batchIdVal = data.batchId || data.batch_id || data.batchNumber || data.batch_number || data.lotNumber || podId;
        const sourceVal = data.source || data.origin || data.facility || data.manufacturer || data.vendor || 'Not specified';

        const normalizedProfile = {
            formulationId: String(formulationIdVal || 'Not specified').trim(),
            classicalReference: String(classicalRefVal || 'Not specified').trim(),
            ingredients: normalizedIngredients,
            coarsePowderSpecification: String(coarsePowderSpecVal || 'Not specified').trim(),
            waterMultiplier: String(waterMultiplierVal || 'Not specified').trim(),
            initialWater: waterNum !== null && !isNaN(Number(waterNum)) ? Number(waterNum) : 'Not specified',
            preparationInstructions: String(prepInstructionsVal || 'Not specified').trim(),
            targetReductionEndpoint: String(targetReductionVal || 'Not specified').trim(),
            postBrewAddition: String(postBrewAdditionVal || 'Not specified').trim(),
            rawMaterialApiReference: String(rawMaterialApiVal || 'Not specified').trim(),
            batchId: String(batchIdVal || 'Not specified').trim(),
            source: String(sourceVal || 'Not specified').trim()
        };

        const normalizedPod = {
            podId: String(podId).trim(),
            formulation: matchedFormulation,
            ingredients: ingredients,
            ingredientDetails: resolvedDetails.filter(d => d.weight !== null).length > 0 ? resolvedDetails : null,
            powder: powderNum,
            water: waterNum,
            targetVolume: targetNum,
            temperature: tempNum,
            batchNumber: String(batchNumber).trim(),
            standard: String(standard).trim(),
            scannedAt: new Date().toISOString(),
            formulationProfile: normalizedProfile
        };

        return { success: true, pod: normalizedPod };
    }

    const podParser = {
        /**
         * List of recognized formulations in the engine.
         */
        registeredFormulations: REGISTERED_FORMULATIONS,

        /**
         * Verified classical reference profiles per AFI & API.
         */
        verifiedFormulations: VERIFIED_FORMULATION_PROFILES,

        /**
         * Verified Ayurvedic botanical reference database.
         */
        botanicalLookup: VERIFIED_BOTANICAL_LOOKUP,

        /**
         * Normalizes and validates raw QR payload into canonical Pod model.
         * Maps field aliases, supports nested preparationParams, resolves
         * formulation IDs, and calculates missing parameters from classical ratios.
         * @param {string|Object} rawPayload
         * @returns {{ success: boolean, pod?: Object, error?: string }}
         */
        normalize: normalizePodPayload,

        /**
         * Parse and validate a raw QR code string or JSON object.
         * Returns a structured Pod object or friendly error message.
         * @param {string|Object} rawPayload
         * @returns {{ success: boolean, pod?: Object, error?: string }}
         */
        parse: function (rawPayload) {
            return normalizePodPayload(rawPayload);
        },

        /**
         * Store the active pod in localStorage and IndexedDB.
         * @param {Object} pod
         */
        saveActivePod: function (pod) {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(pod));
            } catch (e) {
                console.error('[iKwath PodParser] localStorage save failed:', e);
            }

            // Store in IndexedDB for audit records
            openDatabase().then(db => {
                if (!db) return;
                try {
                    const tx = db.transaction(STORE_NAME, 'readwrite');
                    const store = tx.objectStore(STORE_NAME);
                    store.put(pod);
                } catch (err) {
                    console.warn('[iKwath PodParser] IndexedDB put failed:', err);
                }
            });
        },

        /**
         * Get the active parsed pod from storage.
         * @returns {Object|null}
         */
        getActivePod: function () {
            try {
                const raw = localStorage.getItem(STORAGE_KEY);
                return raw ? JSON.parse(raw) : null;
            } catch (e) {
                return null;
            }
        },

        /**
         * Clear active pod context.
         */
        clearActivePod: function () {
            try {
                localStorage.removeItem(STORAGE_KEY);
            } catch (e) {
                console.error('[iKwath PodParser] localStorage remove failed:', e);
            }
        },

        /**
         * Auto-populate the existing dashboard fields and trigger calculation.
         * Reuses existing IDs and workflows without altering dashboard DOM.
         * @param {Object} pod
         */
        autoPopulateDashboard: async function (pod) {
            if (!pod) return;
            if (!pod.formulationProfile && typeof normalizePodPayload === 'function') {
                const normalized = normalizePodPayload(pod);
                if (normalized && normalized.success && normalized.pod) {
                    pod = normalized.pod;
                }
            }

            // 1. Populate Ingredient field (Step 1)
            const ingredientInput = document.getElementById('ingredientInput');
            if (ingredientInput) {
                ingredientInput.value = pod.ingredients.join(', ');
            }

            // 2. Set Formulation Context (Step 2)
            window.detectedFormulation = pod.formulation;
            const detectedFormulationEl = document.getElementById('detectedFormulation');
            if (detectedFormulationEl) {
                detectedFormulationEl.textContent = pod.formulation;
            }

            // Human-readable ingredient breakdown in the existing ingredient display area
            const selectedIngredientsEl = document.getElementById('selectedIngredients');
            if (selectedIngredientsEl) {
                if (pod.ingredientDetails && pod.ingredientDetails.length > 0) {
                    const rowsHtml = pod.ingredientDetails.map(d => 
                        `<div style="display:flex; justify-content:space-between; align-items:center; max-width:250px; padding:2px 0;">
                            <span style="font-weight:600; color:var(--text);">${d.name}</span>
                            <span style="color:var(--muted); font-size:13px; margin:0 8px;">&mdash;</span>
                            <strong style="color:var(--forest); font-weight:700;">${d.weight} g</strong>
                        </div>`
                    ).join('');

                    selectedIngredientsEl.innerHTML = `
                        <div class="pod-ingredients-block" style="margin-top:8px;">
                            <div style="font-size:11px; font-weight:800; letter-spacing:1px; color:var(--gold); text-transform:uppercase; margin-bottom:4px;">Ingredients</div>
                            <div style="display:flex; flex-direction:column; gap:2px; font-size:13px;">
                                ${rowsHtml}
                            </div>
                            <div style="margin-top:8px; padding-top:6px; border-top:1px solid var(--border); font-size:12px; color:var(--muted); display:flex; gap:12px; flex-wrap:wrap;">
                                <span>Water: <strong style="color:var(--text);">${pod.water} mL</strong></span>
                                <span>&bull;</span>
                                <span>Target: <strong style="color:var(--text);">${pod.targetVolume} mL</strong></span>
                            </div>
                        </div>
                    `;
                } else {
                    selectedIngredientsEl.textContent = pod.ingredients.join(', ');
                }
            }

            // Pod ID Display in existing pod/formulation context area
            const safeQuery = (sel) => (typeof document.querySelector === 'function' ? document.querySelector(sel) : null);
            const detectedBadge = document.getElementById('detectedBadge') || safeQuery('.formulation-card .detected-badge');
            if (detectedBadge) {
                detectedBadge.textContent = `Pod: ${pod.podId}`;
                if (typeof detectedBadge.setAttribute === 'function') {
                    detectedBadge.setAttribute('data-pod-id', pod.podId);
                }
                detectedBadge.title = `Authenticated Pod ${pod.podId}`;
            }

            const cardEyebrow = safeQuery('.formulation-info > span');
            if (cardEyebrow) {
                cardEyebrow.textContent = `POD: ${pod.podId} • DETECTED FORMULATION`;
            }

            const headerStatus = safeQuery('.header-status');
            if (headerStatus) {
                headerStatus.innerHTML = `<span class="status-dot"></span> System Ready • Pod: <strong>${pod.podId}</strong>`;
            }

            // 3. Populate Powder Quantity Internally (Step 3 internal store)
            const powderInput = document.getElementById('powderInput');
            if (powderInput) {
                powderInput.value = pod.powder;
            }
            const powderAmount = document.getElementById('powderAmount');
            if (powderAmount) {
                powderAmount.textContent = `${pod.powder} g`;
            }

            // 4. Synchronize authoritative QR data into preparation engine state
            if (typeof window.applyPreparationState === 'function') {
                window.applyPreparationState(pod);
            } else {
                window.preparationData = {
                    formulation: pod.formulation,
                    ingredients: pod.ingredients,
                    powder: Number(pod.powder || 48),
                    water: Number(pod.water || (pod.powder ? pod.powder * 8 : 384)),
                    reduction: '1/4',
                    target_volume: Number(pod.targetVolume || 96),
                    targetVolume: Number(pod.targetVolume || 96)
                };
                window.initialVolume = Number(window.preparationData.water);
                window.currentVolume = Number(window.preparationData.water);
                window.targetVolume = Number(window.preparationData.target_volume);
            }

            // Populate Step 2 / Step 3 Water & Target Volume displays
            const waterAmount = document.getElementById('waterAmount');
            if (waterAmount) {
                const wVal = Number(pod.water);
                waterAmount.textContent = `${Number.isInteger(wVal) ? wVal : wVal.toFixed(2)} mL`;
            }

            const targetVolumeEl = document.getElementById('targetVolume');
            if (targetVolumeEl) {
                const tVal = Number(pod.targetVolume);
                targetVolumeEl.textContent = `${Number.isInteger(tVal) ? tVal : tVal.toFixed(2)} mL`;
            }

            // 5. Populate Temperature (Step 3)
            const targetTemp = pod.temperature || 85;
            if (typeof window.setTemperature === 'function') {
                window.setTemperature(targetTemp);
            } else {
                const tempSlider = document.getElementById('temperatureSlider');
                const tempInput = document.getElementById('temperatureInput');
                const tempVal = document.getElementById('temperatureValue');
                const tempStatus = document.getElementById('temperatureStatus');

                if (tempSlider) {
                    tempSlider.max = 100;
                    tempSlider.value = targetTemp;
                }
                if (tempInput) {
                    tempInput.max = 100;
                    tempInput.value = targetTemp;
                }
                if (tempVal) tempVal.textContent = targetTemp + '°C';
                if (typeof window.selectedTemperature !== 'undefined') {
                    window.selectedTemperature = targetTemp;
                }
                if (tempStatus) {
                    if (targetTemp >= 80 && targetTemp <= 90) {
                        tempStatus.textContent = '✓ Within Recommended Range (80–90°C)';
                        tempStatus.className = 'temperature-status good';
                    } else {
                        tempStatus.textContent = '⚠ Outside Recommended Range (80–90°C)';
                        tempStatus.className = 'temperature-status warning';
                    }
                }
            }

            // 6. Update Historical Batch Recommendation & Live Estimated Time for Scanned Pod
            if (window.batchHistory && typeof window.batchHistory.updateRecommendation === 'function') {
                window.batchHistory.updateRecommendation(pod.formulation, pod.ingredients);
            }
            if (typeof window.updateEstimatedPreparationTime === 'function') {
                window.updateEstimatedPreparationTime();
            }

            // 7. Render Formulation Details into Step 1 container
            const wrapper = document.getElementById('formulationDetailsWrapper');
            if (wrapper && typeof this.renderFormulationDetailsHtml === 'function') {
                wrapper.innerHTML = this.renderFormulationDetailsHtml(pod);
            }

            // Route to Step 1 (Formulation) to review authenticated pod details
            if (typeof window.showStep === 'function') {
                window.showStep(1);
            }

            // 8. Display non-disruptive toast notification
            this.showToast(`Pod ${pod.podId} loaded • ${pod.formulation}`);
        },

        /**
         * Minimal, non-disruptive toast notification for auto-population confirmation.
         * @param {string} message
         */
        showToast: function (message) {
            let toast = document.getElementById('ikwathPodToast');
            if (!toast) {
                toast = document.createElement('div');
                toast.id = 'ikwathPodToast';
                toast.className = 'pod-toast';
                document.body.appendChild(toast);
            }
            toast.innerHTML = `<span class="toast-check">✓</span> <span>${message}</span>`;
            toast.classList.add('visible');

            setTimeout(() => {
                toast.classList.remove('visible');
            }, 4500);
        },

        /**
         * Format formulation profile details into structured readable text map.
         * @param {Object} pod
         * @returns {Object}
         */
        formatFormulationDetails: function (pod) {
            if (!pod || !pod.formulationProfile) return {};
            return pod.formulationProfile;
        },

        /**
         * Renders human-readable Formulation Details HTML containing all 13 canonical fields.
         * Displays normal-person-friendly markup without any raw JSON.
         * @param {Object} pod
         * @returns {string} HTML markup
         */
        renderFormulationDetailsHtml: function (pod) {
            if (!pod || !pod.formulationProfile) return '';
            const prof = pod.formulationProfile;

            function esc(str) {
                if (str === null || str === undefined) return '';
                return String(str)
                    .replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;')
                    .replace(/"/g, '&quot;')
                    .replace(/'/g, '&#039;');
            }

            const ingList = prof.ingredients && Array.isArray(prof.ingredients) ? prof.ingredients : [];

            // 1. Formulation ID
            const formulationIdHtml = esc(prof.formulationId || 'Not specified');

            // 2. Classical / AFI Reference
            const classicalRefHtml = esc(prof.classicalReference || 'Not specified');

            // 3. Ingredients (Dynamic Bullet List with Weights)
            const ingredientsHtml = ingList.length > 0
                ? `<ul class="details-bullet-list">` +
                  ingList.map(ing => {
                      const wt = ing.weight !== undefined && ing.weight !== null && ing.weight !== '' && ing.weight !== 'Not specified'
                          ? ` &mdash; <strong>${esc(ing.weight)} g</strong>`
                          : '';
                      return `<li><span class="bullet-dot">&bull;</span> <span class="ing-name">${esc(ing.name)}</span>${wt}</li>`;
                  }).join('') +
                  `</ul>`
                : `<span class="not-specified">Not specified</span>`;

            // 4. Botanical Identity
            const botanicalIdentityHtml = ingList.length > 0 && ingList.some(i => i.botanicalIdentity && i.botanicalIdentity !== 'Not specified')
                ? `<ul class="details-bullet-list">` +
                  ingList.map(ing => `<li><span class="bullet-dot">&bull;</span> <span class="sub-label">${esc(ing.name)}:</span> <em>${esc(ing.botanicalIdentity || 'Not specified')}</em></li>`).join('') +
                  `</ul>`
                : `<span class="not-specified">Not specified</span>`;

            // 5. Part Used
            const partUsedHtml = ingList.length > 0 && ingList.some(i => i.partUsed && i.partUsed !== 'Not specified')
                ? `<ul class="details-bullet-list">` +
                  ingList.map(ing => `<li><span class="bullet-dot">&bull;</span> <span class="sub-label">${esc(ing.name)}:</span> ${esc(ing.partUsed || 'Not specified')}</li>`).join('') +
                  `</ul>`
                : `<span class="not-specified">Not specified</span>`;

            // 6. Ingredient Ratio / Weight
            const ratioWeightHtml = ingList.length > 0
                ? `<ul class="details-bullet-list">` +
                  ingList.map(ing => {
                      const r = ing.ratio && ing.ratio !== 'Not specified' ? esc(ing.ratio) : null;
                      const w = ing.weight !== undefined && ing.weight !== null && ing.weight !== '' && ing.weight !== 'Not specified' ? `${esc(ing.weight)} g` : null;
                      let rwText = 'Not specified';
                      if (r && w) rwText = `${r} (${w})`;
                      else if (r) rwText = r;
                      else if (w) rwText = w;
                      return `<li><span class="bullet-dot">&bull;</span> <span class="sub-label">${esc(ing.name)}:</span> ${rwText}</li>`;
                  }).join('') +
                  `</ul>`
                : `<span class="not-specified">Not specified</span>`;

            // 7. Coarse-Powder Specification
            const coarsePowderHtml = esc(prof.coarsePowderSpecification || 'Not specified');

            // 8. Water Multiplier / Initial Water
            let initialWaterText = 'Not specified';
            if (prof.initialWater && !isNaN(Number(prof.initialWater))) {
                const mult = prof.waterMultiplier && prof.waterMultiplier !== 'Not specified'
                    ? ` (${esc(prof.waterMultiplier)} powder ratio)`
                    : '';
                initialWaterText = `${esc(prof.initialWater)} mL${mult}`;
            }
            const initialWaterHtml = initialWaterText;

            // 9. Preparation Instructions
            const prepInstructionsHtml = esc(prof.preparationInstructions || 'Not specified');

            // 10. Target Reduction Endpoint
            let targetEndpointText = 'Not specified';
            if (prof.targetReductionEndpoint && prof.targetReductionEndpoint !== 'Not specified') {
                targetEndpointText = String(prof.targetReductionEndpoint).includes('mL')
                    ? esc(prof.targetReductionEndpoint)
                    : `${esc(prof.targetReductionEndpoint)} mL`;
            } else if (pod.targetVolume && !isNaN(Number(pod.targetVolume))) {
                targetEndpointText = `${pod.targetVolume} mL`;
            }
            const targetEndpointHtml = targetEndpointText;

            // 11. Post-Brew Addition (if specified)
            const postBrewAdditionHtml = esc(prof.postBrewAddition || 'Not specified');

            // 12. Raw-Material API Reference
            const rawMaterialApiRefHtml = esc(prof.rawMaterialApiReference || 'Not specified');

            // 13. Batch ID / Source
            let batchSourceText = 'Not specified';
            const bId = prof.batchId && prof.batchId !== 'Not specified' ? prof.batchId : (pod.batchNumber || null);
            const src = prof.source && prof.source !== 'Not specified' ? prof.source : null;
            if (bId && src) {
                batchSourceText = `${esc(bId)} &bull; ${esc(src)}`;
            } else if (bId) {
                batchSourceText = esc(bId);
            } else if (src) {
                batchSourceText = esc(src);
            }
            const batchSourceHtml = batchSourceText;

            return `
                <div class="formulation-details-card" id="formulationDetailsCard">
                    <div class="details-header">
                        <div class="details-eyebrow">
                            <span class="check-icon">✓</span>
                            <span>AUTHENTICATED FORMULATION PROFILE</span>
                        </div>
                        <h2 class="details-title">Formulation Details</h2>
                        <div class="details-formulation-badge">${esc(pod.formulation)}</div>
                    </div>

                    <div class="formulation-fields-grid">
                        <!-- 1. Formulation ID -->
                        <div class="field-card field-id">
                            <div class="field-label">Formulation ID</div>
                            <div class="field-value highlight-id" id="fieldFormulationId">${formulationIdHtml}</div>
                        </div>

                        <!-- 2. Classical / AFI Reference -->
                        <div class="field-card field-classical-ref">
                            <div class="field-label">Classical / AFI Reference</div>
                            <div class="field-value" id="fieldClassicalRef">${classicalRefHtml}</div>
                        </div>

                        <!-- 3. Ingredient Name -->
                        <div class="field-card field-ingredients full-width">
                            <div class="field-label">Ingredients</div>
                            <div class="field-value" id="fieldIngredients">${ingredientsHtml}</div>
                        </div>

                        <!-- 4. Botanical Identity -->
                        <div class="field-card field-botanical full-width">
                            <div class="field-label">Botanical Identity</div>
                            <div class="field-value" id="fieldBotanicalIdentity">${botanicalIdentityHtml}</div>
                        </div>

                        <!-- 5. Part Used -->
                        <div class="field-card field-part-used full-width">
                            <div class="field-label">Part Used</div>
                            <div class="field-value" id="fieldPartUsed">${partUsedHtml}</div>
                        </div>

                        <!-- 6. Ingredient Ratio / Weight -->
                        <div class="field-card field-ratio-weight full-width">
                            <div class="field-label">Ingredient Ratio / Weight</div>
                            <div class="field-value" id="fieldRatioWeight">${ratioWeightHtml}</div>
                        </div>

                        <!-- 7. Coarse-Powder Specification -->
                        <div class="field-card full-width">
                            <div class="field-label">Coarse-Powder Specification</div>
                            <div class="field-value" id="fieldCoarsePowder">${coarsePowderHtml}</div>
                        </div>

                        <!-- 8. Water Multiplier / Initial Water -->
                        <div class="field-card">
                            <div class="field-label">Initial Water</div>
                            <div class="field-value highlight-val" id="fieldInitialWater">${initialWaterHtml}</div>
                        </div>

                        <!-- 10. Target Reduction Endpoint -->
                        <div class="field-card">
                            <div class="field-label">Target Reduction Endpoint</div>
                            <div class="field-value highlight-val" id="fieldTargetEndpoint">${targetEndpointHtml}</div>
                        </div>

                        <!-- 9. Preparation Instructions -->
                        <div class="field-card full-width">
                            <div class="field-label">Preparation Instructions</div>
                            <div class="field-value text-body" id="fieldPrepInstructions">${prepInstructionsHtml}</div>
                        </div>

                        <!-- 11. Post-Brew Addition -->
                        <div class="field-card full-width">
                            <div class="field-label">Post-Brew Addition</div>
                            <div class="field-value" id="fieldPostBrewAddition">${postBrewAdditionHtml}</div>
                        </div>

                        <!-- 12. Raw-Material API Reference -->
                        <div class="field-card full-width">
                            <div class="field-label">Raw-Material API Reference</div>
                            <div class="field-value api-mono" id="fieldRawMaterialApi">${rawMaterialApiRefHtml}</div>
                        </div>

                        <!-- 13. Batch ID / Source -->
                        <div class="field-card full-width">
                            <div class="field-label">Batch ID / Source</div>
                            <div class="field-value" id="fieldBatchSource">${batchSourceHtml}</div>
                        </div>
                    </div>

                    <div class="details-actions">
                        <button type="button" id="proceedDashboardBtn" class="btn btn-primary btn-proceed" onclick="if(typeof window.goToTemperature==='function'){window.goToTemperature();}else{window.location.href='/dashboard';}">
                            <span>Continue to Temperature &rarr;</span>
                            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M4 10H16M16 10L11 5M16 10L11 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </button>
                        <a href="/scan" id="scanAnotherPodBtn" class="btn btn-secondary btn-scan-another">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M1 4v6h6M23 20v-6h-6"/>
                                <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/>
                            </svg>
                            <span>Scan Another Pod</span>
                        </a>
                    </div>
                </div>
            `;
        }
    };

    window.podParser = podParser;
    window.normalizePodPayload = normalizePodPayload;

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = podParser;
    }

})(typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : this));
