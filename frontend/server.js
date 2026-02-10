const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

const staticPath = path.join(__dirname, 'dist/frontend/browser');

// Servir les fichiers statiques
app.use(express.static(staticPath));

// Fallback vers index.html pour toutes les routes (SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(staticPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
