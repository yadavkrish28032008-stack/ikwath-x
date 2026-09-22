const fs = require('fs');
const path = require('path');

const landingNewHtmlPath = path.join(__dirname, '..', 'iKwath_ML', 'evaporation_monitor', 'landing_new.html');
const sihIndexHtmlPath = path.join(__dirname, '..', 'iKwath_ML', 'evaporation_monitor', 'SIH 2026', 'index.html');
const landingNewCssPath = path.join(__dirname, '..', 'iKwath_ML', 'evaporation_monitor', 'landing_new.css');
const sihStyleCssPath = path.join(__dirname, '..', 'iKwath_ML', 'evaporation_monitor', 'SIH 2026', 'style.css');

// 1. Prepare Hero & Stats HTML
function getHeroAndStatsHtml(imagePathPrefix) {
    return `    <!-- ================= HERO ================= -->

    <section id="home" class="hero">

        <div class="hero-overlay"></div>

        <div class="hero-container">

            <div class="hero-content reveal">

                <div class="badge">
                    SMART INDIA HACKATHON 2026
                </div>

                <p class="eyebrow">
                    Problem Statement ID - SIH26048 • Hardware
                </p>

                <h1>
                    iKwath-X
                    <span class="hero-tagline">Formulation-Aware • Closed-Loop • Fresh On-Demand Kwatha Preparation</span>
                </h1>

                <p class="hero-description">
                    iKwath-X is a formulation-aware, pod-based smart Kwatha maker designed to prepare a fresh decoction from standardized coarse herbal powder with controlled heating, reduction and batch traceability.
                </p>

                <div class="hero-ps-box">
                    <div class="hero-ps-meta">
                        <span class="ps-badge">SIH26048</span>
                        <span class="ps-theme">MedTech / BioTech / HealthTech</span>
                    </div>
                    <p class="hero-ps-text">
                        "iKwath - a pod-based smart Kwatha (Kadha) maker that prepares a fresh, AFI/API-standardized decoction from yavakuta curna / standardized coarse powder on demand, in the shortest practical time without altering the decoctions quality or yield."
                    </p>
                </div>

                <div class="hero-buttons">

                    <a href="/login" class="btn btn-primary">
                        Open Dashboard
                    </a>

                    <a href="#about" class="btn btn-outline">
                        Explore iKwath-X
                    </a>

                </div>

            </div>


            <div class="hero-visual reveal">

                <div class="floating-card card-top">
                    <strong>Closed-Loop</strong>
                    <span>PID Thermal Control</span>
                </div>

                <div class="prototype-frame">

                    <img src="${imagePathPrefix}prototype.jpeg" alt="iKwath-X Prototype"
                        onerror="this.src='https://placehold.co/700x550?text=iKwath-X+Prototype'">

                </div>

                <div class="floating-card card-bottom">
                    <strong>1/4 Endpoint</strong>
                    <span>AFI / API Standardized</span>
                </div>

            </div>

        </div>

    </section>


    <!-- ================= PROJECT STATS / IDENTITY ================= -->

    <section class="stats" id="identity">

        <div class="stats-container">

            <div class="stat">
                <span class="stat-num">01</span>
                <span class="stat-label">Problem Statement</span>
                <strong>SIH26048</strong>
            </div>

            <div class="stat">
                <span class="stat-num">02</span>
                <span class="stat-label">Team ID</span>
                <strong>148124</strong>
            </div>

            <div class="stat">
                <span class="stat-num">03</span>
                <span class="stat-label">PS Category</span>
                <strong>Hardware</strong>
            </div>

            <div class="stat">
                <span class="stat-num">04</span>
                <span class="stat-label">Theme</span>
                <strong>MedTech / BioTech / HealthTech</strong>
            </div>

            <div class="stat">
                <span class="stat-num">05</span>
                <span class="stat-label">Team</span>
                <strong>ROOT LOGIC</strong>
            </div>

        </div>

    </section>


    <!-- ================= ABOUT / PROBLEM ================= -->

    <section id="about" class="section">`;
}

// 2. Update landing_new.html
let landingNewHtml = fs.readFileSync(landingNewHtmlPath, 'utf8');

// The marker before hero in landing_new.html:
// Currently </nav> is at line 48, followed immediately by <div class="section-heading reveal">
// We need to restore:
//             <button class="menu-btn" onclick="toggleMenu()">☰</button>
//         </div>
//     </header>
// followed by Hero and Stats and <section id="about" class="section">

const navEndIndex = landingNewHtml.indexOf('</nav>');
if (navEndIndex === -1) {
    throw new Error('Could not find </nav> in landing_new.html');
}

const problemHeadingIndex = landingNewHtml.indexOf('<div class="section-heading reveal">');
if (problemHeadingIndex === -1) {
    throw new Error('Could not find <div class="section-heading reveal"> in landing_new.html');
}

const landingTop = landingNewHtml.substring(0, navEndIndex + '</nav>'.length);
const landingBottom = landingNewHtml.substring(problemHeadingIndex);

const heroAndStatsLanding = getHeroAndStatsHtml('/landing_assets/');

const reconstructedLandingNewHtml = landingTop + `\n\n            <button class="menu-btn" onclick="toggleMenu()">☰</button>\n\n        </div>\n\n    </header>\n\n\n` + heroAndStatsLanding + '\n\n        ' + landingBottom.trimStart();

fs.writeFileSync(landingNewHtmlPath, reconstructedLandingNewHtml, 'utf8');
console.log('Successfully updated landing_new.html');

// 3. Update SIH 2026/index.html
let sihIndexHtml = fs.readFileSync(sihIndexHtmlPath, 'utf8');

const sihHeaderEnd = sihIndexHtml.indexOf('</header>');
if (sihHeaderEnd === -1) {
    throw new Error('Could not find </header> in SIH 2026/index.html');
}

const sihProblemHeading = sihIndexHtml.indexOf('<div class="section-heading reveal">');
if (sihProblemHeading === -1) {
    throw new Error('Could not find <div class="section-heading reveal"> in SIH 2026/index.html');
}

const sihTop = sihIndexHtml.substring(0, sihHeaderEnd + '</header>'.length);
const sihBottom = sihIndexHtml.substring(sihProblemHeading);
const heroAndStatsSih = getHeroAndStatsHtml('image/');

const reconstructedSihHtml = sihTop + '\n\n\n' + heroAndStatsSih + '\n\n        ' + sihBottom.trimStart();
fs.writeFileSync(sihIndexHtmlPath, reconstructedSihHtml, 'utf8');
console.log('Successfully updated SIH 2026/index.html');

// 4. Update CSS (both landing_new.css and SIH 2026/style.css)
function updateCss(cssPath) {
    let css = fs.readFileSync(cssPath, 'utf8');

    // Add .hero-tagline and .hero-ps-box after .hero h1 span
    const targetH1Span = `.hero h1 span {
    display: block;
    color: var(--green);
}`;

    const newHeroStyles = `.hero h1 span {
    display: block;
    color: var(--green);
}

.hero-tagline {
    display: block;
    margin-top: 14px;
    font-size: clamp(16px, 2.1vw, 20px);
    font-weight: 700;
    color: var(--green);
    letter-spacing: -0.2px;
    line-height: 1.35;
    font-family: "Inter", sans-serif;
}

.hero-ps-box {
    margin-top: 24px;
    padding: 16px 20px;
    background: rgba(255, 255, 255, 0.88);
    border: 1px solid var(--border);
    border-left: 4px solid var(--green);
    border-radius: 12px;
    backdrop-filter: blur(8px);
    box-shadow: 0 8px 24px rgba(31, 56, 38, 0.05);
}

.hero-ps-meta {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 8px;
}

.ps-badge {
    background: var(--light-green);
    color: var(--green);
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0.8px;
    padding: 3px 8px;
    border-radius: 6px;
}

.ps-theme {
    font-size: 12px;
    font-weight: 600;
    color: var(--muted);
}

.hero-ps-text {
    font-size: 13.5px;
    line-height: 1.55;
    color: #2c3830;
    font-style: italic;
    margin: 0;
}`;

    if (css.includes('.hero-tagline')) {
        console.log(`${path.basename(cssPath)} already has .hero-tagline`);
    } else if (css.includes(targetH1Span)) {
        css = css.replace(targetH1Span, newHeroStyles);
    } else {
        // Fallback with normalized line endings
        const normalizedTarget = targetH1Span.replace(/\r?\n/g, '\n');
        const normalizedCss = css.replace(/\r?\n/g, '\n');
        if (normalizedCss.includes(normalizedTarget)) {
            css = normalizedCss.replace(normalizedTarget, newHeroStyles);
        } else {
            console.warn(`Could not find targetH1Span in ${cssPath}`);
        }
    }

    // Replace the .stats block
    const statsRegex = /\/\* ================= STATS ================= \*\/[\s\S]*?(?=\/\* ================= SECTIONS ================= \*\/)/;
    const newStatsCss = `/* ================= STATS / IDENTITY ================= */

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
    padding: 12px 18px;
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

    if (statsRegex.test(css)) {
        css = css.replace(statsRegex, newStatsCss);
    } else {
        console.warn(`Could not find stats section in ${cssPath}`);
    }

    // Update responsive queries for stats
    // In max-width: 1000px
    const media1000Target = `.hero-container,
    .solution-container,
    .technology-container,
    .safety-container {
        grid-template-columns: 1fr;
    }`;

    const media1000Replacement = `.hero-container,
    .solution-container,
    .technology-container,
    .safety-container {
        grid-template-columns: 1fr;
    }

    .stats-container {
        grid-template-columns: repeat(3, 1fr);
    }`;

    if (!css.includes('.stats-container {') || !css.includes('repeat(3, 1fr)')) {
        css = css.replace(media1000Target.replace(/\r?\n/g, '\n'), media1000Replacement);
    }

    // In max-width: 700px
    const media700StatsRegex = /\.stats-container\s*\{[\s\S]*?\}\s*\.stat\s*\{[\s\S]*?\}/;
    const media700StatsReplacement = `.stats-container {
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

    css = css.replace(media700StatsRegex, media700StatsReplacement);

    fs.writeFileSync(cssPath, css, 'utf8');
    console.log(`Successfully updated ${path.basename(cssPath)}`);
}

updateCss(landingNewCssPath);
updateCss(sihStyleCssPath);
