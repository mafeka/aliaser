import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const version = process.argv[2];

if (!version) {
  console.error('Usage: node build/release.mjs <version>');
  console.error('Example: node build/release.mjs 0.2.0');
  process.exit(1);
}

if (!/^\d+\.\d+\.\d+$/.test(version)) {
  console.error(`Invalid version: "${version}". Expected format: digits.digits.digits (e.g. 0.2.0)`);
  process.exit(1);
}

// Update package.json
const packageJsonPath = resolve(root, 'package.json');
console.log(`Updating ${packageJsonPath}...`);
const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
packageJson.version = version;
writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');

// Update src/manifest.json
const manifestPath = resolve(root, 'src/manifest.json');
console.log(`Updating ${manifestPath}...`);
const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));
manifest.version = version;
writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');

// Git operations
console.log('Staging files...');
execSync('git add package.json src/manifest.json', { stdio: 'inherit', cwd: root });

console.log(`Committing: chore: bump version to ${version}`);
execSync(`git commit -m "chore: bump version to ${version}"`, { stdio: 'inherit', cwd: root });

console.log(`Tagging: v${version}`);
execSync(`git tag v${version}`, { stdio: 'inherit', cwd: root });

console.log('Pushing commits and tags...');
execSync('git push && git push --tags', { stdio: 'inherit', cwd: root });

console.log(`Released v${version}`);
