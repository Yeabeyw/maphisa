import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.join(__dirname, '..');
const sourceHtml = path.join(rootDir, 'index.html');
const targetHtml = path.join(rootDir, 'dist', 'client', 'index.html');

// Read source index.html
let html = fs.readFileSync(sourceHtml, 'utf-8');

// Find the main JS bundle in dist/client/assets
const assetsDir = path.join(rootDir, 'dist', 'client', 'assets');
const files = fs.readdirSync(assetsDir);

// Find the largest index-*.js file (the main bundle)
const indexFiles = files.filter(f => f.startsWith('index-') && f.endsWith('.js'));
const mainBundle = indexFiles.sort((a, b) => {
  const statA = fs.statSync(path.join(assetsDir, a));
  const statB = fs.statSync(path.join(assetsDir, b));
  return statB.size - statA.size;
})[0];

if (!mainBundle) {
  console.error('Could not find main bundle in dist/client/assets');
  process.exit(1);
}

// Replace the script src
html = html.replace('/src/start.ts', `/assets/${mainBundle}`);

// Ensure target directory exists
const targetDir = path.dirname(targetHtml);
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// Write the modified index.html
fs.writeFileSync(targetHtml, html);

console.log(`✓ Copied index.html to dist/client/index.html`);
console.log(`✓ Updated script reference to /assets/${mainBundle}`);
