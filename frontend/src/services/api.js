import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api/',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Basic error handling for AI fallback
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If backend throws 500 for LLM parsing or failure, we redirect to /error
    if (error.response && error.response.status === 500) {
      window.location.href = '/error';
    }
    return Promise.reject(error);
  }
);

export default {
  createGoal: (data) => api.post('goals/', data),
  getGoals: () => api.get('goals/'),
  getGraph: (id) => api.get(`goals/${id}/graph/`),
  expandSkill: (id, skill_name) => api.post(`skills/${id}/expand/`, { skill_name }),
  savePath: (id, ordered_skill_ids) => api.post(`goals/${id}/path/`, { ordered_skill_ids }),
  startSession: (data) => api.post('sessions/start/', data),
  evaluateAnswer: (id, data) => api.post(`sessions/${id}/evaluate/`, data),
  getProgress: (user_id) => api.get(`progress/${user_id}/`),
  getSummary: (id) => api.get(`goals/${id}/summary/`),
};
