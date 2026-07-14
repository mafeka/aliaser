import { readFileSync } from 'fs';
import { execSync } from 'child_process';

const manifest = JSON.parse(readFileSync('src/manifest.json', 'utf-8'));
const version = manifest.version;

const chromeZip = `dist/aliaser-${version}-chrome.zip`;
const firefoxXpi = `dist/aliaser-${version}-firefox.xpi`;

execSync(`cd dist/chrome && zip -r ../aliaser-${version}-chrome.zip .`);
console.log(`Created ${chromeZip}`);

execSync(`cd dist/firefox && zip -r ../aliaser-${version}-firefox.xpi .`);
console.log(`Created ${firefoxXpi}`);
