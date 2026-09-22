const fs = require('fs');
const content = fs.readFileSync('iKwath_ML/evaporation_monitor/SIH 2026/index.html', 'utf8');

// Find all elements with class containing 'btn'
const btnMatches = [...content.matchAll(/<[^>]+class=["'][^"']*btn[^"']*["'][^>]*>[\s\S]*?<\/[^>]+>/gi)];
console.log('Elements with btn class (' + btnMatches.length + '):');
btnMatches.forEach((b, i) => console.log(`${i+1}: ${b[0].replace(/\s+/g, ' ')}`));

// Find all section IDs
const sectionMatches = [...content.matchAll(/<section[^>]+id=["']([^"']+)["'][^>]*>/gi)];
console.log('\nSections:');
sectionMatches.forEach(s => console.log(s[1]));
