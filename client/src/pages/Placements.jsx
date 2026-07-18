import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { placementsAPI } from '../services/api';
import GlassCard from '../components/GlassCard';
import SkeletonLoader from '../components/SkeletonLoader';
import { 
  Briefcase, 
  DollarSign, 
  MapPin, 
  Calendar, 
  Sparkles, 
  FileText, 
  Plus, 
  ArrowRight,
  TrendingUp,
  Award,
  CheckCircle,
  HelpCircle,
  Trash2,
  Trophy,
  ExternalLink,
  Code
} from 'lucide-react';
import confetti from 'canvas-confetti';

const Placements = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [placements, setPlacements] = useState([]);
  const [selectedPlacement, setSelectedPlacement] = useState(null);

  // Tab state: 'drives' or 'profile'
  const [activeTab, setActiveTab] = useState('drives');

  // Student Application States
  const [resumeText, setResumeText] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Admin Recruitment Drive Creation States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [description, setDescription] = useState('');
  const [requirements, setRequirements] = useState('');
  const [ctc, setCtc] = useState('');
  const [deadline, setDeadline] = useState('');

  // LinkedIn-style Profile States (persisted in localStorage)
  const [experiences, setExperiences] = useState(() => {
    const saved = localStorage.getItem('campusone_profile_exp');
    return saved ? JSON.parse(saved) : [
      { id: '1', title: 'Frontend Developer Intern', company: 'Google Summer of Code', duration: 'May 2025 - August 2025', description: 'Worked on React-based dashboards and optimized rendering engines.' }
    ];
  });

  const [projects, setProjects] = useState(() => {
    const saved = localStorage.getItem('campusone_profile_proj');
    return saved ? JSON.parse(saved) : [
      { id: '1', title: 'CampusOne AI Platform', tech: 'React, Node, Express, MongoDB', description: 'AI-powered unified student services hub.' }
    ];
  });

  const [certificates, setCertificates] = useState(() => {
    const saved = localStorage.getItem('campusone_profile_cert');
    return saved ? JSON.parse(saved) : [
      { id: '1', name: 'Advanced React Certification', issuer: 'Meta / Coursera', date: 'October 2025' }
    ];
  });

  // Toggle Add Forms
  const [showAddExp, setShowAddExp] = useState(false);
  const [expTitle, setExpTitle] = useState('');
  const [expCompany, setExpCompany] = useState('');
  const [expDuration, setExpDuration] = useState('');
  const [expDesc, setExpDesc] = useState('');

  const [showAddProj, setShowAddProj] = useState(false);
  const [projTitle, setProjTitle] = useState('');
  const [projTech, setProjTech] = useState('');
  const [projDesc, setProjDesc] = useState('');

  const [showAddCert, setShowAddCert] = useState(false);
  const [certName, setCertName] = useState('');
  const [certIssuer, setCertIssuer] = useState('');
  const [certDate, setCertDate] = useState('');

  useEffect(() => {
    fetchPlacements();
  }, []);

  const fetchPlacements = async () => {
    setLoading(true);
    try {
      const response = await placementsAPI.get();
      setPlacements(response.data);
      if (response.data.length > 0) {
        setSelectedPlacement(response.data[0]);
      }
    } catch (err) {
      console.error('Failed to load placement opportunities:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (e) => {
    e.preventDefault();
    if (!resumeText.trim()) return;

    setSubmitLoading(true);
    setSuccessMsg('');
    try {
      await placementsAPI.apply(selectedPlacement._id, {
        resumeText,
        resumeUrl: 'https://campusone.ai/uploads/resumes/my-resume.pdf'
      });
      
      setSuccessMsg('Applied successfully! AI Analysis compiled below.');
      
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.8 },
        colors: ['#10b981', '#6366f1', '#a855f7']
      });

      setResumeText('');
      setTimeout(() => setSuccessMsg(''), 4000);
      fetchPlacements();
    } catch (err) {
      console.error('Application failed:', err.message);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleCreatePlacement = async (e) => {
    e.preventDefault();
    if (!company.trim() || !role.trim() || !ctc || !deadline) return;

    setSubmitLoading(true);
    try {
      await placementsAPI.post({
        company,
        role,
        description,
        requirements,
        ctc,
        deadline
      });

      setShowCreateModal(false);
      setCompany('');
      setRole('');
      setDescription('');
      setRequirements('');
      setCtc('');
      setDeadline('');
      fetchPlacements();
    } catch (err) {
      console.error('Publishing placement posting failed:', err.message);
    } finally {
      setSubmitLoading(false);
    }
  };

  // Add Item Actions
  const handleAddExperience = (e) => {
    e.preventDefault();
    if (!expTitle.trim() || !expCompany.trim()) return;
    const newItem = {
      id: Date.now().toString(),
      title: expTitle,
      company: expCompany,
      duration: expDuration || 'Present',
      description: expDesc
    };
    const updated = [...experiences, newItem];
    setExperiences(updated);
    localStorage.setItem('campusone_profile_exp', JSON.stringify(updated));
    
    // Reset Form
    setExpTitle('');
    setExpCompany('');
    setExpDuration('');
    setExpDesc('');
    setShowAddExp(false);
    
    confetti({
      particleCount: 40,
      spread: 50,
      colors: ['#6366f1', '#10b981']
    });
  };

  const handleAddProject = (e) => {
    e.preventDefault();
    if (!projTitle.trim()) return;
    const newItem = {
      id: Date.now().toString(),
      title: projTitle,
      tech: projTech,
      description: projDesc
    };
    const updated = [...projects, newItem];
    setProjects(updated);
    localStorage.setItem('campusone_profile_proj', JSON.stringify(updated));

    setProjTitle('');
    setProjTech('');
    setProjDesc('');
    setShowAddProj(false);

    confetti({
      particleCount: 40,
      spread: 50,
      colors: ['#6366f1', '#10b981']
    });
  };

  const handleAddCertificate = (e) => {
    e.preventDefault();
    if (!certName.trim()) return;
    const newItem = {
      id: Date.now().toString(),
      name: certName,
      issuer: certIssuer,
      date: certDate
    };
    const updated = [...certificates, newItem];
    setCertificates(updated);
    localStorage.setItem('campusone_profile_cert', JSON.stringify(updated));

    setCertName('');
    setCertIssuer('');
    setCertDate('');
    setShowAddCert(false);

    confetti({
      particleCount: 40,
      spread: 50,
      colors: ['#6366f1', '#10b981']
    });
  };

  const handleDeleteExp = (id) => {
    const updated = experiences.filter(x => x.id !== id);
    setExperiences(updated);
    localStorage.setItem('campusone_profile_exp', JSON.stringify(updated));
  };

  const handleDeleteProj = (id) => {
    const updated = projects.filter(x => x.id !== id);
    setProjects(updated);
    localStorage.setItem('campusone_profile_proj', JSON.stringify(updated));
  };

  const handleDeleteCert = (id) => {
    const updated = certificates.filter(x => x.id !== id);
    setCertificates(updated);
    localStorage.setItem('campusone_profile_cert', JSON.stringify(updated));
  };

  // Profile completeness & rank calculation
  const profileScore = Math.min(30 + experiences.length * 20 + projects.length * 15 + certificates.length * 10, 100);
  const placementRank = Math.max(148 - experiences.length * 35 - projects.length * 25 - certificates.length * 15, 4);

  if (loading) {
    return <SkeletonLoader type="list" count={4} />;
  }

  return (
    <div className="space-y-6 select-none animate-in fade-in duration-300">
      
      {/* Sub navigation for Student Profile & Drives */}
      <div className="flex justify-between items-center border-b border-zinc-800/80 pb-3">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('drives')}
            className={`pb-2 px-1 text-sm font-bold tracking-wide transition-all border-b-2 ${
              activeTab === 'drives'
                ? 'border-accent-primary text-zinc-100 font-extrabold'
                : 'border-transparent text-zinc-400 hover:text-zinc-300'
            }`}
          >
            Placement Drives
          </button>
          {user.role === 'student' && (
            <button
              onClick={() => setActiveTab('profile')}
              className={`pb-2 px-1 text-sm font-bold tracking-wide transition-all border-b-2 ${
                activeTab === 'profile'
                  ? 'border-accent-primary text-zinc-100 font-extrabold'
                  : 'border-transparent text-zinc-400 hover:text-zinc-300'
              }`}
            >
              My Professional Profile
            </button>
          )}
        </div>
      </div>

      {activeTab === 'drives' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar List of Job Postings */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-zinc-200 text-sm">Placement Drives</h3>
              {user.role === 'admin' && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="p-2 bg-accent-primary hover:bg-accent-primary/80 text-white rounded-xl shadow-glow transition-all flex items-center gap-1 text-xs font-semibold"
                >
                  <Plus size={14} /> Post Drive
                </button>
              )}
            </div>

            <div className="space-y-3 max-h-[calc(100vh-18rem)] overflow-y-auto pr-1">
              {placements.map((p) => {
                const isSelected = selectedPlacement?._id === p._id;
                return (
                  <div
                    key={p._id}
                    onClick={() => setSelectedPlacement(p)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      isSelected 
                        ? 'bg-zinc-900 border-accent-primary/45 shadow-glow' 
                        : 'bg-zinc-900/40 border-zinc-800/60 hover:bg-zinc-900/60'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-zinc-200 text-sm">{p.company}</h4>
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded uppercase tracking-wider">
                        {p.ctc}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 mt-1.5 font-semibold truncate">{p.role}</p>
                    <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 mt-3 font-medium">
                      <Calendar size={12} /> Apply by: {new Date(p.deadline).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Main Focus Detail Pane */}
          <div className="lg:col-span-2 space-y-6">
            {selectedPlacement ? (
              <GlassCard hoverEffect={false} className="h-full flex flex-col justify-between">
                <div>
                  {/* Header */}
                  <div className="flex justify-between items-start border-b border-zinc-800/80 pb-4 mb-4 gap-4">
                    <div>
                      <h2 className="text-xl font-bold text-zinc-100">{selectedPlacement.company}</h2>
                      <p className="text-sm text-zinc-400 font-semibold mt-1">{selectedPlacement.role}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-semibold text-zinc-400 block">Package (CTC)</span>
                      <span className="text-base font-bold text-emerald-400 block mt-1">
                        {selectedPlacement.ctc}
                      </span>
                    </div>
                  </div>

                  {/* Requirements & Description */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Job Description</h4>
                      <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed mt-2">{selectedPlacement.description}</p>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Prerequisite Requirements</h4>
                      <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed mt-2 italic">{selectedPlacement.requirements}</p>
                    </div>
                  </div>
                </div>

                {/* Application Section */}
                <div className="mt-8 pt-4 border-t border-zinc-800/80">
                  {user.role === 'student' && (
                    <div>
                      {selectedPlacement.myApplication ? (
                        <div className="space-y-6">
                          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl flex items-center gap-2">
                            <CheckCircle size={16} /> Application submitted successfully. Status: <strong>Applied</strong>
                          </div>

                          {/* AI resume analysis */}
                          {selectedPlacement.myApplication.aiResumeAnalysis && (
                            <div className="p-5 rounded-xl bg-gradient-to-tr from-accent-primary/5 to-accent-secondary/5 border border-accent-primary/10 space-y-4">
                              <h4 className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-1.5">
                                <Sparkles size={14} className="text-accent-secondary animate-pulse" /> AI Resume Review analysis
                              </h4>
                              <div className="text-xs text-zinc-300 leading-relaxed whitespace-pre-wrap font-sans">
                                {selectedPlacement.myApplication.aiResumeAnalysis}
                              </div>
                            </div>
                          )}

                          {/* AI generated mock interview questions */}
                          {selectedPlacement.myApplication.aiMockQuestions && selectedPlacement.myApplication.aiMockQuestions.length > 0 && (
                            <div className="space-y-3">
                              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                                <HelpCircle size={14} className="text-accent-primary" /> AI-Generated Mock Interview Questions
                              </h4>
                              <div className="space-y-2">
                                {selectedPlacement.myApplication.aiMockQuestions.map((q, index) => (
                                  <div 
                                    key={index}
                                    className="p-3 rounded-lg bg-zinc-900/30 border border-zinc-800/40 text-xs text-zinc-305 flex items-start gap-3"
                                  >
                                    <span className="h-5 w-5 rounded-full bg-accent-primary/10 text-accent-primary flex items-center justify-center flex-shrink-0 font-bold animate-pulse">
                                      {index + 1}
                                    </span>
                                    <span className="leading-relaxed text-zinc-300">{q}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <form onSubmit={handleApply} className="space-y-4">
                          {successMsg && (
                            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl flex items-center gap-2">
                              <CheckCircle size={16} /> {successMsg}
                            </div>
                          )}

                          <div className="space-y-1.5">
                            <div className="flex justify-between items-center">
                              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Paste Resume Contents</label>
                              <span className="text-[10px] text-zinc-500">AI will analyze this matches score against requirements</span>
                            </div>
                            <textarea
                              rows={5}
                              required
                              value={resumeText}
                              onChange={(e) => setResumeText(e.target.value)}
                              placeholder="Paste resume qualifications, projects, technologies, and work logs..."
                              className="w-full p-4 rounded-xl glass-input text-xs text-zinc-300 focus:outline-none"
                            />
                          </div>

                          <div className="flex justify-end">
                            <button
                              type="submit"
                              disabled={submitLoading}
                              className="px-5 py-2.5 bg-gradient-to-r from-accent-primary to-accent-secondary hover:opacity-90 active:scale-95 text-xs text-white font-semibold rounded-xl shadow-glow transition-all flex items-center gap-1.5 disabled:opacity-50"
                            >
                              {submitLoading ? (
                                <div className="h-4.5 w-4.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              ) : (
                                <>
                                  <span>Apply & Run AI Audit</span>
                                  <ArrowRight size={13} />
                                </>
                              )}
                            </button>
                          </div>
                        </form>
                      )}
                    </div>
                  )}
                </div>
              </GlassCard>
            ) : (
              <div className="text-center py-24 text-zinc-500">
                No drives active.
              </div>
            )}
          </div>
        </div>
      ) : (
        /* LinkedIn-style Portfolio + Rank Board Section */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* LinkedIn Profile Card & Sections (2/3 width) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Profile Header */}
            <GlassCard hoverEffect={false} className="overflow-hidden p-0 relative">
              {/* Header Banner */}
              <div className="h-28 bg-gradient-to-r from-accent-primary/20 via-accent-secondary/20 to-zinc-900 border-b border-zinc-800" />
              
              <div className="p-6 pt-0 relative flex flex-col sm:flex-row gap-4 items-start sm:items-end -mt-10 mb-2">
                <img 
                  src={user.avatar} 
                  alt={user.name} 
                  className="h-20 w-20 rounded-2xl border-4 border-background bg-zinc-950/60 shadow-lg object-cover"
                />
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-lg font-bold text-zinc-100">{user.name}</h2>
                      <p className="text-xs text-zinc-400 font-semibold">{user.email}</p>
                    </div>
                    <span className="text-[10px] font-bold text-accent-primary bg-accent-primary/10 border border-accent-primary/20 px-2 py-0.5 rounded uppercase tracking-wider">
                      Student Standing
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 font-medium mt-1">
                    Department of {user.studentDetails?.department || 'Computer Science'} • Roll: {user.studentDetails?.rollNo || 'CS-2023-042'}
                  </p>
                </div>
              </div>
            </GlassCard>

            {/* Experience Section */}
            <GlassCard hoverEffect={false} className="space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-zinc-800/80">
                <h3 className="text-xs font-bold text-zinc-350 uppercase tracking-wider flex items-center gap-1.5">
                  <Briefcase size={14} className="text-accent-primary" /> Work Experience
                </h3>
                <button 
                  onClick={() => setShowAddExp(!showAddExp)}
                  className="p-1 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-lg transition-colors flex items-center gap-1 text-[11px] font-semibold"
                >
                  <Plus size={14} /> Add
                </button>
              </div>

              {showAddExp && (
                <form onSubmit={handleAddExperience} className="p-4 rounded-xl bg-zinc-950/40 border border-zinc-800/80 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Job Title</label>
                      <input 
                        type="text" 
                        required 
                        value={expTitle} 
                        onChange={(e) => setExpTitle(e.target.value)} 
                        placeholder="e.g. Frontend Intern"
                        className="w-full px-3 py-1.5 rounded-lg glass-input text-xs text-zinc-200"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Company</label>
                      <input 
                        type="text" 
                        required 
                        value={expCompany} 
                        onChange={(e) => setExpCompany(e.target.value)} 
                        placeholder="e.g. Vercel"
                        className="w-full px-3 py-1.5 rounded-lg glass-input text-xs text-zinc-200"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Duration / Dates</label>
                    <input 
                      type="text" 
                      value={expDuration} 
                      onChange={(e) => setExpDuration(e.target.value)} 
                      placeholder="e.g. June 2025 - August 2025"
                      className="w-full px-3 py-1.5 rounded-lg glass-input text-xs text-zinc-200"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Description</label>
                    <textarea 
                      rows={2} 
                      value={expDesc} 
                      onChange={(e) => setExpDesc(e.target.value)} 
                      placeholder="Detail your responsibilities and achievements..."
                      className="w-full p-3 rounded-lg glass-input text-xs text-zinc-200"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button 
                      type="button" 
                      onClick={() => setShowAddExp(false)} 
                      className="px-3 py-1 bg-zinc-900 border border-zinc-800 text-zinc-450 hover:text-zinc-200 text-xs font-semibold rounded-lg"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="px-3.5 py-1 bg-accent-primary hover:bg-accent-primary/95 text-white text-xs font-semibold rounded-lg"
                    >
                      Save Experience
                    </button>
                  </div>
                </form>
              )}

              <div className="space-y-4">
                {experiences.length === 0 ? (
                  <p className="text-xs text-zinc-500 italic py-2">No work experiences added yet.</p>
                ) : (
                  experiences.map((exp) => (
                    <div key={exp.id} className="relative group p-3 rounded-xl hover:bg-zinc-900/20 border border-transparent hover:border-zinc-850/60 transition-all flex gap-3">
                      <div className="h-8 w-8 rounded-lg bg-accent-primary/10 flex items-center justify-center flex-shrink-0 text-accent-primary">
                        <Briefcase size={16} />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h4 className="text-xs font-bold text-zinc-200">{exp.title}</h4>
                          <button 
                            onClick={() => handleDeleteExp(exp.id)} 
                            className="opacity-0 group-hover:opacity-100 p-1 text-zinc-500 hover:text-rose-400 rounded transition-all"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                        <p className="text-[11px] text-zinc-400 font-semibold">{exp.company}</p>
                        <p className="text-[10px] text-zinc-500 font-medium mt-0.5">{exp.duration}</p>
                        {exp.description && (
                          <p className="text-[11px] text-zinc-350 leading-relaxed mt-2 whitespace-pre-wrap">{exp.description}</p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </GlassCard>

            {/* Projects Section */}
            <GlassCard hoverEffect={false} className="space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-zinc-800/80">
                <h3 className="text-xs font-bold text-zinc-350 uppercase tracking-wider flex items-center gap-1.5">
                  <Code size={14} className="text-accent-primary" /> Core Projects
                </h3>
                <button 
                  onClick={() => setShowAddProj(!showAddProj)}
                  className="p-1 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-lg transition-colors flex items-center gap-1 text-[11px] font-semibold"
                >
                  <Plus size={14} /> Add
                </button>
              </div>

              {showAddProj && (
                <form onSubmit={handleAddProject} className="p-4 rounded-xl bg-zinc-950/40 border border-zinc-800/80 space-y-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Project Title</label>
                    <input 
                      type="text" 
                      required 
                      value={projTitle} 
                      onChange={(e) => setProjTitle(e.target.value)} 
                      placeholder="e.g. CampusOne AI"
                      className="w-full px-3 py-1.5 rounded-lg glass-input text-xs text-zinc-200"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Tech Stack (Comma Separated)</label>
                    <input 
                      type="text" 
                      value={projTech} 
                      onChange={(e) => setProjTech(e.target.value)} 
                      placeholder="e.g. React, Express, MongoDB"
                      className="w-full px-3 py-1.5 rounded-lg glass-input text-xs text-zinc-200"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Description</label>
                    <textarea 
                      rows={2} 
                      value={projDesc} 
                      onChange={(e) => setProjDesc(e.target.value)} 
                      placeholder="Explain features, algorithms, and key achievements..."
                      className="w-full p-3 rounded-lg glass-input text-xs text-zinc-200"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button 
                      type="button" 
                      onClick={() => setShowAddProj(false)} 
                      className="px-3 py-1 bg-zinc-900 border border-zinc-800 text-zinc-450 hover:text-zinc-200 text-xs font-semibold rounded-lg"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="px-3.5 py-1 bg-accent-primary hover:bg-accent-primary/95 text-white text-xs font-semibold rounded-lg"
                    >
                      Save Project
                    </button>
                  </div>
                </form>
              )}

              <div className="space-y-4">
                {projects.length === 0 ? (
                  <p className="text-xs text-zinc-500 italic py-2">No projects added yet.</p>
                ) : (
                  projects.map((proj) => (
                    <div key={proj.id} className="relative group p-3 rounded-xl hover:bg-zinc-900/20 border border-transparent hover:border-zinc-850/60 transition-all flex gap-3">
                      <div className="h-8 w-8 rounded-lg bg-accent-primary/10 flex items-center justify-center flex-shrink-0 text-accent-primary">
                        <Code size={16} />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h4 className="text-xs font-bold text-zinc-200">{proj.title}</h4>
                          <button 
                            onClick={() => handleDeleteProj(proj.id)} 
                            className="opacity-0 group-hover:opacity-100 p-1 text-zinc-500 hover:text-rose-400 rounded transition-all"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                        {proj.tech && (
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            {proj.tech.split(',').map((tech, idx) => (
                              <span key={idx} className="text-[9px] font-semibold text-accent-secondary bg-accent-secondary/5 border border-accent-secondary/10 px-1.5 py-0.5 rounded">
                                {tech.trim()}
                              </span>
                            ))}
                          </div>
                        )}
                        {proj.description && (
                          <p className="text-[11px] text-zinc-350 leading-relaxed mt-2 whitespace-pre-wrap">{proj.description}</p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </GlassCard>

            {/* Licenses & Certifications Section */}
            <GlassCard hoverEffect={false} className="space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-zinc-800/80">
                <h3 className="text-xs font-bold text-zinc-350 uppercase tracking-wider flex items-center gap-1.5">
                  <Award size={14} className="text-accent-primary" /> Licenses & Certifications
                </h3>
                <button 
                  onClick={() => setShowAddCert(!showAddCert)}
                  className="p-1 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-lg transition-colors flex items-center gap-1 text-[11px] font-semibold"
                >
                  <Plus size={14} /> Add
                </button>
              </div>

              {showAddCert && (
                <form onSubmit={handleAddCertificate} className="p-4 rounded-xl bg-zinc-950/40 border border-zinc-800/80 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Certification Name</label>
                      <input 
                        type="text" 
                        required 
                        value={certName} 
                        onChange={(e) => setCertName(e.target.value)} 
                        placeholder="e.g. AWS Cloud Practitioner"
                        className="w-full px-3 py-1.5 rounded-lg glass-input text-xs text-zinc-200"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Issuer Organization</label>
                      <input 
                        type="text" 
                        required 
                        value={certIssuer} 
                        onChange={(e) => setCertIssuer(e.target.value)} 
                        placeholder="e.g. Amazon Web Services"
                        className="w-full px-3 py-1.5 rounded-lg glass-input text-xs text-zinc-200"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Date Issued</label>
                    <input 
                      type="text" 
                      value={certDate} 
                      onChange={(e) => setCertDate(e.target.value)} 
                      placeholder="e.g. November 2025"
                      className="w-full px-3 py-1.5 rounded-lg glass-input text-xs text-zinc-200"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button 
                      type="button" 
                      onClick={() => setShowAddCert(false)} 
                      className="px-3 py-1 bg-zinc-900 border border-zinc-800 text-zinc-450 hover:text-zinc-200 text-xs font-semibold rounded-lg"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="px-3.5 py-1 bg-accent-primary hover:bg-accent-primary/95 text-white text-xs font-semibold rounded-lg"
                    >
                      Save Certificate
                    </button>
                  </div>
                </form>
              )}

              <div className="space-y-4">
                {certificates.length === 0 ? (
                  <p className="text-xs text-zinc-500 italic py-2">No certificates added yet.</p>
                ) : (
                  certificates.map((cert) => (
                    <div key={cert.id} className="relative group p-3 rounded-xl hover:bg-zinc-900/20 border border-transparent hover:border-zinc-850/60 transition-all flex gap-3">
                      <div className="h-8 w-8 rounded-lg bg-accent-primary/10 flex items-center justify-center flex-shrink-0 text-accent-primary">
                        <Award size={16} />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h4 className="text-xs font-bold text-zinc-200">{cert.name}</h4>
                          <button 
                            onClick={() => handleDeleteCert(cert.id)} 
                            className="opacity-0 group-hover:opacity-100 p-1 text-zinc-500 hover:text-rose-400 rounded transition-all"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                        <p className="text-[11px] text-zinc-400 font-semibold">{cert.issuer}</p>
                        <p className="text-[10px] text-zinc-500 font-medium mt-0.5">{cert.date || 'Verified'}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </GlassCard>

          </div>

          {/* Placement Rank Board Column (Shows ONLY our rank unmasked) */}
          <div className="space-y-6">
            
            {/* Rank Box */}
            <GlassCard hoverEffect={false} className="p-6 border border-accent-primary/20 bg-zinc-900/60 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-3 opacity-[0.03]">
                <Trophy size={96} className="text-accent-secondary" />
              </div>
              
              <span className="text-[9px] font-bold text-accent-secondary bg-accent-secondary/15 border border-accent-secondary/20 px-2 py-0.5 rounded-lg uppercase tracking-wider">
                Active Placement Index
              </span>
              
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-5xl font-extrabold bg-gradient-to-r from-accent-primary via-accent-secondary to-white bg-clip-text text-transparent tracking-tight">#{placementRank}</span>
                <span className="text-xs text-zinc-500 font-medium">out of 450 applicants</span>
              </div>
              
              <div className="mt-5 space-y-2">
                <div className="flex justify-between text-xs text-zinc-400 font-semibold">
                  <span>Profile Audit Rating</span>
                  <span className="text-accent-primary font-bold">{profileScore}%</span>
                </div>
                <div className="w-full bg-zinc-800/80 rounded-full h-1.5 overflow-hidden border border-zinc-750/30">
                  <div 
                    className="bg-gradient-to-r from-accent-primary to-accent-secondary h-1.5 rounded-full transition-all duration-500" 
                    style={{ width: `${profileScore}%` }}
                  />
                </div>
              </div>
              
              <p className="text-[10px] text-zinc-500 leading-relaxed mt-4 pt-1.5 border-t border-zinc-850">
                🚀 Adding experience logs, technical frameworks, and certifications directly improves your Placement readiness score and advances your placement index.
              </p>
            </GlassCard>

            {/* Masked Standings Leaderboard */}
            <GlassCard hoverEffect={false} className="p-5 space-y-4">
              <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp size={14} className="text-accent-secondary" /> Rank Board Standings
              </h3>
              
              <div className="space-y-2.5">
                {/* Competitor Row (Masked) */}
                <div className="flex justify-between items-center p-2.5 rounded-lg bg-zinc-950/10 border border-zinc-900/40 opacity-[0.12] select-none blur-[2.5px] pointer-events-none">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-zinc-500 w-5">#1</span>
                    <div className="h-6 w-6 rounded-full bg-zinc-800" />
                    <span className="font-semibold text-zinc-400">Rahul Sharma</span>
                  </div>
                  <span className="text-zinc-550 font-medium text-xs">96% Rating</span>
                </div>
                
                {/* Competitor Row (Masked) */}
                <div className="flex justify-between items-center p-2.5 rounded-lg bg-zinc-950/10 border border-zinc-900/40 opacity-[0.12] select-none blur-[2.5px] pointer-events-none">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-zinc-500 w-5">#2</span>
                    <div className="h-6 w-6 rounded-full bg-zinc-800" />
                    <span className="font-semibold text-zinc-400">Priya Patel</span>
                  </div>
                  <span className="text-zinc-550 font-medium text-xs">94% Rating</span>
                </div>

                <div className="text-center py-1 text-zinc-600 font-semibold tracking-widest text-[9px]">
                  ••••
                </div>

                {/* ACTIVE USER ROW - HIGHLIGHTED & UNMASKED */}
                <div className="flex justify-between items-center p-3 rounded-xl bg-gradient-to-r from-accent-primary/10 to-accent-secondary/5 border border-accent-primary/35 shadow-glow shadow-accent-primary/5 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-1.5 h-full bg-accent-primary" />
                  <div className="flex items-center gap-3">
                    <span className="font-black text-accent-primary w-5 text-sm">#{placementRank}</span>
                    <img 
                      src={user.avatar} 
                      alt={user.name} 
                      className="h-8 w-8 rounded-xl border border-accent-primary/25 bg-zinc-950/60 object-cover"
                    />
                    <div>
                      <span className="font-bold text-zinc-200 block text-xs">{user.name} (You)</span>
                      <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wide">
                        {user.studentDetails?.rollNo || 'CS-2023-042'}
                      </span>
                    </div>
                  </div>
                  <span className="text-accent-secondary font-black text-xs pr-1">{profileScore}% Rating</span>
                </div>

                <div className="text-center py-1 text-zinc-600 font-semibold tracking-widest text-[9px]">
                  ••••
                </div>

                {/* Competitor Row (Masked) */}
                <div className="flex justify-between items-center p-2.5 rounded-lg bg-zinc-950/10 border border-zinc-900/40 opacity-[0.12] select-none blur-[2.5px] pointer-events-none">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-zinc-500 w-5">#{placementRank + 1}</span>
                    <div className="h-6 w-6 rounded-full bg-zinc-800" />
                    <span className="font-semibold text-zinc-400">Amit Kumar</span>
                  </div>
                  <span className="text-zinc-550 font-medium text-xs">68% Rating</span>
                </div>
              </div>

              {/* Informative footer regarding masked standings */}
              <div className="text-[10px] text-zinc-500 leading-relaxed bg-zinc-950/40 p-3.5 rounded-xl border border-zinc-850/80">
                🔒 <strong>Privacy Guard Enabled:</strong> To maintain candidate confidentiality and ensure compliant competitive integrity, other student names, records, and ratings are completely masked. Only your unmasked standings are displayed.
              </div>
            </GlassCard>

          </div>

        </div>
      )}

      {/* Admin Create drive modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <GlassCard hoverEffect={false} className="w-full max-w-lg p-6 border border-zinc-800/80 shadow-2xl relative animate-in zoom-in-95 duration-200">
            <h3 className="text-base font-semibold text-zinc-200 mb-4 pb-2 border-b border-zinc-800/80">Publish Recruitment Drive</h3>
            
            <form onSubmit={handleCreatePlacement} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Company Name</label>
                  <input
                    type="text"
                    required
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="e.g. Google"
                    className="w-full px-4 py-2.5 rounded-xl glass-input text-xs text-zinc-300 focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Role Title</label>
                  <input
                    type="text"
                    required
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="e.g. Associate SWE"
                    className="w-full px-4 py-2.5 rounded-xl glass-input text-xs text-zinc-300 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Job Description</label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detail the job descriptions..."
                  className="w-full p-4 rounded-xl glass-input text-xs text-zinc-300 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Prerequisites (Requirements)</label>
                <input
                  type="text"
                  required
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                  placeholder="CGPA > 8.0, Proficient in Python/React..."
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-xs text-zinc-300 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Salary CTC (Package)</label>
                  <input
                    type="text"
                    required
                    value={ctc}
                    onChange={(e) => setCtc(e.target.value)}
                    placeholder="e.g. 18 LPA"
                    className="w-full px-4 py-2.5 rounded-xl glass-input text-xs text-zinc-300 focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Application Deadline</label>
                  <input
                    type="date"
                    required
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl glass-input text-xs text-zinc-300 focus:outline-none"
                  />
                </div>
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
                  Publish Posting
                </button>
              </div>
            </form>
          </GlassCard>
        </div>
      )}

    </div>
  );
};

export default Placements;
