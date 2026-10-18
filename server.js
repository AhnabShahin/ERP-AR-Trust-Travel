import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const distPath = path.join(__dirname, 'dist');

// Serve static assets from dist with caching
app.use(
  express.static(distPath, {
    maxAge: '1y',
    index: 'index.html',
  })
);

// Health check endpoint for Hostinger deployment checks
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// SPA fallback for all other routes
app.get('*', (req, res) => {
  const indexPath = path.join(distPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(500).send('Application build not found. Please run "npm run build".');
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 AR Trust Travel & Tourism server listening on port ${PORT}`);
});
