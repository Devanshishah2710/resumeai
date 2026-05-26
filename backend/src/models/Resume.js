const mongoose = require('mongoose');

const experienceSchema = new mongoose.Schema({
  company: { type: String, trim: true },
  role: { type: String, trim: true },
  location: { type: String, trim: true },
  startDate: String, endDate: String,
  current: { type: Boolean, default: false },
  description: { type: String, trim: true },
  bullets: [String],
});

const educationSchema = new mongoose.Schema({
  institution: { type: String, trim: true },
  degree: { type: String, trim: true },
  field: { type: String, trim: true },
  startYear: String, endYear: String,
  gpa: String, honors: String,
});

const projectSchema = new mongoose.Schema({
  name: String, description: String,
  technologies: [String], url: String, github: String,
});

const resumeSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, default: 'My Resume', maxlength: 100 },
  template: { type: String, default: 'modern', enum: ['modern','executive','creative','minimal','academic','startup'] },
  templateColor: { type: String, default: '#3B82F6' },
  personal: {
    name: String, email: String, phone: String, location: String,
    linkedin: String, github: String, website: String, title: String, summary: String,
  },
  experience: [experienceSchema],
  education: [educationSchema],
  projects: [projectSchema],
  skills: {
    technical: [String], soft: [String], languages: [String], tools: [String],
  },
  atsScore: { type: Number, min: 0, max: 100 },
  targetRole: String,
  downloadCount: { type: Number, default: 0 },
  lastDownloaded: Date,
  isDeleted: { type: Boolean, default: false },
  deletedAt: Date,
}, { timestamps: true });

resumeSchema.index({ user: 1, createdAt: -1 });

resumeSchema.pre('save', function (next) {
  let score = 0;
  const p = this.personal;
  if (p?.name) score += 10;
  if (p?.email) score += 10;
  if (p?.phone) score += 5;
  if (p?.summary?.length > 50) score += 15;
  if (this.experience?.length > 0) score += 20;
  if (this.education?.length > 0) score += 15;
  const allSkills = [...(this.skills?.technical||[]), ...(this.skills?.soft||[]), ...(this.skills?.tools||[])];
  if (allSkills.length >= 5) score += 15;
  if (this.projects?.length > 0) score += 10;
  this.atsScore = Math.min(score, 100);
  next();
});

module.exports = mongoose.model('Resume', resumeSchema);
