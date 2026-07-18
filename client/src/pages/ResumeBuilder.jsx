import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { resumeAPI } from '../services/api';
import GlassCard from '../components/GlassCard';
import {
  User,
  Briefcase,
  BookOpen,
  Code,
  Sparkles,
  Download,
  Plus,
  Trash2,
  CheckCircle,
  FileText,
  AlertCircle,
  TrendingUp,
  RefreshCw
} from 'lucide-react';
import confetti from 'canvas-confetti';

const ResumeBuilder = () => {
  const { user } = useAuth();
  
  // Tabs: 'personal' | 'education' | 'experience' | 'projects' | 'skills'
  const [activeTab, setActiveTab] = useState('personal');
  
  // Form states pre-filled with demo ATS-friendly data
  const [personalInfo, setPersonalInfo] = useState({
    name: user?.name || 'Aravind Sharma',
    email: user?.email || 'aravind.sharma@student360.edu',
    phone: '+91 98765 43210',
    github: 'github.com/aravindsharma',
    linkedin: 'linkedin.com/in/aravindsharma',
    summary: 'Detail-oriented Computer Science student with a strong foundation in full-stack web development. Experienced in building responsive interfaces, integrating RESTful APIs, and implementing database solutions. Passionate about software architecture, performance tuning, and clean code principles.'
  });

  const [education, setEducation] = useState([
    {
      institution: 'student360 Institute of Technology',
      degree: 'Bachelor of Technology',
      major: 'Computer Science and Engineering',
      gpa: '8.8/10.0',
      startYear: '2023',
      endYear: '2027 (Expected)'
    }
  ]);

  const [experience, setExperience] = useState([
    {
      id: 1,
      company: 'CyberTech Solutions',
      role: 'Software Development Intern',
      duration: 'May 2025 - July 2025',
      description: 'Worked on building front-end screens for customer dashboard. Helped with backend database optimization. Integrated third-party APIs for processing payment information.'
    }
  ]);

  const [projects, setProjects] = useState([
    {
      id: 1,
      title: 'student360 Portal',
      techStack: 'React.js, Node.js, Express, MongoDB',
      description: 'Created a collaborative platform for students and faculty. Designed a responsive navigation sidebar and notification service. Managed state integration across pages.'
    }
  ]);

  const [skills, setSkills] = useState('JavaScript, React.js, Node.js, Express, SQL, MongoDB, Git, HTML/CSS');

  // AI states
  const [loading, setLoading] = useState(false);
  const [atsReport, setAtsReport] = useState({
    atsScore: 78,
    feedback: [
      'Replace passive language (e.g., "worked on", "helped") with high-impact action verbs (e.g., "engineered", "orchestrated").',
      'Add measurable metrics/numbers to your internship and projects to substantiate your contributions.',
      'Incorporate professional keywords matching your target career role (SDE/Full Stack).'
    ]
  });
  const [optimizedData, setOptimizedData] = useState(null);
  const [isApplied, setIsApplied] = useState(false);

  // Form handlers
  const handlePersonalChange = (e) => {
    const { name, value } = e.target;
    setPersonalInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleEducationChange = (index, field, value) => {
    const updated = [...education];
    updated[index][field] = value;
    setEducation(updated);
  };

  const addEducation = () => {
    setEducation(prev => [...prev, { institution: '', degree: '', major: '', gpa: '', startYear: '', endYear: '' }]);
  };

  const removeEducation = (index) => {
    setEducation(prev => prev.filter((_, i) => i !== index));
  };

  const handleExperienceChange = (id, field, value) => {
    const updated = experience.map(exp => {
      if (exp.id === id) return { ...exp, [field]: value };
      return exp;
    });
    setExperience(updated);
  };

  const addExperience = () => {
    setExperience(prev => [...prev, { id: Date.now(), company: '', role: '', duration: '', description: '' }]);
  };

  const removeExperience = (id) => {
    setExperience(prev => prev.filter(exp => exp.id !== id));
  };

  const handleProjectChange = (id, field, value) => {
    const updated = projects.map(proj => {
      if (proj.id === id) return { ...proj, [field]: value };
      return proj;
    });
    setProjects(updated);
  };

  const addProject = () => {
    setProjects(prev => [...prev, { id: Date.now(), title: '', techStack: '', description: '' }]);
  };

  const removeProject = (id) => {
    setProjects(prev => prev.filter(proj => proj.id !== id));
  };

  // AI Optimizer
  const handleAIOptimize = async () => {
    setLoading(true);
    setIsApplied(false);
    try {
      const response = await resumeAPI.optimize({
        personalInfo,
        education,
        experience,
        projects,
        skills,
        targetRole: 'Software Development Engineer'
      });
      
      setOptimizedData(response.data || response);
      if (response.data?.atsScore) {
        setAtsReport({
          atsScore: response.data.atsScore,
          feedback: response.data.feedback || []
        });
      } else if (response.atsScore) {
        setAtsReport({
          atsScore: response.atsScore,
          feedback: response.feedback || []
        });
      }
      
      confetti({
        particleCount: 60,
        spread: 45,
        origin: { y: 0.8 },
        colors: ['#3b82f6', '#8b5cf6', '#10b981']
      });
    } catch (err) {
      console.error('Failed to optimize resume:', err.message);
    } finally {
      setLoading(false);
    }
  };

  // Apply AI optimizations back into the main form
  const applyAIOptimizations = () => {
    if (!optimizedData) return;
    
    // Update summary
    if (optimizedData.optimizedSummary) {
      setPersonalInfo(prev => ({ ...prev, summary: optimizedData.optimizedSummary }));
    }
    
    // Update experience descriptions
    if (optimizedData.optimizedExperience && optimizedData.optimizedExperience.length > 0) {
      const updatedExp = experience.map((exp, idx) => {
        const optExp = optimizedData.optimizedExperience[idx];
        if (optExp && optExp.optimizedBullets) {
          return {
            ...exp,
            description: optExp.optimizedBullets.map(b => `- ${b}`).join('\n')
          };
        }
        return exp;
      });
      setExperience(updatedExp);
    }

    // Update projects descriptions
    if (optimizedData.optimizedProjects && optimizedData.optimizedProjects.length > 0) {
      const updatedProj = projects.map((proj, idx) => {
        const optProj = optimizedData.optimizedProjects[idx];
        if (optProj && optProj.optimizedBullets) {
          return {
            ...proj,
            description: optProj.optimizedBullets.map(b => `- ${b}`).join('\n')
          };
        }
        return proj;
      });
      setProjects(updatedProj);
    }

    // Append suggested skills
    if (optimizedData.suggestedSkills && optimizedData.suggestedSkills.length > 0) {
      const currentSkillsList = skills.split(',').map(s => s.trim());
      const newSkillsList = [...new Set([...currentSkillsList, ...optimizedData.suggestedSkills])];
      setSkills(newSkillsList.join(', '));
    }

    setIsApplied(true);
    setOptimizedData(null);
  };

  // Print/Export resume
  const handlePrint = () => {
    window.print();
  };

  // Render Preview elements
  const renderBullets = (text) => {
    if (!text) return null;
    return text.split('\n').map((line, i) => {
      const clean = line.replace(/^-\s*/, '').trim();
      if (!clean) return null;
      return <li key={i} className="text-zinc-700 text-[11px] leading-relaxed mb-0.5 list-disc ml-4">{clean}</li>;
    });
  };

  return (
    <div className="flex flex-col xl:flex-row gap-6 h-[calc(100vh-120px)] overflow-hidden print:p-0 print:h-auto print:overflow-visible">
      
      {/* ── Left Editor/Analysis Panel ─────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 print:hidden overflow-y-auto pr-1">
        {/* Header */}
        <GlassCard className="p-5 mb-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-base font-bold text-zinc-100 flex items-center gap-2">
              <Sparkles size={18} className="text-blue-400" />
              ATS Resume Builder
              <span className="text-[10px] font-bold bg-blue-500/10 border border-blue-500/30 text-blue-400 px-2 py-0.5 rounded-full uppercase tracking-wider">Glena Assisted</span>
            </h1>
            <p className="text-xs text-zinc-500 mt-1">Design an elegant single-column resume fully optimized for applicant tracking filters.</p>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <button
              onClick={handleAIOptimize}
              disabled={loading}
              className="flex-1 md:flex-none flex items-center justify-center gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90 active:scale-95 text-xs text-white font-semibold px-4 py-2.5 rounded-xl shadow-glow transition-all disabled:opacity-50"
            >
              {loading ? (
                <RefreshCw size={13} className="animate-spin" />
              ) : (
                <Sparkles size={13} />
              )}
              AI Optimize
            </button>
            <button
              onClick={handlePrint}
              className="flex-1 md:flex-none flex items-center justify-center gap-1.5 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-xs text-zinc-300 font-semibold px-4 py-2.5 rounded-xl transition-all"
            >
              <Download size={13} />
              Export PDF
            </button>
          </div>
        </GlassCard>

        {/* ATS Score & Suggestions Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
          <GlassCard className="p-4 flex flex-col items-center justify-center text-center">
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-2">Simulated ATS Score</span>
            <div className="relative flex items-center justify-center">
              <svg className="w-20 h-20 transform -rotate-95">
                <circle cx="40" cy="40" r="34" className="stroke-zinc-800" strokeWidth="6" fill="transparent" />
                <circle
                  cx="40" cy="40" r="34"
                  className={`${
                    atsReport.atsScore >= 80 ? 'stroke-emerald-500' : 'stroke-amber-500'
                  } transition-all duration-1000`}
                  strokeWidth="6"
                  fill="transparent"
                  strokeDasharray={2 * Math.PI * 34}
                  strokeDashoffset={2 * Math.PI * 34 * (1 - atsReport.atsScore / 100)}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute text-lg font-extrabold text-zinc-100">{atsReport.atsScore}%</span>
            </div>
          </GlassCard>

          <GlassCard className="col-span-2 p-4 flex flex-col justify-center">
            <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider flex items-center gap-1 mb-2">
              <AlertCircle size={12} className="text-blue-400" /> ATS Suggestions & Insights
            </span>
            <ul className="space-y-1.5">
              {atsReport.feedback.map((tip, idx) => (
                <li key={idx} className="text-zinc-400 text-[11px] leading-relaxed flex items-start gap-1.5">
                  <span className="text-blue-400 mt-0.5">•</span>
                  {tip}
                </li>
              ))}
            </ul>
          </GlassCard>
        </div>

        {/* AI Recommendations Drawer (If optimizedData is present) */}
        {optimizedData && (
          <div className="mb-5 p-4 rounded-xl bg-blue-950/20 border border-blue-500/20 animate-in slide-in-from-top duration-300">
            <div className="flex items-start justify-between gap-3">
              <div className="flex gap-2">
                <Sparkles className="text-blue-400 flex-shrink-0 mt-0.5" size={16} />
                <div>
                  <h4 className="text-xs font-bold text-zinc-200 uppercase tracking-wider">AI Optimization Ready</h4>
                  <p className="text-[11px] text-zinc-400 mt-0.5">Glena has optimized your summary, rewritten weak experience bullets with action verbs, and detected skills match targets.</p>
                </div>
              </div>
              <button
                onClick={applyAIOptimizations}
                className="bg-blue-600 hover:bg-blue-500 text-[10px] font-bold text-white px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
              >
                Apply AI Suggestions
              </button>
            </div>
          </div>
        )}

        {isApplied && (
          <div className="mb-5 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2">
            <CheckCircle className="text-emerald-400" size={15} />
            <span className="text-[11px] text-emerald-400 font-medium">Applied AI optimization to your resume fields! Check your live preview.</span>
          </div>
        )}

        {/* Editor Tabs Navigation */}
        <div className="flex border-b border-zinc-800/80 mb-5 overflow-x-auto gap-2">
          {[
            { id: 'personal', label: 'Contact & Summary', icon: User },
            { id: 'education', label: 'Education', icon: BookOpen },
            { id: 'experience', label: 'Experience', icon: Briefcase },
            { id: 'projects', label: 'Projects', icon: FileText },
            { id: 'skills', label: 'Skills', icon: Code }
          ].map(tab => {
            const Icon = tab.icon;
            const isTabActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 pb-2.5 px-1.5 border-b-2 text-xs font-bold whitespace-nowrap transition-all ${
                  isTabActive
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <Icon size={13} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Editor Forms */}
        <GlassCard className="p-5 flex-1 min-h-[300px]">
          {/* Tab 1: Personal Contact Details & Summary */}
          {activeTab === 'personal' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={personalInfo.name}
                    onChange={handlePersonalChange}
                    className="w-full px-4 py-2.5 rounded-xl glass-input text-xs text-zinc-300 focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={personalInfo.email}
                    onChange={handlePersonalChange}
                    className="w-full px-4 py-2.5 rounded-xl glass-input text-xs text-zinc-300 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Phone Number</label>
                  <input
                    type="text"
                    name="phone"
                    value={personalInfo.phone}
                    onChange={handlePersonalChange}
                    className="w-full px-4 py-2.5 rounded-xl glass-input text-xs text-zinc-300 focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">GitHub Username/URL</label>
                  <input
                    type="text"
                    name="github"
                    value={personalInfo.github}
                    onChange={handlePersonalChange}
                    placeholder="e.g. github.com/aravind"
                    className="w-full px-4 py-2.5 rounded-xl glass-input text-xs text-zinc-300 focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">LinkedIn Profile URL</label>
                  <input
                    type="text"
                    name="linkedin"
                    value={personalInfo.linkedin}
                    onChange={handlePersonalChange}
                    placeholder="e.g. linkedin.com/in/aravind"
                    className="w-full px-4 py-2.5 rounded-xl glass-input text-xs text-zinc-300 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Professional Summary</label>
                <textarea
                  rows={5}
                  name="summary"
                  value={personalInfo.summary}
                  onChange={handlePersonalChange}
                  className="w-full p-4 rounded-xl glass-input text-xs text-zinc-300 focus:outline-none leading-relaxed"
                />
              </div>
            </div>
          )}

          {/* Tab 2: Education History */}
          {activeTab === 'education' && (
            <div className="space-y-6">
              {education.map((edu, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-zinc-900/30 border border-zinc-800/40 relative">
                  {education.length > 1 && (
                    <button
                      onClick={() => removeEducation(idx)}
                      className="absolute top-4 right-4 text-zinc-500 hover:text-rose-400 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Institution / School Name</label>
                      <input
                        type="text"
                        value={edu.institution}
                        onChange={(e) => handleEducationChange(idx, 'institution', e.target.value)}
                        placeholder="e.g. CampusOne Institute of Technology"
                        className="w-full px-4 py-2.5 rounded-xl glass-input text-xs text-zinc-300 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Degree</label>
                      <input
                        type="text"
                        value={edu.degree}
                        onChange={(e) => handleEducationChange(idx, 'degree', e.target.value)}
                        placeholder="e.g. B.Tech"
                        className="w-full px-4 py-2.5 rounded-xl glass-input text-xs text-zinc-300 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="col-span-2 space-y-1.5">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Field of Study / Major</label>
                      <input
                        type="text"
                        value={edu.major}
                        onChange={(e) => handleEducationChange(idx, 'major', e.target.value)}
                        placeholder="e.g. Computer Science and Engineering"
                        className="w-full px-4 py-2.5 rounded-xl glass-input text-xs text-zinc-300 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">GPA / Percentage</label>
                      <input
                        type="text"
                        value={edu.gpa}
                        onChange={(e) => handleEducationChange(idx, 'gpa', e.target.value)}
                        placeholder="e.g. 8.8 / 10.0"
                        className="w-full px-4 py-2.5 rounded-xl glass-input text-xs text-zinc-300 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Timeline (Start - End)</label>
                      <input
                        type="text"
                        value={`${edu.startYear} - ${edu.endYear}`}
                        onChange={(e) => {
                          const parts = e.target.value.split('-');
                          handleEducationChange(idx, 'startYear', parts[0]?.trim() || '');
                          handleEducationChange(idx, 'endYear', parts[1]?.trim() || '');
                        }}
                        placeholder="e.g. 2023 - 2027"
                        className="w-full px-4 py-2.5 rounded-xl glass-input text-xs text-zinc-300 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              ))}
              <button
                onClick={addEducation}
                className="flex items-center gap-1 text-xs text-blue-400 font-semibold hover:text-blue-300 transition-colors"
              >
                <Plus size={14} /> Add Education Record
              </button>
            </div>
          )}

          {/* Tab 3: Professional Experience */}
          {activeTab === 'experience' && (
            <div className="space-y-6">
              {experience.map((exp, idx) => (
                <div key={exp.id} className="p-4 rounded-xl bg-zinc-900/30 border border-zinc-800/40 relative">
                  <button
                    onClick={() => removeExperience(exp.id)}
                    className="absolute top-4 right-4 text-zinc-500 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Company Name</label>
                      <input
                        type="text"
                        value={exp.company}
                        onChange={(e) => handleExperienceChange(exp.id, 'company', e.target.value)}
                        placeholder="e.g. CyberTech Solutions"
                        className="w-full px-4 py-2.5 rounded-xl glass-input text-xs text-zinc-300 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Job / Internship Role</label>
                      <input
                        type="text"
                        value={exp.role}
                        onChange={(e) => handleExperienceChange(exp.id, 'role', e.target.value)}
                        placeholder="e.g. Frontend Intern"
                        className="w-full px-4 py-2.5 rounded-xl glass-input text-xs text-zinc-300 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Timeline (Duration)</label>
                      <input
                        type="text"
                        value={exp.duration}
                        onChange={(e) => handleExperienceChange(exp.id, 'duration', e.target.value)}
                        placeholder="e.g. Jun 2025 - Aug 2025"
                        className="w-full px-4 py-2.5 rounded-xl glass-input text-xs text-zinc-300 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Key Contributions (One bullet point per line)</label>
                    <textarea
                      rows={4}
                      value={exp.description}
                      onChange={(e) => handleExperienceChange(exp.id, 'description', e.target.value)}
                      placeholder="- Spearheaded design for main app layout reducing load times by 20%&#10;- Resolved complex REST API state synchronization bugs"
                      className="w-full p-4 rounded-xl glass-input text-xs text-zinc-300 focus:outline-none leading-relaxed"
                    />
                  </div>
                </div>
              ))}
              <button
                onClick={addExperience}
                className="flex items-center gap-1 text-xs text-blue-400 font-semibold hover:text-blue-300 transition-colors"
              >
                <Plus size={14} /> Add Experience Record
              </button>
            </div>
          )}

          {/* Tab 4: Projects */}
          {activeTab === 'projects' && (
            <div className="space-y-6">
              {projects.map((proj, idx) => (
                <div key={proj.id} className="p-4 rounded-xl bg-zinc-900/30 border border-zinc-800/40 relative">
                  <button
                    onClick={() => removeProject(proj.id)}
                    className="absolute top-4 right-4 text-zinc-500 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Project Title</label>
                      <input
                        type="text"
                        value={proj.title}
                        onChange={(e) => handleProjectChange(proj.id, 'title', e.target.value)}
                        placeholder="e.g. Portfolio Manager"
                        className="w-full px-4 py-2.5 rounded-xl glass-input text-xs text-zinc-300 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Tech Stack Used</label>
                      <input
                        type="text"
                        value={proj.techStack}
                        onChange={(e) => handleProjectChange(proj.id, 'techStack', e.target.value)}
                        placeholder="e.g. React.js, Express, PostgreSQL"
                        className="w-full px-4 py-2.5 rounded-xl glass-input text-xs text-zinc-300 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Project Description (One bullet point per line)</label>
                    <textarea
                      rows={4}
                      value={proj.description}
                      onChange={(e) => handleProjectChange(proj.id, 'description', e.target.value)}
                      placeholder="- Created core components using React and state hooks&#10;- Streamlined indexing speeds by 30% on MongoDB database"
                      className="w-full p-4 rounded-xl glass-input text-xs text-zinc-300 focus:outline-none leading-relaxed"
                    />
                  </div>
                </div>
              ))}
              <button
                onClick={addProject}
                className="flex items-center gap-1 text-xs text-blue-400 font-semibold hover:text-blue-300 transition-colors"
              >
                <Plus size={14} /> Add Project Record
              </button>
            </div>
          )}

          {/* Tab 5: Technical Skills */}
          {activeTab === 'skills' && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Technical Skills (Comma separated list)</label>
                <textarea
                  rows={6}
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  placeholder="e.g. Java, Python, React.js, Node.js, REST APIs, Git"
                  className="w-full p-4 rounded-xl glass-input text-xs text-zinc-300 focus:outline-none leading-relaxed"
                />
              </div>
              <div className="p-4 rounded-xl bg-zinc-900/20 border border-zinc-800/40 text-xs text-zinc-400">
                💡 **Pro Tip:** List core programming languages first, followed by frameworks, libraries, databases, and version tools. Avoid soft skills here as ATS checks for target technical tags.
              </div>
            </div>
          )}
        </GlassCard>
      </div>

      {/* ── Right Live Printable PDF Sheet Preview ────────────────────── */}
      <div className="flex-1 flex flex-col items-center overflow-y-auto bg-zinc-950/40 xl:bg-transparent rounded-2xl border border-zinc-900 xl:border-none p-4 xl:p-0 print:p-0 print:border-none print:w-full">
        {/* Real paper dimensions simulation */}
        <div
          id="resume-preview-sheet"
          className="w-full max-w-[800px] min-h-[1050px] bg-white text-zinc-900 shadow-2xl p-10 font-serif border border-zinc-200 select-text flex flex-col justify-between print:shadow-none print:border-none print:p-0 print:max-w-none"
        >
          <div>
            {/* Header / Contact Details */}
            <div className="text-center border-b-[1.5px] border-zinc-900 pb-3.5">
              <h1 className="text-[22px] font-bold tracking-tight text-zinc-950 uppercase font-sans">{personalInfo.name}</h1>
              <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[11px] text-zinc-700 font-sans mt-1.5">
                {personalInfo.email && <span>{personalInfo.email}</span>}
                {personalInfo.phone && <span>| {personalInfo.phone}</span>}
                {personalInfo.github && <span>| {personalInfo.github}</span>}
                {personalInfo.linkedin && <span>| {personalInfo.linkedin}</span>}
              </div>
            </div>

            {/* Summary Section */}
            {personalInfo.summary && (
              <div className="mt-4">
                <h3 className="text-[12px] font-bold uppercase tracking-wider text-zinc-950 border-b border-zinc-300 pb-0.5 font-sans">Professional Summary</h3>
                <p className="text-zinc-700 text-[11px] leading-relaxed mt-1.5 text-justify">{personalInfo.summary}</p>
              </div>
            )}

            {/* Experience Section */}
            {experience.length > 0 && (
              <div className="mt-4">
                <h3 className="text-[12px] font-bold uppercase tracking-wider text-zinc-950 border-b border-zinc-300 pb-0.5 font-sans">Professional Experience</h3>
                <div className="space-y-3 mt-2">
                  {experience.map((exp, idx) => (
                    <div key={exp.id || idx}>
                      <div className="flex justify-between items-baseline font-sans">
                        <span className="text-[11.5px] font-bold text-zinc-900">{exp.company}</span>
                        <span className="text-[10px] text-zinc-600 font-medium italic">{exp.duration}</span>
                      </div>
                      <div className="flex justify-between items-baseline mt-0.5 font-sans">
                        <span className="text-[10.5px] font-semibold text-zinc-800 italic">{exp.role}</span>
                      </div>
                      <ul className="list-disc mt-1.5 space-y-1">
                        {renderBullets(exp.description)}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Projects Section */}
            {projects.length > 0 && (
              <div className="mt-4">
                <h3 className="text-[12px] font-bold uppercase tracking-wider text-zinc-950 border-b border-zinc-300 pb-0.5 font-sans">Technical Projects</h3>
                <div className="space-y-3 mt-2">
                  {projects.map((proj, idx) => (
                    <div key={proj.id || idx}>
                      <div className="flex justify-between items-baseline font-sans">
                        <span className="text-[11.5px] font-bold text-zinc-900">{proj.title}</span>
                        <span className="text-[10px] text-zinc-600 font-medium italic">Tech stack: {proj.techStack}</span>
                      </div>
                      <ul className="list-disc mt-1.5 space-y-1">
                        {renderBullets(proj.description)}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Education Section */}
            {education.length > 0 && (
              <div className="mt-4">
                <h3 className="text-[12px] font-bold uppercase tracking-wider text-zinc-950 border-b border-zinc-300 pb-0.5 font-sans">Education</h3>
                <div className="space-y-3 mt-2">
                  {education.map((edu, idx) => (
                    <div key={idx} className="flex justify-between items-baseline font-sans">
                      <div>
                        <span className="text-[11.5px] font-bold text-zinc-900">{edu.institution}</span>
                        <div className="text-[10.5px] text-zinc-800 mt-0.5">
                          {edu.degree} in {edu.major} {edu.gpa && <span>(CGPA: {edu.gpa})</span>}
                        </div>
                      </div>
                      <span className="text-[10px] text-zinc-600 font-medium italic">
                        {edu.startYear} - {edu.endYear}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Skills Section */}
            {skills && (
              <div className="mt-4">
                <h3 className="text-[12px] font-bold uppercase tracking-wider text-zinc-950 border-b border-zinc-300 pb-0.5 font-sans">Technical Skills</h3>
                <p className="text-zinc-700 text-[11px] leading-relaxed mt-1.5">
                  <strong className="text-zinc-900 font-sans text-[10.5px]">Proficiencies:</strong> {skills}
                </p>
              </div>
            )}
          </div>

          {/* Footer branding only visible on screen */}
          <div className="border-t border-zinc-200 pt-3 flex justify-between items-center text-[9px] text-zinc-400 font-sans print:hidden">
            <span>ATS Format Compliant</span>
            <span>Generated via student360 AI Portal</span>
          </div>
        </div>
      </div>

      {/* Global page-print configuration override style */}
      <style>{`
        @media print {
          /* Hide app layout elements */
          body * {
            visibility: hidden !important;
          }
          #resume-preview-sheet, #resume-preview-sheet * {
            visibility: visible !important;
          }
          #resume-preview-sheet {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            border: none !important;
            box-shadow: none !important;
          }
          /* Prevent margins on printed page */
          @page {
            size: letter;
            margin: 0.5in;
          }
        }
      `}</style>
    </div>
  );
};

export default ResumeBuilder;
