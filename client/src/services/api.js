import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || (process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:5000/api'),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
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

/** Drop the stored session and send the visitor to the login page. */
const evictSession = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  if (!window.location.pathname.startsWith('/login')) {
    // Remember where they were so login can send them back.
    const next = window.location.pathname + window.location.search;
    window.location.href = `/login?next=${encodeURIComponent(next)}`;
  }
};

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    // Suspended / banned mid-session: end the session (but let the login page show its own message).
    const code = error.response?.data?.code;
    if (status === 403 && String(code || '').startsWith('ACCOUNT_')) {
      evictSession();
    }
    // A 401 only means an *expired* session when there was a session to
    // expire. Public pages call authenticated-optional endpoints too, and a
    // signed-out visitor hitting one must stay where they are rather than
    // being bounced to /login.
    if (status === 401 && localStorage.getItem('token')) {
      evictSession();
    }
    return Promise.reject(error);
  }
);

export default api;
