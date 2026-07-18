const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  faculty: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  department: {
    type: String,
    required: true
  },
  semester: {
    type: Number,
    required: true
  },
  credits: {
    type: Number,
    default: 4
  },
  schedule: [{
    day: {
      type: String, // e.g., 'Monday', 'Wednesday'
      required: true
    },
    time: {
      type: String, // e.g., '09:00 AM - 10:00 AM'
      required: true
    },
    room: {
      type: String,
      default: 'L-101'
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Course', CourseSchema);
