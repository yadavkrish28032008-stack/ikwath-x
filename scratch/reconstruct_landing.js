const fs = require('fs');
const path = require('path');

const landingNewHtmlPath = path.join(__dirname, '..', 'iKwath_ML', 'evaporation_monitor', 'landing_new.html');
const sihIndexHtmlPath = path.join(__dirname, '..', 'iKwath_ML', 'evaporation_monitor', 'SIH 2026', 'index.html');
const landingNewCssPath = path.join(__dirname, '..', 'iKwath_ML', 'evaporation_monitor', 'landing_new.css');
const sihStyleCssPath = path.join(__dirname, '..', 'iKwath_ML', 'evaporation_monitor', 'SIH 2026', 'style.css');

// 1. Reconstructed Phase 2 (How It Works, Smart Technology, Process Flow) + Phase 3 (Impact, Validation)
const reconstructedPhase2And3Top = `    <!-- ================= HOW IT WORKS ================= -->

    <section id="how-it-works" class="section how-it-works-section">

        <div class="section-heading reveal">
            <span>HOW IT WORKS</span>
            <h2>Fresh Kwatha in 4 Simple Steps</h2>
            <p>
                From smart pod recognition to fresh dispensing, iKwath-X automates traditional Ayurvedic decoction with closed-loop precision.
            </p>
        </div>

        <div class="concept-flow reveal">
            <div class="concept-card">
                <div class="concept-step">01</div>
                <div class="concept-icon">📦</div>
                <h3>SMART POD</h3>
                <p>Identifies the formulation</p>
            </div>

            <div class="concept-connector">→</div>

            <div class="concept-card">
                <div class="concept-step">02</div>
                <div class="concept-icon">⚙️</div>
                <h3>AUTOMATED PREPARATION</h3>
                <p>The system follows the selected formulation process</p>
            </div>

            <div class="concept-connector">→</div>

            <div class="concept-card">
                <div class="concept-step">03</div>
                <div class="concept-icon">🌡️</div>
                <h3>CONTROLLED BREWING</h3>
                <p>Temperature and process conditions are monitored</p>
            </div>

            <div class="concept-connector">→</div>

            <div class="concept-card highlight">
                <div class="concept-step">04</div>
                <div class="concept-icon">🍵</div>
                <h3>FRESH KWATHA</h3>
                <p>The prepared Kwatha is filtered and dispensed</p>
            </div>
        </div>

    </section>


    <!-- ================= SMART TECHNOLOGY ================= -->

    <section id="technology" class="section tech-minimal-section">

        <div class="section-heading reveal">
            <span>SMART TECHNOLOGY</span>
            <h2>Intelligent Closed-Loop Control</h2>
            <p>
                Combining optical identification, digital recipe profiles, and real-time sensory feedback for authentic, repeatable decoctions.
            </p>
        </div>

        <div class="tech-minimal-grid">
            <div class="tech-minimal-card reveal">
                <div class="tech-icon-pill">QR / RFID</div>
                <h3>Formulation Identification</h3>
                <p>Smart pod recognition identifies the herbal recipe automatically without manual input.</p>
            </div>

            <div class="tech-minimal-card reveal">
                <div class="tech-icon-pill">SMART CONTROL</div>
                <h3>Process Parameters Loaded</h3>
                <p>Process parameters are loaded based on the formulation to execute its specific decoction profile.</p>
            </div>

            <div class="tech-minimal-card reveal">
                <div class="tech-icon-pill">SENSOR FEEDBACK</div>
                <h3>Real-Time Monitoring</h3>
                <p>Continuous temperature and mass/process monitoring guides reduction to the classical 1/4 endpoint.</p>
            </div>

            <div class="tech-minimal-card reveal">
                <div class="tech-icon-pill">TRACEABILITY</div>
                <h3>Batch Information Recorded</h3>
                <p>Batch information and preparation history can be recorded digitally for complete verification.</p>
            </div>
        </div>

    </section>


    <!-- ================= PROCESS FLOW ================= -->

    <section id="workflow" class="section process-timeline-section">

        <div class="section-heading reveal">
            <span>PROCESS FLOW</span>
            <h2>End-to-End Preparation Timeline</h2>
            <p>
                A streamlined, reproducible preparation journey executed through formulation-aware mechatronic control.
            </p>
        </div>

        <div class="timeline-container reveal">
            <div class="timeline-card">
                <div class="timeline-number">01</div>
                <h3>SCAN</h3>
                <p>Identify the smart pod.</p>
            </div>

            <div class="timeline-card">
                <div class="timeline-number">02</div>
                <h3>LOAD</h3>
                <p>Load the formulation profile.</p>
            </div>

            <div class="timeline-card">
                <div class="timeline-number">03</div>
                <h3>BREW</h3>
                <p>Begin controlled preparation.</p>
            </div>

            <div class="timeline-card">
                <div class="timeline-number">04</div>
                <h3>REDUCE</h3>
                <p>Monitor the reduction process.</p>
            </div>

            <div class="timeline-card">
                <div class="timeline-number">05</div>
                <h3>FILTER</h3>
                <p>Filter the prepared Kwatha.</p>
            </div>

            <div class="timeline-card highlight">
                <div class="timeline-number">06</div>
                <h3>DISPENSE</h3>
                <p>Fresh Kwatha is ready.</p>
            </div>
        </div>

    </section>


    <!-- ================= IMPACT ================= -->

    <section id="impact" class="section impact-minimal-section">

        <div class="section-heading reveal">
            <span>IMPACT</span>
            <h2>Why iKwath-X Matters</h2>
            <p>
                Moving from manual, variable preparation to consistent, authenticated, on-demand Kwatha for practitioners and patients.
            </p>
        </div>

        <div class="impact-minimal-grid">
            <div class="impact-minimal-card reveal">
                <div class="impact-badge">FRESH</div>
                <h3>Fresh On-Demand</h3>
                <p>Fresh on-demand preparation concept eliminating storage degradation.</p>
            </div>

            <div class="impact-minimal-card reveal">
                <div class="impact-badge">CONSISTENT</div>
                <h3>Formulation-Aware</h3>
                <p>Formulation-aware process control tailored to specific classical recipes.</p>
            </div>

            <div class="impact-minimal-card reveal">
                <div class="impact-badge">SMART</div>
                <h3>Sensor-Based</h3>
                <p>Sensor-based process monitoring eliminating manual kitchen guesswork.</p>
            </div>

            <div class="impact-minimal-card reveal">
                <div class="impact-badge">TRACEABLE</div>
                <h3>Verifiable Batches</h3>
                <p>Batch information can be recorded for clinical and quality verification.</p>
            </div>
        </div>

    </section>


    <!-- ================= VALIDATION ================= -->

    <section id="validation" class="section validation-section">

        <div class="section-heading reveal">
            <span>VALIDATION</span>
            <h2>Validation Framework</h2>
            <p>
                Designed for validation against classical and reference preparation standards.
            </p>
        </div>

        <div class="validation-container reveal">
            <div class="validation-intro">
                <h3>Designed for Standardized Benchmarking</h3>
                <p>
                    The iKwath-X system architecture is designed for validation against classical reference decoctions described in the Ayurvedic Pharmacopoeia of India (API) by quantifying key physical and chemical process parameters across repeated cycles.
                </p>
            </div>

            <div class="validation-params-grid">
                <div class="param-card">
                    <span class="param-bullet">●</span>
                    <div>
                        <strong>Temperature Profile</strong>
                        <span>Thermal stability across operating range</span>
                    </div>
                </div>

                <div class="param-card">
                    <span class="param-bullet">●</span>
                    <div>
                        <strong>Reduction Behaviour</strong>
                        <span>Mass-based evaporation curve</span>
                    </div>
                </div>

                <div class="param-card">
                    <span class="param-bullet">●</span>
                    <div>
                        <strong>Final Volume / Mass</strong>
                        <span>Reaching targeted 1/4 endpoint</span>
                    </div>
                </div>

                <div class="param-card">
                    <span class="param-bullet">●</span>
                    <div>
                        <strong>Extract Density</strong>
                        <span>Total dissolved solids & density</span>
                    </div>
                </div>

                <div class="param-card">
                    <span class="param-bullet">●</span>
                    <div>
                        <strong>Constituent Profile</strong>
                        <span>Retention of classical bioactives</span>
                    </div>
                </div>
            </div>
        </div>

    </section>`;

// Reconstructed References & Footer
const reconstructedReferencesAndFooter = `    <!-- ================= REFERENCES ================= -->

    <section id="references" class="references section">

        <div class="section-heading reveal">
            <span>RESEARCH & STANDARDS</span>
            <h2>References & Standards</h2>
            <p>
                Core pharmacopoeial guidelines and institutional frameworks informing the iKwath-X project.
            </p>
        </div>

        <div class="reference-grid reveal">
            <div class="reference-card">
                <span class="ref-num">01</span>
                <div>
                    <h3>Ayurvedic Formulary of India (AFI)</h3>
                    <p>Reference principles for classical Kwatha formulations, decoction ratios, and botanical processing standards.</p>
                </div>
            </div>

            <div class="reference-card">
                <span class="ref-num">02</span>
                <div>
                    <h3>Ayurvedic Pharmacopoeia of India (API)</h3>
                    <p>Monographs for raw herbal powder quality, identity verification, and permissible physicochemical parameter ranges.</p>
                </div>
            </div>

            <div class="reference-card">
                <span class="ref-num">03</span>
                <div>
                    <h3>PCIM&H / Ministry of AYUSH</h3>
                    <p>Pharmacopoeia Commission for Indian Medicine & Homoeopathy standards on quality control and standardization.</p>
                </div>
            </div>

            <div class="reference-card">
                <span class="ref-num">04</span>
                <div>
                    <h3>Relevant Research Literature</h3>
                    <p>Standardization studies on closed vs open boiling extraction kinetics and organoleptic stability in aqueous decoctions.</p>
                </div>
            </div>
        </div>

    </section>


    <!-- ================= FOOTER ================= -->

    <footer class="site-footer">

        <div class="footer-container">

            <div class="footer-brand">
                <div class="footer-logo">iKwath-X</div>
                <p>Formulation-Aware • Closed-Loop • Fresh On-Demand Kwatha Preparation</p>
                <span class="footer-tag">Smart India Hackathon 2026 • Problem Statement ID: SIH26048</span>
            </div>

            <div class="footer-nav">
                <a href="#home">Home</a>
                <a href="#about">About</a>
                <a href="#technology">Technology</a>
                <a href="#workflow">Process</a>
                <a href="#impact">Impact</a>
                <a href="#team">Team</a>
                <a href="/login" class="footer-login-btn">Open Dashboard</a>
            </div>

            <div class="footer-project">
                <span>TEAM</span>
                <strong>ROOT LOGIC</strong>
                <small>Team ID: 148124</small>
            </div>

        </div>

        <div class="footer-bottom">
            <p>© 2026 ROOT LOGIC • Smart India Hackathon 2026 (SIH26048)</p>
            <p>Smart • Controlled • Repeatable</p>
        </div>

    </footer>`;

function reconstructHtml(filePath, scriptTag) {
    let html = fs.readFileSync(filePath, 'utf8');

    // 1. Find end of #solution
    const solutionEndToken = '</section>';
    const solutionStartIndex = html.indexOf('<section id="solution"');
    if (solutionStartIndex === -1) throw new Error('Cannot find <section id="solution"');
    const solutionEndIndex = html.indexOf(solutionEndToken, solutionStartIndex) + solutionEndToken.length;

    // 2. Find start and end of #team
    const teamStartIndex = html.indexOf('<section id="team"');
    if (teamStartIndex === -1) throw new Error('Cannot find <section id="team"');
    
    // In our HTML, #team ends before <!-- ================= REFERENCES ================= -->
    // Let's find </section> for #team
    const teamEndToken = '</section>';
    const teamEndIndex = html.indexOf(teamEndToken, teamStartIndex) + teamEndToken.length;

    const beforeSolution = html.substring(0, solutionEndIndex);
    const teamSection = html.substring(teamStartIndex, teamEndIndex);

    const reconstructed = beforeSolution + '\n\n\n' + reconstructedPhase2And3Top + '\n\n\n    ' + teamSection + '\n\n\n' + reconstructedReferencesAndFooter + '\n\n\n    ' + scriptTag + '\n\n</body>\n\n</html>\n';

    fs.writeFileSync(filePath, reconstructed, 'utf8');
    console.log(`Successfully reconstructed ${path.basename(filePath)}`);
}

reconstructHtml(landingNewHtmlPath, '<script src="/landing_new.js"></script>');
reconstructHtml(sihIndexHtmlPath, '<script src="script.js"></script>');

// Update CSS files
const newPhase2And3Css = `/* ================= PHASE 2 & 3: SIMPLIFIED & MODERN PRODUCT STYLES ================= */

.section-heading span {
    display: inline-block;
    color: var(--green);
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    margin-bottom: 12px;
}

/* 1. HOW IT WORKS: Concept Flow */
.concept-flow {
    display: grid;
    grid-template-columns: 1fr auto 1fr auto 1fr auto 1fr;
    align-items: center;
    gap: 12px;
    margin-top: 40px;
}

.concept-card {
    background: white;
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 28px 20px;
    text-align: center;
    box-shadow: 0 4px 18px rgba(19, 37, 26, 0.04);
    transition: transform 0.25s ease, box-shadow 0.25s ease;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}

.concept-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 30px rgba(19, 37, 26, 0.08);
}

.concept-card.highlight {
    border-color: var(--green);
    background: #fdfefe;
}

.concept-step {
    font-size: 11px;
    font-weight: 800;
    color: #5fa76f;
    letter-spacing: 1px;
    margin-bottom: 8px;
}

.concept-icon {
    font-size: 32px;
    margin-bottom: 12px;
}

.concept-card h3 {
    font-size: 16px;
    font-weight: 800;
    color: var(--dark-green);
    letter-spacing: 0.5px;
    margin-bottom: 8px;
}

.concept-card p {
    font-size: 13px;
    color: var(--muted);
    line-height: 1.5;
}

.concept-connector {
    font-size: 20px;
    color: var(--green);
    font-weight: 800;
    opacity: 0.6;
}

/* 2. SMART TECHNOLOGY: 4 Minimal Cards */
.tech-minimal-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
    margin-top: 40px;
}

.tech-minimal-card {
    background: white;
    border: 1px solid var(--border);
    border-radius: 14px;
    padding: 28px 22px;
    box-shadow: 0 4px 16px rgba(19, 37, 26, 0.03);
    transition: transform 0.25s ease, border-color 0.25s ease;
}

.tech-minimal-card:hover {
    transform: translateY(-4px);
    border-color: #bcd3bf;
}

.tech-icon-pill {
    display: inline-block;
    background: var(--light-green);
    color: var(--green);
    font-size: 10px;
    font-weight: 800;
    letter-spacing: 1px;
    padding: 4px 10px;
    border-radius: 20px;
    margin-bottom: 14px;
}

.tech-minimal-card h3 {
    font-size: 17px;
    font-weight: 700;
    color: var(--dark-green);
    margin-bottom: 8px;
}

.tech-minimal-card p {
    font-size: 13px;
    color: var(--muted);
    line-height: 1.55;
}

/* 3. PROCESS FLOW: 6-Stage Timeline */
.timeline-container {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 14px;
    margin-top: 40px;
}

.timeline-card {
    background: white;
    border: 1px solid var(--border);
    border-top: 4px solid var(--green);
    border-radius: 12px;
    padding: 24px 16px;
    text-align: center;
    box-shadow: 0 4px 14px rgba(19, 37, 26, 0.03);
    transition: transform 0.25s ease;
}

.timeline-card:hover {
    transform: translateY(-3px);
}

.timeline-card.highlight {
    border-top-color: #5fa76f;
    background: #fbfdfb;
}

.timeline-number {
    font-size: 12px;
    font-weight: 800;
    color: #5fa76f;
    letter-spacing: 1px;
    margin-bottom: 6px;
}

.timeline-card h3 {
    font-size: 16px;
    font-weight: 800;
    color: var(--dark-green);
    letter-spacing: 0.5px;
    margin-bottom: 8px;
}

.timeline-card p {
    font-size: 12px;
    color: var(--muted);
    line-height: 1.45;
}

/* 4. IMPACT: 4 Clean Minimal Cards */
.impact-minimal-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
    margin-top: 40px;
}

.impact-minimal-card {
    background: white;
    border: 1px solid var(--border);
    border-radius: 14px;
    padding: 28px 22px;
    box-shadow: 0 4px 16px rgba(19, 37, 26, 0.03);
    transition: transform 0.25s ease;
}

.impact-minimal-card:hover {
    transform: translateY(-3px);
}

.impact-badge {
    display: inline-block;
    background: var(--light-green);
    color: var(--green);
    font-size: 10px;
    font-weight: 800;
    letter-spacing: 1px;
    padding: 4px 10px;
    border-radius: 20px;
    margin-bottom: 14px;
}

.impact-minimal-card h3 {
    font-size: 17px;
    font-weight: 700;
    color: var(--dark-green);
    margin-bottom: 8px;
}

.impact-minimal-card p {
    font-size: 13px;
    color: var(--muted);
    line-height: 1.55;
}

/* 5. VALIDATION: Benchmarking Box & Parameters */
.validation-container {
    background: white;
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 35px 30px;
    box-shadow: 0 8px 24px rgba(19, 37, 26, 0.04);
    margin-top: 40px;
}

.validation-intro {
    max-width: 800px;
    margin-bottom: 28px;
}

.validation-intro h3 {
    font-size: 19px;
    font-weight: 700;
    color: var(--dark-green);
    margin-bottom: 8px;
}

.validation-intro p {
    font-size: 14px;
    color: var(--muted);
    line-height: 1.6;
}

.validation-params-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 16px;
    padding-top: 20px;
    border-top: 1px solid #edf2ec;
}

.param-card {
    display: flex;
    gap: 10px;
    align-items: flex-start;
}

.param-bullet {
    color: var(--green);
    font-size: 12px;
    margin-top: 2px;
}

.param-card strong {
    display: block;
    font-size: 13.5px;
    color: var(--dark-green);
    font-weight: 700;
    margin-bottom: 3px;
}

.param-card span {
    display: block;
    font-size: 11.5px;
    color: var(--muted);
    line-height: 1.45;
}

/* 7. REFERENCES: 4 Cards */
.reference-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
    margin-top: 40px;
}

.reference-card {
    display: flex;
    gap: 16px;
    background: white;
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 22px 20px;
    box-shadow: 0 4px 14px rgba(19, 37, 26, 0.03);
}

.ref-num {
    font-size: 13px;
    font-weight: 800;
    color: #5fa76f;
    min-width: 24px;
}

.reference-card h3 {
    font-size: 15px;
    font-weight: 700;
    color: var(--dark-green);
    margin-bottom: 5px;
}

.reference-card p {
    font-size: 12.5px;
    color: var(--muted);
    line-height: 1.5;
}

/* 8. FOOTER: Professional Minimal Footer */
.site-footer {
    background: var(--dark-green);
    color: white;
    padding: 60px 25px 30px;
    margin-top: 80px;
}

.site-footer .footer-container {
    max-width: 1250px;
    margin: auto;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 40px;
    padding-bottom: 40px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.footer-brand {
    max-width: 450px;
}

.footer-brand .footer-logo {
    font-size: 24px;
    font-weight: 800;
    letter-spacing: -0.5px;
    color: white;
    margin-bottom: 8px;
}

.footer-brand p {
    font-size: 13px;
    color: #b5d4b8;
    line-height: 1.5;
    margin-bottom: 12px;
}

.footer-tag {
    display: inline-block;
    font-size: 11px;
    color: #8c978e;
    background: rgba(255, 255, 255, 0.06);
    padding: 4px 10px;
    border-radius: 4px;
}

.footer-nav {
    display: flex;
    flex-wrap: wrap;
    gap: 18px;
    align-items: center;
}

.footer-nav a {
    color: #d1ded4;
    text-decoration: none;
    font-size: 13px;
    font-weight: 600;
    transition: color 0.2s;
}

.footer-nav a:hover {
    color: white;
}

.footer-login-btn {
    background: var(--green);
    color: white !important;
    padding: 8px 16px;
    border-radius: 6px;
    font-weight: 700;
}

.footer-project {
    text-align: right;
}

.footer-project span {
    display: block;
    font-size: 10px;
    letter-spacing: 1px;
    color: #8c978e;
}

.footer-project strong {
    display: block;
    font-size: 18px;
    color: white;
    margin: 2px 0;
}

.footer-project small {
    display: block;
    font-size: 11px;
    color: #b5d4b8;
}

.site-footer .footer-bottom {
    max-width: 1250px;
    margin: auto;
    padding-top: 25px;
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    color: #8c978e;
}

/* Responsive Rules for Reconstructed Phase 2 & 3 */
@media (max-width: 1000px) {
    .concept-flow {
        grid-template-columns: repeat(2, 1fr);
        gap: 16px;
    }
    .concept-connector {
        display: none;
    }
    .tech-minimal-grid {
        grid-template-columns: repeat(2, 1fr);
    }
    .timeline-container {
        grid-template-columns: repeat(3, 1fr);
    }
    .impact-minimal-grid {
        grid-template-columns: repeat(2, 1fr);
    }
    .validation-params-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 20px;
    }
    .reference-grid {
        grid-template-columns: 1fr;
    }
    .site-footer .footer-container {
        flex-direction: column;
    }
    .footer-project {
        text-align: left;
    }
}

@media (max-width: 700px) {
    .concept-flow {
        grid-template-columns: 1fr;
    }
    .tech-minimal-grid {
        grid-template-columns: 1fr;
    }
    .timeline-container {
        grid-template-columns: repeat(2, 1fr);
    }
    .impact-minimal-grid {
        grid-template-columns: 1fr;
    }
    .validation-params-grid {
        grid-template-columns: 1fr;
    }
    .site-footer .footer-bottom {
        flex-direction: column;
        gap: 10px;
        text-align: center;
    }
}
`;

function reconstructCss(cssPath) {
    let css = fs.readFileSync(cssPath, 'utf8');

    // Replace everything from /* ================= PHASE 2: TECHNICAL & FEASIBILITY ================= */ onwards
    const phase2Marker = '/* ================= PHASE 2: TECHNICAL & FEASIBILITY ================= */';
    const markerIndex = css.indexOf(phase2Marker);

    if (markerIndex !== -1) {
        css = css.substring(0, markerIndex) + newPhase2And3Css;
    } else {
        css += '\n\n' + newPhase2And3Css;
    }

    fs.writeFileSync(cssPath, css, 'utf8');
    console.log(`Successfully updated ${path.basename(cssPath)}`);
}

reconstructCss(landingNewCssPath);
reconstructCss(sihStyleCssPath);
