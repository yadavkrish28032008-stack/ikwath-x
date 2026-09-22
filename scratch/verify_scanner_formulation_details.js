/**
 * verify_scanner_formulation_details.js
 * 
 * Test suite to verify:
 * 1. Scanning KW-F001 (Amrtottara Kwatha Curna) renders all 13 canonical fields:
 *    - Formulation ID: KW-F001
 *    - Classical / AFI Reference: AFI Part I, 4:1 / Sahasrayogam
 *    - Ingredients: Sunthi (8 g), Amrta (24 g), Abhaya (16 g)
 *    - Botanical Identity: Zingiber officinale, Tinospora cordifolia, Terminalia chebula
 *    - Part Used: Dried rhizome, Stem, Pericarp
 *    - Ingredient Ratio / Weight: 1 part (8g), 3 parts (24g), 2 parts (16g)
 *    - Coarse-Powder Specification: Yavakuta
 *    - Initial Water: 384 mL
 *    - Preparation Instructions
 *    - Target Reduction Endpoint: 96 mL
 *    - Post-Brew Addition: Guda (Jaggery) & Pippali curna
 *    - Raw-Material API Reference: API Part I
 *    - Batch ID / Source: IKW-AMR-2026-01
 * 2. Ingredients are NOT hard-coded:
 *    - Scanning KW-F002 (Aragvadhadi) dynamically displays Aragvadha, Nimba, Patola, Katuka.
 *    - Scanning custom 5-ingredient formulation displays all 5 custom ingredients.
 * 3. Genuine missing fields cleanly display "Not specified".
 * 4. No raw JSON ({, }) or technical key-value payloads exposed in UI.
 * 5. scan.html and scan.css have required elements and styling.
 * 6. Existing dashboard functionality and parity remain completely intact.
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('================================================================');
console.log('TEST SUITE: iKWATH-X SCANNER FORMULATION DETAILS VERIFICATION');
console.log('================================================================');

const monitorDir = path.join(__dirname, '..', 'iKwath_ML', 'evaporation_monitor');
const podParser = require(path.join(monitorDir, 'pod_parser.js'));
const scanHtml = fs.readFileSync(path.join(monitorDir, 'scan.html'), 'utf8');
const scanCss = fs.readFileSync(path.join(monitorDir, 'scan.css'), 'utf8');
const indexHtml = fs.readFileSync(path.join(monitorDir, 'index.html'), 'utf8');
const dashHtml = fs.readFileSync(path.join(monitorDir, 'dashboard.html'), 'utf8');

// CHECK 1: DOM Structure in scan.html & scan.css
console.log('\n--- CHECK 1: Scanner DOM Structure & CSS ---');
assert(scanHtml.includes('id="formulationDetailsSection"'), 'scan.html must contain #formulationDetailsSection');
assert(scanHtml.includes('id="scanDemoPodBtn"'), 'scan.html must retain #scanDemoPodBtn');
assert(scanHtml.includes('id="scanAltDemoPodBtn"'), 'scan.html must contain #scanAltDemoPodBtn');
assert(scanCss.includes('.formulation-details-card'), 'scan.css must style .formulation-details-card');
assert(scanCss.includes('.formulation-fields-grid'), 'scan.css must style .formulation-fields-grid');
assert(scanCss.includes('.btn-proceed'), 'scan.css must style .btn-proceed');
assert(scanCss.includes('.btn-scan-another'), 'scan.css must style .btn-scan-another');
console.log('✓ PASS: scan.html and scan.css contain all required structural elements.');

// CHECK 2: Benchmark Payload KW-F001
console.log('\n--- CHECK 2: Benchmark Formulation (KW-F001 - Amrtottara Kwatha Curna) ---');
const benchmarkPayload = {
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

const res1 = podParser.parse(benchmarkPayload);
assert(res1.success, 'Benchmark payload must parse successfully');
const pod1 = res1.pod;
assert.strictEqual(pod1.podId, 'KW-F001');
assert.strictEqual(pod1.formulation, 'Amrtottara Kwatha Curna');
assert(pod1.formulationProfile, 'Normalized formulationProfile must exist');

const prof1 = pod1.formulationProfile;

// Verify 13 fields on data model
assert.strictEqual(prof1.formulationId, 'KW-F001', 'Field 1: Formulation ID');
assert(prof1.classicalReference.includes('Ayurvedic Formulary of India') || prof1.classicalReference.includes('Sahasrayogam') || prof1.classicalReference.includes('Sharngadhara'), 'Field 2: Classical / AFI Reference');
assert.strictEqual(prof1.ingredients.length, 3, 'Field 3: Ingredient count');
assert.strictEqual(prof1.ingredients[0].name, 'Sunthi', 'Field 3: Sunthi');
assert.strictEqual(prof1.ingredients[0].weight, 8, 'Field 3: Sunthi 8 g');
assert.strictEqual(prof1.ingredients[1].name, 'Amrta', 'Field 3: Amrta');
assert.strictEqual(prof1.ingredients[1].weight, 24, 'Field 3: Amrta 24 g');
assert.strictEqual(prof1.ingredients[2].name, 'Abhaya', 'Field 3: Abhaya');
assert.strictEqual(prof1.ingredients[2].weight, 16, 'Field 3: Abhaya 16 g');
assert(prof1.ingredients[0].botanicalIdentity.includes('Zingiber officinale'), 'Field 4: Sunthi Botanical Identity');
assert(prof1.ingredients[1].botanicalIdentity.includes('Tinospora cordifolia'), 'Field 4: Amrta Botanical Identity');
assert(prof1.ingredients[2].botanicalIdentity.includes('Terminalia chebula'), 'Field 4: Abhaya Botanical Identity');
assert(prof1.ingredients[0].partUsed.includes('rhizome') || prof1.ingredients[0].partUsed.includes('Rhizome'), 'Field 5: Part Used Sunthi');
assert(prof1.ingredients[1].partUsed.includes('stem') || prof1.ingredients[1].partUsed.includes('Stem'), 'Field 5: Part Used Amrta');
assert(prof1.ingredients[2].partUsed.includes('pericarp') || prof1.ingredients[2].partUsed.includes('Pericarp') || prof1.ingredients[2].partUsed.includes('fruit'), 'Field 5: Part Used Abhaya');
assert(prof1.ingredients[0].ratio.includes('1 part') || prof1.ingredients[0].ratio.includes('8 g'), 'Field 6: Ratio / Weight Sunthi');
assert(prof1.coarsePowderSpecification.includes('Yavakuta') || prof1.coarsePowderSpecification.includes('Coarse powder'), 'Field 7: Coarse-Powder Specification');
assert(prof1.initialWater === 384, 'Field 8: Initial Water');
assert(prof1.preparationInstructions.length > 10, 'Field 9: Preparation Instructions');
assert(prof1.targetReductionEndpoint.includes('96') || prof1.targetReductionEndpoint.includes('1/4'), 'Field 10: Target Reduction Endpoint');
assert(prof1.postBrewAddition.includes('Guda') || prof1.postBrewAddition.includes('Jaggery'), 'Field 11: Post-Brew Addition');
assert(prof1.rawMaterialApiReference.includes('API Part I'), 'Field 12: Raw-Material API Reference');
assert.strictEqual(prof1.batchId, 'IKW-AMR-2026-01', 'Field 13: Batch ID / Source');

// Verify HTML rendering of 13 fields
const html1 = podParser.renderFormulationDetailsHtml(pod1);
assert(html1.includes('Formulation ID'), 'Rendered HTML must have Formulation ID label');
assert(html1.includes('KW-F001'), 'Rendered HTML must show KW-F001');
assert(html1.includes('Classical / AFI Reference'), 'Rendered HTML must have Classical / AFI Reference label');
assert(html1.includes('Ingredients'), 'Rendered HTML must have Ingredients label');
assert(html1.includes('Sunthi') && html1.includes('8 g'), 'Sunthi — 8 g must be in HTML');
assert(html1.includes('Amrta') && html1.includes('24 g'), 'Amrta — 24 g must be in HTML');
assert(html1.includes('Abhaya') && html1.includes('16 g'), 'Abhaya — 16 g must be in HTML');
assert(html1.includes('Botanical Identity'), 'Botanical Identity label in HTML');
assert(html1.includes('Zingiber officinale'), 'Zingiber officinale in HTML');
assert(html1.includes('Tinospora cordifolia'), 'Tinospora cordifolia in HTML');
assert(html1.includes('Terminalia chebula'), 'Terminalia chebula in HTML');
assert(html1.includes('Part Used'), 'Part Used label in HTML');
assert(html1.includes('Ingredient Ratio / Weight'), 'Ingredient Ratio / Weight label in HTML');
assert(html1.includes('Coarse-Powder Specification'), 'Coarse-Powder Specification label in HTML');
assert(html1.includes('Initial Water'), 'Initial Water label in HTML');
assert(html1.includes('384 mL'), '384 mL in HTML');
assert(html1.includes('Preparation Instructions'), 'Preparation Instructions label in HTML');
assert(html1.includes('Target Reduction Endpoint'), 'Target Reduction Endpoint label in HTML');
assert(html1.includes('96 mL'), '96 mL in HTML');
assert(html1.includes('Post-Brew Addition'), 'Post-Brew Addition label in HTML');
assert(html1.includes('Guda') || html1.includes('Jaggery'), 'Post-Brew Addition value in HTML');
assert(html1.includes('Raw-Material API Reference'), 'Raw-Material API Reference label in HTML');
assert(html1.includes('Batch ID / Source'), 'Batch ID / Source label in HTML');
assert(html1.includes('IKW-AMR-2026-01'), 'Batch ID value in HTML');
assert(html1.includes('id="proceedDashboardBtn"'), 'Proceed to Preparation Dashboard button in HTML');
assert(html1.includes('id="scanAnotherPodBtn"'), 'Scan Another Pod button in HTML');

console.log('✓ PASS: All 13 formulation fields successfully verified for KW-F001.');

// CHECK 3: Dynamic Verification - Second Formulation (KW-F002 - Aragvadhadi)
console.log('\n--- CHECK 3: Alternate Formulation (KW-F002 - Aragvadhadi Kwatha Curna) ---');
const aragvadhadiPayload = {
    podId: 'KW-F002',
    formulation: 'Aragvadhadi Kwatha Curna',
    powder: 40,
    ingredients: [
        { name: 'Aragvadha', weight: 10 },
        { name: 'Nimba', weight: 10 },
        { name: 'Patola', weight: 10 },
        { name: 'Katuka', weight: 10 }
    ],
    water: 320,
    targetVolume: 80,
    temperature: 85,
    batchNumber: 'IKW-ARG-2026-02'
};

const res2 = podParser.parse(aragvadhadiPayload);
assert(res2.success, 'Aragvadhadi payload must parse successfully');
const pod2 = res2.pod;
const html2 = podParser.renderFormulationDetailsHtml(pod2);

assert(html2.includes('KW-F002'), 'Must show KW-F002');
assert(html2.includes('Aragvadhadi Kwatha Curna'), 'Must show Aragvadhadi Kwatha Curna');
assert(html2.includes('Aragvadha') && html2.includes('10 g'), 'Must show Aragvadha 10 g');
assert(html2.includes('Nimba') && html2.includes('10 g'), 'Must show Nimba 10 g');
assert(html2.includes('Patola') && html2.includes('10 g'), 'Must show Patola 10 g');
assert(html2.includes('Katuka') && html2.includes('10 g'), 'Must show Katuka 10 g');
assert(html2.includes('Cassia fistula'), 'Must show Cassia fistula');
assert(html2.includes('Azadirachta indica'), 'Must show Azadirachta indica');
assert(html2.includes('Trichosanthes dioica'), 'Must show Trichosanthes dioica');
assert(html2.includes('Picrorhiza kurroa'), 'Must show Picrorhiza kurroa');
assert(html2.includes('320 mL'), 'Must show 320 mL');
assert(html2.includes('80 mL'), 'Must show 80 mL');
assert(html2.includes('IKW-ARG-2026-02'), 'Must show IKW-ARG-2026-02');

// Crucial: Confirm Sunthi, Amrta, Abhaya are NOT present in QR #2
assert(!html2.includes('Sunthi'), 'KW-F002 must NOT contain Sunthi');
assert(!html2.includes('Amrta'), 'KW-F002 must NOT contain Amrta');
assert(!html2.includes('Abhaya'), 'KW-F002 must NOT contain Abhaya');
assert(!html2.includes('KW-F001'), 'KW-F002 must NOT contain KW-F001');
console.log('✓ PASS: KW-F002 dynamically populated with its 4 distinct botanicals. Previous ingredients NOT reused.');

// CHECK 4: Dynamic Custom 5-Ingredient Payload
console.log('\n--- CHECK 4: Custom 5-Ingredient Formulation ---');
const customPayload = {
    podId: 'CUSTOM-POD-77',
    formulation: 'Pancha-Kashaya',
    powder: 50,
    ingredients: [
        { name: 'Tulasi', weight: 10, botanicalIdentity: 'Ocimum sanctum L.', partUsed: 'Leaf', ratio: '1 part' },
        { name: 'Haridra', weight: 10, botanicalIdentity: 'Curcuma longa L.', partUsed: 'Rhizome', ratio: '1 part' },
        { name: 'Yashtimadhu', weight: 10, botanicalIdentity: 'Glycyrrhiza glabra L.', partUsed: 'Root', ratio: '1 part' },
        { name: 'Lavanga', weight: 10 },
        { name: 'Maricha', weight: 10 }
    ],
    water: 500,
    targetVolume: 125,
    temperature: 85,
    batchNumber: 'LOT-CUSTOM-01',
    source: 'Himalayan Herbal Facility'
};

const res3 = podParser.parse(customPayload);
assert(res3.success, 'Custom payload must parse successfully');
const pod3 = res3.pod;
const html3 = podParser.renderFormulationDetailsHtml(pod3);

assert(html3.includes('CUSTOM-POD-77'), 'Must show CUSTOM-POD-77');
assert(html3.includes('Pancha-Kashaya'), 'Must show Pancha-Kashaya');
assert(html3.includes('Tulasi'), 'Must show Tulasi');
assert(html3.includes('Haridra'), 'Must show Haridra');
assert(html3.includes('Yashtimadhu'), 'Must show Yashtimadhu');
assert(html3.includes('Lavanga'), 'Must show Lavanga');
assert(html3.includes('Maricha'), 'Must show Maricha');
assert(html3.includes('Ocimum sanctum'), 'Must show Ocimum sanctum');
assert(html3.includes('Curcuma longa'), 'Must show Curcuma longa');
assert(html3.includes('500 mL'), 'Must show 500 mL');
assert(html3.includes('125 mL'), 'Must show 125 mL');
assert(html3.includes('Himalayan Herbal Facility'), 'Must show Himalayan Herbal Facility');
assert(html3.includes('LOT-CUSTOM-01'), 'Must show LOT-CUSTOM-01');

// Missing fields in custom payload should be "Not specified"
assert(html3.includes('Not specified'), 'Missing fields must display "Not specified"');
console.log('✓ PASS: Custom 5-ingredient formulation dynamically parsed and rendered with "Not specified" fallbacks.');

// CHECK 5: Zero Raw JSON Exposure
console.log('\n--- CHECK 5: Zero Raw JSON Exposure in UI ---');
[html1, html2, html3].forEach((html, idx) => {
    assert(!html.includes('{"'), `HTML #${idx+1} must not contain raw JSON object strings`);
    assert(!html.includes('podId:'), `HTML #${idx+1} must not contain developer key-value pairs`);
    assert(!html.includes('preparationParams'), `HTML #${idx+1} must not contain preparationParams`);
    assert(!html.includes('targetReductionEndpoint:'), `HTML #${idx+1} must not contain raw object keys`);
});
console.log('✓ PASS: No raw JSON, technical keys, or developer payloads in any rendered view.');

// CHECK 6: Preservation of Dashboard & Existing Core Files
console.log('\n--- CHECK 6: Preservation of Existing Dashboard & Parity ---');
assert.strictEqual(indexHtml, dashHtml, 'index.html and dashboard.html must remain 100% byte identical');
assert(indexHtml.includes('id="detectedFormulation"'), 'index.html must retain #detectedFormulation');
assert(indexHtml.includes('id="selectedIngredients"'), 'index.html must retain #selectedIngredients');
console.log('✓ PASS: Dashboard parity and elements 100% preserved.');

console.log('\n================================================================');
console.log('ALL 6 FORMULATION DETAILS VERIFICATION CHECKS PASSED! ✓');
console.log('================================================================');
