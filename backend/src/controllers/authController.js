const User = require('../models/User');
const { generateTokens, verifyToken } = require('../utils/jwt');
const { AppError } = require('../middleware/errorHandler');

const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) throw new AppError('All fields required.', 400);
    if (password.length < 8) throw new AppError('Password must be 8+ characters.', 400);
    if (await User.findOne({ email: email.toLowerCase() })) throw new AppError('Email already registered.', 409);
    const user = await User.create({ name, email, password });
    const { accessToken, refreshToken } = generateTokens(user._id);
    user.refreshToken = refreshToken; user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });
    res.status(201).json({ message: 'Account created', user: user.toSafeObject(), accessToken, refreshToken });
  } catch (err) { next(err); }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) throw new AppError('Email and password required.', 400);
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password +refreshToken');
    if (!user || !(await user.comparePassword(password))) throw new AppError('Invalid email or password.', 401);
    const { accessToken, refreshToken } = generateTokens(user._id);
    user.refreshToken = refreshToken; user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });
    res.json({ message: 'Login successful', user: user.toSafeObject(), accessToken, refreshToken });
  } catch (err) { next(err); }
};

const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) throw new AppError('Refresh token required.', 400);
    const decoded = verifyToken(refreshToken, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('+refreshToken');
    if (!user || user.refreshToken !== refreshToken) throw new AppError('Invalid refresh token.', 401);
    const tokens = generateTokens(user._id);
    user.refreshToken = tokens.refreshToken;
    await user.save({ validateBeforeSave: false });
    res.json(tokens);
  } catch (err) { next(err); }
};

const logout = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { refreshToken: null });
    res.json({ message: 'Logged out' });
  } catch (err) { next(err); }
};

const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ user: user.toSafeObject() });
  } catch (err) { next(err); }
};

module.exports = { register, login, refresh, logout, getMe };
