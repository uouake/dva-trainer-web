// Build script for Render
const fs = require('fs');
const path = require('path');

// Remplacer l'URL de l'API par la variable d'environnement
const apiUrl = process.env.API_BASE_URL || 'https://dva-trainer-api.onrender.com';

const envFile = `export const environment = {
  apiBaseUrl: '${apiUrl}',
};`;

fs.writeFileSync(
  path.join(__dirname, 'src/environments/environment.ts'),
  envFile
);

console.log('Environment file updated with API URL:', apiUrl);
