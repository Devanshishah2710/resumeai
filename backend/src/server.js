require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const connectDB = require('./utils/database');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();
connectDB();

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000', credentials: true }));
app.use(rateLimit({ windowMs: 15*60*1000, max: 100 }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

app.use('/api/auth',      require('./routes/auth'));
app.use('/api/resumes',   require('./routes/resumes'));
app.use('/api/templates', require('./routes/templates'));
app.use('/api/ai',        require('./routes/ai'));
app.use('/api/pdf',       require('./routes/pdf'));
app.use('/api/users',     require('./routes/users'));

app.get('/api/health', (req, res) => res.json({ status: 'ok', env: process.env.NODE_ENV }));
app.use('*', (req, res) => res.status(404).json({ error: `${req.originalUrl} not found` }));
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 ResumeAI API  →  http://localhost:${PORT}`);
  console.log(`📦 Mongo         →  ${process.env.MONGODB_URI}`);
  console.log(`🌐 Frontend      →  ${process.env.FRONTEND_URL}\n`);
});
module.exports = app;
