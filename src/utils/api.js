// Use same-origin /api so Next.js rewrites proxy to backend (see next.config.mjs). Override with NEXT_PUBLIC_API_URL for a direct backend URL.
const API_URL = process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' ? '' : 'http://localhost:5000') + '/api';

// Get auth token from localStorage
// TokenSync component keeps this in sync with NextAuth session
const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('No token found in localStorage. Make sure you are logged in.');
    }
    return token;
  }
  return null;
};

const buildLoginUrlWithRedirect = (pathname) => {
  const path = pathname || '/';
  const segments = path.split('/').filter(Boolean);
  const lang = segments[0] || 'en';
  const loginPath = `/${lang}/login`;
  const redirectTo = path;
  const search = new URLSearchParams({ redirectTo }).toString();
  return `${loginPath}?${search}`;
};

const forceLogoutAndRedirect = () => {
  if (typeof window === 'undefined') return;

   // Avoid redirect loops if multiple API calls fail at once
   if (window.__FORCE_LOGIN_REDIRECTING) return;
   window.__FORCE_LOGIN_REDIRECTING = true;

  try {
    localStorage.removeItem('token');
  } catch {}
  const pathname = window.location.pathname || '';
  const isLoginPage = pathname.includes('/login');
  if (!isLoginPage) {
    const target = buildLoginUrlWithRedirect(pathname);
    const doRedirect = () => {
      window.location.replace ? window.location.replace(target) : (window.location.href = target);
    };

    // Also sign out from NextAuth; otherwise server still sees a session and redirects away from login (loop)
    const timeout = setTimeout(doRedirect, 1500);
    import('next-auth/react')
      .then(async (m) => {
        if (typeof m?.signOut === 'function') {
          await m.signOut({ redirect: false });
        }
      })
      .catch(() => {})
      .finally(() => {
        clearTimeout(timeout);
        doRedirect();
      });
  }
};

const parseJwtPayload = (token) => {
  try {
    const parts = String(token).split('.');
    if (parts.length < 2) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
};

const isJwtExpired = (token) => {
  if (typeof window === 'undefined') return false;
  const payload = parseJwtPayload(token);
  const exp = payload?.exp;
  if (!exp || typeof exp !== 'number') return false;
  // Add a small buffer so we don't race the server by 1-2 seconds
  const nowSec = Math.floor(Date.now() / 1000);
  return exp <= nowSec + 5;
};

// API request helper (requires auth)
const apiRequest = async (endpoint, options = {}) => {
  const token = getAuthToken();

  if (!token) {
    forceLogoutAndRedirect();
    return new Promise(() => {});
  }

  // Proactively redirect if token is expired (common "jwt expired" cases)
  if (isJwtExpired(token)) {
    forceLogoutAndRedirect();
    return new Promise(() => {});
  }
  
  const config = {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
    ...options,
  };
  // Re-apply auth + Content-Type so they are never stripped when options.headers is passed (e.g. updateMedia/updateVideo with headers: {}). Other apiRequest callers (no headers option) are unchanged.
  config.headers = {
    'Content-Type': 'application/json',
    ...config.headers,
    Authorization: `Bearer ${token}`
  };
  // FormData requests must not send Content-Type (browser sets multipart with boundary). Only updateVideo/updateMedia pass body; updateMedia uses JSON from EditMediaDialog.
  if (options.body instanceof FormData) {
    delete config.headers['Content-Type'];
  }

  if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
    config.body = JSON.stringify(config.body);
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      // If unauthorized, clear token and redirect to login
      const msgLower = String(data?.message || '').toLowerCase();
      const isAuthError =
        response.status === 401 ||
        response.status === 403 ||
        msgLower.includes('jwt expired') ||
        msgLower.includes('token expired') ||
        msgLower.includes('invalid token') ||
        msgLower.includes('unauthorized');

      if (isAuthError) {
        forceLogoutAndRedirect();
        return new Promise(() => {});
      }
      const url = `${API_URL}${endpoint}`;
      const msg = response.status === 404 && data.path
        ? `${data.message || 'Route not found'} (requested: ${url}, server saw: ${data.path})`
        : (data.message || 'API request failed');
      throw new Error(msg);
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Public API request helper (no auth required)
const publicApiRequest = async (endpoint, options = {}) => {
  const token = getAuthToken(); // Optional - include if available
  
  const config = {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  // Remove Content-Type for FormData (browser will set it with boundary)
  if (options.body instanceof FormData) {
    delete config.headers['Content-Type'];
  }

  if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
    config.body = JSON.stringify(config.body);
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Admin API methods
export const adminAPI = {
  // Dashboard
  getDashboardStats: () => apiRequest('/admin/dashboard/stats'),

  // Users
  getUsers: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/admin/users?${query}`);
  },
  getUserById: (id) => apiRequest(`/admin/users/${id}`),
  createUser: (data) => apiRequest('/admin/users', {
    method: 'POST',
    body: data,
  }),
  updateUser: (id, data) => apiRequest(`/admin/users/${id}`, {
    method: 'PUT',
    body: data,
  }),
  deleteUser: (id) => apiRequest(`/admin/users/${id}`, {
    method: 'DELETE',
  }),

  // Videos
  getVideos: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/admin/videos?${query}`);
  },
  createVideo: (formData) => {
    const token = getAuthToken();
    if (!(formData instanceof FormData) || !formData.has('video')) {
      return Promise.reject(new Error('Video file is required. Please select a video and try again.'));
    }
    return fetch(`${API_URL}/admin/videos`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
        // Do not set Content-Type – browser must set multipart/form-data with boundary
      },
      body: formData,
    }).then(async (response) => {
      const text = await response.text();
      let data;
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        throw new Error(response.ok ? 'Invalid response from server' : (text || 'Upload failed'));
      }
      if (!response.ok) {
        throw new Error(data.message || `Upload failed (${response.status})`);
      }
      return data;
    }).catch((error) => {
      console.error('API Error:', error);
      throw error;
    });
  },
  updateVideo: (id, formData) => apiRequest(`/admin/videos/${id}`, {
    method: 'PUT',
    headers: {},
    body: formData,
  }),
  deleteVideo: (id) => apiRequest(`/admin/videos/${id}`, {
    method: 'DELETE',
  }),
  getVideoStats: (id) => apiRequest(`/admin/videos/${id}/stats`),

  // Logs
  getLogs: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/admin/logs?${query}`);
  },
  deleteLog: (id) => apiRequest(`/admin/logs/${id}`, {
    method: 'DELETE',
  }),

  // Cycles
  getCycles: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/admin/cycles?${query}`);
  },
  deleteCycle: (id) => apiRequest(`/admin/cycles/${id}`, {
    method: 'DELETE',
  }),

  // Subscriptions
  getSubscriptions: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/admin/subscriptions?${query}`);
  },
  deleteSubscription: (id) => apiRequest(`/admin/subscriptions/${id}`, {
    method: 'DELETE',
  }),

  // Gifts
  getGifts: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/admin/gifts?${query}`);
  },
  getGiftById: (id) => apiRequest(`/admin/gifts/${id}`),
  deleteGift: (id) => apiRequest(`/admin/gifts/${id}`, {
    method: 'DELETE',
  }),

  // Notifications (using regular notification routes, which support admin operations)
  getNotifications: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/notifications?${query}`);
  },
  createNotification: (data) => apiRequest('/notifications', {
    method: 'POST',
    body: data,
  }),
  updateNotification: (id, data) => apiRequest(`/notifications/${id}`, {
    method: 'PUT',
    body: data,
  }),
  deleteNotification: (id) => apiRequest(`/notifications/${id}`, {
    method: 'DELETE',
  }),

  // Cycle Phases
  getCyclePhases: () => apiRequest('/admin/cycle-phases'),
  getCyclePhaseById: (id) => apiRequest(`/admin/cycle-phases/${id}`),
  createCyclePhase: (data) => apiRequest('/admin/cycle-phases', {
    method: 'POST',
    body: data,
  }),
  updateCyclePhase: (id, data) => apiRequest(`/admin/cycle-phases/${id}`, {
    method: 'PUT',
    body: data,
  }),
  deleteCyclePhase: (id) => apiRequest(`/admin/cycle-phases/${id}`, {
    method: 'DELETE',
  }),

  // Sequences
  getSequences: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/admin/sequences?${query}`);
  },
  getSequenceById: (id) => apiRequest(`/admin/sequences/${id}`),
  createSequence: (data) => apiRequest('/admin/sequences', {
    method: 'POST',
    body: data,
  }),
  updateSequence: (id, data) => apiRequest(`/admin/sequences/${id}`, {
    method: 'PUT',
    body: data,
  }),
  deleteSequence: (id) => apiRequest(`/admin/sequences/${id}`, {
    method: 'DELETE',
  }),
  duplicateSequence: (id) => apiRequest(`/admin/sequences/${id}/duplicate`, {
    method: 'POST',
  }),
  reorderSequences: (sequenceIds) => apiRequest('/admin/sequences/reorder', {
    method: 'POST',
    body: { sequenceIds },
  }),

  // Sessions
  getSessions: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/admin/sessions?${query}`);
  },
  getSessionById: (id) => apiRequest(`/admin/sessions/${id}`),
  createSession: (formData) => apiRequest('/admin/sessions', {
    method: 'POST',
    body: formData,
  }),
  updateSession: (id, formData) => apiRequest(`/admin/sessions/${id}`, {
    method: 'PUT',
    headers: {},
    body: formData,
  }),
  deleteSession: (id) => apiRequest(`/admin/sessions/${id}`, {
    method: 'DELETE',
  }),
  reorderSessions: (sessionIds) => apiRequest('/admin/sessions/reorder', {
    method: 'POST',
    body: { sessionIds },
  }),

  // Steps
  getSteps: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/admin/steps?${query}`);
  },
  getStepById: (id) => apiRequest(`/admin/steps/${id}`),
  createStep: (data) => apiRequest('/admin/steps', {
    method: 'POST',
    body: data,
  }),
  updateStep: (id, data) => apiRequest(`/admin/steps/${id}`, {
    method: 'PUT',
    body: data,
  }),
  deleteStep: (id) => apiRequest(`/admin/steps/${id}`, {
    method: 'DELETE',
  }),
  reorderSteps: (stepIds) => apiRequest('/admin/steps/reorder', {
    method: 'POST',
    body: { stepIds },
  }),

  // Media Library
  getMedia: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/admin/media?${query}`);
  },
  getMediaById: (id) => apiRequest(`/admin/media/${id}`),
  createMedia: (formData) => {
    const token = getAuthToken();
    return fetch(`${API_URL}/admin/media`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    }).then(async (response) => {
      const text = await response.text();
      let data;
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        throw new Error(response.ok ? 'Invalid response from server' : (text || 'Upload failed'));
      }
      if (!response.ok) {
        throw new Error(data.message || `Upload failed (${response.status})`);
      }
      return data;
    }).catch((error) => {
      console.error('API Error:', error);
      throw error;
    });
  },
  updateMedia: (id, formData) => apiRequest(`/admin/media/${id}`, {
    method: 'PUT',
    headers: {},
    body: formData,
  }),
  deleteMedia: (id) => apiRequest(`/admin/media/${id}`, {
    method: 'DELETE',
  }),

  // Admin Profile & Settings
  getProfile: () => apiRequest('/admin/profile'),
  updateProfile: (data) => apiRequest('/admin/profile', {
    method: 'PUT',
    body: data,
  }),
  changePassword: (data) => apiRequest('/admin/profile/change-password', {
    method: 'PUT',
    body: data,
  }),
};

// User API methods (public-facing endpoints)
export const userAPI = {
  // Sessions
  getSessionsByPhase: (phase) => {
    const query = new URLSearchParams({ phase }).toString();
    return publicApiRequest(`/sessions/phase?${query}`);
  },
  getAllSessions: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return publicApiRequest(`/sessions/all?${query}`);
  },
  getSessionDetails: (id) => publicApiRequest(`/sessions/${id}`),

  // Steps
  getStepsBySession: (sessionId) => publicApiRequest(`/sessions/${sessionId}/steps`),
  getStepById: (stepId) => publicApiRequest(`/sessions/steps/${stepId}`),
};

// Auth API methods
export const authAPI = {
  login: (credentials) => publicApiRequest('/auth/login', {
    method: 'POST',
    body: credentials,
  }),
  register: (userData) => publicApiRequest('/auth/register', {
    method: 'POST',
    body: userData,
  }),
  getMe: () => apiRequest('/auth/me'),
  forgotPassword: (email) => publicApiRequest('/auth/forgot-password', {
    method: 'POST',
    body: { email },
  }),
  resetPassword: (data) => publicApiRequest('/auth/reset-password', {
    method: 'POST',
    body: data,
  }),
};

export default apiRequest;
