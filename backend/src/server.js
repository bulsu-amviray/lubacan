import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
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
    origin: process.env.CORS_ORIGIN || `http://localhost:${PORT}`,
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
    service: 'LUBA CanFindIT · Quezon City Engineering Department API',
    status: 'All systems operational',
    timezone: 'Asia/Manila (+08:00)'
  });
});

// Mount /api/v1/admin/* routes
app.use('/api/v1/admin', apiRoutes);

// Serve static frontend files, design-specs, and root uploaded PNG images
app.use('/design-specs', express.static(designSpecsPath));
app.use('/uploaded-pngs', express.static(workspaceRootPath));
app.use(express.static(frontendPath));

// SPA fallback to frontend/index.html
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) {
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
