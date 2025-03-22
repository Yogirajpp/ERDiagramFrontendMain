import axios from 'axios';
import BASE_URL from './baseUrl';

const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if it exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/updatedetails', data),
  updatePassword: (data) => api.put('/auth/updatepassword', data),
};

// Projects API
export const projectsAPI = {
  getAll: () => api.get('/projects'),
  getById: (id) => api.get(`/projects/${id}`),
  create: (data) => api.post('/projects', data),
  update: (id, data) => api.put(`/projects/${id}`, data),
  delete: (id) => api.delete(`/projects/${id}`),
  getByCompany: (companyId) => api.get(`/projects/company/${companyId}`),
  updateMembers: (id, data) => api.put(`/projects/${id}/members`, data),
};

// Diagrams API
export const diagramsAPI = {
  getAll: (projectId) => api.get(`/diagrams/project/${projectId}`),
  getById: (id) => api.get(`/diagrams/${id}`),
  create: (data) => api.post('/diagrams', data),
  update: (id, data) => api.put(`/diagrams/${id}`, data),
  delete: (id) => api.delete(`/diagrams/${id}`),
  generateSchema: (id) => api.get(`/diagrams/${id}/schema`),
  updateFromSchema: (id, schemaCode) => api.put(`/diagrams/${id}/schema`, { schemaCode }),
  importSchema: (data) => api.post('/diagrams/import', data),
};

// Entities API
export const entitiesAPI = {
  getByDiagram: (diagramId) => api.get(`/entities/diagram/${diagramId}`),
  getById: (id) => api.get(`/entities/${id}`),
  create: (data) => api.post('/entities', data),
  update: (id, data) => api.put(`/entities/${id}`, data),
  delete: (id) => api.delete(`/entities/${id}`),
};

// Attributes API
export const attributesAPI = {
  getByEntity: (entityId) => api.get(`/attributes/entity/${entityId}`),
  getById: (id) => api.get(`/attributes/${id}`),
  create: (data) => api.post('/attributes', data),
  update: (id, data) => api.put(`/attributes/${id}`, data),
  delete: (id) => api.delete(`/attributes/${id}`),
};

// Relationships API
export const relationshipsAPI = {
  getByDiagram: (diagramId) => api.get(`/relationships/diagram/${diagramId}`),
  getById: (id) => api.get(`/relationships/${id}`),
  create: (data) => api.post('/relationships', data),
  update: (id, data) => api.put(`/relationships/${id}`, data),
  delete: (id) => api.delete(`/relationships/${id}`),
};

// Companies API
export const companiesAPI = {
  getAll: () => api.get('/companies'),
  getById: (id) => api.get(`/companies/${id}`),
  create: (data) => api.post('/companies', data),
  update: (id, data) => api.put(`/companies/${id}`, data),
  delete: (id) => api.delete(`/companies/${id}`),
  updateAdmins: (id, data) => api.put(`/companies/${id}/admins`, data),
  getStats: (id) => api.get(`/companies/${id}/stats`),
};

// Users API
export const usersAPI = {
  getAll: () => api.get('/users'),
  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
  getByCompany: (companyId) => api.get(`/users/company/${companyId}`),
};

export default api;