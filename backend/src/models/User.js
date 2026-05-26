const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 8, select: false },
  avatar: { type: String, default: null },
  plan: { type: String, enum: ['free', 'pro', 'enterprise'], default: 'free' },
  resumeCount: { type: Number, default: 0 },
  refreshToken: { type: String, select: false },
  lastLogin: { type: Date },
  preferences: {
    theme: { type: String, default: 'dark' },
    defaultTemplate: { type: String, default: 'modern' },
  },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

userSchema.virtual('resumeLimit').get(function () {
  return { free: 3, pro: 20, enterprise: 999 }[this.plan] || 3;
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.password; delete obj.refreshToken;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
