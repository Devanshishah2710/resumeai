const r = require('express').Router();
const c = require('../controllers/authController');
const { protect } = require('../middleware/auth');
r.post('/register', c.register);
r.post('/login', c.login);
r.post('/refresh', c.refresh);
r.post('/logout', protect, c.logout);
r.get('/me', protect, c.getMe);
module.exports = r;
