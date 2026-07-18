const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Student = require('../models/Student');
const Course = require('../models/Course');
const Complaint = require('../models/Complaint');
const Placement = require('../models/Placement');
const { getDBMode, getStore } = require('../config/db');

// Helper to generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'campusone_ai_jwt_secret_secure_key_12984712', {
    expiresIn: '30d'
  });
};

/**
 * Register User
 * Route: POST /api/auth/register
 */
const registerUser = async (req, res) => {
  const { name, email, password, role, rollNo, department, semester, hostelBlock, hostelRoom } = req.body;

  try {
    // Check if user already exists
    if (getDBMode()) {
      const store = getStore();
      const existingUser = store.users.find(u => u.email === email.toLowerCase());
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const newUser = {
        _id: new Date().getTime().toString(),
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        role: role || 'student',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
        createdAt: new Date()
      };

      store.users.push(newUser);

      if (newUser.role === 'student') {
        const newStudent = {
          _id: (new Date().getTime() + 1).toString(),
          user: newUser._id,
          rollNo: rollNo || `ROLL-${new Date().getTime().toString().slice(-4)}`,
          department: department || 'Computer Science',
          semester: semester ? Number(semester) : 1,
          hostelBlock: hostelBlock || 'Block A',
          hostelRoom: hostelRoom || '101',
          attendancePercentage: 82, // Seed default attendance
          updatedAt: new Date()
        };
        store.students.push(newStudent);
      }

      res.status(201).json({
        token: generateToken(newUser._id),
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          avatar: newUser.avatar
        }
      });
    } else {
      const userExists = await User.findOne({ email });
      if (userExists) {
        return res.status(400).json({ message: 'User already exists' });
      }

      const user = await User.create({
        name,
        email,
        password,
        role: role || 'student',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`
      });

      if (user.role === 'student') {
        await Student.create({
          user: user._id,
          rollNo: rollNo || `ROLL-${user._id.toString().slice(-4)}`,
          department: department || 'Computer Science',
          semester: semester ? Number(semester) : 1,
          hostelBlock: hostelBlock || 'Block A',
          hostelRoom: hostelRoom || '101',
          attendancePercentage: 82
        });
      }

      res.status(201).json({
        token: generateToken(user._id),
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar
        }
      });
    }
  } catch (error) {
    console.error('Registration Error:', error.message);
    res.status(500).json({ message: 'Registration failed, internal server error' });
  }
};

/**
 * Login User
 * Route: POST /api/auth/login
 */
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (getDBMode()) {
      const store = getStore();
      const user = store.users.find(u => u.email === email.toLowerCase());
      if (!user) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      res.json({
        token: generateToken(user._id),
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar
        }
      });
    } else {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      res.json({
        token: generateToken(user._id),
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar
        }
      });
    }
  } catch (error) {
    console.error('Login Error:', error.message);
    res.status(500).json({ message: 'Login failed, internal server error' });
  }
};

/**
 * Get User Profile
 * Route: GET /api/student/profile
 */
const getUserProfile = async (req, res) => {
  try {
    if (getDBMode()) {
      const store = getStore();
      const user = store.users.find(u => u._id.toString() === req.user._id.toString());
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      let profileData = { ...user };
      delete profileData.password;

      if (user.role === 'student') {
        const studentInfo = store.students.find(s => s.user.toString() === user._id.toString());
        profileData.studentDetails = studentInfo || {};
      }

      res.json(profileData);
    } else {
      const user = await User.findById(req.user._id).select('-password');
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      let profileData = user.toObject();

      if (user.role === 'student') {
        const studentInfo = await Student.findOne({ user: user._id });
        profileData.studentDetails = studentInfo || {};
      }

      res.json(profileData);
    }
  } catch (error) {
    console.error('Get Profile Error:', error.message);
    res.status(500).json({ message: 'Failed to retrieve profile, internal server error' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile
};
