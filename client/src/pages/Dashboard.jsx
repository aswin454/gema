import React from 'react';
import { useAuth } from '../context/AuthContext';
import StudentDashboard from './dashboards/StudentDashboard';
import FacultyDashboard from './dashboards/FacultyDashboard';
import AdminDashboard from './dashboards/AdminDashboard';

const Dashboard = () => {
  const { user } = useAuth();

  if (!user) return null;

  // Render role-specific dashboards
  switch (user.role) {
    case 'admin':
      return <AdminDashboard />;
    case 'faculty':
      return <FacultyDashboard />;
    case 'student':
    default:
      return <StudentDashboard />;
  }
};

export default Dashboard;
