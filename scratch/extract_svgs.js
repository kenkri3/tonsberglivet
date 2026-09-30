const fs = require('fs');

const content = fs.readFileSync('C:/Users/glosl/.gemini/antigravity/brain/a9107f27-2e3b-45e6-a6ee-a09bf952d552/.system_generated/steps/888/content.md', 'utf8');

// Find all svg elements
const svgMatches = content.match(/<svg[\s\S]*?<\/svg>/g) || [];
console.log('Total SVGs found:', svgMatches.length);

const results = [];
svgMatches.forEach((svg, i) => {
  const vb = (svg.match(/viewBox=["']([^"']+)["']/) || [])[1];
  const id = (svg.match(/id=["']([^"']+)["']/) || [])[1];
  const cls = (svg.match(/class=["']([^"']+)["']/) || [])[1];
  console.log(`SVG #${i}: id=${id} class=${cls} viewBox=${vb}`);
  if (svg.includes('0 0 70 12.1') || svg.includes('36.4 12.1') || svg.includes('70.1 12.1') || svg.includes('66.6 12.1') || svg.includes('50.7 12.1') || svg.includes('64.474121')) {
    results.push(svg);
  }
});

fs.writeFileSync('scratch/extracted_logos.json', JSON.stringify(results, null, 2));
console.log('Saved', results.length, 'brand SVGs');
