import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  MessageSquare, 
  CheckSquare, 
  FileText, 
  AlertCircle, 
  Briefcase, 
  HelpCircle, 
  LogOut, 
  User, 
  BookOpen, 
  Megaphone,
  Menu,
  X,
  Heart,
  Sparkles
} from 'lucide-react';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  // Navigation Links based on user roles
  const getNavLinks = () => {
    const role = user.role;

    if (role === 'admin') {
      return [
        { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/complaints', label: 'Complaints Office', icon: AlertCircle },
        { path: '/placements', label: 'Placement Drives', icon: Briefcase },
        { path: '/announcements', label: 'Announcements', icon: Megaphone }
      ];
    }

    if (role === 'faculty') {
      return [
        { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/attendance', label: 'Mark Attendance', icon: CheckSquare },
        { path: '/assignments', label: 'Assignments Desk', icon: FileText },
        { path: '/complaints', label: 'Grievance Review', icon: AlertCircle }
      ];
    }

    // Default: Student navigation
    return [
      { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { path: '/attendance', label: 'Attendance Tracker', icon: CheckSquare },
      { path: '/assignments', label: 'Assignment Hub', icon: FileText },
      { path: '/complaints', label: 'Lodge Grievance', icon: AlertCircle },
      { path: '/placements', label: 'Placement Cell', icon: Briefcase },
      { path: '/resume-builder', label: 'Resume Builder', icon: Sparkles },
      { path: '/mental-health', label: 'Mental Wellness', icon: Heart },
      { path: '/faq', label: 'Campus FAQs', icon: HelpCircle }
    ];
  };

  const navLinks = getNavLinks();

  const sidebarContent = (
    <div className="flex flex-col h-full bg-zinc-950 border-r border-zinc-800/60 p-5 select-none justify-between">
      <div>
        {/* Brand Logo */}
        <div className="flex items-center gap-3 px-2 mb-8 justify-between">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-accent-primary to-accent-secondary flex items-center justify-center font-bold text-white shadow-glow text-xs">
              360
            </div>
            <div className="font-semibold text-lg tracking-wide bg-gradient-to-r from-zinc-100 to-zinc-400 bg-clip-text text-transparent">
              student360 <span className="text-xs font-bold text-accent-primary uppercase px-1.5 py-0.5 rounded bg-accent-primary/10 border border-accent-primary/20">AI</span>
            </div>
          </div>
          {/* Close button for mobile views */}
          <button onClick={toggleSidebar} className="md:hidden text-zinc-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* User Card */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-900/40 border border-zinc-800/40 mb-6">
          <img 
            src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} 
            alt="User Avatar" 
            className="w-10 h-10 rounded-full border border-zinc-700 bg-zinc-800"
          />
          <div className="overflow-hidden">
            <h4 className="font-medium text-sm text-zinc-200 truncate">{user.name}</h4>
            <span className="text-xs font-semibold uppercase text-accent-primary block tracking-wider mt-0.5">
              {user.role}
            </span>
          </div>
        </div>

        {/* Links Navigation */}
        <nav className="space-y-1.5">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={() => { if (window.innerWidth < 768) toggleSidebar(); }}
                className={({ isActive }) => 
                  `flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                    isActive 
                      ? 'bg-accent-primary/10 border border-accent-primary/30 text-white shadow-glow' 
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50 border border-transparent'
                  }`
                }
              >
                <Icon size={18} />
                <span>{link.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Logout Action */}
      <div className="pt-4 border-t border-zinc-800/50">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-xl font-medium text-sm text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border border-transparent transition-all"
        >
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Backdrop overlay */}
      {isOpen && (
        <div 
          onClick={toggleSidebar}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
};

export default Sidebar;
