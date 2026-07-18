import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { notificationsAPI } from '../services/api';
import { Bell, Menu, Check, Volume2, VolumeX, ShieldAlert, Sparkles, Megaphone, Sun, Moon, Search, Calendar } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const Navbar = ({ toggleSidebar, title }) => {
  const { user } = useAuth();
  const location = useLocation();
  const isDashboard = location.pathname === '/dashboard';
  
  const [notifications, setNotifications] = useState([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const dropdownRef = useRef(null);
  
  // Theme toggle state with initialization
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('theme') !== 'light';
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark(!isDark);
    localStorage.setItem('theme', !isDark ? 'dark' : 'light');
  };

  const getGreeting = () => {
    const hours = new Date().getHours();
    const firstName = user?.name ? user.name.split(' ')[0] : 'Alex';
    if (hours < 12) return `Good Morning, ${firstName} 👋`;
    if (hours < 18) return `Good Afternoon, ${firstName} 👋`;
    return `Good Evening, ${firstName} 👋`;
  };

  const getFormattedDate = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const today = new Date();
    const dayName = days[today.getDay()];
    const dateNum = today.getDate();
    const monthName = months[today.getMonth()];
    const year = today.getFullYear();
    return `${dayName}, ${dateNum} ${monthName} ${year}`;
  };

  const semesterStr = user?.semester ? `Semester ${user.semester}` : 'Semester 5';
  const deptStr = user?.department || 'Computer Science';

  // Poll notifications every 12 seconds for real-time alert mimicking
  useEffect(() => {
    if (!user) return;
    
    const fetchNotifications = async () => {
      try {
        const response = await notificationsAPI.get();
        // Cache notifications locally for offline fallback
        localStorage.setItem('notifications_cache', JSON.stringify(response.data));
        setNotifications(response.data);
      } catch (err) {
        console.warn('Could not fetch notifications, reading cache:', err.message);
        const cached = localStorage.getItem('notifications_cache');
        if (cached) {
          setNotifications(JSON.parse(cached));
        }
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 12000);
    return () => clearInterval(interval);
  }, [user]);

  // Handle closing dropdown when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowNotifDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await notificationsAPI.markRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error('Mark read failed:', err.message);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (isDashboard) {
    return (
      <header className="border-b border-zinc-800/50 bg-zinc-950/60 backdrop-blur-md px-6 md:px-8 py-6 md:py-7 flex flex-col md:flex-row md:items-center justify-between gap-6 select-none relative z-30">
        {/* Left Side: Personalized Welcome */}
        <div className="flex flex-col">
          <div className="flex items-center gap-3">
            {/* Mobile Hamburger menu */}
            <button 
              onClick={toggleSidebar}
              className="md:hidden p-2 hover:bg-zinc-800/50 rounded-lg text-zinc-400 hover:text-white transition-colors -ml-2"
            >
              <Menu size={20} />
            </button>
            <h1 className="text-2xl md:text-3xl font-extrabold text-zinc-100 tracking-tight">
              {getGreeting()}
            </h1>
          </div>
          <p className="text-zinc-400 text-xs md:text-sm mt-1 font-medium">
            Here's what's happening today.
          </p>
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5 mt-3 text-xs text-zinc-500 font-semibold tracking-wide">
            <span className="flex items-center gap-1.5">
              <Calendar size={13} className="text-accent-primary" />
              Today: {getFormattedDate()}
            </span>
            <span className="text-zinc-700 hidden sm:inline">•</span>
            <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[10px] uppercase text-zinc-400 tracking-wider font-bold">
              {semesterStr} • {deptStr}
            </span>
          </div>
        </div>

        {/* Right Side: Search, Theme, Notifications, Profile */}
        <div className="flex items-center gap-3 sm:gap-4 justify-between md:justify-end w-full md:w-auto border-t md:border-t-0 border-zinc-900/50 pt-4 md:pt-0">
          {/* Functional Search Bar */}
          <div className="relative flex-grow sm:flex-grow-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={14} />
            <input 
              type="text" 
              placeholder="Search courses, tasks..." 
              className="w-full sm:w-48 md:w-56 pl-9 pr-4 py-2 rounded-xl text-xs bg-zinc-900/50 border border-zinc-800/80 text-zinc-300 placeholder-zinc-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all"
            />
          </div>

          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme}
              className="p-2.5 rounded-xl bg-zinc-900/50 border border-zinc-800/80 text-zinc-400 hover:text-zinc-200 transition-all hover:scale-105"
              title="Toggle Theme"
            >
              {isDark ? <Sun size={17} className="text-amber-400" /> : <Moon size={17} className="text-indigo-400" />}
            </button>

            {/* Notification Bell Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                className="p-2.5 rounded-xl bg-zinc-900/50 border border-zinc-800/80 text-zinc-400 hover:text-zinc-200 transition-all relative hover:scale-105"
              >
                <Bell size={17} />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 bg-rose-500 rounded-full animate-pulse border border-zinc-950" />
                )}
              </button>

              {showNotifDropdown && (
                <div className="absolute right-0 mt-3 w-80 rounded-2xl glass-card border border-zinc-800/80 shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-3 duration-250">
                  <div className="flex justify-between items-center pb-3 border-b border-zinc-800/80 mb-2">
                    <span className="font-semibold text-sm text-zinc-200">Alert Center</span>
                    {unreadCount > 0 && (
                      <button 
                        onClick={handleMarkAllRead}
                        className="text-xs text-accent-primary hover:text-accent-secondary font-medium transition-colors flex items-center gap-1"
                      >
                        <Check size={12} /> Mark all read
                      </button>
                    )}
                  </div>

                  {notifications.length === 0 ? (
                    <div className="text-center py-6 text-zinc-500 text-xs">
                      No notifications to display.
                    </div>
                  ) : (
                    <div className="max-h-64 overflow-y-auto space-y-2">
                      {notifications.slice(0, 5).map((notif) => (
                        <div 
                          key={notif._id} 
                          className={`p-3 rounded-xl border transition-all text-xs ${
                            notif.read 
                              ? 'bg-zinc-900/10 border-zinc-900/50 text-zinc-400' 
                              : 'bg-zinc-900/50 border-zinc-800/60 text-zinc-200 font-medium'
                          }`}
                        >
                          <div className="flex justify-between items-start gap-2 mb-1">
                            <span className="font-semibold flex items-center gap-1.5">
                              {notif.type === 'warning' && <ShieldAlert size={13} className="text-rose-500" />}
                              {notif.type === 'announcement' && <Megaphone size={13} className="text-amber-500" />}
                              {notif.type === 'success' && <Sparkles size={13} className="text-emerald-500" />}
                              {notif.title}
                            </span>
                            <span className="text-[10px] text-zinc-500">
                              {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="leading-relaxed">{notif.message}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Profile Avatar */}
            <div className="flex items-center gap-3 pl-3 border-l border-zinc-800/80">
              <img 
                src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} 
                alt="User Avatar" 
                className="w-9 h-9 rounded-full border border-zinc-800 bg-zinc-900 shadow-sm"
              />
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="h-16 border-b border-zinc-800/50 bg-zinc-950/60 backdrop-blur-md px-6 flex items-center justify-between select-none relative z-30">
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger menu */}
        <button 
          onClick={toggleSidebar}
          className="md:hidden p-2 hover:bg-zinc-800/50 rounded-lg text-zinc-400 hover:text-white transition-colors"
        >
          <Menu size={20} />
        </button>
        <h1 className="font-semibold text-lg text-zinc-100 tracking-wide font-sans">{title}</h1>
      </div>

      <div className="flex items-center gap-4">
        {/* Search Bar */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={14} />
          <input 
            type="text" 
            placeholder="Search..." 
            className="w-48 pl-9 pr-4 py-1.5 rounded-xl text-xs bg-zinc-900/50 border border-zinc-800/80 text-zinc-300 placeholder-zinc-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all"
          />
        </div>

        {/* Theme Toggle */}
        <button 
          onClick={toggleTheme}
          className="p-2.5 rounded-xl bg-zinc-900/50 border border-zinc-800/80 text-zinc-400 hover:text-zinc-200 transition-all hover:scale-105"
        >
          {isDark ? <Sun size={17} className="text-amber-400" /> : <Moon size={17} className="text-indigo-400" />}
        </button>

        {/* Notification Bell Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setShowNotifDropdown(!showNotifDropdown)}
            className="p-2.5 rounded-xl bg-zinc-900/50 border border-zinc-800/80 text-zinc-400 hover:text-zinc-200 transition-all relative hover:scale-105"
          >
            <Bell size={17} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 bg-rose-500 rounded-full animate-pulse border border-zinc-950" />
            )}
          </button>

          {showNotifDropdown && (
            <div className="absolute right-0 mt-3 w-80 rounded-2xl glass-card border border-zinc-800/80 shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-3 duration-250">
              <div className="flex justify-between items-center pb-3 border-b border-zinc-800/80 mb-2">
                <span className="font-semibold text-sm text-zinc-200">Alert Center</span>
                {unreadCount > 0 && (
                  <button 
                    onClick={handleMarkAllRead}
                    className="text-xs text-accent-primary hover:text-accent-secondary font-medium transition-colors flex items-center gap-1"
                  >
                    <Check size={12} /> Mark all read
                  </button>
                )}
              </div>

              {notifications.length === 0 ? (
                <div className="text-center py-6 text-zinc-500 text-xs">
                  No notifications to display.
                </div>
              ) : (
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {notifications.slice(0, 5).map((notif) => (
                    <div 
                      key={notif._id} 
                      className={`p-3 rounded-xl border transition-all text-xs ${
                        notif.read 
                          ? 'bg-zinc-900/10 border-zinc-900/50 text-zinc-400' 
                          : 'bg-zinc-900/50 border-zinc-800/60 text-zinc-200 font-medium'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2 mb-1">
                        <span className="font-semibold flex items-center gap-1.5">
                          {notif.type === 'warning' && <ShieldAlert size={13} className="text-rose-500" />}
                          {notif.type === 'announcement' && <Megaphone size={13} className="text-amber-500" />}
                          {notif.type === 'success' && <Sparkles size={13} className="text-emerald-500" />}
                          {notif.title}
                        </span>
                        <span className="text-[10px] text-zinc-500">
                          {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="leading-relaxed">{notif.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* User Badge Info */}
        <div className="flex items-center gap-3 pl-4 border-l border-zinc-800/80">
          <div className="text-right hidden sm:block">
            <span className="text-xs font-semibold uppercase text-zinc-500 block tracking-wider leading-none">
              {user.role}
            </span>
            <span className="text-sm font-medium text-zinc-300 block mt-1">
              {user.name.split(' ')[0]}
            </span>
          </div>
          <img 
            src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} 
            alt="User Avatar" 
            className="w-9 h-9 rounded-full border border-zinc-800 bg-zinc-900"
          />
        </div>
      </div>
    </header>
  );
};

export default Navbar;
