const fs = require('fs');
const path = require('path');

const monitorDir = path.join(__dirname, '..', 'iKwath_ML', 'evaporation_monitor');
const sihHtml = fs.readFileSync(path.join(monitorDir, 'SIH 2026', 'index.html'), 'utf8');

// Find members-grid start and MENTORS comment in SIH 2026 index.html
const sihGridStart = sihHtml.indexOf('<div class="members-grid">');
const sihMentorsStart = sihHtml.indexOf('<!-- MENTORS -->');

// In SIH 2026, the members-grid ends right before MENTORS
const sihMembers = sihHtml.substring(sihGridStart, sihHtml.lastIndexOf('</div>', sihMentorsStart) + 6);
console.log('Actual SIH members block length:', sihMembers.length);

// In landing_new.html, let's restore it cleanly
// Note: landing_new.html is identical to SIH 2026 index.html except for /landing_assets/ vs image/ and /style.css vs style.css
// Let's create landing_new.html directly from SIH 2026 index.html with the right asset paths:
let newLandingHtml = sihHtml
    .replace(/src="image\//g, 'src="/landing_assets/')
    .replace(/href="style\.css"/g, 'href="/landing_new.css"')
    .replace(/src="script\.js"/g, 'src="/landing_new.js"');

// Ensure login link in nav if needed
if (!newLandingHtml.includes('/login') && sihHtml.includes('#team')) {
    newLandingHtml = newLandingHtml.replace(
        '<a href="#team">Team</a>',
        '<a href="#team">Team</a>\n                <a href="/login" class="nav-login-link">Login</a>'
    );
}

fs.writeFileSync(path.join(monitorDir, 'landing_new.html'), newLandingHtml, 'utf8');
console.log('landing_new.html generated perfectly from SIH 2026 index.html!');
