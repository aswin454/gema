import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import FloatingAIChat from './components/FloatingAIChat';

// Page Imports
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AIChat from './pages/AIChat';
import Attendance from './pages/Attendance';
import Assignments from './pages/Assignments';
import Complaints from './pages/Complaints';
import Placements from './pages/Placements';
import FAQ from './pages/FAQ';
import MentalHealth from './pages/MentalHealth';
import ResumeBuilder from './pages/ResumeBuilder';

// Protected Route Guard Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen w-full bg-background flex flex-col items-center justify-center space-y-4 select-none">
        <div className="h-10 w-10 border-4 border-accent-primary/30 border-t-accent-primary rounded-full animate-spin" />
        <span className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">Restoring Institutional Session...</span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Layout Wrapper to render Navbar + Sidebar for authenticated users
const AppLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();
  const location = useLocation();

  const getPageTitle = (pathname) => {
    switch (pathname) {
      case '/dashboard':
        return 'System Dashboard';
      case '/ai-chat':
        return 'Glena AI Assistant';
      case '/attendance':
        return 'Course Attendance Desk';
      case '/assignments':
        return 'Academic Assignments';
      case '/complaints':
        return 'Student Grievance Office';
      case '/placements':
        return 'Career Placement Cell';
      case '/mental-health':
        return 'Mental Wellness Centre';
      case '/resume-builder':
        return 'ATS Resume Builder';
      case '/faq':
        return 'Institutional FAQs';
      default:
        return 'student360 AI';
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Glowing blur accents in top right */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-accent-primary/5 rounded-full blur-[100px] pointer-events-none" />
        
        <Navbar 
          title={getPageTitle(location.pathname)} 
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)} 
        />
        
        <main className="flex-grow overflow-y-auto p-6 md:p-8 relative z-10">
          {children}
        </main>
        
        {/* Global Student AI Floating Widget */}
        {user?.role === 'student' && <FloatingAIChat />}
      </div>
    </div>
  );
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Auth Public Routes */}
      <Route path="/login" element={<Login />} />

      {/* Authenticated Dashboard Routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <AppLayout>
            <Dashboard />
          </AppLayout>
        </ProtectedRoute>
      } />

      <Route path="/ai-chat" element={
        <ProtectedRoute>
          <AppLayout>
            <AIChat />
          </AppLayout>
        </ProtectedRoute>
      } />

      <Route path="/attendance" element={
        <ProtectedRoute>
          <AppLayout>
            <Attendance />
          </AppLayout>
        </ProtectedRoute>
      } />

      <Route path="/assignments" element={
        <ProtectedRoute>
          <AppLayout>
            <Assignments />
          </AppLayout>
        </ProtectedRoute>
      } />

      <Route path="/complaints" element={
        <ProtectedRoute>
          <AppLayout>
            <Complaints />
          </AppLayout>
        </ProtectedRoute>
      } />

      <Route path="/placements" element={
        <ProtectedRoute>
          <AppLayout>
            <Placements />
          </AppLayout>
        </ProtectedRoute>
      } />

      <Route path="/faq" element={
        <ProtectedRoute>
          <AppLayout>
            <FAQ />
          </AppLayout>
        </ProtectedRoute>
      } />

      <Route path="/mental-health" element={
        <ProtectedRoute>
          <AppLayout>
            <MentalHealth />
          </AppLayout>
        </ProtectedRoute>
      } />

      <Route path="/resume-builder" element={
        <ProtectedRoute>
          <AppLayout>
            <ResumeBuilder />
          </AppLayout>
        </ProtectedRoute>
      } />

      {/* Fallbacks */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
};

export default App;
