const fs = require('fs');
const path = require('path');

const srcPath = path.join(__dirname, '..', 'iKwath_ML', 'evaporation_monitor', 'SIH 2026', 'index.html');
const destPath = path.join(__dirname, '..', 'iKwath_ML', 'evaporation_monitor', 'landing_new.html');

let html = fs.readFileSync(srcPath, 'utf8');

// Cut anything after </html>
const endIdx = html.indexOf('</html>');
if (endIdx !== -1) {
    html = html.substring(0, endIdx + 7) + '\n';
}

// Update CSS link
html = html.replace('<link rel="stylesheet" href="style.css">', '<link rel="stylesheet" href="/landing_new.css">');

// Update script link
html = html.replace('<script src="script.js"></script>', '<script src="/landing_new.js"></script>');

// Update image links to /landing_assets/
html = html.replace(/src="image\//g, 'src="/landing_assets/');

// Update hero main CTA to /login
html = html.replace(
    /<a href="#solution" class="btn btn-primary">\s*Explore iKwath-X\s*<\/a>/,
    `<a href="/login" class="btn btn-primary" id="landingMainCta">
                        Explore iKwath-X
                    </a>`
);

// Add Login link to navMenu
html = html.replace(
    '<a href="#team">Team</a>',
    '<a href="#team">Team</a>\n                <a href="/login" class="nav-login-link">Login</a>'
);

fs.writeFileSync(destPath, html, 'utf8');
console.log('landing_new.html created successfully. Size:', html.length);
