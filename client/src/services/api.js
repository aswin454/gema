import axios from 'axios';

// Create Axios Instance
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request Interceptor: Attach JWT Token automatically from local storage
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response Interceptor: Catch auth failures to trigger client-side logouts
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      // If we are not on the login page, redirect
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        window.location.href = '/login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);

// Centralized API Service Exports
export const authAPI = {
  login: (credentials) => API.post('/api/auth/login', credentials),
  register: (userData) => API.post('/api/auth/register', userData),
  getProfile: () => API.get('/api/student/profile')
};

export const studentAPI = {
  getDashboard: () => API.get('/api/student/dashboard')
};

export const attendanceAPI = {
  get: () => API.get('/api/attendance'),
  post: (attendanceData) => API.post('/api/attendance', attendanceData)
};

export const complaintsAPI = {
  get: () => API.get('/api/complaints'),
  post: (complaintData) => API.post('/api/complaints', complaintData),
  update: (id, updateData) => API.patch(`/api/complaints/${id}`, updateData)
};

export const assignmentsAPI = {
  get: () => API.get('/api/assignments'),
  post: (assignmentData) => API.post('/api/assignments', assignmentData),
  submit: (id, submissionData) => API.post(`/api/assignments/${id}/submit`, submissionData),
  grade: (id, gradingData) => API.post(`/api/assignments/${id}/grade`, gradingData)
};

export const placementsAPI = {
  get: () => API.get('/api/placements'),
  post: (placementData) => API.post('/api/placements', placementData),
  apply: (id, applicationData) => API.post(`/api/placements/${id}/apply`, applicationData)
};

export const chatAPI = {
  getHistory: () => API.get('/api/chat'),
  sendMessage: (message) => API.post('/api/chat', { message }),
  clearHistory: () => API.delete('/api/chat')
};

export const mentalHealthAPI = {
  getHistory: () => API.get('/api/mental-health'),
  sendMessage: (message) => API.post('/api/mental-health', { message }),
  clearHistory: () => API.delete('/api/mental-health')
};

export const notificationsAPI = {
  get: () => API.get('/api/notifications'),
  markRead: () => API.post('/api/notifications/read')
};

export const resumeAPI = {
  optimize: (resumeData) => API.post('/api/resume/optimize', resumeData)
};

export default API;
