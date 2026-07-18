const Complaint = require('../models/Complaint');
const User = require('../models/User');
const { getDBMode, getStore } = require('../config/db');

/**
 * Get Complaints List
 * Route: GET /api/complaints
 */
const getComplaints = async (req, res) => {
  try {
    const userId = req.user._id.toString();

    if (getDBMode()) {
      const store = getStore();
      let complaintsList = [];

      if (req.user.role === 'student') {
        complaintsList = store.complaints.filter(c => c.student.toString() === userId);
      } else {
        // Admins and faculty can see all complaints
        complaintsList = store.complaints;
      }

      // Map student profiles
      const mappedComplaints = complaintsList.map(c => {
        const studentInfo = store.users.find(u => u._id.toString() === c.student.toString());
        return {
          ...c,
          studentName: studentInfo ? studentInfo.name : 'Unknown Student',
          studentEmail: studentInfo ? studentInfo.email : ''
        };
      });

      res.json(mappedComplaints);
    } else {
      let query = {};
      if (req.user.role === 'student') {
        query.student = req.user._id;
      }

      const complaintsList = await Complaint.find(query)
        .populate('student', 'name email avatar')
        .sort({ createdAt: -1 });

      res.json(complaintsList);
    }
  } catch (error) {
    console.error('Fetch Complaints Error:', error.message);
    res.status(500).json({ message: 'Failed to retrieve complaints, internal server error' });
  }
};

/**
 * Raise a New Complaint
 * Route: POST /api/complaints
 */
const raiseComplaint = async (req, res) => {
  const { title, description, category, imageUrl } = req.body;

  try {
    if (!title || !description || !category) {
      return res.status(400).json({ message: 'Title, description and category are required' });
    }

    // Default department routing based on category
    let department = 'General Administration';
    if (category === 'Hostel') department = 'Hostel Warden Office';
    else if (category === 'Academics') department = 'Academic Registry';
    else if (category === 'Infrastructure') department = 'Maintenance Department';
    else if (category === 'Finance') department = 'Accounts & Finance';

    if (getDBMode()) {
      const store = getStore();
      const newComplaint = {
        _id: new Date().getTime().toString(),
        student: req.user._id.toString(),
        title,
        description,
        category,
        imageUrl: imageUrl || '',
        status: 'Pending',
        department,
        adminRemarks: '',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      store.complaints.push(newComplaint);

      // Create a student announcement notification if Socket.IO is attached (handled in server)
      res.status(201).json({
        message: 'Complaint lodged successfully',
        complaint: {
          ...newComplaint,
          studentName: req.user.name,
          studentEmail: req.user.email
        }
      });
    } else {
      const newComplaint = await Complaint.create({
        student: req.user._id,
        title,
        description,
        category,
        imageUrl: imageUrl || '',
        department
      });

      const populatedComplaint = await Complaint.findById(newComplaint._id).populate('student', 'name email avatar');

      res.status(201).json({
        message: 'Complaint lodged successfully',
        complaint: populatedComplaint
      });
    }
  } catch (error) {
    console.error('Raise Complaint Error:', error.message);
    res.status(500).json({ message: 'Failed to lodge complaint, internal server error' });
  }
};

/**
 * Update Complaint Status / Remarks / Assign Department (Admin/Faculty)
 * Route: PATCH /api/complaints/:id
 */
const updateComplaint = async (req, res) => {
  const complaintId = req.params.id;
  const { status, adminRemarks, department } = req.body;

  try {
    if (getDBMode()) {
      const store = getStore();
      const complaintIndex = store.complaints.findIndex(c => c._id.toString() === complaintId.toString());

      if (complaintIndex === -1) {
        return res.status(404).json({ message: 'Complaint not found' });
      }

      const updatedComplaint = {
        ...store.complaints[complaintIndex],
        updatedAt: new Date()
      };

      if (status) updatedComplaint.status = status;
      if (adminRemarks !== undefined) updatedComplaint.adminRemarks = adminRemarks;
      if (department) updatedComplaint.department = department;

      store.complaints[complaintIndex] = updatedComplaint;

      // Add a notification for the student
      const notification = {
        _id: new Date().getTime().toString(),
        recipient: updatedComplaint.student,
        title: `Complaint Status Updated`,
        message: `Your complaint regarding "${updatedComplaint.title}" status is now "${updatedComplaint.status}".`,
        type: updatedComplaint.status === 'Resolved' ? 'success' : 'info',
        readBy: [],
        createdAt: new Date()
      };
      store.notifications.push(notification);

      const studentUser = store.users.find(u => u._id.toString() === updatedComplaint.student.toString());
      res.json({
        message: 'Complaint updated successfully',
        complaint: {
          ...updatedComplaint,
          studentName: studentUser ? studentUser.name : 'Unknown Student',
          studentEmail: studentUser ? studentUser.email : ''
        }
      });
    } else {
      const complaint = await Complaint.findById(complaintId);
      if (!complaint) {
        return res.status(404).json({ message: 'Complaint not found' });
      }

      if (status) complaint.status = status;
      if (adminRemarks !== undefined) complaint.adminRemarks = adminRemarks;
      if (department) complaint.department = department;
      complaint.updatedAt = new Date();

      await complaint.save();

      // Create notification
      const { createServerNotification } = require('../services/notificationService');
      await createServerNotification({
        recipient: complaint.student,
        title: `Complaint Status Updated`,
        message: `Your complaint regarding "${complaint.title}" status is now "${complaint.status}".`,
        type: complaint.status === 'Resolved' ? 'success' : 'info'
      });

      const populatedComplaint = await Complaint.findById(complaintId).populate('student', 'name email avatar');
      res.json({
        message: 'Complaint updated successfully',
        complaint: populatedComplaint
      });
    }
  } catch (error) {
    console.error('Update Complaint Error:', error.message);
    res.status(500).json({ message: 'Failed to update complaint, internal server error' });
  }
};

module.exports = {
  getComplaints,
  raiseComplaint,
  updateComplaint
};
