import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If 401 and not already retrying
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refresh_token');
      
      if (refreshToken) {
        try {
          // Attempt to refresh the token
          const response = await axios.post(`${api.defaults.baseURL}auth/refresh/`, {
            refresh: refreshToken
          });
          
          const newAccessToken = response.data.access;
          localStorage.setItem('access_token', newAccessToken);
          
          // Update original request header and retry
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          // Refresh failed, clear everything and redirect to login
          localStorage.clear();
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
          return Promise.reject(refreshError);
        }
      } else {
        // No refresh token available, logout
        localStorage.clear();
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default {
  login: (data) => api.post('auth/login/', data),
  register: (data) => api.post('auth/register/', data),
  deleteAccount: () => api.delete('auth/delete-account/'),
  createGoal: (data) => api.post('goals/', data),
  getGoals: () => api.get('goals/'),
  deleteGoal: (id) => api.delete(`goals/${id}/`),
  getGraph: (id) => api.get(`goals/${id}/graph/`),
  expandSkill: (id, skill_name, force = false) => api.post(`skills/${id}/expand/`, { skill_name, force_refresh: force }),
  toggleSubtopic: (id) => api.post(`subtopics/${id}/toggle/`),
  getProgress: (user_id) => api.get(`progress/${user_id}/`),
  startSession: (data) => api.post('session/start/', data),
  evaluateAnswer: (id, data) => api.post(`session/evaluate/${id}/`, data),
  getExplanation: (skill_name, subtopic_title, goal_id) => api.post('subtopics/explanation/', { skill_name, subtopic_title, goal_id }),
  markSubtopicMastered: (skill_name, subtopic_title, goal_id) => api.post('subtopic/complete/', { skill_name, subtopic_title, goal_id }),
  getProfile: () => api.get('auth/profile/'),
  getUserStats: () => api.get('user-stats/'),
  
  // Roadmap Quiz
  getQuizStatus: (goal_id) => api.get(`quiz/status/?goal_id=${goal_id}`),
  startRoadmapQuiz: (goal_id) => api.post('quiz/start/', { goal_id }),
  submitRoadmapQuiz: (session_id, answers) => api.post(`quiz/submit/${session_id}/`, { answers }),
  getQuizAnalytics: (goal_id) => api.get(`quiz/analytics/?goal_id=${goal_id}`),
};
