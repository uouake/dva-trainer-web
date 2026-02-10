const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;

const staticPath = path.join(__dirname, 'dist/frontend/browser');
const indexPath = path.join(staticPath, 'index.html');

console.log('=== SERVER STARTUP ===');
console.log('__dirname:', __dirname);
console.log('Current directory contents:', fs.readdirSync(__dirname));

// Check if dist exists
const distPath = path.join(__dirname, 'dist');
console.log('dist exists:', fs.existsSync(distPath));
if (fs.existsSync(distPath)) {
  console.log('dist contents:', fs.readdirSync(distPath));
  const frontendPath = path.join(distPath, 'frontend');
  console.log('frontend exists:', fs.existsSync(frontendPath));
  if (fs.existsSync(frontendPath)) {
    console.log('frontend contents:', fs.readdirSync(frontendPath));
    const browserPath = path.join(frontendPath, 'browser');
    console.log('browser exists:', fs.existsSync(browserPath));
    if (fs.existsSync(browserPath)) {
      console.log('browser contents:', fs.readdirSync(browserPath));
    }
  }
}

console.log('Static path:', staticPath);
console.log('Static path exists:', fs.existsSync(staticPath));
console.log('Index exists:', fs.existsSync(indexPath));
console.log('======================');

// Servir les fichiers statiques depuis le dossier browser
app.use(express.static(staticPath));

// Fallback vers index.html pour toutes les routes (SPA)
app.get('*', (req, res) => {
  console.log('Fallback route hit:', req.path);
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('index.html not found at ' + indexPath);
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
