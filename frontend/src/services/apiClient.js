import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Attach the TanStack QueryClient after it is created so the interceptor
 * can clear cached data before redirecting on session expiry.
 */
let _queryClient = null;
export function attachQueryClient(qc) {
  _queryClient = qc;
}

// Routes that are ALLOWED to return 401 without triggering a redirect.
// The /auth/me check is a passive session probe — 401 just means "not logged in".
const SILENT_401_ROUTES = ['/auth/me', '/auth/login', '/auth/register'];

apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || '';

    const isSilent = SILENT_401_ROUTES.some((route) => url.includes(route));

    // Session expired on a PROTECTED route → clear cache and redirect to login
    if (status === 401 && !isSilent) {
      if (_queryClient) {
        _queryClient.clear();
      }
      if (!window.location.hash.includes('login') && !window.location.pathname.startsWith('/login')) {
        window.location.hash = '#/login';
      }
      return Promise.reject(new Error('Session expired. Please log in again.'));
    }

    const message =
      error.response?.data?.message ||
      error.response?.data?.errors?.[0]?.msg ||
      error.message ||
      'An unexpected error occurred';

    const normalizedError = new Error(message);
    normalizedError.status = status;
    normalizedError.code = error.code;
    return Promise.reject(normalizedError);
  }
);
