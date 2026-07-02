import fs from 'node:fs';
import path from 'node:path';
import opentype from 'opentype.js';

const fonts = [
  {
    name: 'invaders-from-space',
    file: 'C:/Users/Mikhail/Downloads/font-Invaders-From-Space/Invaders-From-Space.ttf',
  },
  {
    name: 'invaders-font',
    file: 'C:/Users/Mikhail/Downloads/font-invaders/Invaders-font.TTF',
  },
  {
    name: 'pixel-invaders',
    file: 'C:/Users/Mikhail/Downloads/font-pixel-invaders/pixel-invaders.ttf',
  },
];

const outRoot = path.resolve('dev/space-invaders-icons/fonts');
const fontSize = 1000;

function safeName(glyph, index) {
  const unicode = glyph.unicode?.toString(16).toUpperCase().padStart(4, '0') ?? 'NONE';
  const rawName = glyph.name || `glyph-${index}`;
  const name = rawName.replace(/[^a-z0-9._-]+/gi, '-').replace(/^-|-$/g, '') || `glyph-${index}`;
  return `${index.toString().padStart(3, '0')}-${name}-u${unicode}.svg`;
}

function svgForGlyph(glyph) {
  const glyphPath = glyph.getPath(0, 0, fontSize);
  const box = glyphPath.getBoundingBox();
  const width = Math.max(1, Math.ceil(box.x2 - box.x1));
  const height = Math.max(1, Math.ceil(box.y2 - box.y1));
  const pad = Math.ceil(Math.max(width, height) * 0.08);
  const viewBox = [
    Math.floor(box.x1 - pad),
    Math.floor(box.y1 - pad),
    Math.ceil(width + pad * 2),
    Math.ceil(height + pad * 2),
  ].join(' ');

  return [
    '<svg xmlns="http://www.w3.org/2000/svg"',
    `  viewBox="${viewBox}"`,
    '  fill="currentColor"',
    '  aria-hidden="true">',
    `  <path d="${glyphPath.toPathData(2)}" />`,
    '</svg>',
    '',
  ].join('\n');
}

const manifest = [];

for (const fontInfo of fonts) {
  const font = opentype.parse(fs.readFileSync(fontInfo.file).buffer);
  const outDir = path.join(outRoot, fontInfo.name);
  fs.mkdirSync(outDir, { recursive: true });

  for (let index = 0; index < font.glyphs.length; index += 1) {
    const glyph = font.glyphs.get(index);
    if (!glyph.unicode || !glyph.path?.commands?.length) continue;

    const fileName = safeName(glyph, index);
    const relativePath = path.posix.join(
      'fonts',
      fontInfo.name,
      fileName,
    );

    fs.writeFileSync(path.join(outDir, fileName), svgForGlyph(glyph));
    manifest.push({
      font: fontInfo.name,
      glyphIndex: index,
      glyphName: glyph.name || null,
      unicode: `U+${glyph.unicode.toString(16).toUpperCase().padStart(4, '0')}`,
      character: String.fromCodePoint(glyph.unicode),
      path: relativePath,
    });
  }
}

fs.writeFileSync(
  path.join(outRoot, 'manifest.json'),
  `${JSON.stringify(manifest, null, 2)}\n`,
);

console.log(`Exported ${manifest.length} SVG icons to ${outRoot}`);
