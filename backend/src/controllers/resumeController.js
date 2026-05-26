const Resume = require('../models/Resume');
const User = require('../models/User');
const { AppError } = require('../middleware/errorHandler');

const getResumes = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, sort = '-updatedAt' } = req.query;
    const query = { user: req.user._id, isDeleted: false };
    const [resumes, total] = await Promise.all([
      Resume.find(query).sort(sort).limit(limit * 1).skip((page - 1) * limit).select('-__v'),
      Resume.countDocuments(query),
    ]);
    res.json({ resumes, pagination: { total, page: +page, pages: Math.ceil(total / limit) } });
  } catch (err) { next(err); }
};

const getResume = async (req, res, next) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, user: req.user._id, isDeleted: false });
    if (!resume) throw new AppError('Resume not found.', 404);
    res.json({ resume });
  } catch (err) { next(err); }
};

const createResume = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const count = await Resume.countDocuments({ user: user._id, isDeleted: false });
    if (count >= user.resumeLimit)
      throw new AppError(`Free plan allows ${user.resumeLimit} resumes. Upgrade for more.`, 403);
    const resume = await Resume.create({ ...req.body, user: req.user._id });
    await User.findByIdAndUpdate(req.user._id, { $inc: { resumeCount: 1 } });
    res.status(201).json({ message: 'Resume created', resume });
  } catch (err) { next(err); }
};

const updateResume = async (req, res, next) => {
  try {
    const resume = await Resume.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id, isDeleted: false },
      req.body, { new: true, runValidators: true }
    );
    if (!resume) throw new AppError('Resume not found.', 404);
    res.json({ message: 'Resume updated', resume });
  } catch (err) { next(err); }
};

const deleteResume = async (req, res, next) => {
  try {
    const resume = await Resume.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id, isDeleted: false },
      { isDeleted: true, deletedAt: new Date() }, { new: true }
    );
    if (!resume) throw new AppError('Resume not found.', 404);
    await User.findByIdAndUpdate(req.user._id, { $inc: { resumeCount: -1 } });
    res.json({ message: 'Resume deleted' });
  } catch (err) { next(err); }
};

const duplicateResume = async (req, res, next) => {
  try {
    const original = await Resume.findOne({ _id: req.params.id, user: req.user._id, isDeleted: false });
    if (!original) throw new AppError('Resume not found.', 404);
    const data = original.toObject();
    delete data._id; delete data.createdAt; delete data.updatedAt; delete data.__v;
    data.title = `${data.title} (Copy)`; data.downloadCount = 0;
    const copy = await Resume.create(data);
    res.status(201).json({ message: 'Resume duplicated', resume: copy });
  } catch (err) { next(err); }
};

module.exports = { getResumes, getResume, createResume, updateResume, deleteResume, duplicateResume };
