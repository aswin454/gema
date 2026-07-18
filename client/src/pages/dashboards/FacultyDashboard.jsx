import React, { useState, useEffect } from 'react';
import GlassCard from '../../components/GlassCard';
import SkeletonLoader from '../../components/SkeletonLoader';
import { complaintsAPI, assignmentsAPI, attendanceAPI } from '../../services/api';
import { 
  Users, 
  BookOpen, 
  FileCheck, 
  AlertCircle,
  Plus,
  Send,
  CheckCircle,
  Calendar,
  MessageSquare
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const FacultyDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [complaints, setComplaints] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [classAttendanceStats, setClassAttendanceStats] = useState([]);

  useEffect(() => {
    const fetchFacultyData = async () => {
      try {
        const complaintsRes = await complaintsAPI.get();
        setComplaints(complaintsRes.data);

        const assignmentsRes = await assignmentsAPI.get();
        setAssignments(assignmentsRes.data);

        // Class attendance aggregates mock
        setClassAttendanceStats([
          { name: 'CS-301 Web Eng', average: 84 },
          { name: 'CS-302 Database', average: 79 },
          { name: 'CS-303 AI Basics', average: 75 }
        ]);
      } catch (err) {
        console.error('Failed to load faculty dashboard data:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFacultyData();
  }, []);

  if (loading) {
    return <SkeletonLoader type="card" count={3} />;
  }

  const pendingComplaints = complaints.filter(c => c.status !== 'Resolved');
  const totalSubmissions = assignments.reduce((acc, curr) => acc + curr.submissions.length, 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <GlassCard hoverEffect={true} className="flex justify-between items-center">
          <div>
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">Courses Conducted</span>
            <span className="text-2xl font-bold text-zinc-100 block mt-2">3</span>
            <span className="text-xs text-zinc-500 mt-1 block">CSE Department</span>
          </div>
          <div className="h-11 w-11 rounded-xl bg-accent-primary/10 text-accent-primary flex items-center justify-center">
            <BookOpen size={20} />
          </div>
        </GlassCard>

        <GlassCard hoverEffect={true} className="flex justify-between items-center">
          <div>
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">Total Students</span>
            <span className="text-2xl font-bold text-zinc-100 block mt-2">124</span>
            <span className="text-xs text-zinc-500 mt-1 block">Active this term</span>
          </div>
          <div className="h-11 w-11 rounded-xl bg-accent-secondary/10 text-accent-secondary flex items-center justify-center">
            <Users size={20} />
          </div>
        </GlassCard>

        <GlassCard hoverEffect={true} className="flex justify-between items-center">
          <div>
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">Active Tasks</span>
            <span className="text-2xl font-bold text-zinc-100 block mt-2">{assignments.length}</span>
            <span className="text-xs text-zinc-500 mt-1 block">{totalSubmissions} Student Submissions</span>
          </div>
          <div className="h-11 w-11 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <FileCheck size={20} />
          </div>
        </GlassCard>

        <GlassCard hoverEffect={true} className="flex justify-between items-center">
          <div>
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">Assigned Complaints</span>
            <span className="text-2xl font-bold text-zinc-100 block mt-2">{pendingComplaints.length}</span>
            <span className="text-xs text-zinc-500 mt-1 block">Requires action</span>
          </div>
          <div className="h-11 w-11 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
            <AlertCircle size={20} />
          </div>
        </GlassCard>
      </div>

      {/* Main Graphs / Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Class Attendance bar chart */}
        <div className="lg:col-span-2">
          <GlassCard hoverEffect={false} className="h-full flex flex-col justify-between">
            <div className="mb-4">
              <h3 className="text-base font-semibold text-zinc-200">Class Attendance Metrics</h3>
              <p className="text-xs text-zinc-500 mt-0.5">Average attendance percentages per class</p>
            </div>
            <div className="h-64 w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={classAttendanceStats}>
                  <XAxis dataKey="name" stroke="#52525b" fontSize={11} tickLine={false} />
                  <YAxis domain={[0, 100]} stroke="#52525b" fontSize={11} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                  />
                  <Bar dataKey="average" fill="#a855f7" radius={[8, 8, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </div>

        {/* Quick Utilities */}
        <GlassCard hoverEffect={false} className="h-full">
          <div className="mb-4">
            <h3 className="text-base font-semibold text-zinc-200">Instructor Dashboard Shortcuts</h3>
            <p className="text-xs text-zinc-500 mt-0.5">Quickly access administration actions</p>
          </div>

          <div className="space-y-3">
            <button 
              onClick={() => window.location.href = '/attendance'}
              className="w-full p-4 rounded-xl bg-zinc-900/40 hover:bg-zinc-900/80 border border-zinc-800/50 flex items-center gap-3 transition-all text-left"
            >
              <div className="h-8 w-8 rounded-lg bg-accent-primary/10 text-accent-primary flex items-center justify-center">
                <Calendar size={16} />
              </div>
              <div>
                <span className="font-semibold text-zinc-200 text-sm block">Mark Daily Attendance</span>
                <span className="text-[11px] text-zinc-500">Record present and late students</span>
              </div>
            </button>

            <button 
              onClick={() => window.location.href = '/assignments'}
              className="w-full p-4 rounded-xl bg-zinc-900/40 hover:bg-zinc-900/80 border border-zinc-800/50 flex items-center gap-3 transition-all text-left"
            >
              <div className="h-8 w-8 rounded-lg bg-accent-secondary/10 text-accent-secondary flex items-center justify-center">
                <Plus size={16} />
              </div>
              <div>
                <span className="font-semibold text-zinc-200 text-sm block">Create Homework Task</span>
                <span className="text-[11px] text-zinc-500">Post details with automatic AI scheduler</span>
              </div>
            </button>
          </div>
        </GlassCard>
      </div>

      {/* Complaints Panel */}
      <GlassCard hoverEffect={false}>
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-base font-semibold text-zinc-200">Assigned Student Complaints</h3>
            <p className="text-xs text-zinc-500 mt-0.5">Review and resolve reported issues</p>
          </div>
        </div>

        <div className="space-y-3">
          {pendingComplaints.length === 0 ? (
            <div className="text-center py-8 text-zinc-500 text-xs">
              No outstanding complaints. Your department is completely clear!
            </div>
          ) : (
            pendingComplaints.map((c) => (
              <div 
                key={c._id}
                className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800/50 flex flex-col md:flex-row justify-between md:items-center gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20 uppercase tracking-wider">
                      {c.category}
                    </span>
                    <span className="text-xs text-zinc-400 font-semibold">
                      Student: {c.studentName || c.student?.name}
                    </span>
                  </div>
                  <h4 className="font-semibold text-zinc-200 text-sm mt-2">{c.title}</h4>
                  <p className="text-xs text-zinc-400 mt-0.5">{c.description}</p>
                </div>
                <div className="flex items-center gap-2 self-end md:self-auto">
                  <button 
                    onClick={() => window.location.href = '/complaints'}
                    className="px-3.5 py-1.5 rounded-lg bg-accent-primary/10 hover:bg-accent-primary/20 text-accent-primary border border-accent-primary/20 text-xs font-semibold flex items-center gap-1.5 transition-all"
                  >
                    <MessageSquare size={13} /> Respond & Resolve
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </GlassCard>
    </div>
  );
};

export default FacultyDashboard;
