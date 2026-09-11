import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, '../dist');
const assetsDir = path.join(distDir, 'assets');
const distSwPath = path.join(distDir, 'sw.js');

try {
  if (fs.existsSync(assetsDir) && fs.existsSync(distSwPath)) {
    const assetFiles = fs.readdirSync(assetsDir).map((file) => `/assets/${file}`);
    const precacheList = ['/', '/index.html', ...assetFiles];

    let swContent = fs.readFileSync(distSwPath, 'utf8');
    swContent = swContent.replace(
      /const APP_SHELL = \[.*?\];/s,
      `const APP_SHELL = ${JSON.stringify(precacheList, null, 2)};`
    );
    fs.writeFileSync(distSwPath, swContent, 'utf8');
    console.log('[generate-sw] Injected precache assets into dist/sw.js:', precacheList);
  }
} catch (err) {
  console.error('[generate-sw] Failed to inject assets into dist/sw.js:', err);
}
