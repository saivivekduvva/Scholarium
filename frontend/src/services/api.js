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
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('username');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    if (error.response && error.response.status === 500) {
      const url = error.config?.url || '';
      if (!url.includes('progress') && !url.includes('profile')) {
        window.location.href = '/error';
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
  savePath: (id, ordered_skill_ids) => api.post(`goals/${id}/save-path/`, { ordered_skill_ids }),
  startSession: (data) => api.post('session/start/', data),
  evaluateAnswer: (id, data) => api.post(`session/evaluate/${id}/`, data),
  getProgress: (user_id) => api.get(`progress/${user_id}/`),
  getSummary: (id) => api.get(`summary/${id}/`),
  getExplanation: (skill_name, subtopic_title, goal_id) => api.post('subtopics/explanation/', { skill_name, subtopic_title, goal_id }),
  markSubtopicMastered: (skill_name, subtopic_title, goal_id) => api.post('subtopic/complete/', { skill_name, subtopic_title, goal_id }),
  getProfile: () => api.get('auth/profile/'),
  verifyEmail: (data) => api.post('auth/verify-email/', data),
};
