const Student = require('../models/Student');
const Course = require('../models/Course');
const Assignment = require('../models/Assignment');
const Complaint = require('../models/Complaint');
const Placement = require('../models/Placement');
const Attendance = require('../models/Attendance');
const { getDBMode, getStore } = require('../config/db');

/**
 * Get Student Dashboard Summary
 * Route: GET /api/student/dashboard
 */
const getStudentDashboard = async (req, res) => {
  try {
    const userId = req.user._id.toString();

    if (getDBMode()) {
      const store = getStore();
      const student = store.students.find(s => s.user.toString() === userId);
      if (!student) {
        return res.status(404).json({ message: 'Student profile not found' });
      }

      // 1. Get enrolled courses (all courses for the student's department & semester)
      let courses = store.courses.filter(c => 
        c.department === student.department && c.semester === student.semester
      );
      if (courses.length === 0) {
        // Fallback to department courses to avoid empty dashboard
        courses = store.courses.filter(c => c.department === student.department);
      }
      if (courses.length === 0) {
        // Final fallback: return all courses
        courses = store.courses;
      }

      // 2. Pending Assignments (due date is in the future AND no submission by this student)
      const assignments = store.assignments.filter(a => {
        const isEnrolled = courses.some(c => c._id.toString() === a.course.toString());
        const hasSubmitted = a.submissions.some(s => s.student.toString() === userId);
        return isEnrolled && !hasSubmitted;
      });

      // 3. Complaints summary
      const complaints = store.complaints.filter(c => c.student.toString() === userId);
      const pendingComplaints = complaints.filter(c => c.status === 'Pending').length;
      const resolvedComplaints = complaints.filter(c => c.status === 'Resolved').length;

      // 4. Placements summary
      const activePlacements = store.placements.filter(p => new Date(p.deadline) > new Date()).length;

      // 5. Timetable / Calendar events with dynamic recovery calculators
      const timetable = [];
      courses.forEach(c => {
        const courseRecords = store.attendance.filter(a => a.student.toString() === userId && a.course.toString() === c._id.toString());
        const total = courseRecords.length;
        const present = courseRecords.filter(r => r.status === 'Present' || r.status === 'Late').length;
        const percentage = total > 0 ? Math.round((present / total) * 100) : 100;

        let classesNeeded = 0;
        let tempPresent = present;
        let tempTotal = total;
        if (percentage < 85) {
          while (Math.round((tempPresent / tempTotal) * 100) < 85) {
            tempPresent++;
            tempTotal++;
            classesNeeded++;
          }
        }

        if (c.schedule) {
          c.schedule.forEach(s => {
            timetable.push({
              courseCode: c.code,
              courseName: c.name,
              day: s.day,
              time: s.time,
              room: s.room,
              percentage,
              classesNeededTo85: classesNeeded
            });
          });
        }
      });

      // 6. Attendance Summary
      const studentAttendance = store.attendance.filter(a => a.student.toString() === userId);
      const totalClasses = studentAttendance.length;
      const presentClasses = studentAttendance.filter(a => a.status === 'Present' || a.status === 'Late').length;
      const calculatedAttendance = totalClasses > 0 ? Math.round((presentClasses / totalClasses) * 100) : student.attendancePercentage;

      // 7. AI Recommendations
      let aiRecommendation = "Maintain your study rhythm! All set for the week.";
      if (calculatedAttendance < 85) {
        aiRecommendation = `Alert: Your attendance is at ${calculatedAttendance}%. You need to attend classes consecutively to cross the 85% eligibility threshold.`;
      } else if (assignments.length > 2) {
        aiRecommendation = `You have ${assignments.length} pending assignments. Focus on submitting "${assignments[0].title}" first before the deadline.`;
      } else if (complaints.some(c => c.status === 'In Progress')) {
        aiRecommendation = "Your complaint regarding hostel maintenance is being processed. The Warden has assigned a technician.";
      }

      return res.json({
        profile: {
          name: req.user.name,
          email: req.user.email,
          role: req.user.role,
          avatar: req.user.avatar,
          ...student
        },
        stats: {
          attendance: calculatedAttendance,
          coursesCount: courses.length,
          pendingAssignments: assignments.length,
          totalComplaints: complaints.length,
          resolvedComplaints,
          activePlacements
        },
        timetable,
        recentAssignments: assignments.slice(0, 5),
        aiRecommendation
      });
    } else {
      // MongoDB querying
      const student = await Student.findOne({ user: userId });
      if (!student) {
        return res.status(404).json({ message: 'Student profile not found' });
      }

      // Enrolled courses
      let courses = await Course.find({ 
        department: student.department, 
        semester: student.semester 
      });
      if (courses.length === 0) {
        // Fallback to department courses to avoid empty dashboard
        courses = await Course.find({ department: student.department });
      }
      if (courses.length === 0) {
        // Final fallback: return all courses
        courses = await Course.find({});
      }
      const courseIds = courses.map(c => c._id);

      // Pending assignments
      const pendingAssignments = await Assignment.find({
        course: { $in: courseIds },
        'submissions.student': { $ne: req.user._id },
        dueDate: { $gte: new Date() }
      }).populate('course');

      // Complaints
      const complaints = await Complaint.find({ student: userId });
      const pendingComplaints = complaints.filter(c => c.status === 'Pending').length;
      const resolvedComplaints = complaints.filter(c => c.status === 'Resolved').length;

      // Active Placements
      const activePlacements = await Placement.countDocuments({ deadline: { $gte: new Date() } });

      // Timetable with recovery calculators
      const timetable = [];
      for (let c of courses) {
        const total = await Attendance.countDocuments({ student: req.user._id, course: c._id });
        const present = await Attendance.countDocuments({
          student: req.user._id,
          course: c._id,
          status: { $in: ['Present', 'Late'] }
        });
        const percentage = total > 0 ? Math.round((present / total) * 100) : 100;

        let classesNeeded = 0;
        let tempPresent = present;
        let tempTotal = total;
        if (percentage < 85) {
          while (Math.round((tempPresent / tempTotal) * 100) < 85) {
            tempPresent++;
            tempTotal++;
            classesNeeded++;
          }
        }

        if (c.schedule) {
          c.schedule.forEach(s => {
            timetable.push({
              courseCode: c.code,
              courseName: c.name,
              day: s.day,
              time: s.time,
              room: s.room,
              percentage,
              classesNeededTo85: classesNeeded
            });
          });
        }
      }

      // Attendance calculations
      const studentAttendance = await Attendance.find({ student: userId });
      const totalClasses = studentAttendance.length;
      const presentClasses = studentAttendance.filter(a => a.status === 'Present' || a.status === 'Late').length;
      const calculatedAttendance = totalClasses > 0 ? Math.round((presentClasses / totalClasses) * 100) : student.attendancePercentage;

      // Update student record
      if (calculatedAttendance !== student.attendancePercentage) {
        student.attendancePercentage = calculatedAttendance;
        await student.save();
      }

      let aiRecommendation = "Excellent work! Your academic metrics are in perfect shape.";
      if (calculatedAttendance < 85) {
        aiRecommendation = `Alert: Attendance is at ${calculatedAttendance}%. You must attend the next few lectures of each course to regain 85% exam eligibility.`;
      } else if (pendingAssignments.length > 0) {
        aiRecommendation = `You have ${pendingAssignments.length} upcoming assignment deadlines. Try planning your schedules using the AI Study Planner.`;
      }

      return res.json({
        profile: {
          name: req.user.name,
          email: req.user.email,
          role: req.user.role,
          avatar: req.user.avatar,
          rollNo: student.rollNo,
          department: student.department,
          semester: student.semester,
          hostelBlock: student.hostelBlock,
          hostelRoom: student.hostelRoom,
          attendancePercentage: student.attendancePercentage
        },
        stats: {
          attendance: calculatedAttendance,
          coursesCount: courses.length,
          pendingAssignments: pendingAssignments.length,
          totalComplaints: complaints.length,
          resolvedComplaints,
          activePlacements
        },
        timetable,
        recentAssignments: pendingAssignments.slice(0, 5),
        aiRecommendation
      });
    }
  } catch (error) {
    console.error('Student Dashboard Fetch Error:', error.message);
    res.status(500).json({ message: 'Failed to retrieve dashboard details, internal server error' });
  }
};

module.exports = {
  getStudentDashboard
};
