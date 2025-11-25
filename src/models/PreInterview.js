const mongoose = require('mongoose');

const preInterviewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  // new fields requested
  desiredRole: { type: String },
  industry: { type: String },
  educationLevel: { type: String },
  experienceLevel: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('PreInterview', preInterviewSchema);
