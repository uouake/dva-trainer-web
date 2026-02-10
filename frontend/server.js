const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;

console.log('=== SERVER STARTUP ===');
console.log('__dirname:', __dirname);
console.log('cwd:', process.cwd());

// Essayer plusieurs chemins possibles pour le build
const possiblePaths = [
  path.join(__dirname, 'dist/frontend/browser'),
  path.join(__dirname, 'dist/frontend'),
  path.join(__dirname, 'dist'),
  path.join(process.cwd(), 'dist/frontend/browser'),
  path.join(process.cwd(), 'dist/frontend'),
  path.join(process.cwd(), 'dist'),
  '/opt/render/project/src/frontend/dist/frontend/browser',
];

let staticPath = null;
let indexPath = null;

for (const testPath of possiblePaths) {
  const testIndex = path.join(testPath, 'index.html');
  console.log(`Testing: ${testPath} -> exists: ${fs.existsSync(testPath)}, index exists: ${fs.existsSync(testIndex)}`);
  if (fs.existsSync(testIndex)) {
    staticPath = testPath;
    indexPath = testIndex;
    console.log('✓ Found valid path:', staticPath);
    break;
  }
}

if (!staticPath) {
  console.error('ERROR: Could not find index.html in any known location!');
  // List all files in current dir for debugging
  console.log('Current dir contents:', fs.readdirSync(__dirname));
}

console.log('======================');

if (staticPath) {
  // Servir les fichiers statiques
  app.use(express.static(staticPath));

  // Fallback vers index.html pour toutes les routes (SPA)
  app.get('*', (req, res) => {
    console.log('Fallback:', req.path);
    res.sendFile(indexPath);
  });
} else {
  app.get('*', (req, res) => {
    res.status(500).send('Server misconfiguration: index.html not found');
  });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
