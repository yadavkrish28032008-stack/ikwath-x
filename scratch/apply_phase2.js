const fs = require('fs');
const path = require('path');

const landingNewHtmlPath = path.join(__dirname, '..', 'iKwath_ML', 'evaporation_monitor', 'landing_new.html');
const sihIndexHtmlPath = path.join(__dirname, '..', 'iKwath_ML', 'evaporation_monitor', 'SIH 2026', 'index.html');
const landingNewCssPath = path.join(__dirname, '..', 'iKwath_ML', 'evaporation_monitor', 'landing_new.css');
const sihStyleCssPath = path.join(__dirname, '..', 'iKwath_ML', 'evaporation_monitor', 'SIH 2026', 'style.css');

const phase2Html = `    <!-- ================= 1. TECHNICAL APPROACH, 2. HARDWARE, 3. SOFTWARE ARCHITECTURE ================= -->

    <section id="technology" class="section tech-approach-section">

        <!-- 1. TECHNICAL APPROACH -->
        <div class="section-heading reveal">
            <span class="section-subtag">01 • TECHNICAL APPROACH</span>
            <h2>Closed-Loop Phyto-Extraction Architecture</h2>
            <p>
                The proposed iKwath-X architecture transforms traditional Kwatha preparation into an automated, closed-loop decoction process governed by real-time sensor feedback and formulation-specific digital recipes.
            </p>
        </div>

        <div class="approach-overview-card reveal">
            <div class="approach-badge">PROPOSED SYSTEM ARCHITECTURE</div>
            <div class="approach-grid">
                <div class="approach-col">
                    <h4>Smart Pod Authentication</h4>
                    <p>Optical / QR identification validates the formulation and loads unique target temperature, stirring, and reduction parameters.</p>
                </div>
                <div class="approach-col">
                    <h4>Controlled Thermal Extraction</h4>
                    <p>Closed-loop PID regulation maintains temperature at recipe-specific levels, preserving heat-sensitive bioactive compounds.</p>
                </div>
                <div class="approach-col">
                    <h4>Continuous Mass-Based Reduction</h4>
                    <p>Real-time load-cell feedback monitors solvent evaporation to accurately detect the classical 1/4 reduction endpoint.</p>
                </div>
                <div class="approach-col">
                    <h4>Gated Dispensing & Traceability</h4>
                    <p>Integrated mesh filtration dispenses the fresh decoction while session parameters are logged to the batch history database.</p>
                </div>
            </div>
            <div class="architecture-disclaimer">
                * Note: Described hardware mechanisms represent the proposed iKwath-X system architecture and engineering specifications.
            </div>
        </div>

        <!-- 2. HARDWARE REQUIREMENTS -->
        <div class="section-heading reveal" style="margin-top: 70px;">
            <span class="section-subtag">02 • HARDWARE REQUIREMENTS</span>
            <h2>Instrumentation & Component Architecture</h2>
            <p>
                A multi-sensor, actuator-integrated hardware stack designed around industrial-grade embedded components for precise decoction monitoring.
            </p>
        </div>

        <div class="hardware-grid">
            <div class="hardware-card reveal">
                <div class="hw-tag">CONTROLLER</div>
                <h3>ESP32-S3</h3>
                <p>Main control unit for process automation, sensor coordination, and Wi-Fi telemetry.</p>
            </div>
            <div class="hardware-card reveal">
                <div class="hw-tag">IDENTIFICATION</div>
                <h3>QR / RFID Reader</h3>
                <p>Formulation pod identification, pod authentication, and automated recipe profile loading.</p>
            </div>
            <div class="hardware-card reveal">
                <div class="hw-tag">TEMPERATURE</div>
                <h3>PT100 + MAX31865</h3>
                <p>High-precision RTD temperature sensing for controlled, mild-heat decoction brewing.</p>
            </div>
            <div class="hardware-card reveal">
                <div class="hw-tag">MASS TRACKING</div>
                <h3>Load Cell + HX711</h3>
                <p>Continuous mass monitoring for closed-loop reduction and 1/4 endpoint tracking.</p>
            </div>
            <div class="hardware-card reveal">
                <div class="hw-tag">SAFETY INTERLOCK</div>
                <h3>Water Level + Foam Sensor</h3>
                <p>Active fluid monitoring providing boil-over protection and dry-run interlock cutoff.</p>
            </div>
            <div class="hardware-card reveal">
                <div class="hw-tag">THERMAL ACTUATOR</div>
                <h3>800W Heating Plate + SSR</h3>
                <p>Solid-state relay controlled heating element for rapid and precise thermal regulation.</p>
            </div>
            <div class="hardware-card reveal">
                <div class="hw-tag">AGITATION</div>
                <h3>Magnetic Stirrer + Exhaust</h3>
                <p>Continuous agitation for uniform extraction alongside controlled vapor ventilation.</p>
            </div>
            <div class="hardware-card reveal">
                <div class="hw-tag">DISPENSING</div>
                <h3>Peristaltic Pump + Filter</h3>
                <p>Food-grade fluid transfer through integrated filtration mesh directly to dispensing outlet.</p>
            </div>
            <div class="hardware-card reveal">
                <div class="hw-tag">VESSEL</div>
                <h3>SS304 Chamber</h3>
                <p>Removable food-grade stainless steel decoction vessel designed for hygiene and durability.</p>
            </div>
        </div>

        <!-- 3. SOFTWARE ARCHITECTURE -->
        <div class="section-heading reveal" style="margin-top: 70px;">
            <span class="section-subtag">03 • SOFTWARE ARCHITECTURE</span>
            <h2>Embedded to Web Architecture Pipeline</h2>
            <p>
                A modern 5-tier architecture connecting real-time microcontroller control to a responsive web dashboard and batch logging engine.
            </p>
        </div>

        <div class="software-layers-grid reveal">
            <div class="software-card">
                <span class="layer-num">LAYER 01</span>
                <h4>Embedded Firmware</h4>
                <p class="sw-tech">C / C++ on ESP32-S3</p>
                <p class="sw-desc">Real-time control loops, ADC sensor sampling, PID thermal management, and actuator switching logic.</p>
            </div>
            <div class="software-card">
                <span class="layer-num">LAYER 02</span>
                <h4>Connectivity</h4>
                <p class="sw-tech">HTTP / REST over Wi-Fi</p>
                <p class="sw-desc">Lightweight JSON telemetry streaming and bi-directional recipe coordination between appliance and server.</p>
            </div>
            <div class="software-card">
                <span class="layer-num">LAYER 03</span>
                <h4>Backend & API</h4>
                <p class="sw-tech">Python + Flask</p>
                <p class="sw-desc">Formulation database matching, process state engine, physics-informed evaporation calculation, and session management.</p>
            </div>
            <div class="software-card">
                <span class="layer-num">LAYER 04</span>
                <h4>Operator Interface</h4>
                <p class="sw-tech">HTML5 • CSS3 • JavaScript</p>
                <p class="sw-desc">Interactive dashboard with live temperature/mass telemetry, QR scanning interface, and visual progress tracking.</p>
            </div>
            <div class="software-card">
                <span class="layer-num">LAYER 05</span>
                <h4>Data & Traceability</h4>
                <p class="sw-tech">Local Database / JSON Batch Logs</p>
                <p class="sw-desc">Tamper-evident batch records documenting Pod ID, heating profile, reduction ratio, and operator timestamps.</p>
            </div>
        </div>

        <!-- ARCHITECTURE FLOW DIAGRAM -->
        <div class="arch-flow-container reveal">
            <div class="arch-flow-title">SYSTEM DATA & CONTROL PIPELINE</div>
            <div class="arch-flow-steps">
                <div class="flow-node">
                    <span class="node-icon">📦</span>
                    <strong>SMART POD</strong>
                    <span>QR / RFID Ident</span>
                </div>
                <div class="flow-arrow">→</div>
                <div class="flow-node">
                    <span class="node-icon">⚡</span>
                    <strong>ESP32-S3 CONTROL</strong>
                    <span>Embedded Firmware</span>
                </div>
                <div class="flow-arrow">→</div>
                <div class="flow-node">
                    <span class="node-icon">🎛️</span>
                    <strong>SENSORS & ACTUATORS</strong>
                    <span>PT100, Load Cell, SSR</span>
                </div>
                <div class="flow-arrow">→</div>
                <div class="flow-node">
                    <span class="node-icon">📶</span>
                    <strong>Wi-Fi / REST</strong>
                    <span>Telemetry Transport</span>
                </div>
                <div class="flow-arrow">→</div>
                <div class="flow-node">
                    <span class="node-icon">🐍</span>
                    <strong>FLASK BACKEND</strong>
                    <span>Processing Engine</span>
                </div>
                <div class="flow-arrow">→</div>
                <div class="flow-node">
                    <span class="node-icon">💻</span>
                    <strong>WEB DASHBOARD</strong>
                    <span>Operator UI</span>
                </div>
                <div class="flow-arrow">→</div>
                <div class="flow-node highlight">
                    <span class="node-icon">📋</span>
                    <strong>BATCH LOGGING</strong>
                    <span>Traceable Records</span>
                </div>
            </div>
        </div>

    </section>


    <!-- ================= 4. PROCESS FLOW ================= -->

    <section id="workflow" class="section process-flow-section">

        <div class="section-heading reveal">
            <span class="section-subtag">04 • PROCESS FLOW</span>
            <h2>12-Stage Closed-Loop Decoction Journey</h2>
            <p>
                The complete end-to-end preparation sequence executing formulation-specific extraction from smart pod recognition to fresh Kwatha delivery.
            </p>
        </div>

        <div class="twelve-stage-grid">
            <div class="stage-card reveal">
                <div class="stage-badge">01</div>
                <h4>Smart Pod</h4>
                <p>Standardized coarse herbal powder (yavakuta curna) sealed in hermetic pod.</p>
            </div>
            <div class="stage-card reveal">
                <div class="stage-badge">02</div>
                <h4>QR / RFID Scan</h4>
                <p>Optical or RFID reader identifies the specific formulation identity.</p>
            </div>
            <div class="stage-card reveal">
                <div class="stage-badge">03</div>
                <h4>Recipe Loaded</h4>
                <p>Formulation-specific temperature, duration, and reduction profile loaded.</p>
            </div>
            <div class="stage-card reveal">
                <div class="stage-badge">04</div>
                <h4>Water & Pod Added</h4>
                <p>Measured classical water volume added to chamber with inserted pod.</p>
            </div>
            <div class="stage-card reveal">
                <div class="stage-badge">05</div>
                <h4>Safety Check</h4>
                <p>Dry-run interlock and level sensor verify safe operating conditions.</p>
            </div>
            <div class="stage-card reveal">
                <div class="stage-badge">06</div>
                <h4>Mild-Heat Brewing</h4>
                <p>PID-regulated heating initiated within the optimal operating range.</p>
            </div>
            <div class="stage-card reveal">
                <div class="stage-badge">07</div>
                <h4>Continuous Stirring</h4>
                <p>Active stirring ensures uniform thermal distribution and active extraction.</p>
            </div>
            <div class="stage-card reveal">
                <div class="stage-badge">08</div>
                <h4>Target Reduction</h4>
                <p>Real-time load-cell feedback tracks solvent mass reduction to 1/4 endpoint.</p>
            </div>
            <div class="stage-card reveal">
                <div class="stage-badge">09</div>
                <h4>Consistency Check</h4>
                <p>Thermal stability and reduction rate are verified against recipe profile.</p>
            </div>
            <div class="stage-card reveal">
                <div class="stage-badge">10</div>
                <h4>Filter & Dispense</h4>
                <p>Fine-mesh filtration separates spent marc and dispenses clean decoction.</p>
            </div>
            <div class="stage-card reveal">
                <div class="stage-badge">11</div>
                <h4>Batch Logging</h4>
                <p>Telemetry, Pod ID, thermal logs, and duration stored in dashboard database.</p>
            </div>
            <div class="stage-card reveal">
                <div class="stage-badge">12</div>
                <h4>Fresh Kwatha Ready</h4>
                <p>Fresh, standardized, classical Ayurvedic decoction ready for immediate use.</p>
            </div>
        </div>

    </section>


    <!-- ================= 5. TECHNICAL FEASIBILITY, 6. OPERATIONAL FEASIBILITY, 7. MAINTENANCE ================= -->

    <section id="feasibility" class="section feasibility-section">

        <!-- 6. OPERATIONAL FEASIBILITY: SCAN -> ADD -> START -> READY -->
        <div class="section-heading reveal">
            <span class="section-subtag">06 • OPERATIONAL FEASIBILITY</span>
            <h2>Simple 4-Step Operator Journey</h2>
            <p>
                Designed for effortless day-to-day operation in clinical and home environments with zero complex programming required.
            </p>
        </div>

        <div class="operational-journey-grid">
            <div class="op-step-card reveal">
                <div class="op-step-header">
                    <span class="op-step-num">STEP 1</span>
                    <span class="op-step-action">SCAN</span>
                </div>
                <h3>Identify Pod</h3>
                <p>Scan the formulation pod via QR reader to load digital recipe parameters automatically.</p>
            </div>
            <div class="op-step-card reveal">
                <div class="op-step-header">
                    <span class="op-step-num">STEP 2</span>
                    <span class="op-step-action">ADD</span>
                </div>
                <h3>Add Water & Pod</h3>
                <p>Pour prescribed water volume into the SS304 chamber and insert the herbal pod.</p>
            </div>
            <div class="op-step-card reveal">
                <div class="op-step-header">
                    <span class="op-step-num">STEP 3</span>
                    <span class="op-step-action">START</span>
                </div>
                <h3>Begin Brewing</h3>
                <p>One-touch start activates automated heating, stirring, and closed-loop reduction.</p>
            </div>
            <div class="op-step-card reveal">
                <div class="op-step-header">
                    <span class="op-step-num">STEP 4</span>
                    <span class="op-step-action">READY</span>
                </div>
                <h3>Dispense & Log</h3>
                <p>Filtered fresh Kwatha is dispensed while the session is logged to batch history.</p>
            </div>
        </div>

        <!-- 5. TECHNICAL FEASIBILITY -->
        <div class="section-heading reveal" style="margin-top: 70px;">
            <span class="section-subtag">05 • TECHNICAL FEASIBILITY</span>
            <h2>Engineering Feasibility & Validation Pillars</h2>
            <p>
                Bridging Ayurvedic pharmacopoeial standards with modern embedded mechatronics through proposed closed-loop engineering.
            </p>
        </div>

        <div class="feasibility-pillars-grid">
            <div class="feasibility-card reveal">
                <div class="pillar-icon">🌡️</div>
                <h3>Targeted Operating Temperature</h3>
                <p>Proposed PID control maintains steady temperature in the operating range to prevent scorching of sensitive bioactive constituents.</p>
            </div>
            <div class="feasibility-card reveal">
                <div class="pillar-icon">⚖️</div>
                <h3>Formulation-Specific Reduction</h3>
                <p>Load-cell mass tracking is designed to automatically detect the classical 1/4 reduction endpoint without manual stick dipping.</p>
            </div>
            <div class="feasibility-card reveal">
                <div class="pillar-icon">🔍</div>
                <h3>QR / RFID Identification</h3>
                <p>Automated profile selection eliminates human recipe entry errors, ensuring exact process execution for every unique herbal blend.</p>
            </div>
            <div class="feasibility-card reveal">
                <div class="pillar-icon">🔄</div>
                <h3>Repeatable Automated Brewing</h3>
                <p>Continuous stirring and automated thermal cycling yield consistent extraction efficiency across repeated preparation cycles.</p>
            </div>
            <div class="feasibility-card reveal">
                <div class="pillar-icon">🛡️</div>
                <h3>Integrated Safety & Hygiene</h3>
                <p>Food-grade SS304 materials, dry-run safety cutoffs, and foam boil-over prevention ensure hygienic and secure operation.</p>
            </div>
            <div class="feasibility-card reveal">
                <div class="pillar-icon">⚡</div>
                <h3>ESP32-S3 Microcontroller Control</h3>
                <p>Robust dual-core 240MHz SoC coordinates multi-channel ADC sensor acquisition, PID heating, and web telemetry concurrently.</p>
            </div>
        </div>

        <!-- 7. MAINTENANCE -->
        <div class="section-heading reveal" style="margin-top: 70px;">
            <span class="section-subtag">07 • MAINTENANCE & SERVICING</span>
            <h2>Practical Maintenance Architecture</h2>
            <p>
                Engineered for rapid daily sanitization, modular field servicing, and high hygienic compliance.
            </p>
        </div>

        <div class="maintenance-grid">
            <div class="maint-card reveal">
                <div class="maint-num">01</div>
                <h4>Removable Chamber & Filter</h4>
                <p>Quick-release SS304 chamber and fine mesh filter disassemble easily for direct sink washing.</p>
            </div>
            <div class="maint-card reveal">
                <div class="maint-num">02</div>
                <h4>Replaceable Pod & Consumables</h4>
                <p>Single-use pod design encapsulates the spent coarse powder, preventing cross-batch contamination.</p>
            </div>
            <div class="maint-card reveal">
                <div class="maint-num">03</div>
                <h4>Rinse & Flow-Line Flush</h4>
                <p>Automated rinse cycle flushes delivery tubing, peristaltic pump, and nozzle between batches.</p>
            </div>
            <div class="maint-card reveal">
                <div class="maint-num">04</div>
                <h4>Modular Subsystem Servicing</h4>
                <p>Electronic controller, heating base, and pump assemblies are modular for straightforward replacement.</p>
            </div>
            <div class="maint-card reveal">
                <div class="maint-num">05</div>
                <h4>Food-Grade SS304 Surfaces</h4>
                <p>Non-reactive, corrosion-resistant stainless steel alloy compatible with standard sanitary cleansers.</p>
            </div>
        </div>

    </section>


    <!-- ================= 8. ECONOMIC, 9. ENVIRONMENTAL, 10. SOCIAL VIABILITY ================= -->

    <section id="impact" class="section viability-section">

        <div class="section-heading reveal">
            <span class="section-subtag">08, 09, 10 • TRIPLE-BOTTOM-LINE VIABILITY</span>
            <h2>Economic, Environmental & Social Viability</h2>
            <p>
                A grounded, sustainable implementation model aligned with clinical requirements, institutional sustainability, and healthcare access.
            </p>
        </div>

        <div class="viability-grid">

            <!-- 8. ECONOMIC VIABILITY -->
            <div class="viability-card reveal">
                <div class="viability-header">
                    <span class="viability-badge">VIABILITY 01</span>
                    <h3>Economic Viability</h3>
                </div>
                <p class="viability-subtitle">Sustainable Hardware & Consumable Architecture</p>
                <ul class="viability-list">
                    <li><strong>Reusable Base Appliance:</strong> High-durability core unit lowers total cost of ownership across years of daily operation.</li>
                    <li><strong>Replaceable Herbal Pods:</strong> Standardized, affordable pod packaging creates a predictable, accessible consumable model.</li>
                    <li><strong>Off-the-Shelf Modular Components:</strong> Standard industrial sensors (PT100, HX711, ESP32) minimize manufacturing and maintenance overhead.</li>
                    <li><strong>Clinic-First Deployment Concept:</strong> Targeted initial deployment for Ayurvedic clinics and dispensaries with high daily patient volume.</li>
                    <li><strong>Conservative Phased Rollout:</strong> Measured institutional adoption ensures field validation before wide commercial scaling.</li>
                </ul>
            </div>

            <!-- 9. ENVIRONMENTAL VIABILITY -->
            <div class="viability-card reveal">
                <div class="viability-header">
                    <span class="viability-badge">VIABILITY 02</span>
                    <h3>Environmental Viability</h3>
                </div>
                <p class="viability-subtitle">Resource Efficiency & Waste Minimization</p>
                <ul class="viability-list">
                    <li><strong>Reusable Core Hardware:</strong> Durable SS304 and structural chassis engineered for longevity, minimizing e-waste.</li>
                    <li><strong>Minimalist Replaceable Pods:</strong> Pod architecture prioritizes natural coarse herbal powder with minimal packaging overhead.</li>
                    <li><strong>Optimized Energy & Solvent Usage:</strong> Enclosed chamber and targeted PID heating reduce energy waste compared to open-flame boiling.</li>
                    <li><strong>Modular Maintainability:</strong> Individual sensors and pumps can be serviced or replaced without discarding the entire appliance.</li>
                    <li><strong>Zero Synthetic Chemical Additives:</strong> Pure extraction process requires only water and raw standardized botanicals.</li>
                </ul>
            </div>

            <!-- 10. SOCIAL VIABILITY -->
            <div class="viability-card reveal">
                <div class="viability-header">
                    <span class="viability-badge">VIABILITY 03</span>
                    <h3>Social Viability</h3>
                </div>
                <p class="viability-subtitle">Relevance for Healthcare & Community Wellness</p>
                <ul class="viability-list">
                    <li><strong>Home Users:</strong> Empowers individuals and families to prepare authentic fresh Kwatha safely on demand without continuous kitchen supervision.</li>
                    <li><strong>Ayurvedic Clinics & Vaidyas:</strong> Enables practitioners to dispense standardized, classical AFI-compliant decoctions right at the point of care.</li>
                    <li><strong>Healthcare & Wellness Centers:</strong> Digital batch logging and hygiene compliance support integration into institutional healthcare setups.</li>
                    <li><strong>Preserving Classical Heritage:</strong> Bridges ancient Ayurvedic knowledge with modern engineering to enhance trust and adherence.</li>
                    <li><strong>Factual & Safety Oriented:</strong> Focuses on preparation consistency, hygiene, and standardization without unsupported clinical claims.</li>
                </ul>
            </div>

        </div>

    </section>`;

// Function to update HTML file
function updateHtmlFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');

    // Find end of #solution section
    const solutionEndToken = '</section>';
    const solutionStartIndex = content.indexOf('<section id="solution"');
    if (solutionStartIndex === -1) throw new Error(`Cannot find <section id="solution" in ${filePath}`);

    const solutionEndIndex = content.indexOf(solutionEndToken, solutionStartIndex) + solutionEndToken.length;

    // Find start of #team section
    const teamStartIndex = content.indexOf('<section id="team"');
    if (teamStartIndex === -1) throw new Error(`Cannot find <section id="team" in ${filePath}`);

    const beforeSolutionEnd = content.substring(0, solutionEndIndex);
    const fromTeamStart = content.substring(teamStartIndex);

    const updatedContent = beforeSolutionEnd + '\n\n\n' + phase2Html + '\n\n\n    ' + fromTeamStart;
    fs.writeFileSync(filePath, updatedContent, 'utf8');
    console.log(`Successfully updated ${path.basename(filePath)}`);
}

updateHtmlFile(landingNewHtmlPath);
updateHtmlFile(sihIndexHtmlPath);

// CSS to append
const phase2Css = `
/* ================= PHASE 2: TECHNICAL & FEASIBILITY ================= */

.section-subtag {
    display: inline-block;
    color: var(--green);
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    margin-bottom: 12px;
}

/* 1. Technical Approach Card */
.approach-overview-card {
    background: white;
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 35px 30px;
    box-shadow: 0 10px 30px rgba(19, 37, 26, 0.04);
    margin-bottom: 60px;
}

.approach-badge {
    display: inline-block;
    background: var(--light-green);
    color: var(--green);
    font-size: 10px;
    font-weight: 800;
    letter-spacing: 1.2px;
    padding: 4px 10px;
    border-radius: 20px;
    margin-bottom: 24px;
}

.approach-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 24px;
}

.approach-col {
    border-left: 3px solid var(--light-green);
    padding-left: 16px;
}

.approach-col h4 {
    font-size: 15px;
    font-weight: 700;
    color: var(--dark-green);
    margin-bottom: 8px;
}

.approach-col p {
    font-size: 13px;
    color: var(--muted);
    line-height: 1.55;
}

.architecture-disclaimer {
    margin-top: 25px;
    padding-top: 15px;
    border-top: 1px solid #f0f4ef;
    font-size: 11.5px;
    color: #8c978e;
    font-style: italic;
}

/* 2. Hardware Grid (9 items) */
.hardware-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
    margin-bottom: 60px;
}

.hardware-card {
    background: white;
    border: 1px solid var(--border);
    border-radius: 14px;
    padding: 24px 22px;
    transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
    box-shadow: 0 4px 16px rgba(19, 37, 26, 0.03);
}

.hardware-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 30px rgba(19, 37, 26, 0.08);
    border-color: #bcd3bf;
}

.hw-tag {
    display: inline-block;
    font-size: 9.5px;
    font-weight: 800;
    letter-spacing: 1px;
    color: var(--green);
    background: var(--light-green);
    padding: 3px 8px;
    border-radius: 4px;
    margin-bottom: 12px;
}

.hardware-card h3 {
    font-size: 17px;
    font-weight: 700;
    color: var(--dark-green);
    margin-bottom: 8px;
}

.hardware-card p {
    font-size: 13px;
    color: var(--muted);
    line-height: 1.5;
}

/* 3. Software Layers & Pipeline */
.software-layers-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 16px;
    margin-bottom: 35px;
}

.software-card {
    background: white;
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 22px 18px;
    box-shadow: 0 4px 16px rgba(19, 37, 26, 0.03);
    transition: transform 0.25s ease;
}

.software-card:hover {
    transform: translateY(-3px);
}

.layer-num {
    display: block;
    font-size: 9.5px;
    font-weight: 800;
    letter-spacing: 1px;
    color: #5fa76f;
    margin-bottom: 6px;
}

.software-card h4 {
    font-size: 15px;
    font-weight: 700;
    color: var(--dark-green);
    margin-bottom: 4px;
}

.sw-tech {
    font-size: 11.5px;
    font-weight: 700;
    color: var(--green);
    margin-bottom: 8px;
}

.sw-desc {
    font-size: 12px;
    color: var(--muted);
    line-height: 1.5;
}

/* Architecture Flow Diagram */
.arch-flow-container {
    background: var(--dark-green);
    border-radius: 16px;
    padding: 28px 24px;
    color: white;
    box-shadow: 0 15px 40px rgba(19, 37, 26, 0.12);
}

.arch-flow-title {
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 1.5px;
    color: #8bbd97;
    margin-bottom: 20px;
    text-transform: uppercase;
    text-align: center;
}

.arch-flow-steps {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    flex-wrap: nowrap;
    overflow-x: auto;
    padding-bottom: 5px;
}

.flow-node {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 10px;
    padding: 12px 14px;
    text-align: center;
    flex: 1;
    min-width: 110px;
}

.flow-node.highlight {
    background: rgba(49, 95, 61, 0.4);
    border-color: #5fa76f;
}

.node-icon {
    display: block;
    font-size: 18px;
    margin-bottom: 4px;
}

.flow-node strong {
    display: block;
    font-size: 11.5px;
    color: #ffffff;
    font-weight: 700;
    margin-bottom: 2px;
    white-space: nowrap;
}

.flow-node span {
    display: block;
    font-size: 9.5px;
    color: #9fb3a3;
    white-space: nowrap;
}

.flow-arrow {
    color: #5fa76f;
    font-size: 16px;
    font-weight: bold;
    flex-shrink: 0;
}

/* 4. 12-Stage Process Flow Grid */
.twelve-stage-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
}

.stage-card {
    background: white;
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 20px 18px;
    position: relative;
    box-shadow: 0 4px 14px rgba(19, 37, 26, 0.03);
    transition: transform 0.25s ease, border-color 0.25s ease;
}

.stage-card:hover {
    transform: translateY(-3px);
    border-color: #bcd3bf;
}

.stage-badge {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: var(--light-green);
    color: var(--green);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    font-weight: 800;
    margin-bottom: 12px;
}

.stage-card h4 {
    font-size: 14.5px;
    font-weight: 700;
    color: var(--dark-green);
    margin-bottom: 6px;
}

.stage-card p {
    font-size: 12px;
    color: var(--muted);
    line-height: 1.5;
}

/* 6. Operational Feasibility: SCAN -> ADD -> START -> READY */
.operational-journey-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
    margin-bottom: 60px;
}

.op-step-card {
    background: white;
    border: 1px solid var(--border);
    border-top: 4px solid var(--green);
    border-radius: 14px;
    padding: 26px 20px;
    box-shadow: 0 6px 20px rgba(19, 37, 26, 0.04);
    transition: transform 0.25s ease;
}

.op-step-card:hover {
    transform: translateY(-4px);
}

.op-step-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 14px;
}

.op-step-num {
    font-size: 10px;
    font-weight: 800;
    letter-spacing: 1px;
    color: var(--muted);
}

.op-step-action {
    background: var(--light-green);
    color: var(--green);
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 1px;
    padding: 4px 10px;
    border-radius: 20px;
}

.op-step-card h3 {
    font-size: 18px;
    font-weight: 700;
    color: var(--dark-green);
    margin-bottom: 8px;
}

.op-step-card p {
    font-size: 13px;
    color: var(--muted);
    line-height: 1.5;
}

/* 5. Feasibility Pillars Grid */
.feasibility-pillars-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
    margin-bottom: 60px;
}

.feasibility-card {
    background: white;
    border: 1px solid var(--border);
    border-radius: 14px;
    padding: 24px 22px;
    box-shadow: 0 4px 16px rgba(19, 37, 26, 0.03);
    transition: transform 0.25s ease;
}

.feasibility-card:hover {
    transform: translateY(-3px);
}

.pillar-icon {
    font-size: 24px;
    margin-bottom: 12px;
}

.feasibility-card h3 {
    font-size: 16px;
    font-weight: 700;
    color: var(--dark-green);
    margin-bottom: 8px;
}

.feasibility-card p {
    font-size: 13px;
    color: var(--muted);
    line-height: 1.55;
}

/* 7. Maintenance Grid (5 items) */
.maintenance-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 16px;
}

.maint-card {
    background: white;
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 20px 16px;
    box-shadow: 0 4px 14px rgba(19, 37, 26, 0.03);
    transition: transform 0.25s ease;
}

.maint-card:hover {
    transform: translateY(-3px);
}

.maint-num {
    width: 26px;
    height: 26px;
    border-radius: 6px;
    background: var(--light-green);
    color: var(--green);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    font-weight: 800;
    margin-bottom: 10px;
}

.maint-card h4 {
    font-size: 14px;
    font-weight: 700;
    color: var(--dark-green);
    margin-bottom: 6px;
}

.maint-card p {
    font-size: 12px;
    color: var(--muted);
    line-height: 1.5;
}

/* 8, 9, 10. Triple Bottom Line Viability Grid */
.viability-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
}

.viability-card {
    background: white;
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 30px 25px;
    box-shadow: 0 8px 24px rgba(19, 37, 26, 0.04);
    transition: transform 0.25s ease;
}

.viability-card:hover {
    transform: translateY(-4px);
}

.viability-header {
    margin-bottom: 14px;
}

.viability-badge {
    display: inline-block;
    font-size: 9.5px;
    font-weight: 800;
    letter-spacing: 1px;
    color: var(--green);
    background: var(--light-green);
    padding: 3px 8px;
    border-radius: 4px;
    margin-bottom: 8px;
}

.viability-card h3 {
    font-size: 20px;
    font-weight: 700;
    color: var(--dark-green);
}

.viability-subtitle {
    font-size: 12.5px;
    font-weight: 600;
    color: var(--muted);
    margin-bottom: 20px;
    padding-bottom: 12px;
    border-bottom: 1px solid #f0f4ef;
}

.viability-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.viability-list li {
    font-size: 12.5px;
    color: #3d4a40;
    line-height: 1.5;
    position: relative;
    padding-left: 16px;
}

.viability-list li::before {
    content: "•";
    color: var(--green);
    position: absolute;
    left: 0;
    font-size: 16px;
    line-height: 1;
}

.viability-list li strong {
    color: var(--dark-green);
}

/* Responsive Rules for Phase 2 */
@media (max-width: 1000px) {
    .approach-grid {
        grid-template-columns: repeat(2, 1fr);
    }
    .hardware-grid {
        grid-template-columns: repeat(2, 1fr);
    }
    .software-layers-grid {
        grid-template-columns: repeat(3, 1fr);
    }
    .twelve-stage-grid {
        grid-template-columns: repeat(3, 1fr);
    }
    .operational-journey-grid {
        grid-template-columns: repeat(2, 1fr);
    }
    .feasibility-pillars-grid {
        grid-template-columns: repeat(2, 1fr);
    }
    .maintenance-grid {
        grid-template-columns: repeat(3, 1fr);
    }
    .viability-grid {
        grid-template-columns: 1fr;
    }
}

@media (max-width: 700px) {
    .approach-grid {
        grid-template-columns: 1fr;
    }
    .hardware-grid {
        grid-template-columns: 1fr;
    }
    .software-layers-grid {
        grid-template-columns: 1fr;
    }
    .arch-flow-steps {
        flex-direction: column;
        align-items: stretch;
    }
    .flow-arrow {
        transform: rotate(90deg);
        text-align: center;
        margin: 4px 0;
    }
    .twelve-stage-grid {
        grid-template-columns: 1fr;
    }
    .operational-journey-grid {
        grid-template-columns: 1fr;
    }
    .feasibility-pillars-grid {
        grid-template-columns: 1fr;
    }
    .maintenance-grid {
        grid-template-columns: 1fr;
    }
}
`;

function updateCssFile(cssPath) {
    let css = fs.readFileSync(cssPath, 'utf8');
    if (!css.includes('PHASE 2: TECHNICAL & FEASIBILITY')) {
        css += '\n\n' + phase2Css;
        fs.writeFileSync(cssPath, css, 'utf8');
        console.log(`Successfully updated ${path.basename(cssPath)} with Phase 2 CSS`);
    } else {
        console.log(`${path.basename(cssPath)} already contains Phase 2 CSS`);
    }
}

updateCssFile(landingNewCssPath);
updateCssFile(sihStyleCssPath);
