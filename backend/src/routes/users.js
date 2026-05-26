const r = require('express').Router();
const c = require('../controllers/userController');
const { protect } = require('../middleware/auth');
r.use(protect);
r.get('/profile', c.getProfile);
r.put('/profile', c.updateProfile);
r.put('/password', c.changePassword);
module.exports = r;
