require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
const connectDB = require('./utils/database');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();

// Trust proxy (required for Render/cloud deployments)
app.set('trust proxy', 1);

connectDB();

// ── Security ──────────────────────────────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }));

app.use(cors({
  origin: (origin, callback) => {
    const allowed = [
      process.env.FRONTEND_URL,
      'http://localhost:3000',
      'https://resumeai-five-eta.vercel.app',
    ].filter(Boolean);
    if (!origin || allowed.includes(origin)) return callback(null, true);
    callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ── Rate limiting ─────────────────────────────────────────────────────────────
app.use('/api/', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { error: 'Too many requests, please try again later.' },
}));

// ── Body parsing ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Logging ───────────────────────────────────────────────────────────────────
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

// ── Static files (sample PDFs) ────────────────────────────────────────────────
app.use('/public', express.static(path.join(__dirname, '../public')));

// ── API Routes ────────────────────────────────────────────────────────────────
app.use('/api/auth',      require('./routes/auth'));
app.use('/api/resumes',   require('./routes/resumes'));
app.use('/api/templates', require('./routes/templates'));
app.use('/api/ai',        require('./routes/ai'));
app.use('/api/pdf',       require('./routes/pdf'));
app.use('/api/users',     require('./routes/users'));
app.use('/api/samples',   require('./routes/samples'));   // ← sample PDFs

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    env: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use('*', (req, res) => {
  res.status(404).json({ error: `Route ${req.originalUrl} not found` });
});

// ── Global error handler ──────────────────────────────────────────────────────
app.use(errorHandler);

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 ResumeAI API running on port ${PORT}`);
  console.log(`📦 MongoDB connected`);
  console.log(`🌐 Frontend: ${process.env.FRONTEND_URL}`);
  console.log(`📄 Samples API ready at /api/samples`);
});

module.exports = app;
