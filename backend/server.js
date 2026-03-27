// Express server entry point for Financial Resource Management System
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// ─── Environment Validation ───────────────────────────────────────────────────
if (!process.env.JWT_SECRET) {
  if (process.env.NODE_ENV === 'production') {
    console.error('❌ FATAL: JWT_SECRET environment variable is required in production.');
    console.error('   Copy backend/.env.example to backend/.env and set a strong JWT_SECRET.');
    process.exit(1);
  }
  // In development, generate a random secret per process so tokens are never predictable.
  // Tokens will be invalidated on each server restart – acceptable for local development.
  const crypto = require('crypto');
  process.env.JWT_SECRET = crypto.randomBytes(32).toString('hex');
  console.warn('⚠️  JWT_SECRET is not set in .env – using a random development secret (tokens reset on restart).');
  console.warn('   Copy backend/.env.example to backend/.env and set a strong JWT_SECRET.');
}

const app = express();

// ─── Uploads Directory ────────────────────────────────────────────────────────
const UPLOADS_DIR = path.join(__dirname, '../uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// ─── Multer Configuration (file uploads) ─────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${unique}${ext}`);
  }
});

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF, JPEG, PNG, and GIF files are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }  // 5 MB per file
});

// Expose upload middleware for use in routes
app.locals.upload = upload;

// ─── Rate Limiters ────────────────────────────────────────────────────────────
// Strict limit for auth endpoints (login/register) to prevent brute-force attacks
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 20,                    // 20 attempts per window per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests from this IP, please try again later.' }
});

// General limit for all other API routes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 200,                   // 200 requests per window per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests from this IP, please try again later.' }
});

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// Serve static frontend assets from the /frontend directory
app.use(express.static(path.join(__dirname, '../frontend')));

// Serve uploaded files (restrict directory listing)
app.use('/uploads', express.static(UPLOADS_DIR));

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth',         authLimiter, require('./routes/auth'));
app.use('/api/donations',    apiLimiter,  require('./routes/donations'));
app.use('/api/applications', apiLimiter,  require('./routes/applications'));
app.use('/api/admin',        apiLimiter,  require('./routes/admin'));

// Health check endpoint
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

// SPA catch-all: serve index.html for any non-API route (rate-limited)
app.get('*', apiLimiter, (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error' });
});

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
const db = require('./config/db');

app.listen(PORT, async () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`   Frontend: http://localhost:${PORT}`);
  console.log(`   API:      http://localhost:${PORT}/api`);

  // Verify database connection on startup so misconfiguration is caught early
  try {
    await db.query('SELECT 1');
    console.log('✅ Database connection OK');
  } catch (err) {
    console.error('❌ Database connection FAILED:', err.message);
    console.error('   Make sure MySQL is running and your .env DB_* variables are correct.');
    if (process.env.NODE_ENV === 'production') {
      console.error('   Exiting – cannot serve API requests without a database.');
      process.exit(1);
    }
    console.warn('   Server will continue running in development mode, but API calls will fail until the database is available.');
  }
});
