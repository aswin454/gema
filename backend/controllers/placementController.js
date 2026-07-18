const Placement = require('../models/Placement');
const Student = require('../models/Student');
const { getDBMode, getStore } = require('../config/db');
const { analyzeResume, generateMockQuestions } = require('../services/aiService');
const { createServerNotification } = require('../services/notificationService');

/**
 * Get Placement Opportunities
 * Route: GET /api/placements
 */
const getPlacements = async (req, res) => {
  try {
    const userId = req.user._id.toString();

    if (getDBMode()) {
      const store = getStore();
      const list = store.placements.map(p => {
        const myApplication = p.applications.find(a => a.student.toString() === userId);
        return {
          ...p,
          myApplication: myApplication || null
        };
      });
      res.json(list);
    } else {
      const rawList = await Placement.find().sort({ deadline: 1 });
      const list = rawList.map(p => {
        const myApplication = p.applications.find(a => a.student.toString() === req.user._id.toString());
        return {
          ...p.toObject(),
          myApplication: myApplication || null
        };
      });
      res.json(list);
    }
  } catch (error) {
    console.error('Fetch Placements Error:', error.message);
    res.status(500).json({ message: 'Failed to retrieve placements list, internal server error' });
  }
};

/**
 * Create New Placement Posting (Admin/Faculty Only)
 * Route: POST /api/placements
 */
const createPlacement = async (req, res) => {
  const { company, role, description, requirements, ctc, deadline } = req.body;

  try {
    if (!company || !role || !description || !requirements || !ctc || !deadline) {
      return res.status(400).json({ message: 'All posting details are required' });
    }

    if (getDBMode()) {
      const store = getStore();
      const newPlacement = {
        _id: new Date().getTime().toString(),
        company,
        role,
        description,
        requirements,
        ctc,
        deadline: new Date(deadline),
        applications: [],
        createdAt: new Date()
      };

      store.placements.push(newPlacement);

      // Broadcast notification
      await createServerNotification({
        recipient: null, // Broadcast to all users
        title: 'New Placement Drive Posted',
        message: `${company} is recruiting for "${role}" offering ${ctc}. Deadline to apply is ${new Date(deadline).toLocaleDateString()}.`,
        type: 'announcement'
      });

      res.status(201).json({ message: 'Placement posting created successfully', placement: newPlacement });
    } else {
      const placement = await Placement.create({
        company,
        role,
        description,
        requirements,
        ctc,
        deadline: new Date(deadline)
      });

      // Broadcast notification
      await createServerNotification({
        recipient: null,
        title: 'New Placement Drive Posted',
        message: `${company} is recruiting for "${role}" with package ${ctc}. Deadline: ${new Date(deadline).toLocaleDateString()}.`,
        type: 'announcement'
      });

      res.status(201).json({ message: 'Placement posting created successfully', placement });
    }
  } catch (error) {
    console.error('Create Placement Error:', error.message);
    res.status(500).json({ message: 'Failed to create placement posting, internal server error' });
  }
};

/**
 * Apply for a Placement Drive (and trigger AI Resume Analysis & Mock Interview Generation)
 * Route: POST /api/placements/:id/apply
 */
const applyPlacement = async (req, res) => {
  const placementId = req.params.id;
  const { resumeText, resumeUrl } = req.body; // Can accept text input for direct analysis

  try {
    const studentId = req.user._id.toString();
    const mockResume = resumeText || "Student resume with qualifications in Full Stack Development, React.js, Express, and Database schemas.";

    if (getDBMode()) {
      const store = getStore();
      const placementIndex = store.placements.findIndex(p => p._id.toString() === placementId.toString());

      if (placementIndex === -1) {
        return res.status(404).json({ message: 'Placement drive not found' });
      }

      const placement = store.placements[placementIndex];
      
      // Prevent duplicates
      const alreadyApplied = placement.applications.some(a => a.student.toString() === studentId);
      if (alreadyApplied) {
        return res.status(400).json({ message: 'You have already applied for this placement' });
      }

      // Analyze resume and generate questions via AI service
      const aiAnalysisResult = await analyzeResume(mockResume, placement);
      const aiQuestionsResult = await generateMockQuestions(placement);

      const application = {
        _id: new Date().getTime().toString(),
        student: studentId,
        resumeUrl: resumeUrl || 'https://campusone.ai/uploads/resumes/mock-resume.pdf',
        status: 'Applied',
        aiResumeAnalysis: aiAnalysisResult,
        aiMockQuestions: aiQuestionsResult,
        appliedAt: new Date()
      };

      placement.applications.push(application);
      store.placements[placementIndex] = placement;

      res.status(201).json({
        message: 'Application submitted successfully with AI resume review.',
        application
      });
    } else {
      const placement = await Placement.findById(placementId);
      if (!placement) {
        return res.status(404).json({ message: 'Placement drive not found' });
      }

      const alreadyApplied = placement.applications.some(a => a.student.toString() === studentId);
      if (alreadyApplied) {
        return res.status(400).json({ message: 'You have already applied for this placement' });
      }

      const aiAnalysisResult = await analyzeResume(mockResume, placement);
      const aiQuestionsResult = await generateMockQuestions(placement);

      const application = {
        student: req.user._id,
        resumeUrl: resumeUrl || 'https://campusone.ai/uploads/resumes/mock-resume.pdf',
        status: 'Applied',
        aiResumeAnalysis: aiAnalysisResult,
        aiMockQuestions: aiQuestionsResult
      };

      placement.applications.push(application);
      await placement.save();

      res.status(201).json({
        message: 'Application submitted successfully with AI resume review.',
        application
      });
    }
  } catch (error) {
    console.error('Apply Placement Error:', error.message);
    res.status(500).json({ message: 'Failed to apply for placement drive, internal server error' });
  }
};

module.exports = {
  getPlacements,
  createPlacement,
  applyPlacement
};
