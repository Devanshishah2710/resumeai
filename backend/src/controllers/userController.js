const User = require('../models/User');
const { AppError } = require('../middleware/errorHandler');

const getProfile = async (req, res, next) => {
  try { res.json({ user: (await User.findById(req.user._id)).toSafeObject() }); }
  catch (err) { next(err); }
};

const updateProfile = async (req, res, next) => {
  try {
    const updates = {};
    ['name','preferences'].forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
    res.json({ message: 'Profile updated', user: user.toSafeObject() });
  } catch (err) { next(err); }
};

const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) throw new AppError('Both passwords required.', 400);
    if (newPassword.length < 8) throw new AppError('New password must be 8+ characters.', 400);
    const user = await User.findById(req.user._id).select('+password');
    if (!(await user.comparePassword(currentPassword))) throw new AppError('Current password incorrect.', 401);
    user.password = newPassword; await user.save();
    res.json({ message: 'Password changed' });
  } catch (err) { next(err); }
};

module.exports = { getProfile, updateProfile, changePassword };
