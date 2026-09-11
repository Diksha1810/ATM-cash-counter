import axios from 'axios';
import { QUERY_KEYS } from '../utils/constants';
import { getIsOnline, setNetworkOnline, subscribeNetworkStatus } from '../utils/networkState';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 4000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Attach the TanStack QueryClient after it is created so the interceptor
 * can clear cached data before redirecting on session expiry.
 */
let _queryClient = null;
const activeRequests = new Set();

function createOfflineError() {
  const error = new Error('Network is offline.');
  error.code = 'ERR_INTERNET_DISCONNECTED';
  return error;
}

subscribeNetworkStatus((online) => {
  if (!online) {
    activeRequests.forEach((controller) => controller.abort());
    activeRequests.clear();
  }
});

export function attachQueryClient(qc) {
  _queryClient = qc;
}

// Routes that are ALLOWED to return 401 without triggering a redirect.
// The /auth/me check is a passive session probe — 401 just means "not logged in".
const SILENT_401_ROUTES = ['/auth/me', '/auth/login', '/auth/register'];

apiClient.interceptors.request.use((config) => {
  if (!getIsOnline()) {
    return Promise.reject(createOfflineError());
  }

  const controller = new AbortController();
  const originalSignal = config.signal;
  config.signal = controller.signal;
  activeRequests.add(controller);

  if (originalSignal) {
    if (originalSignal.aborted) controller.abort();
    else originalSignal.addEventListener('abort', () => controller.abort(), { once: true });
  }

  config.__requestController = controller;
  return config;
});

apiClient.interceptors.response.use(
  (response) => {
    if (response.config.__requestController) {
      activeRequests.delete(response.config.__requestController);
    }
    setNetworkOnline(true);
    return response.data;
  },
  (error) => {
    if (error.config?.__requestController) {
      activeRequests.delete(error.config.__requestController);
    }
    const status = error.response?.status;
    const url = error.config?.url || '';

    // If there is no HTTP status, the network request failed to connect
    if (!status) {
      setNetworkOnline(false);
    }

    const isSilent = SILENT_401_ROUTES.some((route) => url.includes(route));

    // Session expired on a protected route: preserve the auth observer while
    // removing protected data and explicitly marking the session as signed out.
    if (status === 401 && !isSilent) {
      if (_queryClient) {
        _queryClient.setQueryData([QUERY_KEYS.AUTH_USER], null);
        _queryClient.removeQueries({ queryKey: [QUERY_KEYS.INVENTORY] });
        _queryClient.removeQueries({ queryKey: [QUERY_KEYS.PENDING_COUNT] });
        _queryClient.removeQueries({ queryKey: [QUERY_KEYS.TRANSACTIONS] });
      }
      if (!window.location.pathname.startsWith('/login')) {
        window.location.assign('/login');
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
