const http = require('http');
const fs = require('fs');

function fetchUrl(urlPath) {
    return new Promise((resolve, reject) => {
        const req = http.get('http://127.0.0.1:5000' + urlPath, (res) => {
            let data = [];
            res.on('data', chunk => data.push(chunk));
            res.on('end', () => {
                const buffer = Buffer.concat(data);
                resolve({
                    statusCode: res.statusCode,
                    headers: res.headers,
                    body: buffer.toString('utf8'),
                    byteLength: buffer.length
                });
            });
        });
        req.on('error', reject);
    });
}

async function runVerification() {
    console.log('====================================================');
    console.log('TEST SUITE: SIH 2026 LANDING PAGE MIGRATION QA');
    console.log('====================================================\n');

    let allPassed = true;

    function assert(condition, message) {
        if (condition) {
            console.log('✓ PASS: ' + message);
        } else {
            console.error('✗ FAIL: ' + message);
            allPassed = false;
        }
    }

    // --- TEST 1: Root Route (GET /) ---
    console.log('--- TEST 1: Open / -> New SIH 2026 Landing Page ---');
    try {
        const homeRes = await fetchUrl('/');
        assert(homeRes.statusCode === 200, 'GET / returned HTTP 200 (No 404)');
        assert(homeRes.body.includes('iKwath-X | ROOT LOGIC'), 'Title contains "iKwath-X | ROOT LOGIC"');
        assert(homeRes.body.includes('SMART INDIA HACKATHON 2026'), 'Content contains "SMART INDIA HACKATHON 2026"');
        assert(homeRes.body.includes('SIH26048'), 'Content contains problem statement "SIH26048"');
        assert(homeRes.body.includes('Fresh Kwatha.'), 'Hero contains "Fresh Kwatha."');
        assert(homeRes.body.includes('Smartly Prepared.'), 'Hero contains "Smartly Prepared."');
        assert(homeRes.body.includes('Explore iKwath-X'), 'Hero contains "Explore iKwath-X" button');
        assert(!homeRes.body.includes('```'), 'No trailing markdown backticks present');

        // --- TEST 2: Main CTA target ---
        console.log('\n--- TEST 2: Main CTA Click Target (/login) ---');
        const ctaMatch = homeRes.body.match(/<a[^>]*id=["']landingMainCta["'][^>]*href=["']([^"']+)["'][^>]*>/i) ||
                         homeRes.body.match(/<a[^>]*href=["']([^"']+)["'][^>]*id=["']landingMainCta["'][^>]*>/i);
        const ctaHref = ctaMatch ? ctaMatch[1] : null;
        assert(ctaHref === '/login', `Main CTA #landingMainCta links to "/login" (Actual: ${ctaHref})`);

        const navLoginMatch = homeRes.body.includes('href="/login"');
        assert(navLoginMatch, 'Navigation menu includes direct link to "/login"');

        // --- TEST 3: CSS & JS Assets ---
        console.log('\n--- TEST 3: Landing Page Stylesheet & Script ---');
        const cssRes = await fetchUrl('/landing_new.css');
        assert(cssRes.statusCode === 200, 'GET /landing_new.css returned HTTP 200');
        assert(cssRes.body.includes('--green: #315f3d;'), 'landing_new.css contains SIH 2026 brand variables');

        const jsRes = await fetchUrl('/landing_new.js');
        assert(jsRes.statusCode === 200, 'GET /landing_new.js returned HTTP 200');
        assert(jsRes.body.includes('toggleMenu'), 'landing_new.js contains toggleMenu function');

        // --- TEST 4: All Image Assets Referenced in HTML ---
        console.log('\n--- TEST 4: All Image Assets from SIH 2026 ---');
        const imgRegex = /<img\s+[^>]*?src=["']([^"']+)["']/gi;
        let match;
        const imagesFound = [];
        while ((match = imgRegex.exec(homeRes.body)) !== null) {
            if (!match[1].startsWith('http')) {
                imagesFound.push(match[1]);
            }
        }

        console.log(`Found ${imagesFound.length} images referenced in landing page:`);
        for (const imgSrc of imagesFound) {
            const encodedPath = imgSrc.split('/').map(segment => encodeURIComponent(segment)).join('/');
            const imgRes = await fetchUrl(encodedPath);
            assert(imgRes.statusCode === 200, `Image "${imgSrc}" loads with HTTP 200 (${imgRes.byteLength} bytes)`);
        }

        // --- TEST 5: Existing /login Page Preservation ---
        console.log('\n--- TEST 5: Existing /login Page Preservation ---');
        const loginRes = await fetchUrl('/login');
        assert(loginRes.statusCode === 200, 'GET /login returned HTTP 200');
        assert(loginRes.body.includes('Operator Sign In') || loginRes.body.includes('iKwath-X • Operator Login'), 'Login page title and headers preserved');
        assert(loginRes.body.includes('auth.js'), 'Auth module preserved on login page');
        assert(loginRes.body.includes('login.css'), 'Login stylesheet preserved on login page');

        // --- TEST 6: Existing /dashboard Preservation ---
        console.log('\n--- TEST 6: Existing /dashboard Preservation ---');
        const dashRes = await fetchUrl('/dashboard');
        assert(dashRes.statusCode === 200, 'GET /dashboard returned HTTP 200');
        assert(dashRes.body.includes('Smart Ayurvedic Preparation') || dashRes.body.includes('iKwath-X Dashboard'), 'Dashboard headers intact');
        assert(dashRes.body.includes('script.js'), 'Dashboard script.js link intact');
        assert(dashRes.body.includes('style.css'), 'Dashboard style.css link intact');
        assert(dashRes.body.includes('temperatureValue') || dashRes.body.includes('temperatureInput'), 'Dashboard temperature controls intact');

        // --- TEST 7: QR Scanner Preservation ---
        console.log('\n--- TEST 7: QR Scanner Preservation ---');
        const scanRes = await fetchUrl('/pod-scanner');
        assert(scanRes.statusCode === 200, 'GET /pod-scanner returned HTTP 200');
        assert(scanRes.body.includes('pod_parser.js'), 'pod_parser.js intact on scanner');
        assert(scanRes.body.includes('formulationDetailsSection'), '13-field formulationDetailsSection intact on scanner');

        // --- TEST 8: Refresh / route ---
        console.log('\n--- TEST 8: Refresh / Route ---');
        const refreshRes = await fetchUrl('/');
        assert(refreshRes.statusCode === 200, 'Re-requesting GET / consistently returns HTTP 200');

    } catch (err) {
        console.error('Unexpected error during verification:', err);
        allPassed = false;
    }

    console.log('\n====================================================');
    if (allPassed) {
        console.log('ALL VERIFICATION CHECKS PASSED PERFECTLY! ZERO 404s! ✓');
    } else {
        console.error('SOME CHECKS FAILED! Please inspect output above.');
    }
    console.log('====================================================\n');
    process.exit(allPassed ? 0 : 1);
}

runVerification();
