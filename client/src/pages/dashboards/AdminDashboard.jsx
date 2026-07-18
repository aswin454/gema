import React, { useState, useEffect } from 'react';
import GlassCard from '../../components/GlassCard';
import SkeletonLoader from '../../components/SkeletonLoader';
import { complaintsAPI, placementsAPI } from '../../services/api';
import { 
  ShieldCheck, 
  Users, 
  Briefcase, 
  AlertOctagon,
  Megaphone,
  BookOpen,
  Calendar,
  Layers
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [complaintsCount, setComplaintsCount] = useState(0);
  const [placementsCount, setPlacementsCount] = useState(0);
  const [weeklyTrends, setWeeklyTrends] = useState([]);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const complaintsRes = await complaintsAPI.get();
        setComplaintsCount(complaintsRes.data.length);

        const placementsRes = await placementsAPI.get();
        setPlacementsCount(placementsRes.data.length);

        // Simulated weekly system complaints trends
        setWeeklyTrends([
          { name: 'Mon', resolved: 4, raised: 5 },
          { name: 'Tue', resolved: 6, raised: 3 },
          { name: 'Wed', resolved: 3, raised: 8 },
          { name: 'Thu', resolved: 7, raised: 4 },
          { name: 'Fri', resolved: 8, raised: 5 }
        ]);
      } catch (err) {
        console.error('Failed to load admin stats:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  if (loading) {
    return <SkeletonLoader type="card" count={4} />;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <GlassCard hoverEffect={true} className="flex justify-between items-center">
          <div>
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">Student Registrations</span>
            <span className="text-2xl font-bold text-zinc-100 block mt-2">1,240</span>
            <span className="text-xs text-zinc-500 mt-1 block">Active on platform</span>
          </div>
          <div className="h-11 w-11 rounded-xl bg-accent-primary/10 text-accent-primary flex items-center justify-center">
            <Users size={20} />
          </div>
        </GlassCard>

        <GlassCard hoverEffect={true} className="flex justify-between items-center">
          <div>
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">Faculty Accounts</span>
            <span className="text-2xl font-bold text-zinc-100 block mt-2">48</span>
            <span className="text-xs text-zinc-500 mt-1 block">Verified Instructors</span>
          </div>
          <div className="h-11 w-11 rounded-xl bg-accent-secondary/10 text-accent-secondary flex items-center justify-center">
            <ShieldCheck size={20} />
          </div>
        </GlassCard>

        <GlassCard hoverEffect={true} className="flex justify-between items-center">
          <div>
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">Placement Drives</span>
            <span className="text-2xl font-bold text-zinc-100 block mt-2">{placementsCount}</span>
            <span className="text-xs text-zinc-500 mt-1 block">Corporate partnerships</span>
          </div>
          <div className="h-11 w-11 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <Briefcase size={20} />
          </div>
        </GlassCard>

        <GlassCard hoverEffect={true} className="flex justify-between items-center">
          <div>
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">System Complaints</span>
            <span className="text-2xl font-bold text-zinc-100 block mt-2">{complaintsCount}</span>
            <span className="text-xs text-zinc-500 mt-1 block">Total Raised (All roles)</span>
          </div>
          <div className="h-11 w-11 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
            <AlertOctagon size={20} />
          </div>
        </GlassCard>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly complaints trends */}
        <div className="lg:col-span-2">
          <GlassCard hoverEffect={false} className="h-full flex flex-col justify-between">
            <div className="mb-4">
              <h3 className="text-base font-semibold text-zinc-200">University Grievance Trends</h3>
              <p className="text-xs text-zinc-500 mt-0.5">Daily comparison of complaints filed vs resolved</p>
            </div>
            <div className="h-64 w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyTrends}>
                  <defs>
                    <linearGradient id="colorRaised" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#52525b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#52525b" fontSize={11} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                  />
                  <Area type="monotone" dataKey="raised" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorRaised)" name="Raised" />
                  <Area type="monotone" dataKey="resolved" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorResolved)" name="Resolved" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </div>

        {/* Administration Links */}
        <GlassCard hoverEffect={false} className="h-full">
          <div className="mb-4">
            <h3 className="text-base font-semibold text-zinc-200">Management Dashboard</h3>
            <p className="text-xs text-zinc-500 mt-0.5">Quickly edit institutional services</p>
          </div>

          <div className="space-y-2">
            <button 
              onClick={() => window.location.href = '/complaints'}
              className="w-full px-4 py-3 rounded-xl bg-zinc-900/40 hover:bg-zinc-900/80 border border-zinc-800/50 flex items-center gap-3 transition-all text-left"
            >
              <AlertOctagon size={16} className="text-rose-400" />
              <span className="text-xs font-semibold text-zinc-300">Assign & Resolve Grievances</span>
            </button>

            <button 
              onClick={() => window.location.href = '/placements'}
              className="w-full px-4 py-3 rounded-xl bg-zinc-900/40 hover:bg-zinc-900/80 border border-zinc-800/50 flex items-center gap-3 transition-all text-left"
            >
              <Briefcase size={16} className="text-emerald-400" />
              <span className="text-xs font-semibold text-zinc-300">Publish Placement Drives</span>
            </button>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default AdminDashboard;
