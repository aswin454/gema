const express = require('express');
const router = express.Router();

// Middlewares
const { protect, authorize } = require('../middleware/auth');

// Controllers
const { registerUser, loginUser, getUserProfile } = require('../controllers/authController');
const { getStudentDashboard } = require('../controllers/studentController');
const { getAttendance, postAttendance } = require('../controllers/attendanceController');
const { getComplaints, raiseComplaint, updateComplaint } = require('../controllers/complaintController');
const { getAssignments, createAssignment, submitAssignment, gradeAssignment } = require('../controllers/assignmentController');
const { getPlacements, createPlacement, applyPlacement } = require('../controllers/placementController');
const { sendMessage, getChatHistory, clearChatHistory } = require('../controllers/chatController');
const { sendMentalHealthMessage, getMentalHealthHistory, clearMentalHealthHistory } = require('../controllers/mentalHealthController');
const { getNotifications, markAsRead } = require('../controllers/notificationController');
const { optimizeResume } = require('../controllers/resumeController');

// -------------------------------------------------------------
// Authentication Route Definitions
// -------------------------------------------------------------
router.post('/auth/register', registerUser);
router.post('/auth/login', loginUser);
router.get('/student/profile', protect, getUserProfile);

// -------------------------------------------------------------
// Student Dashboard Routing
// -------------------------------------------------------------
router.get('/student/dashboard', protect, getStudentDashboard);

// -------------------------------------------------------------
// Attendance Management Routing
// -------------------------------------------------------------
router.get('/attendance', protect, getAttendance);
router.post('/attendance', protect, authorize('faculty', 'admin'), postAttendance);

// -------------------------------------------------------------
// Complaint / Grievance Management Routing
// -------------------------------------------------------------
router.get('/complaints', protect, getComplaints);
router.post('/complaints', protect, authorize('student'), raiseComplaint);
router.patch('/complaints/:id', protect, authorize('faculty', 'admin'), updateComplaint);

// -------------------------------------------------------------
// Course Assignments Routing
// -------------------------------------------------------------
router.get('/assignments', protect, getAssignments);
router.post('/assignments', protect, authorize('faculty', 'admin'), createAssignment);
router.post('/assignments/:id/submit', protect, authorize('student'), submitAssignment);
router.post('/assignments/:id/grade', protect, authorize('faculty', 'admin'), gradeAssignment);

// -------------------------------------------------------------
// Placement Drive Routing
// -------------------------------------------------------------
router.get('/placements', protect, getPlacements);
router.post('/placements', protect, authorize('admin'), createPlacement);
router.post('/placements/:id/apply', protect, authorize('student'), applyPlacement);

// -------------------------------------------------------------
// Gemma 4 AI Assistant Routing
// -------------------------------------------------------------
router.get('/chat', protect, getChatHistory);
router.post('/chat', protect, sendMessage);
router.delete('/chat', protect, clearChatHistory);

// -------------------------------------------------------------
// Mental Health Support Bot Routing
// -------------------------------------------------------------
router.get('/mental-health', protect, getMentalHealthHistory);
router.post('/mental-health', protect, sendMentalHealthMessage);
router.delete('/mental-health', protect, clearMentalHealthHistory);

// -------------------------------------------------------------
// Notification Services Routing
// -------------------------------------------------------------
router.get('/notifications', protect, getNotifications);
router.post('/notifications/read', protect, markAsRead);

// -------------------------------------------------------------
// Resume Builder Optimization Routing
// -------------------------------------------------------------
router.post('/resume/optimize', protect, optimizeResume);

module.exports = router;
