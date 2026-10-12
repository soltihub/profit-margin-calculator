import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
// Cloud Run injects PORT=8080 for Nginx; AI Studio dev server proxy strictly expects port 3000
const PORT = 3000;

// Health check endpoint
app.get('/healthz', (req, res) => {
  res.status(200).send('OK');
});

// Favicon handler to prevent 404 noise in console
app.get('/favicon.ico', (req, res) => {
  res.status(204).end();
});

// Serve static files from root directory
app.use(express.static(__dirname, {
  etag: true,
  lastModified: true,
  maxAge: 0
}));

// Fallback: only serve index.html for navigation routes (not missing asset files)
app.use((req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).end();
  }
  if (path.extname(req.path)) {
    return res.status(404).send('Asset not found');
  }
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).send('Internal Server Error');
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Development server running on http://0.0.0.0:${PORT}`);
});
