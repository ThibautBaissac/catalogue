#!/usr/bin/env node
// Generates macOS .icns from a source image using sharp.
// Usage: node scripts/generate-icon.js src/renderer/assets/images/logo.jpg

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function main() {
  const src = process.argv[2];
  if (!src) {
    console.error('Provide source image path (e.g. src/renderer/assets/images/logo.jpg)');
    process.exit(1);
  }
  const outDir = path.join(__dirname, '..', 'build', 'icons');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  // Apple icon set sizes
  const sizes = [16,32,64,128,256,512,1024];
  const iconsetDir = path.join(outDir, 'icon.iconset');
  if (!fs.existsSync(iconsetDir)) fs.mkdirSync(iconsetDir, { recursive: true });
  for (const size of sizes) {
    const base = path.join(iconsetDir, `icon_${size}x${size}.png`);
    await sharp(src).resize(size, size).png().toFile(base);
    if (size !== 16) { // create @2x variant for all except smallest if within Apple's typical set
      await sharp(src).resize(size*2, size*2).png().toFile(base.replace('.png', `@2x.png`));
    }
  }
  // Use macOS iconutil if present to convert to .icns
  const { execSync } = require('child_process');
  try {
    execSync(`iconutil -c icns ${iconsetDir} -o ${path.join(outDir, 'icon.icns')}`);
    console.log('Generated', path.join(outDir, 'icon.icns'));
  } catch (e) {
    console.warn('iconutil failed. Ensure you are on macOS. You can supply an .icns manually at build/icons/icon.icns');
  }
}
main().catch(e => { console.error(e); process.exit(1); });
