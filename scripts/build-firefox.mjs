import { readFileSync, writeFileSync, cpSync } from 'fs';

// Copy Chrome build as base
cpSync('dist', 'dist-firefox', { recursive: true });

// Merge Firefox manifest overrides
const base = JSON.parse(readFileSync('dist-firefox/manifest.json', 'utf-8'));
const firefox = JSON.parse(readFileSync('src/manifest.firefox.json', 'utf-8'));

// Replace service_worker with scripts
delete base.background.service_worker;
Object.assign(base.background, firefox.background);
Object.assign(base, { browser_specific_settings: firefox.browser_specific_settings });

writeFileSync('dist-firefox/manifest.json', JSON.stringify(base, null, 2));
console.log('Firefox build created in dist-firefox/');
