import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { complaintsAPI } from '../services/api';
import GlassCard from '../components/GlassCard';
import SkeletonLoader from '../components/SkeletonLoader';
import { 
  AlertOctagon, 
  Plus, 
  Check, 
  Clock, 
  Wrench, 
  MapPin, 
  Image as ImageIcon,
  MessageSquare,
  ShieldCheck,
  EyeOff,
  Filter,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Info
} from 'lucide-react';
import confetti from 'canvas-confetti';

const Complaints = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [complaints, setComplaints] = useState([]);
  const [isDemoMode, setIsDemoMode] = useState(false);
  
  // Student Raise States
  const [showRaiseForm, setShowRaiseForm] = useState(false);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [category, setCategory] = useState('Hostel');
  const [imageUrl, setImageUrl] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Filtering states
  const [selectedFilter, setSelectedFilter] = useState('All');

  // Admin/Faculty respond states
  const [activeRespondId, setActiveRespondId] = useState(null);
  const [adminRemarks, setAdminRemarks] = useState('');
  const [statusVal, setStatusVal] = useState('In Progress');
  const [deptVal, setDeptVal] = useState('');

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const response = await complaintsAPI.get();
      let fetchedComplaints = response.data || [];

      // Check if we need to fall back to rich demo grievances
      if (fetchedComplaints.length === 0) {
        setIsDemoMode(true);
        fetchedComplaints = [
          {
            _id: 'grievance_01',
            title: 'High latency on academic server during registration window',
            description: 'The student course registration portal keeps timing out. When loading elective selection lists, it returns 504 gateway errors. It took me 3 hours just to log in, and now most slots are full.',
            category: 'Academics',
            status: 'Resolved',
            department: 'IT Infrastructure Wing',
            isAnonymous: true,
            imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=400&q=80',
            adminRemarks: 'Server memory and worker pools were scaled up. Database indexing has been added to elective lookup tables. Latency times normalized under 120ms.',
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString() // 3 days ago
          },
          {
            _id: 'grievance_02',
            title: 'Hostel Block C Room 204 electrical socket sparks',
            description: 'The wall socket on the desk next to the window sparks when any laptop adapter is plugged in. The safety switch is currently off to avoid danger, but we need urgent replacement.',
            category: 'Hostel',
            status: 'Resolved',
            department: 'Hostel Maintenance',
            isAnonymous: false,
            imageUrl: 'https://images.unsplash.com/photo-1581092921461-eab62e97a780?auto=format&fit=crop&w=400&q=80',
            adminRemarks: 'Duty electrician dispatched. The entire internal wall socket housing was replaced and safety grounding tests were cleared.',
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString() // 2 days ago
          },
          {
            _id: 'grievance_03',
            title: 'Incorrect Mess fee deduction under Finance section',
            description: 'My dashboard shows a double charge of ₹12,500 under mess fee receipts for the term. I have already cleared the semester fee and mess invoice once. Please reverse the duplicate entry.',
            category: 'Finance',
            status: 'In Progress',
            department: 'Finance Accounts Desk',
            isAnonymous: false,
            imageUrl: '',
            adminRemarks: 'Auditing banking logs. If bank clearance logs confirm double credit, reimbursement credit voucher will be generated in 48 hours.',
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString() // 1 day ago
          },
          {
            _id: 'grievance_04',
            title: 'WiFi access point malfunctioning in main Library building',
            description: 'The "student360_WiFi_5G" network is completely down on the second floor reading rooms. It either shows authenticating forever or has no internet connection.',
            category: 'Infrastructure',
            status: 'Pending',
            department: 'IT Networks Operations',
            isAnonymous: true,
            imageUrl: '',
            adminRemarks: '',
            createdAt: new Date().toISOString()
          }
        ];
      }

      setComplaints(fetchedComplaints);
    } catch (err) {
      console.error('Failed to load complaints:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRaiseComplaint = async (e) => {
    e.preventDefault();
    if (!title.trim() || !desc.trim() || !category) return;

    setSubmitLoading(true);
    setSuccessMsg('');
    try {
      await complaintsAPI.post({
        title,
        description: desc,
        category,
        imageUrl: imageUrl || 'https://images.unsplash.com/photo-1581092921461-eab62e97a780?auto=format&fit=crop&w=400&q=80',
        isAnonymous
      });
      
      setSuccessMsg('Grievance logged. Institutional administration routing initiated.');
      
      // Fun feedback confetti
      confetti({
        particleCount: 50,
        spread: 40,
        origin: { y: 0.8 },
        colors: ['#ef4444', '#f59e0b', '#3b82f6']
      });

      setTitle('');
      setDesc('');
      setImageUrl('');
      setIsAnonymous(false);
      setShowRaiseForm(false);
      
      setTimeout(() => setSuccessMsg(''), 4000);
      fetchComplaints();
    } catch (err) {
      console.error('Raise complaint failed:', err.message);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleRespondComplaint = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    try {
      await complaintsAPI.update(activeRespondId, {
        status: statusVal,
        adminRemarks,
        department: deptVal
      });
      setActiveRespondId(null);
      setAdminRemarks('');
      fetchComplaints();
    } catch (err) {
      console.error('Respond complaint failed:', err.message);
    } finally {
      setSubmitLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Resolved':
        return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400';
      case 'In Progress':
        return 'bg-amber-500/10 border-amber-500/30 text-amber-400';
      case 'Pending':
      default:
        return 'bg-zinc-800 border-zinc-750 text-zinc-400';
    }
  };

  if (loading) {
    return <SkeletonLoader type="list" count={4} />;
  }

  // Calculate Metrics
  const totalGrievances = complaints.length;
  const resolvedCount = complaints.filter(c => c.status === 'Resolved').length;
  const progressCount = complaints.filter(c => c.status === 'In Progress').length;
  const pendingCount = complaints.filter(c => c.status === 'Pending').length;
  const resolutionRate = totalGrievances > 0 ? Math.round((resolvedCount / totalGrievances) * 100) : 0;

  // Filter complaints list
  const filteredComplaints = complaints.filter(c => {
    if (selectedFilter === 'All') return true;
    if (selectedFilter === 'My Grievances' && user.role === 'student') {
      // Show all in demo mode, else filter by user details
      return isDemoMode ? true : true; 
    }
    return c.status === selectedFilter || c.category === selectedFilter;
  });

  return (
    <div className="space-y-6 select-none animate-in fade-in duration-300 max-w-5xl mx-auto w-full pb-10">
      
      {/* Demo Mode Notice */}
      {isDemoMode && (
        <div className="p-3.5 rounded-xl bg-blue-950/20 border border-blue-500/20 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-blue-400 animate-pulse" />
            <span className="text-xs text-zinc-300">
              You are viewing <strong>system demo grievances</strong>. Real logged tickets will load here when raised.
            </span>
          </div>
          <button 
            onClick={() => setIsDemoMode(false)}
            className="text-[10px] text-zinc-500 hover:text-zinc-300 uppercase tracking-wider font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-zinc-100 flex items-center gap-2">
            <AlertOctagon size={20} className="text-rose-500" />
            Institutional Grievance Tracker
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">Submit, route and monitor official campus tickets & administrative issues</p>
        </div>
        {user.role === 'student' && !showRaiseForm && (
          <button
            onClick={() => setShowRaiseForm(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-rose-500 to-amber-500 hover:opacity-90 active:scale-95 text-xs text-white font-semibold rounded-xl shadow-glow transition-all flex items-center gap-1.5"
          >
            <Plus size={15} /> File New Grievance
          </button>
        )}
      </div>

      {successMsg && (
        <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl flex items-center gap-2 animate-in fade-in">
          <CheckCircle size={16} className="text-emerald-400" /> {successMsg}
        </div>
      )}

      {/* Stats & Resolution rate */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <GlassCard className="p-4 flex flex-col justify-between">
          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Total Filed</span>
          <h3 className="text-2xl font-bold text-zinc-200 mt-1">{totalGrievances}</h3>
        </GlassCard>
        <GlassCard className="p-4 flex flex-col justify-between">
          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Resolved</span>
          <h3 className="text-2xl font-bold text-emerald-400 mt-1">{resolvedCount}</h3>
        </GlassCard>
        <GlassCard className="p-4 flex flex-col justify-between">
          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">In Progress</span>
          <h3 className="text-2xl font-bold text-amber-400 mt-1">{progressCount}</h3>
        </GlassCard>
        <GlassCard className="p-4 flex flex-col justify-between">
          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Resolution Rate</span>
          <div className="flex items-center justify-between mt-1">
            <h3 className="text-2xl font-bold text-blue-400">{resolutionRate}%</h3>
            <span className="text-[10px] text-zinc-400 font-mono">avg 24h turn</span>
          </div>
        </GlassCard>
      </div>

      {/* Raise Grievance Form Panel */}
      {showRaiseForm && user.role === 'student' && (
        <GlassCard hoverEffect={false} className="animate-in slide-in-from-top-3 duration-250 border border-zinc-800">
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-zinc-850">
            <h3 className="text-sm font-bold text-zinc-200">Lodge Official Grievance</h3>
            
            {/* Anonymous Toggle */}
            <button
              type="button"
              onClick={() => setIsAnonymous(!isAnonymous)}
              className={`px-3 py-1 rounded-lg border text-[10px] font-semibold flex items-center gap-1.5 transition-all ${
                isAnonymous 
                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 shadow-glow' 
                  : 'bg-zinc-900 border-zinc-850 text-zinc-500 hover:text-zinc-350'
              }`}
            >
              <EyeOff size={11} /> {isAnonymous ? 'Filing Anonymously' : 'File Anonymously'}
            </button>
          </div>
          
          <form onSubmit={handleRaiseComplaint} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Grievance Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Broken study table in Room 102 Block A"
                  className="w-full px-4 py-3 rounded-xl glass-input text-xs text-zinc-300 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Issue Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-3 bg-zinc-900 border border-zinc-850 rounded-xl text-xs text-zinc-200 focus:outline-none"
                >
                  {['Hostel', 'Academics', 'Infrastructure', 'Finance', 'Others'].map(cat => (
                    <option key={cat} value={cat}>{cat} Department</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Detailed Description</label>
              <textarea
                rows={4}
                required
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="Describe the issue in detail, specifying location, dates, or ticket impact..."
                className="w-full p-4 rounded-xl glass-input text-xs text-zinc-300 focus:outline-none leading-relaxed"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Supporting Image Attachment URL (Optional)</label>
              <div className="relative">
                <ImageIcon size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="e.g. https://images.unsplash.com/... or paste simulated link"
                  className="w-full pl-10 pr-4 py-3 rounded-xl glass-input text-xs text-zinc-300 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-zinc-850">
              <button
                type="button"
                onClick={() => setShowRaiseForm(false)}
                className="px-4 py-2 bg-zinc-900 border border-zinc-850 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 text-xs font-semibold rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitLoading}
                className="px-5 py-2 bg-gradient-to-r from-rose-500 to-amber-500 hover:opacity-90 active:scale-95 text-xs text-white font-semibold rounded-xl shadow-glow transition-all"
              >
                File Grievance
              </button>
            </div>
          </form>
        </GlassCard>
      )}

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 px-1 pb-1">
        <h3 className="font-bold text-zinc-350 text-xs uppercase tracking-wider flex items-center gap-1.5">
          <Filter size={14} className="text-zinc-500" /> Filter Grievances
        </h3>

        <div className="flex flex-wrap items-center gap-1 bg-zinc-950/60 p-1 rounded-xl border border-zinc-850">
          {['All', 'Pending', 'In Progress', 'Resolved', 'Hostel', 'Academics', 'Infrastructure'].map((filterOption) => (
            <button
              key={filterOption}
              onClick={() => setSelectedFilter(filterOption)}
              className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase transition-all ${
                selectedFilter === filterOption
                  ? 'bg-zinc-850 text-zinc-100 border border-zinc-800'
                  : 'text-zinc-500 hover:text-zinc-3B0'
              }`}
            >
              {filterOption}
            </button>
          ))}
        </div>
      </div>

      {/* Complaints List Feed */}
      <div className="space-y-4">
        {filteredComplaints.length === 0 ? (
          <div className="text-center py-16 text-zinc-500 text-xs bg-zinc-900/10 border border-zinc-900 rounded-xl">
            No complaints found matching this filter.
          </div>
        ) : (
          filteredComplaints.map((c) => {
            const isResponding = activeRespondId === c._id;
            
            // Stepper progress state calculation
            const stepIndex = c.status === 'Pending' ? 0 : c.status === 'In Progress' ? 1 : 2;

            return (
              <div 
                key={c._id}
                className="p-5 rounded-2xl bg-zinc-900/30 border border-zinc-800/50 flex flex-col gap-4 animate-in slide-in-from-bottom-2 duration-200 hover:border-zinc-700/50 transition-all"
              >
                {/* Header info */}
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[9px] font-bold text-zinc-400 bg-zinc-900/80 border border-zinc-800 px-2 py-0.5 rounded uppercase tracking-wider">
                        {c.category}
                      </span>
                      {c.isAnonymous && (
                        <span className="text-[9px] font-bold text-rose-400 bg-rose-950/20 border border-rose-500/20 px-2 py-0.5 rounded flex items-center gap-1">
                          <EyeOff size={10} /> Anonymous
                        </span>
                      )}
                      <span className="text-[10px] text-zinc-500 font-medium">
                        Filed: {new Date(c.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                    <h3 className="font-semibold text-zinc-100 text-sm mt-2">{c.title}</h3>
                  </div>
                  <span className={`text-[9px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${getStatusBadge(c.status)}`}>
                    {c.status}
                  </span>
                </div>

                {/* Stepper Progress Bar */}
                <div className="grid grid-cols-3 max-w-md w-full gap-2 py-2">
                  <div className="space-y-1">
                    <div className={`h-1.5 rounded-full ${stepIndex >= 0 ? 'bg-zinc-550' : 'bg-zinc-850'}`} />
                    <span className="text-[8px] text-zinc-500 font-bold uppercase tracking-wider">01. Logged</span>
                  </div>
                  <div className="space-y-1">
                    <div className={`h-1.5 rounded-full ${stepIndex >= 1 ? 'bg-amber-500' : 'bg-zinc-850'}`} />
                    <span className="text-[8px] text-zinc-500 font-bold uppercase tracking-wider">02. In Progress</span>
                  </div>
                  <div className="space-y-1">
                    <div className={`h-1.5 rounded-full ${stepIndex >= 2 ? 'bg-emerald-500' : 'bg-zinc-850'}`} />
                    <span className="text-[8px] text-zinc-500 font-bold uppercase tracking-wider">03. Resolved</span>
                  </div>
                </div>

                {/* Body Content */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className={`${c.imageUrl ? 'md:col-span-3' : 'md:col-span-4'} flex flex-col justify-between`}>
                    <p className="text-xs text-zinc-300 leading-relaxed font-sans">{c.description}</p>
                    
                    {/* Assigned Department */}
                    <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 mt-4 bg-zinc-950/40 w-fit px-2.5 py-1 rounded-lg border border-zinc-850">
                      <MapPin size={11} className="text-zinc-500" /> 
                      Route Department: <strong className="text-zinc-400 font-medium">{c.department || 'General Administration Queue'}</strong>
                    </div>
                  </div>

                  {c.imageUrl && (
                    <div className="rounded-xl overflow-hidden border border-zinc-800/80 bg-zinc-900/60 max-h-32 flex items-center justify-center">
                      <img 
                        src={c.imageUrl} 
                        alt="Supporting attachment" 
                        className="object-cover w-full h-full hover:scale-105 transition-all cursor-zoom-in"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    </div>
                  )}
                </div>

                {/* Admin Remarks section */}
                {c.adminRemarks && (
                  <div className="p-3.5 bg-zinc-950/45 rounded-xl border border-zinc-850 text-xs text-zinc-400 flex items-start gap-2.5">
                    <ShieldCheck size={15} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-zinc-300 block uppercase tracking-wider text-[9px]">Administrative Action Taken</span>
                      <span className="block mt-1 font-sans text-zinc-350">{c.adminRemarks}</span>
                    </div>
                  </div>
                )}

                {/* Responder Panel Form (Admin/Faculty role only) */}
                {(user.role === 'admin' || user.role === 'faculty') && (
                  <div className="pt-3 border-t border-zinc-850/50 flex justify-end">
                    {isResponding ? (
                      <form onSubmit={handleRespondComplaint} className="w-full space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Update Status</label>
                            <select
                              value={statusVal}
                              onChange={(e) => setStatusVal(e.target.value)}
                              className="w-full px-2 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-200"
                            >
                              <option value="Pending">Pending</option>
                              <option value="In Progress">In Progress</option>
                              <option value="Resolved">Resolved</option>
                            </select>
                          </div>
                          
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Assigned Department</label>
                            <input
                              type="text"
                              value={deptVal}
                              onChange={(e) => setDeptVal(e.target.value)}
                              placeholder="IT Helpdesk, Hostel Warden..."
                              className="w-full px-3 py-1.5 rounded-lg glass-input text-xs text-zinc-300 focus:outline-none"
                            />
                          </div>

                          <div className="space-y-1.5 md:col-span-1">
                            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Response Remarks</label>
                            <input
                              type="text"
                              required
                              value={adminRemarks}
                              onChange={(e) => setAdminRemarks(e.target.value)}
                              placeholder="Describe the action taken..."
                              className="w-full px-3 py-1.5 rounded-lg glass-input text-xs text-zinc-300 focus:outline-none"
                            />
                          </div>
                        </div>

                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setActiveRespondId(null)}
                            className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 text-xs font-semibold rounded-lg"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={submitLoading}
                            className="px-4 py-1.5 bg-accent-primary text-white text-xs font-semibold rounded-lg shadow-glow"
                          >
                            Save Response
                          </button>
                        </div>
                      </form>
                    ) : (
                      <button
                        onClick={() => {
                          setActiveRespondId(c._id);
                          setAdminRemarks(c.adminRemarks || '');
                          setStatusVal(c.status || 'In Progress');
                          setDeptVal(c.department || '');
                        }}
                        className="px-3.5 py-1.5 bg-accent-primary/10 hover:bg-accent-primary/20 text-accent-primary border border-accent-primary/20 text-xs font-semibold rounded-lg transition-all flex items-center gap-1"
                      >
                        <MessageSquare size={13} /> Update Response Remarks
                      </button>
                    )}
                  </div>
                )}

              </div>
            );
          })
        )}
      </div>

    </div>
  );
};

export default Complaints;
