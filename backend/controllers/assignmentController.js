const Assignment = require('../models/Assignment');
const Course = require('../models/Course');
const Student = require('../models/Student');
const { getDBMode, getStore } = require('../config/db');
const { queryGlena } = require('../services/aiService');
const { createServerNotification } = require('../services/notificationService');

/**
 * Get Assignments List
 * Route: GET /api/assignments
 */
const getAssignments = async (req, res) => {
  try {
    const userId = req.user._id.toString();

    if (getDBMode()) {
      const store = getStore();
      let list = [];

      if (req.user.role === 'student') {
        const student = store.students.find(s => s.user.toString() === userId);
        if (student) {
          const courses = store.courses.filter(c => 
            c.department === student.department && c.semester === student.semester
          );
          
          list = store.assignments.filter(a => 
            courses.some(c => c._id.toString() === a.course.toString())
          ).map(a => {
            const course = courses.find(c => c._id.toString() === a.course.toString());
            const submission = a.submissions.find(sub => sub.student.toString() === userId);
            return {
              ...a,
              courseCode: course ? course.code : 'SUB',
              courseName: course ? course.name : 'Unknown Subject',
              mySubmission: submission || null
            };
          });
        }
      } else if (req.user.role === 'faculty') {
        // Faculty gets assignments for their courses
        const courses = store.courses.filter(c => c.faculty.toString() === userId);
        list = store.assignments.filter(a => 
          courses.some(c => c._id.toString() === a.course.toString())
        ).map(a => {
          const course = courses.find(c => c._id.toString() === a.course.toString());
          return {
            ...a,
            courseCode: course ? course.code : 'SUB',
            courseName: course ? course.name : 'Unknown Subject'
          };
        });
      } else {
        // Admin gets everything
        list = store.assignments.map(a => {
          const course = store.courses.find(c => c._id.toString() === a.course.toString());
          return {
            ...a,
            courseCode: course ? course.code : 'SUB',
            courseName: course ? course.name : 'Unknown Subject'
          };
        });
      }

      res.json(list);
    } else {
      let list = [];
      if (req.user.role === 'student') {
        const student = await Student.findOne({ user: req.user._id });
        if (student) {
          const courses = await Course.find({ department: student.department, semester: student.semester });
          const courseIds = courses.map(c => c._id);
          
          const rawList = await Assignment.find({ course: { $in: courseIds } })
            .populate('course')
            .sort({ dueDate: 1 });

          list = rawList.map(a => {
            const submission = a.submissions.find(sub => sub.student.toString() === req.user._id.toString());
            return {
              ...a.toObject(),
              courseCode: a.course.code,
              courseName: a.course.name,
              mySubmission: submission || null
            };
          });
        }
      } else if (req.user.role === 'faculty') {
        const courses = await Course.find({ faculty: req.user._id });
        const courseIds = courses.map(c => c._id);
        list = await Assignment.find({ course: { $in: courseIds } })
          .populate('course')
          .sort({ dueDate: 1 });
      } else {
        list = await Assignment.find()
          .populate('course')
          .sort({ dueDate: 1 });
      }
      res.json(list);
    }
  } catch (error) {
    console.error('Fetch Assignments Error:', error.message);
    res.status(500).json({ message: 'Failed to retrieve assignments list, internal server error' });
  }
};

/**
 * Create New Assignment (Faculty Only)
 * Route: POST /api/assignments
 */
const createAssignment = async (req, res) => {
  const { title, description, courseId, dueDate, maxMarks } = req.body;

  try {
    if (!title || !description || !courseId || !dueDate) {
      return res.status(400).json({ message: 'Title, description, courseId, and dueDate are required' });
    }

    // AI Study Tips generation using Glena
    let aiStudyTips = '';
    try {
      const glenaPrompt = `Generate a short, high-quality, step-by-step academic study schedule and core tips for students working on the following assignment:
Title: ${title}
Task: ${description}
Ensure it is direct, concise, and structured in Markdown format.`;
      aiStudyTips = await queryGlena(glenaPrompt, [], null);
    } catch (e) {
      aiStudyTips = `### AI Study Suggestions for: ${title}
1. **Analyze Requirements**: Understand the prompt requirements completely before coding or writing.
2. **Breakdown Task**: Outline the assignment sections (e.g. Intro, Method, Implementation, Testing).
3. **Reference Sources**: Refer to your class notes from Week 4 and standard textbook chapters.
4. **Time Management**: Dedicate 2 hours to design, 4 hours to coding/writing, and 1 hour to revision.`;
    }

    if (getDBMode()) {
      const store = getStore();
      const newAssignment = {
        _id: new Date().getTime().toString(),
        title,
        description,
        course: courseId,
        dueDate: new Date(dueDate),
        maxMarks: maxMarks ? Number(maxMarks) : 100,
        submissions: [],
        aiStudyTips,
        createdAt: new Date()
      };
      
      store.assignments.push(newAssignment);

      // Create notification for all students enrolled in the course
      const course = store.courses.find(c => c._id.toString() === courseId.toString());
      if (course) {
        const students = store.students.filter(s => s.department === course.department && s.semester === course.semester);
        students.forEach(async (s) => {
          await createServerNotification({
            recipient: s.user,
            title: 'New Assignment Posted',
            message: `A new assignment "${title}" has been posted for course "${course.name}". Due on ${new Date(dueDate).toLocaleDateString()}.`,
            type: 'info'
          });
        });
      }

      res.status(201).json({ message: 'Assignment created successfully', assignment: newAssignment });
    } else {
      const assignment = await Assignment.create({
        title,
        description,
        course: courseId,
        dueDate: new Date(dueDate),
        maxMarks: maxMarks ? Number(maxMarks) : 100,
        aiStudyTips
      });

      // Create notification
      const course = await Course.findById(courseId);
      if (course) {
        const students = await Student.find({ department: course.department, semester: course.semester });
        for (let s of students) {
          await createServerNotification({
            recipient: s.user,
            title: 'New Assignment Posted',
            message: `A new assignment "${title}" has been posted for "${course.name}". Due: ${new Date(dueDate).toLocaleDateString()}.`,
            type: 'info'
          });
        }
      }

      res.status(201).json({ message: 'Assignment created successfully', assignment });
    }
  } catch (error) {
    console.error('Create Assignment Error:', error.message);
    res.status(500).json({ message: 'Failed to create assignment, internal server error' });
  }
};

/**
 * Submit Assignment (Student Only)
 * Route: POST /api/assignments/:id/submit
 */
const submitAssignment = async (req, res) => {
  const assignmentId = req.params.id;
  const { textContent, fileUrl } = req.body;

  try {
    const studentId = req.user._id.toString();

    if (getDBMode()) {
      const store = getStore();
      const assignmentIndex = store.assignments.findIndex(a => a._id.toString() === assignmentId.toString());

      if (assignmentIndex === -1) {
        return res.status(404).json({ message: 'Assignment not found' });
      }

      const assignment = store.assignments[assignmentIndex];
      const isLate = new Date() > new Date(assignment.dueDate);

      const submission = {
        _id: new Date().getTime().toString(),
        student: studentId,
        submittedAt: new Date(),
        status: isLate ? 'Late' : 'Submitted',
        fileUrl: fileUrl || '',
        textContent: textContent || '',
        grade: 'Pending',
        feedback: ''
      };

      // Remove existing submission by same student if any (resubmission)
      assignment.submissions = assignment.submissions.filter(s => s.student.toString() !== studentId);
      assignment.submissions.push(submission);
      store.assignments[assignmentIndex] = assignment;

      res.json({ message: 'Assignment submitted successfully', submission });
    } else {
      const assignment = await Assignment.findById(assignmentId);
      if (!assignment) {
        return res.status(404).json({ message: 'Assignment not found' });
      }

      const isLate = new Date() > new Date(assignment.dueDate);

      const submission = {
        student: req.user._id,
        submittedAt: new Date(),
        status: isLate ? 'Late' : 'Submitted',
        fileUrl: fileUrl || '',
        textContent: textContent || '',
        grade: 'Pending',
        feedback: ''
      };

      // Filter out existing submissions by the same student
      assignment.submissions = assignment.submissions.filter(s => s.student.toString() !== req.user._id.toString());
      assignment.submissions.push(submission);

      await assignment.save();

      res.json({ message: 'Assignment submitted successfully', submission });
    }
  } catch (error) {
    console.error('Submit Assignment Error:', error.message);
    res.status(500).json({ message: 'Failed to submit assignment, internal server error' });
  }
};

/**
 * Grade Submission (Faculty Only)
 * Route: POST /api/assignments/:id/grade
 */
const gradeAssignment = async (req, res) => {
  const assignmentId = req.params.id;
  const { studentId, grade, feedback } = req.body;

  try {
    if (!studentId || !grade) {
      return res.status(400).json({ message: 'StudentId and Grade are required' });
    }

    if (getDBMode()) {
      const store = getStore();
      const assignmentIndex = store.assignments.findIndex(a => a._id.toString() === assignmentId.toString());

      if (assignmentIndex === -1) {
        return res.status(404).json({ message: 'Assignment not found' });
      }

      const assignment = store.assignments[assignmentIndex];
      const submissionIndex = assignment.submissions.findIndex(s => s.student.toString() === studentId.toString());

      if (submissionIndex === -1) {
        return res.status(404).json({ message: 'Submission not found' });
      }

      assignment.submissions[submissionIndex].grade = grade;
      assignment.submissions[submissionIndex].feedback = feedback || '';
      assignment.submissions[submissionIndex].status = 'Graded';

      store.assignments[assignmentIndex] = assignment;

      // Notify student
      await createServerNotification({
        recipient: studentId,
        title: 'Assignment Graded',
        message: `Your submission for "${assignment.title}" has been graded. Grade: ${grade}.`,
        type: 'success'
      });

      res.json({ message: 'Submission graded successfully', submission: assignment.submissions[submissionIndex] });
    } else {
      const assignment = await Assignment.findById(assignmentId);
      if (!assignment) {
        return res.status(404).json({ message: 'Assignment not found' });
      }

      const submission = assignment.submissions.find(s => s.student.toString() === studentId.toString());
      if (!submission) {
        return res.status(404).json({ message: 'Submission not found' });
      }

      submission.grade = grade;
      submission.feedback = feedback || '';
      submission.status = 'Graded';

      await assignment.save();

      // Notify student
      await createServerNotification({
        recipient: studentId,
        title: 'Assignment Graded',
        message: `Your submission for "${assignment.title}" has been graded. Grade: ${grade}.`,
        type: 'success'
      });

      res.json({ message: 'Submission graded successfully', submission });
    }
  } catch (error) {
    console.error('Grade Assignment Error:', error.message);
    res.status(500).json({ message: 'Failed to grade submission, internal server error' });
  }
};

module.exports = {
  getAssignments,
  createAssignment,
  submitAssignment,
  gradeAssignment
};
