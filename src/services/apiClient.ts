import axios, { AxiosRequestConfig } from 'axios';
import { auth } from '../config/firebase';

export const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to inject Firebase ID token into requests
apiClient.interceptors.request.use(
  async (config) => {
    // 1. Try real Firebase token
    if (auth?.currentUser) {
      try {
        const token = await auth.currentUser.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
        return config;
      } catch (err) {
        console.warn('[apiClient] Failed to get Firebase ID token:', err);
      }
    }

    // 2. Fallback: check session user in localStorage for demo testing
    let sessionToken = localStorage.getItem('speakmate_auth_token');
    if (!sessionToken) {
      const savedProfile = localStorage.getItem('speakmate_profile');
      if (savedProfile) {
        try {
          const parsed = JSON.parse(savedProfile);
          const tokenPayload = {
            uid: parsed.firebaseUid || parsed.id || 'usr_local',
            email: parsed.email || 'speaker@speakmate.com',
            name: parsed.name || 'Speaker',
            username: parsed.username || 'speaker',
          };
          sessionToken = `demo-token-${btoa(unescape(encodeURIComponent(JSON.stringify(tokenPayload))))}`;
          localStorage.setItem('speakmate_auth_token', sessionToken);
        } catch {}
      }
    }

    if (sessionToken && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${sessionToken}`;
    }

    // 3. Attach current user profile metadata for proper host resolution
    const savedProfile = localStorage.getItem('speakmate_profile');
    if (savedProfile) {
      try {
        const parsed = JSON.parse(savedProfile);
        if (parsed?.name) {
          config.headers['x-user-name'] = encodeURIComponent(parsed.name);
        }
        if (parsed?.username) {
          config.headers['x-user-username'] = encodeURIComponent(parsed.username);
        }
      } catch {}
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for auth errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn('[apiClient] 401 Unauthorized encountered from backend.');
    }
    return Promise.reject(error);
  }
);
