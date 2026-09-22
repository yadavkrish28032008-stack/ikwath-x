const fs = require('fs');
const path = require('path');

const cssFiles = [
    path.join(__dirname, '..', 'iKwath_ML', 'evaporation_monitor', 'landing_new.css'),
    path.join(__dirname, '..', 'iKwath_ML', 'evaporation_monitor', 'SIH 2026', 'style.css')
];

for (const cssPath of cssFiles) {
    let css = fs.readFileSync(cssPath, 'utf8');

    // 1. Replace the entire desktop stats section
    const desktopStatsPattern = /\/\* ================= STATS \/ IDENTITY ================= \*\/[\s\S]*?(?=\/\* ================= SECTIONS ================= \*\/)/;
    
    const correctDesktopStats = `/* ================= STATS / IDENTITY ================= */

.stats {
    background: var(--dark-green);
    color: white;
    position: relative;
    z-index: 10;
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08);
}

.stats-container {
    max-width: 1250px;
    margin: auto;
    padding: 28px 25px;
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 14px;
}

.stat {
    text-align: left;
    padding: 14px 18px;
    border-right: 1px solid rgba(255, 255, 255, 0.08);
    background: rgba(255, 255, 255, 0.02);
    border-radius: 10px;
    transition: background 0.3s, transform 0.2s;
}

.stat:hover {
    background: rgba(255, 255, 255, 0.05);
}

.stat:last-child {
    border-right: none;
}

.stat-num {
    display: inline-block;
    font-size: 11px;
    font-weight: 800;
    color: #5fa76f;
    letter-spacing: 1px;
    margin-bottom: 4px;
}

.stat-label {
    display: block;
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    color: #9fb3a3;
    font-weight: 600;
    margin-bottom: 6px;
}

.stat strong {
    display: block;
    font-size: 18px;
    font-weight: 700;
    color: #ffffff;
    line-height: 1.25;
}

`;

    css = css.replace(desktopStatsPattern, correctDesktopStats);

    // 2. Fix mobile 700px query
    const mobileOldStatsPattern = /\.btn\s*\{\s*text-align:\s*center;\s*\}\s*\.stats-container\s*\{[\s\S]*?\}\s*\.stat\s*\{[\s\S]*?\}/;
    const mobileNewStats = `.btn {
        text-align: center;
    }

    .stats-container {
        grid-template-columns: repeat(2, 1fr);
        gap: 10px;
        padding: 20px 15px;
    }

    .stat {
        padding: 12px 14px;
        border-right: none;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }

    .stat:nth-child(5) {
        grid-column: span 2;
    }

    .stat strong {
        font-size: 16px;
    }`;

    css = css.replace(mobileOldStatsPattern, mobileNewStats);

    fs.writeFileSync(cssPath, css, 'utf8');
    console.log(`Fixed CSS in ${path.basename(cssPath)}`);
}
