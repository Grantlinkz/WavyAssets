/**
 * WavyAssets Gateway Production Entrypoint Resolver
 * Resolves compiled entrypoint whether nest build outputs to dist/main.js or dist/src/main.js
 */
const fs = require('fs');
const path = require('path');

const candidates = [
  path.join(__dirname, 'dist', 'main.js'),
  path.join(__dirname, 'dist', 'src', 'main.js'),
  path.join(__dirname, 'dist', 'main'),
  path.join(__dirname, 'dist', 'src', 'main'),
];

const target = candidates.find((p) => fs.existsSync(p));

if (!target) {
  console.error('[WavyAssets] Fatal bootstrap error: Could not locate compiled entrypoint.');
  const distPath = path.join(__dirname, 'dist');
  if (fs.existsSync(distPath)) {
    console.error('[WavyAssets] Contents of dist/:', fs.readdirSync(distPath));
    const srcPath = path.join(distPath, 'src');
    if (fs.existsSync(srcPath)) {
      console.error('[WavyAssets] Contents of dist/src/:', fs.readdirSync(srcPath));
    }
  } else {
    console.error('[WavyAssets] dist/ directory does not exist. Did build succeed?');
  }
  process.exit(1);
}

console.log(`[WavyAssets] Launching production gateway from: ${target}`);
require(target);
