const r = require('express').Router();
const c = require('../controllers/resumeController');
const { protect } = require('../middleware/auth');
r.use(protect);
r.route('/').get(c.getResumes).post(c.createResume);
r.route('/:id').get(c.getResume).put(c.updateResume).delete(c.deleteResume);
r.post('/:id/duplicate', c.duplicateResume);
module.exports = r;
