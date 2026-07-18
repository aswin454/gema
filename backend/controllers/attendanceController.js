const Attendance = require('../models/Attendance');
const Course = require('../models/Course');
const Student = require('../models/Student');
const { getDBMode, getStore } = require('../config/db');

/**
 * Get Student Attendance Records and Calculator Metrics
 * Route: GET /api/attendance
 */
const getAttendance = async (req, res) => {
  try {
    const userId = req.user._id.toString();

    if (getDBMode()) {
      const store = getStore();
      let records = [];
      let department = 'Computer Science';
      let semester = 1;

      if (req.user.role === 'student') {
        records = store.attendance.filter(a => a.student.toString() === userId);
        const studentInfo = store.students.find(s => s.user.toString() === userId);
        if (studentInfo) {
          department = studentInfo.department;
          semester = studentInfo.semester;
        }
      } else {
        // Faculty / Admin gets all records
        records = store.attendance;
      }

      // Map courses metadata
      const mappedRecords = records.map(r => {
        const course = store.courses.find(c => c._id.toString() === r.course.toString());
        return {
          ...r,
          courseName: course ? course.name : 'Unknown Subject',
          courseCode: course ? course.code : 'SUB-000'
        };
      });

      // Calculate stats per course for student
      let courseSummaries = [];
      if (req.user.role === 'student') {
        const studentCourses = store.courses.filter(c => c.department === department && c.semester === semester);
        
        studentCourses.forEach(c => {
          const courseRecords = mappedRecords.filter(r => r.course.toString() === c._id.toString());
          const total = courseRecords.length;
          const present = courseRecords.filter(r => r.status === 'Present' || r.status === 'Late').length;
          const percentage = total > 0 ? Math.round((present / total) * 100) : 100;
          
          // Required Classes calculator (Target 85%)
          let classesNeeded = 0;
          let currentPct = percentage;
          let tempPresent = present;
          let tempTotal = total;

          if (currentPct < 85) {
            while (Math.round((tempPresent / tempTotal) * 100) < 85) {
              tempPresent++;
              tempTotal++;
              classesNeeded++;
            }
          }

          courseSummaries.push({
            courseId: c._id,
            courseName: c.name,
            courseCode: c.code,
            credits: c.credits,
            total,
            present,
            absent: total - present,
            percentage,
            classesNeededTo85: classesNeeded
          });
        });
      }

      res.json({
        records: mappedRecords,
        courseSummaries
      });
    } else {
      let recordsQuery = {};
      let studentProfile = null;

      if (req.user.role === 'student') {
        recordsQuery.student = req.user._id;
        studentProfile = await Student.findOne({ user: req.user._id });
      }

      const records = await Attendance.find(recordsQuery)
        .populate('course')
        .populate('student', 'name email')
        .sort({ date: -1 });

      let courseSummaries = [];
      if (req.user.role === 'student' && studentProfile) {
        const courses = await Course.find({
          department: studentProfile.department,
          semester: studentProfile.semester
        });

        for (let c of courses) {
          const total = await Attendance.countDocuments({ student: req.user._id, course: c._id });
          const present = await Attendance.countDocuments({
            student: req.user._id,
            course: c._id,
            status: { $in: ['Present', 'Late'] }
          });
          const percentage = total > 0 ? Math.round((present / total) * 100) : 100;

          // Attendance recovery calculator (Target 85%)
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

          courseSummaries.push({
            courseId: c._id,
            courseName: c.name,
            courseCode: c.code,
            credits: c.credits,
            total,
            present,
            absent: total - present,
            percentage,
            classesNeededTo85: classesNeeded
          });
        }
      }

      res.json({
        records,
        courseSummaries
      });
    }
  } catch (error) {
    console.error('Fetch Attendance Error:', error.message);
    res.status(500).json({ message: 'Failed to retrieve attendance log, internal server error' });
  }
};

/**
 * Log Attendance (Faculty Only)
 * Route: POST /api/attendance
 */
const postAttendance = async (req, res) => {
  const { studentId, courseId, date, status, notes } = req.body;

  try {
    const formattedDate = date ? new Date(date) : new Date();
    // Normalize date to remove hours/minutes for daily unique attendance constraint
    formattedDate.setHours(0, 0, 0, 0);

    if (getDBMode()) {
      const store = getStore();
      
      // Check if attendance already logged today
      const alreadyLoggedIndex = store.attendance.findIndex(a => {
        const sameStudent = a.student.toString() === studentId.toString();
        const sameCourse = a.course.toString() === courseId.toString();
        const d1 = new Date(a.date);
        d1.setHours(0, 0, 0, 0);
        return sameStudent && sameCourse && d1.getTime() === formattedDate.getTime();
      });

      const newRecord = {
        _id: alreadyLoggedIndex >= 0 ? store.attendance[alreadyLoggedIndex]._id : new Date().getTime().toString(),
        student: studentId,
        course: courseId,
        date: formattedDate,
        status: status || 'Present',
        notes: notes || ''
      };

      if (alreadyLoggedIndex >= 0) {
        store.attendance[alreadyLoggedIndex] = newRecord;
      } else {
        store.attendance.push(newRecord);
      }

      // Re-calculate the student overall attendance percentage and update profile
      const studentRecords = store.attendance.filter(a => a.student.toString() === studentId.toString());
      const total = studentRecords.length;
      const present = studentRecords.filter(a => a.status === 'Present' || a.status === 'Late').length;
      const newPct = total > 0 ? Math.round((present / total) * 100) : 100;

      const studentIndex = store.students.findIndex(s => s.user.toString() === studentId.toString());
      if (studentIndex >= 0) {
        store.students[studentIndex].attendancePercentage = newPct;
      }

      res.status(201).json({ message: 'Attendance updated successfully', record: newRecord });
    } else {
      // Find and update or create
      const query = { student: studentId, course: courseId, date: formattedDate };
      const update = { status, notes };
      const options = { upsert: true, new: true, setDefaultsOnInsert: true };

      const record = await Attendance.findOneAndUpdate(query, update, options);

      // Recalculate attendance
      const total = await Attendance.countDocuments({ student: studentId });
      const present = await Attendance.countDocuments({
        student: studentId,
        status: { $in: ['Present', 'Late'] }
      });
      const newPct = total > 0 ? Math.round((present / total) * 100) : 100;

      await Student.findOneAndUpdate({ user: studentId }, { attendancePercentage: newPct });

      res.status(201).json({ message: 'Attendance updated successfully', record });
    }
  } catch (error) {
    console.error('Post Attendance Error:', error.message);
    res.status(500).json({ message: 'Failed to update attendance log, internal server error' });
  }
};

module.exports = {
  getAttendance,
  postAttendance
};
