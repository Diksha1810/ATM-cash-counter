import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, '../dist');
const assetsDir = path.join(distDir, 'assets');
const distSwPath = path.join(distDir, 'sw.js');
const indexHtmlPath = path.join(distDir, 'index.html');

try {
  // 1. Inject precache assets into dist/sw.js
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

  // 2. Generate SPA static fallback files for direct URL navigation on Vercel
  if (fs.existsSync(indexHtmlPath)) {
    const indexContent = fs.readFileSync(indexHtmlPath, 'utf8');
    const routes = ['dashboard', 'transactions', 'login', 'register', '404'];

    for (const route of routes) {
      // Create /<route>.html
      fs.writeFileSync(path.join(distDir, `${route}.html`), indexContent, 'utf8');

      // Create /<route>/index.html
      const routeDir = path.join(distDir, route);
      if (!fs.existsSync(routeDir)) {
        fs.mkdirSync(routeDir, { recursive: true });
      }
      fs.writeFileSync(path.join(routeDir, 'index.html'), indexContent, 'utf8');
    }
    console.log('[generate-sw] Generated static route fallbacks for SPA direct navigation.');
  }
} catch (err) {
  console.error('[generate-sw] Build script error:', err);
}
