const http = require('http');

function get(url) {
    return new Promise((resolve, reject) => {
        http.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve({ status: res.statusCode, data }));
        }).on('error', reject);
    });
}

async function verify() {
    console.log('--- VERIFYING LIVE SERVER ON http://127.0.0.1:5000 ---');
    
    // 1. Landing Page
    const landing = await get('http://127.0.0.1:5000/');
    if (landing.status !== 200) throw new Error('Landing page status: ' + landing.status);
    console.log('✓ Landing page responded with HTTP 200');

    const html = landing.data;

    // Checks on Hero
    const requiredTexts = [
        'iKwath-X',
        'Formulation-Aware • Closed-Loop • Fresh On-Demand Kwatha Preparation',
        'SMART INDIA HACKATHON 2026',
        'Problem Statement ID - SIH26048 • Hardware',
        'iKwath-X is a formulation-aware, pod-based smart Kwatha maker designed to prepare a fresh decoction from standardized coarse herbal powder with controlled heating, reduction and batch traceability.',
        'iKwath - a pod-based smart Kwatha (Kadha) maker that prepares a fresh, AFI/API-standardized decoction from yavakuta curna / standardized coarse powder on demand, in the shortest practical time without altering the decoctions quality or yield.',
        'MedTech / BioTech / HealthTech',
        'Hardware',
        '148124',
        'ROOT LOGIC',
        'Open Dashboard',
        'Explore iKwath-X'
    ];

    for (const text of requiredTexts) {
        if (!html.includes(text)) {
            throw new Error(`Missing expected text: "${text}"`);
        }
        console.log(`✓ Contains text: "${text.substring(0, 45)}..."`);
    }

    // Check CTA link
    if (!html.includes('href="/login"')) {
        throw new Error('Missing CTA linking to /login');
    }
    console.log('✓ Verified CTA links to /login');

    // Check 5 stats
    const statsChecks = [
        { num: '01', label: 'Problem Statement', val: 'SIH26048' },
        { num: '02', label: 'Team ID', val: '148124' },
        { num: '03', label: 'PS Category', val: 'Hardware' },
        { num: '04', label: 'Theme', val: 'MedTech / BioTech / HealthTech' },
        { num: '05', label: 'Team', val: 'ROOT LOGIC' }
    ];

    for (const st of statsChecks) {
        if (!html.includes(st.num) || !html.includes(st.label) || !html.includes(st.val)) {
            throw new Error(`Stat mismatch for ${JSON.stringify(st)}`);
        }
        console.log(`✓ Verified Stat ${st.num}: ${st.label} -> ${st.val}`);
    }

    // Verify /login route
    const login = await get('http://127.0.0.1:5000/login');
    if (login.status !== 200) throw new Error('Login route status: ' + login.status);
    console.log('✓ /login route responded with HTTP 200');

    // Verify /dashboard route
    const dashboard = await get('http://127.0.0.1:5000/dashboard');
    if (dashboard.status !== 200) throw new Error('Dashboard route status: ' + dashboard.status);
    console.log('✓ /dashboard route responded with HTTP 200');

    // Verify /scan route
    const scan = await get('http://127.0.0.1:5000/scan');
    if (scan.status !== 200) throw new Error('Scan route status: ' + scan.status);
    console.log('✓ /scan route responded with HTTP 200');

    // Verify /batch-history route
    const batch = await get('http://127.0.0.1:5000/batch-history');
    if (batch.status !== 200) throw new Error('Batch History route status: ' + batch.status);
    console.log('✓ /batch-history route responded with HTTP 200');

    console.log('\nALL CHECKS PASSED SUCCESSFULLY!');
}

verify().catch(err => {
    console.error('Verification failed:', err);
    process.exit(1);
});
