import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api/',
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
      window.location.href = '/error';
    }
    return Promise.reject(error);
  }
);

export default {
  login: (data) => api.post('auth/login/', data),
  register: (data) => api.post('auth/register/', data),
  createGoal: (data) => api.post('goals/', data),
  getGoals: () => api.get('goals/'),
  getGraph: (id) => api.get(`goals/${id}/graph/`),
  expandSkill: (id, skill_name) => api.post(`skills/${id}/expand/`, { skill_name }),
  toggleSubtopic: (id) => api.post(`subtopics/${id}/toggle/`),
  savePath: (id, ordered_skill_ids) => api.post(`goals/${id}/path/`, { ordered_skill_ids }),
  startSession: (data) => api.post('sessions/start/', data),
  evaluateAnswer: (id, data) => api.post(`sessions/${id}/evaluate/`, data),
  getProgress: (user_id) => api.get(`progress/${user_id}/`),
  getSummary: (id) => api.get(`goals/${id}/summary/`),
};
