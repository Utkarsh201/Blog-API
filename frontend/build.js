import fs from 'fs-extra';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distPath = path.join(__dirname, 'dist');
const adminDistPath = path.join(__dirname, 'admin', 'dist');
const blogDistPath = path.join(__dirname, 'blog', 'dist');

// Step 1: Clean the dist folder
console.log('Cleaning dist folder...');
fs.removeSync(distPath);

// Step 2: Build the admin app
console.log('Building admin app...');
execSync('npm install && npm run build', {
    cwd: path.join(__dirname, 'admin'),
    stdio: 'inherit'
});

// Step 3: Build the blog app
console.log('Building blog app...');
execSync('npm install && npm run build', {
    cwd: path.join(__dirname, 'blog'),
    stdio: 'inherit'
});

// Step 4: Copy the _redirects file into dist
console.log('Assembling frontend dist...');
fs.copySync(blogDistPath, distPath);
fs.copySync(adminDistPath, path.join(distPath, 'admin'));

// Step 5: Copy the _redirects file into dist
console.log('Copying _redirects file...');
fs.copyFileSync(
    path.join(__dirname, '_redirects'),
    path.join(distPath, '_redirects')
);

console.log('Build complete!');
