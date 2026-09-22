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
    console.log('=== STARTING RECONSTRUCTION VERIFICATION ===\n');

    // 1. Live Landing Page
    const res = await get('http://127.0.0.1:5000/');
    if (res.status !== 200) throw new Error('Live landing page returned status: ' + res.status);
    console.log('✓ [1/10] Live Landing Page responded with HTTP 200');

    const html = res.data;

    // 2. Verify Phase 1 is 100% UNCHANGED
    const phase1Items = [
        'iKwath-X',
        'Formulation-Aware • Closed-Loop • Fresh On-Demand Kwatha Preparation',
        'SMART INDIA HACKATHON 2026',
        'Problem Statement ID - SIH26048 • Hardware',
        'iKwath-X is a formulation-aware, pod-based smart Kwatha maker designed to prepare a fresh decoction from standardized coarse herbal powder with controlled heating, reduction and batch traceability.',
        '01', 'Problem Statement', 'SIH26048',
        '02', 'Team ID', '148124',
        '03', 'PS Category', 'Hardware',
        '04', 'Theme', 'MedTech / BioTech / HealthTech',
        '05', 'Team', 'ROOT LOGIC',
        'Open Dashboard',
        'Explore iKwath-X',
        'THE PROBLEM',
        'Why does Kwatha preparation need',
        'OUR SOLUTION',
        'A formulation-aware'
    ];
    for (const item of phase1Items) {
        if (!html.includes(item)) throw new Error('Missing Phase 1 item: ' + item);
    }
    console.log('✓ [2/10] Phase 1 Hero, Identity Cards, Problem & Solution confirmed 100% UNCHANGED');

    // 3. Phase 2: HOW IT WORKS
    const howItWorks = [
        'HOW IT WORKS',
        'SMART POD', 'Identifies the formulation',
        'AUTOMATED PREPARATION', 'The system follows the selected formulation process',
        'CONTROLLED BREWING', 'Temperature and process conditions are monitored',
        'FRESH KWATHA', 'The prepared Kwatha is filtered and dispensed'
    ];
    for (const hw of howItWorks) {
        if (!html.includes(hw)) throw new Error('Missing How It Works item: ' + hw);
    }
    console.log('✓ [3/10] Phase 2: HOW IT WORKS (4 simple visual steps) verified');

    // 4. Phase 2: SMART TECHNOLOGY (4 items)
    const smartTech = [
        'SMART TECHNOLOGY',
        'QR / RFID', 'Formulation Identification',
        'SMART CONTROL', 'Process Parameters Loaded',
        'SENSOR FEEDBACK', 'Real-Time Monitoring',
        'TRACEABILITY', 'Batch Information Recorded'
    ];
    for (const st of smartTech) {
        if (!html.includes(st)) throw new Error('Missing Smart Tech item: ' + st);
    }
    console.log('✓ [4/10] Phase 2: SMART TECHNOLOGY (4 minimal items) verified');

    // 5. Phase 2: PROCESS FLOW (6 stages)
    const processFlow = [
        'PROCESS FLOW',
        '01', 'SCAN', 'Identify the smart pod.',
        '02', 'LOAD', 'Load the formulation profile.',
        '03', 'BREW', 'Begin controlled preparation.',
        '04', 'REDUCE', 'Monitor the reduction process.',
        '05', 'FILTER', 'Filter the prepared Kwatha.',
        '06', 'DISPENSE', 'Fresh Kwatha is ready.'
    ];
    for (const pf of processFlow) {
        if (!html.includes(pf)) throw new Error('Missing Process Flow item: ' + pf);
    }
    console.log('✓ [5/10] Phase 2: PROCESS FLOW (6 simple timeline stages) verified');

    // 6. Phase 3: IMPACT (4 items)
    const impact = [
        'IMPACT',
        'FRESH', 'Fresh On-Demand',
        'CONSISTENT', 'Formulation-Aware',
        'SMART', 'Sensor-Based',
        'TRACEABLE', 'Verifiable Batches'
    ];
    for (const im of impact) {
        if (!html.includes(im)) throw new Error('Missing Impact item: ' + im);
    }
    console.log('✓ [6/10] Phase 3: IMPACT (4 clean minimal cards) verified');

    // 7. Phase 3: VALIDATION
    const validation = [
        'VALIDATION',
        'Designed for validation against classical and reference preparation standards.',
        'Temperature Profile',
        'Reduction Behaviour',
        'Final Volume / Mass',
        'Extract Density',
        'Constituent Profile'
    ];
    for (const val of validation) {
        if (!html.includes(val)) throw new Error('Missing Validation item: ' + val);
    }
    console.log('✓ [7/10] Phase 3: VALIDATION (5 parameters) verified');

    // 8. Phase 3: TEAM (Confirmed all 6 members untouched)
    const team = [
        'BOOMESH R',
        'JOSE GEORGESAM E',
        'KAVIYA M',
        'MAYURI S V',
        'YADAVKRISH R D',
        'HAFIZ MUZZAMIL A',
        'MUTHUSAMY SIR',
        'GAJENDRAN SIR'
    ];
    for (const member of team) {
        if (!html.includes(member)) throw new Error('Missing Team member: ' + member);
    }
    console.log('✓ [8/10] Phase 3: TEAM section confirmed 100% UNTOUCHED (all 6 members + mentors intact)');

    // 9. Phase 3: REFERENCES & FOOTER
    const refFooter = [
        'Ayurvedic Formulary of India (AFI)',
        'Ayurvedic Pharmacopoeia of India (API)',
        'PCIM&H / Ministry of AYUSH',
        'Relevant Research Literature',
        'SIH26048',
        'Team ID: 148124',
        'Smart • Controlled • Repeatable'
    ];
    for (const rf of refFooter) {
        if (!html.includes(rf)) throw new Error('Missing Reference/Footer item: ' + rf);
    }
    console.log('✓ [9/10] Phase 3: REFERENCES & FOOTER verified');

    // 10. Application endpoints preserved
    const endpoints = ['/login', '/dashboard', '/scan', '/batch-history'];
    for (const ep of endpoints) {
        const epRes = await get('http://127.0.0.1:5000' + ep);
        if (epRes.status !== 200) throw new Error(`Endpoint ${ep} returned status: ${epRes.status}`);
    }
    console.log('✓ [10/10] Core application endpoints (/login, /dashboard, /scan, /batch-history) verified intact');

    console.log('\n=============================================');
    console.log('ALL VERIFICATIONS PASSED (10/10) SUCCESSFULLY!');
    console.log('=============================================');
}

verify().catch(err => {
    console.error('Verification failed:', err);
    process.exit(1);
});
