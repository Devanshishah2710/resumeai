import axios from 'axios';

const api = axios.create({ baseURL: '/api', headers: { 'Content-Type': 'application/json' }, timeout: 30000 });

api.interceptors.request.use(config => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let isRefreshing = false, failedQueue = [];
const processQueue = (err, token) => { failedQueue.forEach(p => err ? p.reject(err) : p.resolve(token)); failedQueue = []; };

api.interceptors.response.use(r => r, async error => {
  const orig = error.config;
  if (error.response?.status === 401 && error.response?.data?.code === 'TOKEN_EXPIRED' && !orig._retry) {
    if (isRefreshing) return new Promise((res, rej) => failedQueue.push({ resolve: res, reject: rej })).then(t => { orig.headers.Authorization = `Bearer ${t}`; return api(orig); });
    orig._retry = true; isRefreshing = true;
    try {
      const { data } = await axios.post('/api/auth/refresh', { refreshToken: localStorage.getItem('refreshToken') });
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      processQueue(null, data.accessToken);
      orig.headers.Authorization = `Bearer ${data.accessToken}`;
      return api(orig);
    } catch (e) {
      processQueue(e, null);
      localStorage.removeItem('accessToken'); localStorage.removeItem('refreshToken');
      window.location.href = '/auth';
      return Promise.reject(e);
    } finally { isRefreshing = false; }
  }
  return Promise.reject(error);
});

export const authAPI = {
  register: d => api.post('/auth/register', d),
  login: d => api.post('/auth/login', d),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
};
export const resumeAPI = {
  list: p => api.get('/resumes', { params: p }),
  get: id => api.get(`/resumes/${id}`),
  create: d => api.post('/resumes', d),
  update: (id, d) => api.put(`/resumes/${id}`, d),
  delete: id => api.delete(`/resumes/${id}`),
  duplicate: id => api.post(`/resumes/${id}/duplicate`),
};
export const aiAPI = {
  generateSummary: d => api.post('/ai/summary', d),
  generateBullets: d => api.post('/ai/bullets', d),
  suggestSkills: d => api.post('/ai/skills', d),
  atsCheck: d => api.post('/ai/ats-check', d),
  generateCoverLetter: d => api.post('/ai/cover-letter', d),
};
export const pdfAPI = { generate: id => api.post(`/pdf/generate/${id}`, {}, { responseType: 'blob' }) };
export const templateAPI = { list: p => api.get('/templates', { params: p }), get: id => api.get(`/templates/${id}`) };
export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: d => api.put('/users/profile', d),
  changePassword: d => api.put('/users/password', d),
};
export default api;
