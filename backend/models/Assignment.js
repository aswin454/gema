const mongoose = require('mongoose');

const SubmissionSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['Submitted', 'Graded', 'Late'],
    default: 'Submitted'
  },
  fileUrl: {
    type: String,
    default: ''
  },
  textContent: {
    type: String,
    default: ''
  },
  grade: {
    type: String,
    default: '' // e.g. 'A', 'B', 'Pending'
  },
  feedback: {
    type: String,
    default: ''
  }
});

const AssignmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  dueDate: {
    type: Date,
    required: true
  },
  maxMarks: {
    type: Number,
    default: 100
  },
  submissions: [SubmissionSchema],
  aiStudyTips: {
    type: String,
    default: '' // AI generated study schedule/tips for this assignment
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Assignment', AssignmentSchema);
