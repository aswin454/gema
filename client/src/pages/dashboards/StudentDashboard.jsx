import React, { useState, useEffect } from 'react';
import { studentAPI, attendanceAPI } from '../../services/api';
import GlassCard from '../../components/GlassCard';
import SkeletonLoader from '../../components/SkeletonLoader';
import { 
  TrendingUp, 
  BookOpen, 
  Clock, 
  Briefcase, 
  HelpCircle, 
  AlertTriangle,
  GraduationCap,
  Sparkles,
  Calendar,
  ChevronRight
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';

const StudentDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [attendanceChartData, setAttendanceChartData] = useState([]);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await studentAPI.getDashboard();
        setData(response.data);

        // Fetch attendance history to build chart data
        const attResponse = await attendanceAPI.get();
        const records = attResponse.data.records || [];
        
        // Mock weekly/monthly chart points based on logs
        const chartPoints = [
          { name: 'Week 1', percentage: 85 },
          { name: 'Week 2', percentage: 80 },
          { name: 'Week 3', percentage: 78 },
          { name: 'Week 4', percentage: 82 },
          { name: 'Week 5', percentage: response.data.stats.attendance }
        ];
        setAttendanceChartData(chartPoints);
      } catch (err) {
        console.error('Failed to load dashboard:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <SkeletonLoader type="card" count={4} />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <SkeletonLoader type="chart" />
          </div>
          <div>
            <SkeletonLoader type="list" count={3} />
          </div>
        </div>
      </div>
    );
  }

  const { stats, timetable, recentAssignments, aiRecommendation, profile } = data;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* AI Recommendation Glow Banner */}
      <GlassCard 
        hoverEffect={false} 
        className="relative overflow-hidden bg-gradient-to-r from-accent-primary/20 via-accent-secondary/15 to-transparent border border-accent-primary/20 p-5 rounded-2xl"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-accent-primary/25 border border-accent-primary/45 flex items-center justify-center text-white shadow-glow">
              <Sparkles size={18} className="text-accent-secondary" />
            </div>
            <div>
              <h4 className="font-semibold text-zinc-100 flex items-center gap-1.5 text-sm md:text-base">
                student360 AI Recommendation
              </h4>
              <p className="text-xs md:text-sm text-zinc-300 mt-1 max-w-2xl leading-relaxed">
                "{aiRecommendation}"
              </p>
            </div>
          </div>
          {stats.attendance < 85 && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs font-semibold text-rose-400">
              <AlertTriangle size={14} /> Critical Attendance Alert
            </div>
          )}
        </div>
      </GlassCard>

      {/* Numerical Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <GlassCard hoverEffect={true} className="flex justify-between items-center">
          <div>
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">Attendance</span>
            <span className={`text-2xl font-bold block mt-2 ${stats.attendance < 85 ? 'text-rose-400' : 'text-zinc-100'}`}>
              {stats.attendance}%
            </span>
            <span className="text-xs text-zinc-500 mt-1 block">Req. Minimum: 85%</span>
          </div>
          <div className={`h-11 w-11 rounded-xl flex items-center justify-center ${stats.attendance < 85 ? 'bg-rose-500/10 text-rose-400' : 'bg-accent-primary/10 text-accent-primary'}`}>
            <TrendingUp size={20} />
          </div>
        </GlassCard>

        <GlassCard hoverEffect={true} className="flex justify-between items-center">
          <div>
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">Enrolled Courses</span>
            <span className="text-2xl font-bold text-zinc-100 block mt-2">{stats.coursesCount}</span>
            <span className="text-xs text-zinc-500 mt-1 block">Active this Semester</span>
          </div>
          <div className="h-11 w-11 rounded-xl bg-accent-secondary/10 text-accent-secondary flex items-center justify-center">
            <BookOpen size={20} />
          </div>
        </GlassCard>

        <GlassCard hoverEffect={true} className="flex justify-between items-center">
          <div>
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">Pending Tasks</span>
            <span className="text-2xl font-bold text-zinc-100 block mt-2">{stats.pendingAssignments}</span>
            <span className="text-xs text-zinc-500 mt-1 block">Due this week</span>
          </div>
          <div className="h-11 w-11 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
            <Clock size={20} />
          </div>
        </GlassCard>

        <GlassCard hoverEffect={true} className="flex justify-between items-center">
          <div>
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">Job Listings</span>
            <span className="text-2xl font-bold text-zinc-100 block mt-2">{stats.activePlacements}</span>
            <span className="text-xs text-zinc-500 mt-1 block">Drives Recruiting Now</span>
          </div>
          <div className="h-11 w-11 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <Briefcase size={20} />
          </div>
        </GlassCard>
      </div>

      {/* Main Content Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance Area Chart Card */}
        <div className="lg:col-span-2">
          <GlassCard hoverEffect={false} className="h-full flex flex-col justify-between">
            <div className="mb-4">
              <h3 className="text-base font-semibold text-zinc-200">Attendance Analytics</h3>
              <p className="text-xs text-zinc-500 mt-0.5">Academic Year 2026 - Weekly Progression</p>
            </div>
            <div className="h-64 w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={attendanceChartData}>
                  <defs>
                    <linearGradient id="colorAttendance" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#52525b" fontSize={11} tickLine={false} />
                  <YAxis domain={[0, 100]} stroke="#52525b" fontSize={11} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="percentage" 
                    stroke="#6366f1" 
                    strokeWidth={2.5}
                    fillOpacity={1} 
                    fill="url(#colorAttendance)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </div>

        {/* Timetable / Calendar Schedule */}
        <div>
          <GlassCard hoverEffect={false} className="h-full flex flex-col justify-between">
            <div className="mb-4 flex justify-between items-center">
              <div>
                <h3 className="text-base font-semibold text-zinc-200">Timetable Overview</h3>
                <p className="text-xs text-zinc-500 mt-0.5">Enrolled Course Schedules</p>
              </div>
              <Calendar size={18} className="text-zinc-500" />
            </div>

            <div className="space-y-3 flex-grow overflow-y-auto max-h-[250px] pr-1">
              {timetable.length === 0 ? (
                <div className="text-center py-12 text-zinc-500 text-xs">
                  No courses scheduled.
                </div>
              ) : (
                timetable.map((slot, index) => (
                  <div 
                    key={index}
                    className="p-3.5 rounded-xl bg-zinc-900/30 border border-zinc-800/40 space-y-2.5 transition-all hover:bg-zinc-900/50"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <span className="text-[10px] font-bold text-accent-secondary bg-accent-secondary/10 px-1.5 py-0.5 rounded uppercase tracking-wider">
                          {slot.courseCode} ({slot.day})
                        </span>
                        <h4 className="text-xs font-bold text-zinc-200 mt-2">{slot.courseName}</h4>
                        <span className="text-[10px] text-zinc-500 mt-0.5 block font-semibold">
                          {slot.time} • Room {slot.room}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className={`text-[11px] font-extrabold ${slot.percentage < 85 ? 'text-rose-400' : 'text-emerald-400'}`}>
                          {slot.percentage}% Attd.
                        </span>
                      </div>
                    </div>
                    
                    <div className="pt-2 border-t border-zinc-800/40 flex items-center justify-between text-[10px]">
                      <span className="text-zinc-500 font-medium">Recovery Required:</span>
                      {slot.percentage >= 85 ? (
                        <span className="text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded">
                          ✓ Target Met
                        </span>
                      ) : (
                        <span className="text-rose-400 font-bold bg-rose-500/10 border border-rose-500/20 px-1.5 py-0.5 rounded">
                          ⚠ Attend next {slot.classesNeededTo85} class{slot.classesNeededTo85 > 1 ? 'es' : ''}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Bottom Grid for Tasks & Complaints */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pending Assignments */}
        <GlassCard hoverEffect={false}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base font-semibold text-zinc-200">Recent Assignments Due</h3>
            <span className="text-xs text-zinc-500">Upcoming deadlines</span>
          </div>

          <div className="space-y-3">
            {recentAssignments.length === 0 ? (
              <div className="text-center py-8 text-zinc-500 text-xs">
                All assignments submitted! You are completely up to date.
              </div>
            ) : (
              recentAssignments.map((a) => (
                <div 
                  key={a._id}
                  className="p-3.5 rounded-xl bg-zinc-900/40 border border-zinc-800/50 flex justify-between items-center"
                >
                  <div className="overflow-hidden pr-2">
                    <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 uppercase tracking-wider">
                      {a.courseCode}
                    </span>
                    <h4 className="font-semibold text-zinc-200 text-sm truncate mt-1.5">{a.title}</h4>
                    <p className="text-xs text-zinc-500 mt-0.5 truncate">{a.description}</p>
                  </div>
                  <div className="text-right whitespace-nowrap">
                    <span className="text-xs text-zinc-400 block font-semibold">
                      {new Date(a.dueDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>
                    <span className="text-[10px] text-zinc-500 block mt-0.5">
                      Max marks: {a.maxMarks}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </GlassCard>

        {/* Quick Grievance Tracking / Raise */}
        <GlassCard hoverEffect={false}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base font-semibold text-zinc-200">Grievance Locker</h3>
            <span className="text-xs text-zinc-500">Real-time resolution updates</span>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-zinc-900/30 border border-zinc-800/40 text-center">
                <span className="text-2xl font-bold text-accent-primary">{stats.totalComplaints}</span>
                <span className="text-xs text-zinc-400 block mt-1">Lodge Complaints</span>
              </div>
              <div className="p-4 rounded-xl bg-zinc-900/30 border border-zinc-800/40 text-center">
                <span className="text-2xl font-bold text-accent-success">{stats.resolvedComplaints}</span>
                <span className="text-xs text-zinc-400 block mt-1">Resolved Complaints</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-accent-secondary/5 border border-accent-secondary/20 flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-zinc-200 text-xs">Need to file a new grievance?</h4>
                <p className="text-[11px] text-zinc-400 mt-0.5">Lodge academic, hostel or network issue reports.</p>
              </div>
              <button 
                onClick={() => window.location.href = '/complaints'}
                className="p-2 rounded-lg bg-accent-secondary/15 hover:bg-accent-secondary/25 border border-accent-secondary/30 text-accent-secondary text-xs font-semibold flex items-center gap-1 transition-all"
              >
                File Report <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default StudentDashboard;
