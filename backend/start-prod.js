const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('=== STARTUP DEBUG ===');
console.log('Current directory:', process.cwd());
console.log('__dirname:', __dirname);

// Vérifier la structure
const rootDir = __dirname;
console.log('\nRoot contents:', fs.readdirSync(rootDir));

if (fs.existsSync(path.join(rootDir, 'dist'))) {
  console.log('\ndist contents:', fs.readdirSync(path.join(rootDir, 'dist')));
  
  if (fs.existsSync(path.join(rootDir, 'dist', 'src'))) {
    console.log('dist/src contents:', fs.readdirSync(path.join(rootDir, 'dist', 'src')));
  }
} else {
  console.log('\n❌ dist folder NOT FOUND!');
}

// Essayer de trouver le fichier main
const possiblePaths = [
  'dist/main.js',
  'dist/main',
  'dist/src/main.js',
  'dist/src/main',
];

console.log('\nSearching for main file:');
for (const p of possiblePaths) {
  const fullPath = path.join(rootDir, p);
  const exists = fs.existsSync(fullPath);
  console.log(`  ${p}: ${exists ? '✅ EXISTS' : '❌ NOT FOUND'}`);
  if (exists) {
    console.log(`    -> Will use: ${fullPath}`);
    require(fullPath);
    process.exit(0);
  }
}

console.log('\n❌ CRITICAL: Could not find main file in any location!');
process.exit(1);
