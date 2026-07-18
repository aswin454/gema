const mongoose = require('mongoose');

const PlacementApplicationSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  resumeUrl: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Applied', 'Shortlisted', 'Interviewing', 'Offered', 'Rejected'],
    default: 'Applied'
  },
  aiResumeAnalysis: {
    type: String,
    default: '' // AI analysis summary, score, suggestions
  },
  aiMockQuestions: [{
    type: String // AI generated customized interview questions
  }],
  appliedAt: {
    type: Date,
    default: Date.now
  }
});

const PlacementSchema = new mongoose.Schema({
  company: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  requirements: {
    type: String,
    required: true // e.g. "CGPA > 8.0, Node.js knowledge"
  },
  ctc: {
    type: String, // e.g. "12 LPA"
    required: true
  },
  deadline: {
    type: Date,
    required: true
  },
  applications: [PlacementApplicationSchema],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Placement', PlacementSchema);
