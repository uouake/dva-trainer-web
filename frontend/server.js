const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;

const staticPath = path.join(__dirname, 'dist/frontend/browser');
const indexPath = path.join(staticPath, 'index.html');

console.log('__dirname:', __dirname);
console.log('Static path:', staticPath);
console.log('Index path:', indexPath);
console.log('Static path exists:', fs.existsSync(staticPath));
console.log('Index exists:', fs.existsSync(indexPath));

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
