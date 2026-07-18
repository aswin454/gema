const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rollNo: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  department: {
    type: String,
    required: true,
    trim: true
  },
  semester: {
    type: Number,
    required: true,
    default: 1
  },
  hostelBlock: {
    type: String,
    default: 'N/A'
  },
  hostelRoom: {
    type: String,
    default: 'N/A'
  },
  attendancePercentage: {
    type: Number,
    default: 100
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Student', StudentSchema);
