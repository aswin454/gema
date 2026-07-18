import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { assignmentsAPI } from '../services/api';
import GlassCard from '../components/GlassCard';
import SkeletonLoader from '../components/SkeletonLoader';
import { 
  FileText, 
  Calendar, 
  Award, 
  Sparkles, 
  Send, 
  CheckCircle, 
  Clock, 
  Plus, 
  AlertCircle,
  FolderOpen,
  CheckSquare,
  BookOpen,
  Bookmark,
  ChevronRight,
  TrendingUp,
  Paperclip,
  UploadCloud,
  FileCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';

const Assignments = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);

  // Student submission states
  const [submissionText, setSubmissionText] = useState('');
  const [submissionUrl, setSubmissionUrl] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Sidebar filter
  const [sidebarFilter, setSidebarFilter] = useState('All');

  // Faculty creation states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCourseId, setNewCourseId] = useState('course_01');
  const [newDueDate, setNewDueDate] = useState('');
  const [newMaxMarks, setNewMaxMarks] = useState('100');

  // Faculty grading states
  const [activeSubmission, setActiveSubmission] = useState(null); // { studentId, studentName, text, etc. }
  const [gradeValue, setGradeValue] = useState('A');
  const [feedbackValue, setFeedbackValue] = useState('');

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const response = await assignmentsAPI.get();
      let fetchedAssignments = response.data || [];

      // Populating rich demo assignments if none are returned
      if (fetchedAssignments.length === 0) {
        fetchedAssignments = [
          {
            _id: 'asm_01',
            title: 'Advanced State Management & Performance Optimization',
            description: 'Implement a structured React application leveraging Context API and useReducer. Optimize re-renders using useMemo, useCallback, and React.memo. Profile the application performance using Chrome DevTools React Profiler and supply screenshots along with structural analysis.',
            courseCode: 'CS-301',
            courseName: 'Advanced Web Engineering',
            dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days left
            maxMarks: 100,
            aiStudyTips: '⏱️ **AI Strategy (3 Days Left):**\n1. **Day 1:** Refactor state structure, create useReducer hooks, write memoized selectors.\n2. **Day 2:** Run Chrome Performance check, capture flamecharts before/after.\n3. **Day 3:** Assemble Markdown report and submit repository index.',
            mySubmission: null,
            submissions: []
          },
          {
            _id: 'asm_02',
            title: 'Database Relational Mapping & Query Optimization',
            description: 'Analyze the provided 3NF database schema and design indexes to optimize high-volume JOIN operations. Write advanced PostgreSQL queries utilizing window functions, CTEs (Common Table Expressions), and JSONB operators. Analyze queries using EXPLAIN ANALYZE and document your optimization steps.',
            courseCode: 'CS-302',
            courseName: 'Database Architecture',
            dueDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // Overdue / Graded
            maxMarks: 100,
            aiStudyTips: '⏱️ **Graded Task:**\nThis assignment has been graded. Review faculty comments and target rubrics to understand query performance constraints.',
            mySubmission: {
              status: 'Graded',
              textContent: 'Attached PostgreSQL query optimizations. Handled window function ranking over course entries, reducing query lookup times from 84ms to 2.4ms using custom indexes.',
              fileUrl: 'https://student360.ai/uploads/submissions/pg_optimizer.zip',
              grade: 'A+',
              feedback: 'Exceptional indexing strategy. The EXPLAIN ANALYZE logs demonstrate an outstanding grasp of join-cost variables. Keep it up!',
              submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString()
            },
            submissions: []
          },
          {
            _id: 'asm_03',
            title: 'Machine Learning Classification Pipeline & Fine-tuning',
            description: 'Develop a Python-based ML training pipeline using scikit-learn or PyTorch. Implement a classifier for predicting student placement eligibility based on academic benchmarks. Fine-tune hyperparameters using GridSearch and plot the Confusion Matrix and ROC curve.',
            courseCode: 'CS-303',
            courseName: 'Artificial Intelligence',
            dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 8).toISOString(), // 8 days left
            maxMarks: 100,
            aiStudyTips: '⏱️ **AI Strategy (8 Days Left):**\n- **Milestone 1:** Preprocess the tabular dataset, impute missing metrics, encode categorical traits.\n- **Milestone 2:** Set up classifier pipeline, baseline training accuracy check.\n- **Milestone 3:** Run hyperparameter loops, compile validation curves.',
            mySubmission: null,
            submissions: []
          }
        ];
      }

      setAssignments(fetchedAssignments);
      if (fetchedAssignments.length > 0) {
        setSelectedAssignment(fetchedAssignments[0]);
      }
    } catch (err) {
      console.error('Failed to load assignments:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStudentSubmit = async (e) => {
    e.preventDefault();
    if (!submissionText.trim() && !submissionUrl.trim() && !uploadedFile) return;

    setSubmitLoading(true);
    try {
      const finalUrl = submissionUrl || (uploadedFile ? `https://student360.ai/uploads/submissions/${uploadedFile.name}` : '');
      
      await assignmentsAPI.submit(selectedAssignment._id, {
        textContent: submissionText,
        fileUrl: finalUrl || 'https://student360.ai/uploads/submissions/project.zip'
      });
      
      setSuccessMsg('Assignment submitted successfully!');
      
      // Celebrate with confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.8 },
        colors: ['#3b82f6', '#8b5cf6', '#10b981']
      });

      setSubmissionText('');
      setSubmissionUrl('');
      setUploadedFile(null);
      setUploadProgress(0);
      
      setTimeout(() => setSuccessMsg(''), 4000);
      fetchAssignments();
    } catch (err) {
      console.error('Submission failed:', err.message);
    } finally {
      setSubmitLoading(false);
    }
  };

  // Drag and Drop File Handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      simulateFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      simulateFileUpload(e.target.files[0]);
    }
  };

  const simulateFileUpload = (file) => {
    setUploadedFile({ name: file.name, size: (file.size / 1024 / 1024).toFixed(2) });
    setUploadProgress(10);
    
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 15;
      });
    }, 150);
  };

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDesc.trim() || !newDueDate) return;

    setSubmitLoading(true);
    try {
      await assignmentsAPI.post({
        title: newTitle,
        description: newDesc,
        courseId: newCourseId,
        dueDate: newDueDate,
        maxMarks: Number(newMaxMarks)
      });

      setShowCreateModal(false);
      setNewTitle('');
      setNewDesc('');
      setNewDueDate('');
      fetchAssignments();
    } catch (err) {
      console.error('Create assignment failed:', err.message);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleGradeSubmission = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    try {
      await assignmentsAPI.grade(selectedAssignment._id, {
        studentId: activeSubmission.studentId,
        grade: gradeValue,
        feedback: feedbackValue
      });
      setActiveSubmission(null);
      setFeedbackValue('');
      fetchAssignments();
    } catch (err) {
      console.error('Grading failed:', err.message);
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return <SkeletonLoader type="list" count={4} />;
  }

  // Sidebar Filter Logic
  const filteredAssignments = assignments.filter((a) => {
    if (sidebarFilter === 'All') return true;
    if (sidebarFilter === 'Pending') return !a.mySubmission;
    if (sidebarFilter === 'Submitted') return a.mySubmission && a.mySubmission.status !== 'Graded';
    if (sidebarFilter === 'Graded') return a.mySubmission && a.mySubmission.status === 'Graded';
    return true;
  });

  // Calculate Metrics
  const totalCount = assignments.length;
  const submittedCount = assignments.filter(a => a.mySubmission).length;
  const gradedCount = assignments.filter(a => a.mySubmission?.status === 'Graded').length;
  const pendingCount = totalCount - submittedCount;

  return (
    <div className="space-y-6 select-none animate-in fade-in duration-300">
      
      {/* Top Academic Progress Indicators */}
      {user.role === 'student' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <GlassCard className="p-4 flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <BookOpen size={16} />
            </div>
            <div>
              <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">Assigned Tasks</span>
              <h4 className="text-lg font-bold text-zinc-200">{totalCount}</h4>
            </div>
          </GlassCard>

          <GlassCard className="p-4 flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Clock size={16} className="animate-pulse" />
            </div>
            <div>
              <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">Pending Action</span>
              <h4 className="text-lg font-bold text-amber-400">{pendingCount}</h4>
            </div>
          </GlassCard>

          <GlassCard className="p-4 flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CheckCircle size={16} />
            </div>
            <div>
              <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">Submitted Tasks</span>
              <h4 className="text-lg font-bold text-emerald-400">{submittedCount}</h4>
            </div>
          </GlassCard>

          <GlassCard className="p-4 flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Award size={16} />
            </div>
            <div>
              <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">Evaluated Tasks</span>
              <h4 className="text-lg font-bold text-purple-400">{gradedCount}</h4>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Main Grid: Sidebar List & Detail Pane */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Sidebar List of Assignments */}
        <div className="space-y-4 lg:col-span-1">
          <div className="flex justify-between items-center px-1">
            <h3 className="font-bold text-zinc-200 text-xs uppercase tracking-wider">Classroom Tasks</h3>
            {(user.role === 'faculty' || user.role === 'admin') && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-3 py-1.5 bg-accent-primary hover:opacity-90 active:scale-95 text-white rounded-xl shadow-glow transition-all flex items-center gap-1 text-[10px] font-bold"
              >
                <Plus size={12} /> Post Task
              </button>
            )}
          </div>

          {/* Sidebar Filter Tabs */}
          {user.role === 'student' && (
            <div className="flex bg-zinc-950/60 p-1 rounded-xl border border-zinc-850 justify-between">
              {['All', 'Pending', 'Submitted', 'Graded'].map((f) => (
                <button
                  key={f}
                  onClick={() => setSidebarFilter(f)}
                  className={`px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase transition-all flex-1 ${
                    sidebarFilter === f
                      ? 'bg-zinc-850 text-zinc-100 border border-zinc-800'
                      : 'text-zinc-500 hover:text-zinc-350'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          )}

          {/* List scrollable container */}
          <div className="space-y-3 max-h-[calc(100vh-16rem)] overflow-y-auto pr-1">
            {filteredAssignments.length === 0 ? (
              <div className="text-center py-12 text-zinc-500 text-xs bg-zinc-900/10 border border-zinc-900 rounded-xl">
                No matching tasks found.
              </div>
            ) : (
              filteredAssignments.map((a) => {
                const isSelected = selectedAssignment?._id === a._id;
                let badgeColor = 'bg-zinc-800 border-zinc-700 text-zinc-400';
                let badgeText = 'Pending';
                
                if (user.role === 'student') {
                  const sub = a.mySubmission;
                  if (sub) {
                    if (sub.status === 'Graded') {
                      badgeColor = 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400';
                      badgeText = `Graded (${sub.grade})`;
                    } else {
                      badgeColor = 'bg-accent-primary/10 border-accent-primary/20 text-accent-primary';
                      badgeText = 'Submitted';
                    }
                  }
                }

                return (
                  <div
                    key={a._id}
                    onClick={() => {
                      setSelectedAssignment(a);
                      setActiveSubmission(null);
                    }}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected 
                        ? 'bg-zinc-900 border-accent-primary/45 shadow-glow' 
                        : 'bg-zinc-900/30 border-zinc-800/60 hover:bg-zinc-900/50'
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <span className="text-[9px] font-bold text-zinc-400 bg-zinc-950 border border-zinc-800 px-2 py-0.5 rounded-lg uppercase tracking-wider">
                          {a.courseCode || 'SUB'}
                        </span>
                        {user.role === 'student' && (
                          <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider ${badgeColor}`}>
                            {badgeText}
                          </span>
                        )}
                      </div>
                      <h4 className="font-semibold text-zinc-200 text-xs sm:text-sm mt-3 leading-snug">{a.title}</h4>
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-zinc-850/40">
                      <div className="flex items-center gap-1 text-[9px] text-zinc-500 font-bold">
                        <Calendar size={11} /> Due: {new Date(a.dueDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </div>
                      <ChevronRight size={14} className={`text-zinc-650 transition-transform ${isSelected ? 'translate-x-1 text-accent-primary' : ''}`} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Main Focus Detail Pane */}
        <div className="lg:col-span-2 space-y-6">
          {selectedAssignment ? (
            <GlassCard hoverEffect={false} className="p-6 flex flex-col justify-between">
              <div>
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-850 pb-4 mb-5 gap-4">
                  <div>
                    <span className="text-[9px] font-bold text-accent-primary bg-accent-primary/10 border border-accent-primary/20 px-2 py-0.5 rounded-md uppercase tracking-wider">
                      {selectedAssignment.courseName || 'Class Course'}
                    </span>
                    <h2 className="text-lg font-bold text-zinc-150 mt-3">{selectedAssignment.title}</h2>
                  </div>
                  <div className="text-left sm:text-right bg-zinc-950/40 px-3 py-2 rounded-xl border border-zinc-850/50">
                    <span className="text-[9px] font-bold text-zinc-500 block uppercase tracking-wider">Submission Deadline</span>
                    <span className="text-xs font-bold text-accent-primary block mt-1">
                      {new Date(selectedAssignment.dueDate).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                </div>

                {/* Task Guidelines */}
                <div className="space-y-5">
                  <div>
                    <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Task Guidelines</h4>
                    <p className="text-xs text-zinc-300 leading-relaxed mt-2 whitespace-pre-wrap">{selectedAssignment.description}</p>
                  </div>

                  {/* AI Generated Study Tips Section */}
                  {selectedAssignment.aiStudyTips && (
                    <div className="p-4 rounded-xl bg-gradient-to-tr from-accent-primary/5 via-accent-secondary/5 to-transparent border border-accent-primary/15">
                      <h4 className="text-[10px] font-bold text-zinc-250 uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles size={14} className="text-accent-secondary animate-pulse animate-duration-1000" /> AI Suggested Roadmap
                      </h4>
                      <div className="text-xs text-zinc-300 leading-relaxed mt-2.5 whitespace-pre-wrap font-sans">
                        {selectedAssignment.aiStudyTips}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Forms / Submissions */}
              <div className="mt-8 pt-5 border-t border-zinc-850">
                
                {/* Student Submit block */}
                {user.role === 'student' && (
                  <div>
                    {selectedAssignment.mySubmission ? (
                      <div className="space-y-4">
                        {/* Grade Card */}
                        {selectedAssignment.mySubmission.status === 'Graded' ? (
                          <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-950/20 via-zinc-900/40 to-transparent border border-emerald-500/25 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                            <div className="text-center md:border-r border-zinc-850 pb-2 md:pb-0">
                              <span className="text-[9px] text-zinc-500 block uppercase tracking-wider mb-1">Earned Grade</span>
                              <span className="text-4xl font-extrabold text-emerald-400 drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]">{selectedAssignment.mySubmission.grade}</span>
                            </div>
                            <div className="md:col-span-3 px-1">
                              <span className="text-[9px] text-zinc-500 block uppercase tracking-wider mb-1 flex items-center gap-1">
                                <Award size={12} className="text-emerald-400" /> Faculty Assessment & Feedback
                              </span>
                              <p className="text-xs text-zinc-300 leading-relaxed font-sans">{selectedAssignment.mySubmission.feedback || 'Outstanding deliverables submission. Requirements completed fully.'}</p>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3 p-4 rounded-xl bg-blue-950/20 border border-blue-500/25">
                            <Clock size={16} className="text-blue-400 animate-pulse" />
                            <div className="flex-grow">
                              <span className="text-xs font-bold text-blue-400 block">⏳ Awaiting Grading & Evaluation</span>
                              <span className="text-[10px] text-zinc-500">
                                Submitted on {new Date(selectedAssignment.mySubmission.submittedAt).toLocaleDateString([], { day:'numeric', month:'short' })} at {new Date(selectedAssignment.mySubmission.submittedAt).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })}
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Submission Content Review */}
                        {selectedAssignment.mySubmission.textContent && (
                          <div className="p-4 bg-zinc-950/70 rounded-xl border border-zinc-850 text-xs text-zinc-400">
                            <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider block mb-2">My Deliverable Submission</span>
                            <p className="font-sans leading-relaxed text-zinc-350">{selectedAssignment.mySubmission.textContent}</p>
                            
                            {selectedAssignment.mySubmission.fileUrl && (
                              <div className="mt-3.5 pt-3.5 border-t border-zinc-900 flex items-center gap-1.5 text-blue-400 font-semibold hover:text-blue-300 text-[10px]">
                                <Paperclip size={12} />
                                <a href={selectedAssignment.mySubmission.fileUrl} target="_blank" rel="noreferrer">
                                  Attachment: {selectedAssignment.mySubmission.fileUrl}
                                </a>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      // Student Submission Form
                      <form onSubmit={handleStudentSubmit} className="space-y-4">
                        {successMsg && (
                          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl flex items-center gap-2">
                            <CheckCircle size={16} /> {successMsg}
                          </div>
                        )}

                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Assignment Submission Text / Summary</label>
                          <textarea
                            rows={4}
                            required
                            value={submissionText}
                            onChange={(e) => setSubmissionText(e.target.value)}
                            placeholder="Provide details about your implementation or solution files..."
                            className="w-full p-4 rounded-xl glass-input text-xs text-zinc-300 focus:outline-none leading-relaxed"
                          />
                        </div>

                        {/* Interactive Drag and Drop Upload Zone */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Upload Code Artifacts (.zip, .pdf)</label>
                          
                          <div 
                            onDragEnter={handleDrag}
                            onDragOver={handleDrag}
                            onDragLeave={handleDrag}
                            onDrop={handleDrop}
                            className={`p-6 rounded-2xl border-2 border-dashed text-center transition-all cursor-pointer ${
                              dragActive 
                                ? 'border-accent-primary bg-accent-primary/5' 
                                : uploadedFile 
                                  ? 'border-emerald-500/30 bg-emerald-500/5' 
                                  : 'border-zinc-800 bg-zinc-950/20 hover:border-zinc-700'
                            }`}
                          >
                            <input 
                              type="file"
                              id="file-upload-input"
                              onChange={handleFileInput}
                              className="hidden" 
                            />
                            
                            {!uploadedFile ? (
                              <label htmlFor="file-upload-input" className="cursor-pointer flex flex-col items-center gap-2">
                                <UploadCloud size={24} className="text-zinc-500" />
                                <span className="text-xs font-semibold text-zinc-300">Drag and drop file here, or <span className="text-accent-primary">browse</span></span>
                                <span className="text-[10px] text-zinc-500">ZIP, PDF or source files up to 25MB</span>
                              </label>
                            ) : (
                              <div className="flex flex-col items-center gap-2">
                                <FileCheck size={24} className="text-emerald-400" />
                                <span className="text-xs font-bold text-zinc-200">{uploadedFile.name}</span>
                                <span className="text-[10px] text-zinc-500">{uploadedFile.size} MB</span>
                                
                                {/* Upload progress bar */}
                                <div className="w-48 h-1.5 bg-zinc-900 rounded-full mt-2 overflow-hidden border border-zinc-850">
                                  <div 
                                    className="h-full bg-emerald-400 transition-all duration-300"
                                    style={{ width: `${uploadProgress}%` }}
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Optional URL submission input */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Repository / Live Project URL</label>
                          <input
                            type="url"
                            value={submissionUrl}
                            onChange={(e) => setSubmissionUrl(e.target.value)}
                            placeholder="e.g. https://github.com/your-username/repository"
                            className="w-full px-4 py-3 rounded-xl glass-input text-xs text-zinc-300 focus:outline-none"
                          />
                        </div>

                        <div className="flex justify-end pt-2">
                          <button
                            type="submit"
                            disabled={submitLoading || (uploadedFile && uploadProgress < 100)}
                            className="px-5 py-2.5 bg-gradient-to-r from-accent-primary to-accent-secondary hover:opacity-90 active:scale-95 text-xs text-white font-semibold rounded-xl shadow-glow transition-all flex items-center gap-1.5 disabled:opacity-50"
                          >
                            {submitLoading ? (
                              <div className="h-4.5 w-4.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                              <>
                                <Send size={12} /> Submit Assignment
                              </>
                            )}
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                )}

                {/* Faculty Submissions Grading Panel */}
                {(user.role === 'faculty' || user.role === 'admin') && (
                  <div>
                    <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5 mb-3">
                      <FolderOpen size={14} className="text-accent-primary" /> Student Submissions ({selectedAssignment.submissions.length})
                    </h4>

                    {selectedAssignment.submissions.length === 0 ? (
                      <div className="p-4 text-center text-xs text-zinc-500 bg-zinc-900/10 border border-zinc-900 rounded-xl">
                        No submissions logged by students yet.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {selectedAssignment.submissions.map((sub) => {
                          const isGrading = activeSubmission?.studentId === sub.student;
                          return (
                            <div 
                              key={sub.student}
                              className="p-4 rounded-xl bg-zinc-900/30 border border-zinc-800/40 hover:border-zinc-700/40 transition-colors"
                            >
                              <div className="flex justify-between items-center">
                                <div>
                                  <span className="text-xs font-semibold text-zinc-200">
                                    Student ID: {sub.student.slice(-6).toUpperCase()}
                                  </span>
                                  <span className="text-[10px] text-zinc-500 block mt-0.5">Submitted: {new Date(sub.submittedAt).toLocaleDateString()}</span>
                                </div>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${
                                  sub.status === 'Graded' 
                                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                                    : 'bg-accent-primary/10 border-accent-primary/20 text-accent-primary'
                                }`}>
                                  {sub.status} {sub.grade ? `(${sub.grade})` : ''}
                                </span>
                              </div>

                              <p className="text-xs text-zinc-300 bg-zinc-950/65 p-3 rounded-lg border border-zinc-850/60 mt-3 whitespace-pre-wrap">
                                {sub.textContent}
                              </p>

                              {sub.fileUrl && (
                                <a 
                                  href={sub.fileUrl} 
                                  target="_blank" 
                                  rel="noreferrer"
                                  className="text-[11px] text-accent-primary hover:underline block mt-2"
                                >
                                  View Attachment: {sub.fileUrl}
                                </a>
                              )}

                              {/* Grading Form */}
                              {isGrading ? (
                                <form onSubmit={handleGradeSubmission} className="space-y-3 mt-4 pt-3 border-t border-zinc-850">
                                  <div className="grid grid-cols-3 gap-4">
                                    <div className="space-y-1.5">
                                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Select Grade</label>
                                      <select
                                        value={gradeValue}
                                        onChange={(e) => setGradeValue(e.target.value)}
                                        className="w-full px-2 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-200"
                                      >
                                        {['A+', 'A', 'B+', 'B', 'C', 'D', 'F'].map(g => (
                                          <option key={g} value={g}>{g}</option>
                                        ))}
                                      </select>
                                    </div>
                                    <div className="col-span-2 space-y-1.5">
                                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Remarks / Feedback</label>
                                      <input
                                        type="text"
                                        value={feedbackValue}
                                        onChange={(e) => setFeedbackValue(e.target.value)}
                                        placeholder="Great structure, clean references..."
                                        className="w-full px-3 py-2 rounded-lg glass-input text-xs text-zinc-300 focus:outline-none"
                                      />
                                    </div>
                                  </div>
                                  <div className="flex justify-end gap-2">
                                    <button 
                                      type="button" 
                                      onClick={() => setActiveSubmission(null)}
                                      className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 text-xs font-semibold rounded-lg transition-all"
                                    >
                                      Cancel
                                    </button>
                                    <button 
                                      type="submit"
                                      disabled={submitLoading}
                                      className="px-4 py-1.5 bg-accent-primary hover:opacity-90 active:scale-95 text-xs text-white font-semibold rounded-lg shadow-glow transition-all"
                                    >
                                      Save Grade
                                    </button>
                                  </div>
                                </form>
                              ) : (
                                sub.status !== 'Graded' && (
                                  <div className="flex justify-end mt-3">
                                    <button
                                      onClick={() => setActiveSubmission({ studentId: sub.student, name: sub.student })}
                                      className="px-3.5 py-1.5 bg-accent-primary/15 hover:bg-accent-primary/25 border border-accent-primary/30 text-accent-primary text-xs font-semibold rounded-lg transition-all"
                                    >
                                      Evaluate Submission
                                    </button>
                                  </div>
                                )
                              )}

                              {sub.status === 'Graded' && !isGrading && (
                                <div className="mt-3 bg-zinc-950/20 p-2.5 rounded-lg border border-zinc-850 text-xs text-zinc-400">
                                  <strong>Faculty remarks:</strong> {sub.feedback || 'No feedback remarks provided.'}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

              </div>
            </GlassCard>
          ) : (
            <div className="text-center py-24 text-zinc-500">
              No assignments selected.
            </div>
          )}
        </div>

      </div>

      {/* Faculty Create Assignment Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <GlassCard hoverEffect={false} className="w-full max-w-lg p-6 border border-zinc-800/80 shadow-2xl relative animate-in zoom-in-95 duration-200">
            <h3 className="text-base font-semibold text-zinc-200 mb-4 pb-2 border-b border-zinc-800/80">Create Course Assignment</h3>
            <form onSubmit={handleCreateAssignment} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Assignment Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Database Normalization exercises"
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-xs text-zinc-300"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Assignment Description & Requirements</label>
                <textarea
                  rows={4}
                  required
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Detail the instructions, topics, files and format criteria..."
                  className="w-full p-4 rounded-xl glass-input text-xs text-zinc-300 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Target Course</label>
                  <select
                    value={newCourseId}
                    onChange={(e) => setNewCourseId(e.target.value)}
                    className="w-full px-3 py-2.5 bg-zinc-900 border border-zinc-850 rounded-xl text-xs text-zinc-200"
                  >
                    <option value="course_01">CS-301 Advanced Web Engineering</option>
                    <option value="course_02">CS-302 Database Architecture</option>
                    <option value="course_03">CS-303 Artificial Intelligence</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Max Marks</label>
                  <input
                    type="number"
                    value={newMaxMarks}
                    onChange={(e) => setNewMaxMarks(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl glass-input text-xs text-zinc-300"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Submission Deadline</label>
                <input
                  type="date"
                  required
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-xs text-zinc-300"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800/80">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 text-xs font-semibold rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="px-4 py-2 bg-accent-primary hover:opacity-90 active:scale-95 text-xs text-white font-semibold rounded-xl shadow-glow transition-all"
                >
                  Publish Task
                </button>
              </div>
            </form>
          </GlassCard>
        </div>
      )}

    </div>
  );
};

export default Assignments;
