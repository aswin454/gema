const mongoose = require('mongoose');

const ChatMessageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'assistant'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  options: [String],
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const ChatHistorySchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  messages: [ChatMessageSchema],
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('ChatHistory', ChatHistorySchema);
