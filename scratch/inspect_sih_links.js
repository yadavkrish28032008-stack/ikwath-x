const fs = require('fs');
const content = fs.readFileSync('iKwath_ML/evaporation_monitor/SIH 2026/index.html', 'utf8');

const linkRegex = /<a\s+(?:[^>]*?\s+)?href=["']([^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi;
let match;
const links = [];
while ((match = linkRegex.exec(content)) !== null) {
  links.push({
    href: match[1],
    text: match[2].replace(/<[^>]+>/g, '').trim().replace(/\s+/g, ' ')
  });
}

console.log('All links (' + links.length + '):');
links.forEach((l, idx) => console.log(`${idx + 1}. [${l.text || '(image/icon)'}] -> ${l.href}`));

// Check buttons
const buttonRegex = /<button[\s\S]*?<\/button>/gi;
const buttons = content.match(buttonRegex) || [];
console.log('\nAll buttons (' + buttons.length + '):');
buttons.forEach((b, idx) => console.log(`${idx + 1}. ${b}`));
