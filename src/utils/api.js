const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

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

// API request helper
const apiRequest = async (endpoint, options = {}) => {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('No authentication token available. Please log in again.');
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
      // If unauthorized, clear token and redirect to login
      if (response.status === 401) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          // Optionally redirect to login
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
        }
      }
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
};

// Auth API methods
export const authAPI = {
  login: (credentials) => apiRequest('/auth/login', {
    method: 'POST',
    body: credentials,
  }),
  register: (userData) => apiRequest('/auth/register', {
    method: 'POST',
    body: userData,
  }),
  getMe: () => apiRequest('/auth/me'),
};

export default apiRequest;
