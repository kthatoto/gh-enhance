import { execSync } from 'child_process';
import { copyFileSync, mkdirSync, readFileSync, writeFileSync, rmSync } from 'fs';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = dirname(__dirname);

// Clean dist
rmSync(`${root}/dist`, { recursive: true, force: true });
mkdirSync(`${root}/dist`, { recursive: true });

// Build content script
console.log('Building content script...');
execSync('npx vite build --config vite.config.content.ts', { cwd: root, stdio: 'inherit' });

// Build options script
console.log('Building options script...');
execSync('npx vite build --config vite.config.options.ts', { cwd: root, stdio: 'inherit' });

// Copy and update manifest.json for production
const manifest = JSON.parse(readFileSync(`${root}/src/manifest.json`, 'utf-8'));
manifest.content_scripts[0].js = ['content.js'];
manifest.options_ui.page = 'options.html';
writeFileSync(`${root}/dist/manifest.json`, JSON.stringify(manifest, null, 2));

// Copy options.html with updated paths
let optionsHtml = readFileSync(`${root}/src/options/options.html`, 'utf-8');
optionsHtml = optionsHtml.replace('options.ts', 'options.js');
writeFileSync(`${root}/dist/options.html`, optionsHtml);

// Copy options.css
copyFileSync(`${root}/src/options/options.css`, `${root}/dist/options.css`);

console.log('Build completed successfully!');
