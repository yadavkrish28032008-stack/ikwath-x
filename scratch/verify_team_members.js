const fs = require('fs');
const path = require('path');
const assert = require('assert');
const http = require('http');

console.log('================================================================');
console.log('TEST SUITE: TEAM MEMBERS VERIFICATION (YADAVKRISH & HAFIZ)');
console.log('================================================================');

const monitorDir = path.join(__dirname, '..', 'iKwath_ML', 'evaporation_monitor');
const sihHtml = fs.readFileSync(path.join(monitorDir, 'SIH 2026', 'index.html'), 'utf8');
const landingHtml = fs.readFileSync(path.join(monitorDir, 'landing_new.html'), 'utf8');

const srcFirstUploaded = 'C:\\Users\\user\\.gemini\\antigravity-ide\\brain\\a67d55db-baf9-4331-9a32-190b2af2b820\\.user_uploaded\\media_1790072077426.jpg';
const srcSecondUploaded = 'C:\\Users\\user\\.gemini\\antigravity-ide\\brain\\a67d55db-baf9-4331-9a32-190b2af2b820\\.user_uploaded\\media_1790072092702.jpg';

// CHECK 1: Image Files Exist and Match Exact Uploads
console.log('\n--- CHECK 1: Uploaded Image Parity and Asset Placement ---');
const folders = [
    path.join(monitorDir, 'image'),
    path.join(monitorDir, 'landing_assets'),
    path.join(monitorDir, 'SIH 2026', 'image')
];

folders.forEach(dir => {
    const hafizImg = path.join(dir, 'hafiz_muzzamil.jpeg');
    const yadavImg = path.join(dir, 'yadavkrish.jpeg');

    assert(fs.existsSync(hafizImg), `hafiz_muzzamil.jpeg must exist in ${dir}`);
    assert(fs.existsSync(yadavImg), `yadavkrish.jpeg must exist in ${dir}`);

    // Verify byte identity with original uploaded files
    const hafizBytes = fs.readFileSync(hafizImg);
    const yadavBytes = fs.readFileSync(yadavImg);
    const src1Bytes = fs.readFileSync(srcFirstUploaded);
    const src2Bytes = fs.readFileSync(srcSecondUploaded);

    assert(hafizBytes.equals(src1Bytes), `hafiz_muzzamil.jpeg in ${dir} must be identical to FIRST uploaded image`);
    assert(yadavBytes.equals(src2Bytes), `yadavkrish.jpeg in ${dir} must be identical to SECOND uploaded image`);
});
console.log('✓ PASS: Both images are correctly placed in all asset directories and match original uploads.');

// CHECK 2: SIH 2026/index.html Team Section
console.log('\n--- CHECK 2: SIH 2026/index.html Team Members ---');
function verifyHtmlMembers(html, isLanding) {
    const assetPrefix = isLanding ? '/landing_assets/' : 'image/';

    // Extract members grid
    const start = html.indexOf('<div class="members-grid">');
    const end = html.indexOf('<!-- MENTORS -->', start);
    assert(start !== -1 && end !== -1, 'Must find members-grid and mentors section');
    const gridHtml = html.substring(start, end);

    // Count member cards
    const cardMatches = gridHtml.match(/<div class="member-card reveal">/g);
    assert.strictEqual(cardMatches.length, 6, 'Must contain exactly 6 member cards');

    // Existing 4 members
    assert(gridHtml.includes('BOOMESH'), 'Must contain Boomesh');
    assert(gridHtml.includes('JOSE GEORGESAM E'), 'Must contain Jose Georgesam E');
    assert(gridHtml.includes('KAVIYA M'), 'Must contain Kaviya M');
    assert(gridHtml.includes('MAYURI S V'), 'Must contain Mayuri S V');

    // Member 5: YADAVKRISH R D
    assert(gridHtml.includes('<h3>YADAVKRISH R D</h3>'), 'Member 5 name must be YADAVKRISH R D');
    assert(gridHtml.includes(`src="${assetPrefix}yadavkrish.jpeg"`), `Member 5 image must use ${assetPrefix}yadavkrish.jpeg`);
    assert(gridHtml.includes('https://www.linkedin.com/in/yadav-krish-99b452384?utm_source=share_via&utm_content=profile&utm_medium=member_android'), 'Member 5 must have correct LinkedIn URL');

    // Member 6: HAFIZ MUZZAMIL A
    assert(gridHtml.includes('<h3>HAFIZ MUZZAMIL A</h3>'), 'Member 6 name must be HAFIZ MUZZAMIL A');
    assert(gridHtml.includes(`src="${assetPrefix}hafiz_muzzamil.jpeg"`), `Member 6 image must use ${assetPrefix}hafiz_muzzamil.jpeg`);
    assert(gridHtml.includes('https://www.linkedin.com/in/hafiz-muzzamil'), 'Member 6 must have correct LinkedIn URL');

    // Order check: Yadavkrish before Hafiz
    const yadavPos = gridHtml.indexOf('YADAVKRISH R D');
    const hafizPos = gridHtml.indexOf('HAFIZ MUZZAMIL A');
    const mayuriPos = gridHtml.indexOf('MAYURI S V');
    assert(mayuriPos < yadavPos, 'Yadavkrish must come after Mayuri (existing 4 members)');
    assert(yadavPos < hafizPos, 'Hafiz Muzzamil must come after Yadavkrish');

    // Link target check
    assert(gridHtml.includes('target="_blank"'), 'LinkedIn links must have target="_blank"');

    // Prohibited URLs check
    assert(!gridHtml.includes('blob:'), 'HTML must NOT contain blob: URLs');
    assert(!gridHtml.includes('C:\\'), 'HTML must NOT contain Windows local file paths');
    assert(!gridHtml.includes('web.whatsapp.com'), 'HTML must NOT contain web.whatsapp.com URLs');
}

verifyHtmlMembers(sihHtml, false);
console.log('✓ PASS: SIH 2026/index.html verified with exactly 6 members and proper order.');

// CHECK 3: landing_new.html Team Section
console.log('\n--- CHECK 3: landing_new.html Team Members ---');
verifyHtmlMembers(landingHtml, true);
console.log('✓ PASS: landing_new.html verified with exactly 6 members and proper order.');

// CHECK 4: CSS Grid Responsiveness
console.log('\n--- CHECK 4: CSS Layout & Responsiveness ---');
const css1 = fs.readFileSync(path.join(monitorDir, 'landing_new.css'), 'utf8');
const css2 = fs.readFileSync(path.join(monitorDir, 'SIH 2026', 'style.css'), 'utf8');

[css1, css2].forEach(css => {
    assert(css.includes('.members-grid'), 'CSS must style .members-grid');
    assert(css.includes('grid-template-columns: repeat(3, 1fr)'), 'CSS must define 3-column grid for desktop');
    assert(css.includes('grid-template-columns: 1fr'), 'CSS must define 1-column stack for mobile');
});
console.log('✓ PASS: Desktop (3 columns) and mobile (1 column) CSS rules intact.');

// CHECK 5: Live HTTP Server Delivery
console.log('\n--- CHECK 5: Live HTTP Server Delivery ---');
http.get('http://127.0.0.1:5000/landing_assets/yadavkrish.jpeg', (res) => {
    assert.strictEqual(res.statusCode, 200, 'HTTP 200 for yadavkrish.jpeg');
    console.log('✓ PASS: /landing_assets/yadavkrish.jpeg served successfully (Status 200)');
    
    http.get('http://127.0.0.1:5000/landing_assets/hafiz_muzzamil.jpeg', (res2) => {
        assert.strictEqual(res2.statusCode, 200, 'HTTP 200 for hafiz_muzzamil.jpeg');
        console.log('✓ PASS: /landing_assets/hafiz_muzzamil.jpeg served successfully (Status 200)');

        http.get('http://127.0.0.1:5000/', (res3) => {
            assert.strictEqual(res3.statusCode, 200, 'HTTP 200 for landing page');
            let data = '';
            res3.on('data', chunk => data += chunk);
            res3.on('end', () => {
                assert(data.includes('YADAVKRISH R D'), 'Live landing page includes Yadavkrish');
                assert(data.includes('HAFIZ MUZZAMIL A'), 'Live landing page includes Hafiz');
                console.log('✓ PASS: Live landing page at http://127.0.0.1:5000/ serves both new members');
                console.log('\n================================================================');
                console.log('ALL VERIFICATION CHECKS PASSED WITH 100% SUCCESS!');
                console.log('================================================================');
            });
        });
    });
}).on('error', (err) => {
    console.log('Note: Flask server offline or not accessible directly, static files verified.');
});
