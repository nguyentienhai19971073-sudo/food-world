import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Middleware for parsing large JSON payloads (image base64)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

const MANIFEST_PATH = path.resolve(__dirname, 'src/data/customAssetManifest.json');
const PUBLIC_CUSTOM_ASSETS = path.resolve(__dirname, 'public/custom_assets');

// Helper to ensure directories exist
const ensureDirs = () => {
  ['dishes', 'countries', 'backgrounds'].forEach((sub) => {
    const dir = path.join(PUBLIC_CUSTOM_ASSETS, sub);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};
ensureDirs();

// Read Manifest
const getManifest = () => {
  try {
    if (fs.existsSync(MANIFEST_PATH)) {
      const data = fs.readFileSync(MANIFEST_PATH, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading manifest:', err);
  }
  return { dishes: {}, countryFlags: {}, countryBackgrounds: {} };
};

// Write Manifest
const saveManifest = (manifest: any) => {
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2), 'utf-8');
};

// API: Get current asset manifest
app.get('/api/assets/manifest', (_req, res) => {
  res.json(getManifest());
});

// API: Upload/Replace Custom Asset
app.post('/api/assets/upload', (req, res) => {
  try {
    const { type, id, dataUrl } = req.body;
    if (!type || !id || !dataUrl) {
      return res.status(400).json({ error: 'Missing required parameters: type, id, dataUrl' });
    }

    // Parse data URL: data:image/png;base64,....
    const matches = dataUrl.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return res.status(400).json({ error: 'Invalid data URL format' });
    }

    let ext = matches[1].toLowerCase();
    if (ext === 'jpeg') ext = 'jpg';
    if (ext === 'svg+xml') ext = 'svg';

    const buffer = Buffer.from(matches[2], 'base64');

    let subfolder = 'dishes';
    let manifestKey = 'dishes';

    if (type === 'country_flag') {
      subfolder = 'countries';
      manifestKey = 'countryFlags';
    } else if (type === 'country_bg') {
      subfolder = 'backgrounds';
      manifestKey = 'countryBackgrounds';
    }

    ensureDirs();
    const fileName = `${id}.${ext}`;
    const filePath = path.join(PUBLIC_CUSTOM_ASSETS, subfolder, fileName);

    fs.writeFileSync(filePath, buffer);

    // Save relative URL that works in both dev and production
    const relativeUrl = `./custom_assets/${subfolder}/${fileName}`;

    const manifest = getManifest();
    if (!manifest[manifestKey]) manifest[manifestKey] = {};
    manifest[manifestKey][id] = relativeUrl;
    saveManifest(manifest);

    res.json({
      success: true,
      url: relativeUrl,
      manifest,
    });
  } catch (error: any) {
    console.error('Upload asset error:', error);
    res.status(500).json({ error: error.message || 'Failed to save asset' });
  }
});

// API: Restore Default (delete custom asset)
app.post('/api/assets/restore-default', (req, res) => {
  try {
    const { type, id } = req.body;
    let subfolder = 'dishes';
    let manifestKey = 'dishes';

    if (type === 'country_flag') {
      subfolder = 'countries';
      manifestKey = 'countryFlags';
    } else if (type === 'country_bg') {
      subfolder = 'backgrounds';
      manifestKey = 'countryBackgrounds';
    }

    const manifest = getManifest();
    if (manifest[manifestKey] && manifest[manifestKey][id]) {
      const targetUrl = manifest[manifestKey][id];
      const filename = path.basename(targetUrl);
      const filePath = path.join(PUBLIC_CUSTOM_ASSETS, subfolder, filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      delete manifest[manifestKey][id];
      saveManifest(manifest);
    }

    res.json({ success: true, manifest });
  } catch (error: any) {
    console.error('Restore default error:', error);
    res.status(500).json({ error: error.message || 'Failed to restore default' });
  }
});

// Serve public static assets
app.use(express.static(path.resolve(__dirname, 'public')));

// Set up Vite development middleware or serve production dist
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist/index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Food World Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
