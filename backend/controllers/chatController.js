const ChatHistory = require('../models/ChatHistory');
const Student = require('../models/Student');
const { getDBMode, getStore } = require('../config/db');
const { queryGlena } = require('../services/aiService');

const getRelatedOptions = (message) => {
  const promptLower = message.toLowerCase().trim();
  let options = [];

  if (promptLower.match(/\b(hi|hello|hey|greetings|welcome|hai)\b/)) {
    options = [
      "My attendance is low. What should I do?",
      "Generate a study plan for this semester.",
      "When are the End-Semester exams scheduled?",
      "How do I file a complaint regarding hostel maintenance?",
      "What scholarships are available and how do I apply?",
      "What are the central library timings?",
      "Who is visiting the campus for recruitment?",
      "When is the deadline for fee payments?"
    ];
  } else if (
    promptLower.includes('attendance') || 
    promptLower.includes('class') || 
    promptLower.includes('recovery') || 
    promptLower.includes('corrections') || 
    promptLower.includes('penalty') || 
    promptLower.includes('marks') || 
    promptLower.includes('medical')
  ) {
    options = [
      "My attendance is low. What should I do?",
      "How do I calculate target recovery classes?",
      "Can I submit a medical certificate for attendance?",
      "Who should I contact for attendance corrections?",
      "What is the penalty for low attendance?",
      "How is internal attendance marks calculated?"
    ];
  } else if (
    promptLower.includes('study') || 
    promptLower.includes('plan') || 
    promptLower.includes('schedule') || 
    promptLower.includes('roadmap') || 
    promptLower.includes('calendar') || 
    promptLower.includes('tips') || 
    promptLower.includes('prep') || 
    promptLower.includes('reference') || 
    promptLower.includes('peer') || 
    promptLower.includes('group') || 
    promptLower.includes('tools')
  ) {
    options = [
      "Generate a study plan for this semester.",
      "Give me exam preparation tips.",
      "Where can I find study reference materials?",
      "How do I join peer study groups?",
      "Can Glena write a daily schedule for me?",
      "What are the recommended study tools?"
    ];
  } else if (
    promptLower.includes('exam') || 
    promptLower.includes('test') || 
    promptLower.includes('timetable') || 
    promptLower.includes('passing') || 
    promptLower.includes('criteria') || 
    promptLower.includes('admit') || 
    promptLower.includes('re-evaluation') || 
    promptLower.includes('re-eval') || 
    promptLower.includes('supplementary') || 
    promptLower.includes('backlog')
  ) {
    options = [
      "When are the End-Semester exams scheduled?",
      "What is the passing criteria for exams?",
      "When will the exam admit card be issued?",
      "How do I apply for re-evaluation?",
      "What happens if I miss an end-semester exam?",
      "Are there supplementary exams available?"
    ];
  } else if (
    promptLower.includes('hostel') || 
    promptLower.includes('mess') || 
    promptLower.includes('warden') || 
    promptLower.includes('room') || 
    promptLower.includes('curfew') || 
    promptLower.includes('timings') || 
    promptLower.includes('guest') || 
    promptLower.includes('maintenance')
  ) {
    options = [
      "How do I file a complaint regarding hostel maintenance?",
      "What is the hostel mess menu?",
      "How do I lodge a maintenance request?",
      "What are the hostel in-out timings?",
      "Can I change my hostel room allocation?",
      "What are the hostel guest policies?"
    ];
  } else if (
    promptLower.includes('scholarship') || 
    promptLower.includes('aid') || 
    promptLower.includes('cgpa') || 
    promptLower.includes('disbursed') || 
    promptLower.includes('documents')
  ) {
    options = [
      "What scholarships are available and how do I apply?",
      "How do I apply for scholarships?",
      "What is the minimum CGPA for scholarships?",
      "What documents are required for scholarships?",
      "When is the scholarship results date?",
      "Are sports scholarships offered?",
      "How is the scholarship amount disbursed?"
    ];
  } else if (
    promptLower.includes('placement') || 
    promptLower.includes('recruitment') || 
    promptLower.includes('recruiter') || 
    promptLower.includes('resume') || 
    promptLower.includes('job') || 
    promptLower.includes('career') || 
    promptLower.includes('interview') || 
    promptLower.includes('package')
  ) {
    options = [
      "Who is visiting the campus for recruitment?",
      "How do I improve my resume match score?",
      "Can I schedule a mock interview?",
      "What companies are visiting this month?",
      "What is the average package for CSE?",
      "Are there off-campus drive referrals?"
    ];
  } else if (
    promptLower.includes('complaint') || 
    promptLower.includes('grievance') || 
    promptLower.includes('ticket') || 
    promptLower.includes('resolution') || 
    promptLower.includes('reopen') || 
    promptLower.includes('photos')
  ) {
    options = [
      "How do I track my active complaint?",
      "How long does it take to resolve a complaint?",
      "Can I upload photos to my complaint?",
      "Who is the chief student grievance officer?",
      "How do I reopen a closed complaint?"
    ];
  } else {
    options = [
      "My attendance is low. What should I do?",
      "Generate a study plan for this semester.",
      "When are the End-Semester exams scheduled?",
      "How do I file a complaint regarding hostel maintenance?",
      "What scholarships are available and how do I apply?",
      "What are the central library timings?",
      "Who is visiting the campus for recruitment?",
      "When is the deadline for fee payments?"
    ];
  }

  // Filter out the exact query so it doesn't suggest itself
  return options.filter(opt => opt.toLowerCase().trim() !== promptLower);
};

/**
 * Send Message to Gemma 4 AI Assistant
 * Route: POST /api/chat
 */
const sendMessage = async (req, res) => {
  const { message } = req.body;
  const userId = req.user._id.toString();

  try {
    if (!message) {
      return res.status(400).json({ message: 'Message content is required' });
    }

    let studentDetails = null;
    let chatRecord = null;

    if (getDBMode()) {
      const store = getStore();
      
      // Load student context details for contextual AI responses
      const studentInfo = store.students.find(s => s.user.toString() === userId);
      if (studentInfo) {
        studentDetails = {
          name: req.user.name,
          rollNo: studentInfo.rollNo,
          department: studentInfo.department,
          semester: studentInfo.semester,
          attendancePercentage: studentInfo.attendancePercentage,
          hostelBlock: studentInfo.hostelBlock,
          hostelRoom: studentInfo.hostelRoom
        };
      }

      // Load previous chat history
      chatRecord = store.chatHistory.find(ch => ch.student.toString() === userId);
      if (!chatRecord) {
        chatRecord = {
          _id: new Date().getTime().toString(),
          student: userId,
          messages: [],
          updatedAt: new Date()
        };
        store.chatHistory.push(chatRecord);
      }

      // Send chat messages to AI with context
      const aiResponseContent = await queryGlena(message, chatRecord.messages, studentDetails);

      // Determine related follow-up options dynamically
      const options = getRelatedOptions(message);

      // Save to chat record
      chatRecord.messages.push({ role: 'user', content: message, timestamp: new Date() });
      chatRecord.messages.push({ role: 'assistant', content: aiResponseContent, options, timestamp: new Date() });
      chatRecord.updatedAt = new Date();

      res.json({
        response: aiResponseContent,
        history: chatRecord.messages
      });
    } else {
      // MongoDB Mode
      const studentInfo = await Student.findOne({ user: req.user._id });
      if (studentInfo) {
        studentDetails = {
          name: req.user.name,
          rollNo: studentInfo.rollNo,
          department: studentInfo.department,
          semester: studentInfo.semester,
          attendancePercentage: studentInfo.attendancePercentage,
          hostelBlock: studentInfo.hostelBlock,
          hostelRoom: studentInfo.hostelRoom
        };
      }

      chatRecord = await ChatHistory.findOne({ student: req.user._id });
      if (!chatRecord) {
        chatRecord = await ChatHistory.create({ student: req.user._id, messages: [] });
      }

      const aiResponseContent = await queryGlena(message, chatRecord.messages, studentDetails);

      // Determine related follow-up options dynamically
      const options = getRelatedOptions(message);

      chatRecord.messages.push({ role: 'user', content: message });
      chatRecord.messages.push({ role: 'assistant', content: aiResponseContent, options });
      chatRecord.updatedAt = new Date();
      await chatRecord.save();

      res.json({
        response: aiResponseContent,
        history: chatRecord.messages
      });
    }
  } catch (error) {
    console.error('AI Chat Error:', error.message);
    res.status(500).json({ message: 'AI chat transaction failed, internal server error' });
  }
};

/**
 * Get Student Chat History
 * Route: GET /api/chat
 */
const getChatHistory = async (req, res) => {
  try {
    const userId = req.user._id.toString();

    if (getDBMode()) {
      const store = getStore();
      const chatRecord = store.chatHistory.find(ch => ch.student.toString() === userId);
      res.json(chatRecord ? chatRecord.messages : []);
    } else {
      const chatRecord = await ChatHistory.findOne({ student: req.user._id });
      res.json(chatRecord ? chatRecord.messages : []);
    }
  } catch (error) {
    console.error('Fetch Chat History Error:', error.message);
    res.status(500).json({ message: 'Failed to retrieve chat history, internal server error' });
  }
};

/**
 * Clear Student Chat History
 * Route: DELETE /api/chat
 */
const clearChatHistory = async (req, res) => {
  try {
    const userId = req.user._id.toString();

    if (getDBMode()) {
      const store = getStore();
      const chatRecord = store.chatHistory.find(ch => ch.student.toString() === userId);
      if (chatRecord) {
        chatRecord.messages = [];
        chatRecord.updatedAt = new Date();
      }
      res.json({ message: 'Chat history cleared successfully' });
    } else {
      const chatRecord = await ChatHistory.findOne({ student: req.user._id });
      if (chatRecord) {
        chatRecord.messages = [];
        chatRecord.updatedAt = new Date();
        await chatRecord.save();
      }
      res.json({ message: 'Chat history cleared successfully' });
    }
  } catch (error) {
    console.error('Clear Chat History Error:', error.message);
    res.status(500).json({ message: 'Failed to clear chat history, internal server error' });
  }
};

module.exports = {
  sendMessage,
  getChatHistory,
  clearChatHistory
};
