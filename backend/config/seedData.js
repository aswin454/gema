const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Student = require('../models/Student');
const Course = require('../models/Course');
const Assignment = require('../models/Assignment');
const Complaint = require('../models/Complaint');
const Placement = require('../models/Placement');
const Attendance = require('../models/Attendance');
const Notification = require('../models/Notification');
const { getDBMode, getStore } = require('./db');

const getSeedData = async () => {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('password123', salt);

  // 1. Mock Users
  const users = [
    {
      _id: 'user_admin_01',
      name: 'Dr. Sarah Jenkins',
      email: 'admin@campusone.ai',
      password: hashedPassword,
      role: 'admin',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=SarahJenkins',
      createdAt: new Date()
    },
    {
      _id: 'user_faculty_01',
      name: 'Prof. Alan Turing',
      email: 'faculty@campusone.ai',
      password: hashedPassword,
      role: 'faculty',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AlanTuring',
      createdAt: new Date()
    },
    {
      _id: 'user_student_01',
      name: 'Alex Mercer',
      email: 'student@campusone.ai',
      password: hashedPassword,
      role: 'student',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AlexMercer',
      createdAt: new Date()
    }
  ];

  // 2. Student Details
  const students = [
    {
      _id: 'student_details_01',
      user: 'user_student_01',
      rollNo: 'CS-2023-042',
      department: 'Computer Science',
      semester: 6,
      hostelBlock: 'Block B',
      hostelRoom: '405',
      attendancePercentage: 74, // Below 75% for trigger demo
      updatedAt: new Date()
    }
  ];

  // 3. Courses
  const courses = [
    {
      _id: 'course_01',
      code: 'CS-301',
      name: 'Advanced Web Engineering',
      faculty: 'user_faculty_01',
      department: 'Computer Science',
      semester: 6,
      credits: 4,
      schedule: [
        { day: 'Monday', time: '09:00 AM - 10:00 AM', room: 'LHC-101' },
        { day: 'Wednesday', time: '09:00 AM - 10:00 AM', room: 'LHC-101' }
      ]
    },
    {
      _id: 'course_02',
      code: 'CS-302',
      name: 'Database Architecture',
      faculty: 'user_faculty_01',
      department: 'Computer Science',
      semester: 6,
      credits: 4,
      schedule: [
        { day: 'Tuesday', time: '11:00 AM - 12:00 PM', room: 'Lab-3' },
        { day: 'Thursday', time: '11:00 AM - 12:00 PM', room: 'Lab-3' }
      ]
    },
    {
      _id: 'course_03',
      code: 'CS-303',
      name: 'Artificial Intelligence',
      faculty: 'user_faculty_01',
      department: 'Computer Science',
      semester: 6,
      credits: 3,
      schedule: [
        { day: 'Monday', time: '02:00 PM - 03:00 PM', room: 'LHC-202' },
        { day: 'Friday', time: '10:00 AM - 11:00 AM', room: 'LHC-202' }
      ]
    },
    {
      _id: 'course_04',
      code: 'CS-304',
      name: 'Cloud Computing Infrastructure',
      faculty: 'user_faculty_01',
      department: 'Computer Science',
      semester: 6,
      credits: 3,
      schedule: [
        { day: 'Wednesday', time: '11:00 AM - 12:00 PM', room: 'LHC-301' },
        { day: 'Friday', time: '11:00 AM - 12:00 PM', room: 'LHC-301' }
      ]
    },
    {
      _id: 'course_05',
      code: 'CS-305',
      name: 'Cyber Security & Cryptography',
      faculty: 'user_faculty_01',
      department: 'Computer Science',
      semester: 6,
      credits: 4,
      schedule: [
        { day: 'Tuesday', time: '02:00 PM - 03:00 PM', room: 'Lab-4' },
        { day: 'Thursday', time: '02:00 PM - 03:00 PM', room: 'Lab-4' }
      ]
    }
  ];

  // 4. Assignments
  const assignments = [
    {
      _id: 'assignment_01',
      title: 'Full Stack MERN Architecture Project',
      description: 'Implement a comprehensive REST API server connecting to React via Axios. Ensure input validation, proper routing, and authentication wrappers are in place.',
      course: 'course_01',
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5), // 5 days from now
      maxMarks: 100,
      submissions: [],
      aiStudyTips: `### AI Recommended Study Roadmap
1.  **Backend Setup (Day 1-2):** Model definitions and routing. Use JWT for authentication.
2.  **Frontend Interface (Day 3):** Glassmorphic state and API connecting.
3.  **Refinement & Verification (Day 4-5):** Clean layout, input validations, error logs.`,
      createdAt: new Date()
    },
    {
      _id: 'assignment_02',
      title: 'SQL Optimizer & Query Execution Plans',
      description: 'Design and test complex SQL join execution trees. Evaluate latency variations before and after indexing columns.',
      course: 'course_02',
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 10), // 10 days from now
      maxMarks: 50,
      submissions: [],
      aiStudyTips: `### SQL Optimization Tips
*   Understand indexing structures (B-Trees vs Hash maps).
*   Test with \`EXPLAIN ANALYZE\` commands on standard PostgreSQL database.`,
      createdAt: new Date()
    }
  ];

  // 5. Attendance Records (CS-2023-042 attendance logs)
  const attendance = [
    { _id: 'att_01', student: 'user_student_01', course: 'course_01', date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4), status: 'Present', notes: 'Attended session' },
    { _id: 'att_02', student: 'user_student_01', course: 'course_01', date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), status: 'Absent', notes: 'Medical emergency leave' },
    { _id: 'att_03', student: 'user_student_01', course: 'course_01', date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1), status: 'Present', notes: '' },
    
    { _id: 'att_04', student: 'user_student_01', course: 'course_02', date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), status: 'Present', notes: '' },
    { _id: 'att_05', student: 'user_student_01', course: 'course_02', date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), status: 'Present', notes: '' },
    
    { _id: 'att_06', student: 'user_student_01', course: 'course_03', date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), status: 'Absent', notes: 'Missed bus' },
    { _id: 'att_07', student: 'user_student_01', course: 'course_03', date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1), status: 'Late', notes: 'Arrived 10m late' },

    { _id: 'att_08', student: 'user_student_01', course: 'course_04', date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), status: 'Present', notes: 'Introduction class' },
    { _id: 'att_09', student: 'user_student_01', course: 'course_04', date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4), status: 'Absent', notes: 'Missed session' },
    { _id: 'att_10', student: 'user_student_01', course: 'course_04', date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), status: 'Present', notes: '' },
    { _id: 'att_11', student: 'user_student_01', course: 'course_04', date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1), status: 'Absent', notes: '' },

    { _id: 'att_12', student: 'user_student_01', course: 'course_05', date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6), status: 'Present', notes: '' },
    { _id: 'att_13', student: 'user_student_01', course: 'course_05', date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), status: 'Present', notes: '' },
    { _id: 'att_14', student: 'user_student_01', course: 'course_05', date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4), status: 'Present', notes: '' },
    { _id: 'att_15', student: 'user_student_01', course: 'course_05', date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), status: 'Present', notes: '' },
    { _id: 'att_16', student: 'user_student_01', course: 'course_05', date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), status: 'Absent', notes: 'Sickness' },
    { _id: 'att_17', student: 'user_student_01', course: 'course_05', date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1), status: 'Present', notes: '' }
  ];

  // 6. Placement Postings
  const placements = [
    {
      _id: 'placement_01',
      company: 'Vercel Inc.',
      role: 'Frontend Systems Engineer',
      description: 'We are looking for Engineers to build modern reactive application runtimes, optimizing page rendering speeds and compiling build processes.',
      requirements: 'Expertise in React, Next.js, Webpack, and Tailwind CSS. Portfolio of projects.',
      ctc: '22 LPA',
      deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 15), // 15 days out
      applications: [],
      createdAt: new Date()
    },
    {
      _id: 'placement_02',
      company: 'Google',
      role: 'Associate Software Engineer',
      description: 'Join the Core engineering group working on high-performance computational problems, distributed databases, and core AI algorithms.',
      requirements: 'Excellent DS/Algo foundations. Python, Java, or C++ proficiency. CGPA > 8.0.',
      ctc: '36 LPA',
      deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 8), // 8 days out
      applications: [],
      createdAt: new Date()
    }
  ];

  // 7. Complaints
  const complaints = [
    {
      _id: 'complaint_01',
      student: 'user_student_01',
      title: 'Slow Hostel Wi-Fi Connection',
      description: 'Wi-Fi speeds in Hostel Block B, room 405 are consistently below 1Mbps. It is making it impossible to stream tutorial videos or push code commits to GitHub.',
      category: 'Infrastructure',
      imageUrl: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=400&q=80',
      status: 'In Progress',
      department: 'IT Helpdesk & Networks',
      adminRemarks: 'Assigned network engineer to check access points in Block B corridors.',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1)
    }
  ];

  // 8. Notifications
  const notifications = [
    {
      _id: 'notif_01',
      recipient: null,
      title: 'End-Semester Exam Registration Open',
      message: 'All students are requested to complete exam registrations and settle outstanding dues by July 31, 2026.',
      type: 'announcement',
      readBy: [],
      createdAt: new Date()
    },
    {
      _id: 'notif_02',
      recipient: 'user_student_01',
      title: 'Low Attendance Alert',
      message: 'Your attendance is at 74%, which is below the mandatory 75% requirements. Make sure to attend upcoming lectures.',
      type: 'warning',
      readBy: [],
      createdAt: new Date()
    }
  ];

  return { users, students, courses, assignments, attendance, placements, complaints, notifications };
};

/**
 * Main Seed trigger
 */
const seedDatabase = async () => {
  const data = await getSeedData();

  if (getDBMode()) {
    console.log('Seeding IN-MEMORY database...');
    const store = getStore();
    
    // Assign collections directly
    store.users = data.users;
    store.students = data.students;
    store.courses = data.courses;
    store.assignments = data.assignments;
    store.attendance = data.attendance;
    store.placements = data.placements;
    store.complaints = data.complaints;
    store.notifications = data.notifications;
    
    console.log('IN-MEMORY seeding completed successfully.');
  } else {
    try {
      console.log('Checking MongoDB database for seeding...');
      const userCount = await User.countDocuments();
      if (userCount === 0) {
        console.log('MongoDB is empty. Seeding database...');
        
        await User.insertMany(data.users);
        await Student.insertMany(data.students);
        await Course.insertMany(data.courses);
        await Assignment.insertMany(data.assignments);
        await Attendance.insertMany(data.attendance);
        await Placement.insertMany(data.placements);
        await Complaint.insertMany(data.complaints);
        await Notification.insertMany(data.notifications);

        console.log('MongoDB seeded successfully.');
      } else {
        console.log('MongoDB already contains users. Checking for course updates...');
        const courseCount = await Course.countDocuments({ code: 'CS-304' });
        if (courseCount === 0) {
          console.log('New subjects not found in MongoDB. Performing delta update for courses and attendance...');
          
          // Re-insert courses to match the updated list
          await Course.deleteMany({});
          await Course.insertMany(data.courses);
          
          // Re-insert attendance to match updated list
          await Attendance.deleteMany({});
          await Attendance.insertMany(data.attendance);
          
          // Recalculate student attendance percentage
          const studentRecords = await Attendance.find({ student: 'user_student_01' });
          const total = studentRecords.length;
          const present = studentRecords.filter(a => a.status === 'Present' || a.status === 'Late').length;
          const newPct = total > 0 ? Math.round((present / total) * 100) : 100;
          await Student.findOneAndUpdate({ user: 'user_student_01' }, { attendancePercentage: newPct });

          console.log('MongoDB courses, attendance records, and student percentages successfully updated.');
        } else {
          console.log('MongoDB courses and attendance records are already up to date.');
        }
      }
    } catch (error) {
      console.error('Error seeding MongoDB database:', error.message);
    }
  }
};

module.exports = {
  seedDatabase
};
