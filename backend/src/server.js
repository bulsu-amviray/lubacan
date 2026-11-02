import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import apiRoutes from './routes/api.routes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendPath = path.resolve(__dirname, '../../frontend');
const designSpecsPath = path.resolve(__dirname, '../../design-specs');
const workspaceRootPath = path.resolve(__dirname, '../..');

const app = express();
const PORT = Number(process.env.PORT || 4000);

// Security headers (allowing Tailwind CDN & inline scripts for frontend shell)
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
  })
);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin or any localhost/127.0.0.1 origins
      if (!origin || origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true
  })
);

app.use(express.json({ limit: '2mb' }));
app.use(cookieParser());

// Rate limiter for API endpoints
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api/', apiLimiter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    service: 'LUBA CanFindIT · City Engineering Office, City of Malolos API',
    status: 'All systems operational',
    timezone: 'Asia/Manila (+08:00)'
  });
});

// Authentication endpoint for administrator sign in
app.post('/api/v1/auth/login', async (req, res) => {
  const { email, password } = req.body || {};
  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanPassword = (password || '').trim();

  if (!cleanEmail || !cleanPassword) {
    return res.status(400).json({
      error: 'MISSING_CREDENTIALS',
      message: 'Email and password are required.'
    });
  }

  const isDefaultAdmin = cleanEmail === 'admin@malolos.gov.ph' && cleanPassword === 'admin123';
  const isAnaAdmin = cleanEmail === 'ana.delacruz@malolos.gov.ph' && (cleanPassword === 'admin123' || cleanPassword === 'correcthorse24');

  if (isDefaultAdmin || isAnaAdmin) {
    const userPayload = isDefaultAdmin
      ? {
          userId: 14,
          fullName: 'System Administrator',
          email: 'admin@malolos.gov.ph',
          role: 'LGU administrator',
          department: 'City Engineering Office'
        }
      : {
          userId: 3,
          fullName: 'Ana Dela Cruz',
          email: 'ana.delacruz@malolos.gov.ph',
          role: 'LGU administrator',
          department: 'City Engineering'
        };

    const token = jwt.sign(
      { sub: userPayload.userId, email: userPayload.email, role: userPayload.role },
      process.env.JWT_SECRET || 'luba_default_secret',
      { expiresIn: '24h' }
    );

    res.cookie('luba_access_token', token, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000
    });

    return res.status(200).json({
      success: true,
      message: 'Authentication successful',
      token,
      user: userPayload
    });
  }

  return res.status(401).json({
    error: 'INVALID_CREDENTIALS',
    message: 'Incorrect email or password. Try again.'
  });
});

// Mount /api/v1/admin/* routes
app.use('/api/v1/admin', apiRoutes);

// Supabase REST Proxy route (bridges queries using server-side credentials with Dart User-Agent)
app.all('/api/supabase/*', async (req, res) => {
  const endpoint = req.params[0] || '';
  const queryString = req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : '';
  const targetUrl = `${(process.env.SUPABASE_URL || 'https://boeukdabtzdvmqsqvtpq.supabase.co').replace(/\/+$/, '')}/rest/v1/${endpoint}${queryString}`;
  const apiKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';

  try {
    const fetchOptions = {
      method: req.method,
      headers: {
        'apikey': apiKey,
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'User-Agent': 'Dart/3.0 (dart:io)',
        ...(req.headers.prefer ? { 'Prefer': req.headers.prefer } : {})
      }
    };
    if (['POST', 'PATCH', 'PUT'].includes(req.method) && req.body) {
      fetchOptions.body = JSON.stringify(req.body);
    }
    const upstreamRes = await fetch(targetUrl, fetchOptions);
    const contentType = upstreamRes.headers.get('content-type') || 'application/json';
    const data = await upstreamRes.text();
    res.status(upstreamRes.status).set('content-type', contentType).send(data);
  } catch (err) {
    res.status(502).json({ error: 'Supabase proxy error', message: err.message });
  }
});

// Serve static design specs and root uploaded PNG images
app.use('/design-specs', express.static(designSpecsPath));
app.use('/uploaded-pngs', express.static(workspaceRootPath));

// Cache-busting middleware for development: ensure fresh assets are always served
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
});

// Guard against serving HTML for nested asset requests (e.g. /dashboard/js/app.js)
app.use((req, res, next) => {
  const assetRegex = /\.(js|mjs|css|png|jpg|jpeg|gif|svg|ico|json|map|woff|woff2|ttf|eot)$/i;
  if (assetRegex.test(req.path)) {
    // Strip any nested routing prefix like /dashboard/, /frontend/, /overview/, etc.
    const cleanAsset = req.path.replace(/^(\/dashboard|\/frontend|\/overview|\/reports)/, '');
    const localAssetPath = path.join(frontendPath, cleanAsset);
    if (fs.existsSync(localAssetPath) && fs.statSync(localAssetPath).isFile()) {
      return res.sendFile(localAssetPath);
    }
    return res.status(404).end();
  }
  next();
});

// Route root to login page: http://localhost:4000 displays the login screen first
app.get(['/', '/login', '/login.html'], (req, res) => {
  if (req.query.screen) {
    return res.sendFile(path.join(frontendPath, 'index.html'));
  }
  return res.sendFile(path.join(frontendPath, 'login.html'));
});

// Admin dashboard route
app.get(['/dashboard', '/dashboard.html', '/dashboard/'], (req, res) => {
  return res.sendFile(path.join(frontendPath, 'index.html'));
});

// Serve frontend static assets without automatically serving index.html on root
app.use(express.static(frontendPath, { index: false }));

// SPA fallback for dashboard routes (HTML only - non-asset paths)
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/') || /\.[a-z0-9]{2,5}$/i.test(req.path)) {
    return next();
  }
  return res.sendFile(path.join(frontendPath, 'index.html'));
});

// Centralized Error Handler
app.use((err, req, res, _next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    error: err.code || 'SERVER_ERROR',
    message: err.message || 'An unexpected server error occurred.'
  });
});

app.listen(PORT, () => {
  console.log(`[LUBA CanFindIT] Server running at http://localhost:${PORT} (Asia/Manila PHT)`);
});

export default app;
