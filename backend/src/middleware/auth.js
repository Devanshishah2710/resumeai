const { verifyToken } = require('../utils/jwt');
const User = require('../models/User');

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer '))
      return res.status(401).json({ error: 'Not authorized. No token provided.' });
    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    const user = await User.findById(decoded.id).select('-password -refreshToken');
    if (!user) return res.status(401).json({ error: 'User not found.' });
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError')
      return res.status(401).json({ error: 'Token expired.', code: 'TOKEN_EXPIRED' });
    return res.status(401).json({ error: 'Invalid token.' });
  }
};

const requirePlan = (...plans) => (req, res, next) => {
  if (!plans.includes(req.user?.plan))
    return res.status(403).json({ error: `Requires ${plans.join(' or ')} plan.`, code: 'PLAN_REQUIRED' });
  next();
};

module.exports = { protect, requirePlan };
