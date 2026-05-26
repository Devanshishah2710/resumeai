const r = require('express').Router();
const { generatePDF } = require('../controllers/pdfController');
const { protect } = require('../middleware/auth');
r.post('/generate/:resumeId', protect, generatePDF);
module.exports = r;
