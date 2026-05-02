const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Базовая функция запроса с автоматической подстановкой токена
async function request(endpoint, options = {}) {
  const url = `${API_URL}${endpoint}`;

  // Берём токен из localStorage если есть
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Request failed');
  }

  return data;
}

// API методы
export const api = {
  // Auth
  register: (email, password, name) =>
    request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    }),

  login: (email, password) =>
    request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  me: () => request('/api/auth/me'),

  // Modules
  getModules: () => request('/api/modules'),
  getModule: (id) => request(`/api/modules/${id}`),
  createModule: (data) =>
    request('/api/modules', { method: 'POST', body: JSON.stringify(data) }),

  // Lessons
  getLesson: (id) => request(`/api/lessons/${id}`),
  createLesson: (data) =>
    request('/api/lessons', { method: 'POST', body: JSON.stringify(data) }),

  // Progress
  markCompleted: (lessonId) =>
    request('/api/progress', {
      method: 'POST',
      body: JSON.stringify({ lessonId }),
    }),
  myProgress: () => request('/api/progress/me'),

  // Assignments
  submitAssignment: (lessonId, content) =>
    request('/api/assignments', {
      method: 'POST',
      body: JSON.stringify({ lessonId, content }),
    }),
  myAssignments: () => request('/api/assignments/me'),
  allAssignments: () => request('/api/assignments'),
  reviewAssignment: (id, status, feedback) =>
    request(`/api/assignments/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status, feedback }),
    }),
};
