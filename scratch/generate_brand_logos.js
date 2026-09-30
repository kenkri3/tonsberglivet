const fs = require('fs');

const raw = JSON.parse(fs.readFileSync('scratch/extracted_logos.json', 'utf8'));

// raw[0]: Tønsberglivet (0 0 70 12.1)
// raw[1]: Tønsberglivet navigation (same)
// raw[2]: Bylivet (0 0 36.4 12.1)
// raw[3]: Hverdagslivet (0 0 70.1 12.1)
// raw[4]: Næringslivet (0 0 66.6 12.1)
// raw[5]: Reiselivet (0 0 50.7 12.1)
// raw[6]: Studentlivet (0 0 64.474121 9.199219)

function cleanSvg(svg, name) {
  // extract viewBox
  const vb = (svg.match(/viewBox=["']([^"']+)["']/) || [])[1];
  // extract inner content
  const inner = svg.replace(/<svg[^>]*>/, '').replace(/<\/svg>/, '');
  return `export function ${name}({ className = "h-6 w-auto fill-current" }: { className?: string }) {
  return (
    <svg viewBox="${vb}" className={className} aria-label="${name.replace('Logo', '')}">
      ${inner.trim()}
    </svg>
  );
}`;
}

const componentCode = `import React from 'react';

/* 
 * Offisielle Tønsberglivet vektormerkevarer
 * Bevarer merkevareidentiteten til Tønsberglivet AS med 100% presisjon.
 */

${cleanSvg(raw[0], 'TonsberglivetLogo')}

${cleanSvg(raw[2], 'BylivetLogo')}

${cleanSvg(raw[3], 'HverdagslivetLogo')}

${cleanSvg(raw[4], 'NaeringslivetLogo')}

${cleanSvg(raw[5], 'ReiselivetLogo')}

${cleanSvg(raw[6], 'StudentlivetLogo')}
`;

fs.mkdirSync('src/components/brand', { recursive: true });
fs.writeFileSync('src/components/brand/BrandLogos.tsx', componentCode);
console.log('Generated src/components/brand/BrandLogos.tsx successfully!');
