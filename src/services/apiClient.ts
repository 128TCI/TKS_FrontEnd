// ─── services/apiClient.ts ────────────────────────────────────────────────────
// Axios instance with:
//  • Base URL from env
//  • JWT token auto-injected into every request
//  • 401 auto-refresh: tries refresh-token once, then redirects to login
//  • 403 / network errors surfaced cleanly

import axios, {
  type AxiosInstance,
  type InternalAxiosRequestConfig,
  type AxiosResponse,
} from 'axios';


const BASE_URL = 'https://localhost:7264/api';

// ── Token helpers ─────────────────────────────────────────────────────────────
const TOKEN_KEY = '128bl3$$1ng$';

export const tokenStorage = {
  get:    ()            => localStorage.getItem(TOKEN_KEY),
  set:    (t: string)   => localStorage.setItem(TOKEN_KEY, t),
  clear:  ()            => localStorage.removeItem(TOKEN_KEY),
};

const apiClient = axios.create({
  //  baseURL: 'https://demo.128techconsultinginc.com/DEMO_128_TKS/api',
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30_000,
});

// ── Request interceptor — attach Bearer token ─────────────────────────────────
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = tokenStorage.get();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor — handle 401 with auto-refresh ──────────────────────
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: AxiosResponse) => void;
  reject:  (reason?: unknown) => void;
  config:  InternalAxiosRequestConfig;
}> = [];

const processQueue = (error: unknown | null, token: string | null) => {
  failedQueue.forEach(({ resolve, reject, config }) => {
    if (error || !token) {
      reject(error);
    } else {
      config.headers.Authorization = `Bearer ${token}`;
      apiClient(config).then(resolve).catch(reject);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest: InternalAxiosRequestConfig & { _retry?: boolean } =
      error.config;

    // Skip redirect for auth endpoints to prevent infinite loops
    const isAuthEndpoint =
      originalRequest?.url?.includes('/Login') ||
      originalRequest?.url?.includes('/Auth/refresh-token');

    // ── 401 Unauthorized — attempt token refresh ──────────────────────────────
    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      const currentToken = tokenStorage.get();

      // No token — go to login immediately
      if (!currentToken) {
        redirectToLogin();
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject, config: originalRequest });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post<{ token: string }>(
          `${BASE_URL}/Auth/refresh-token`,
          { token: currentToken },
          { headers: { 'Content-Type': 'application/json' } }
        );
        tokenStorage.set(data.token);
        originalRequest.headers.Authorization = `Bearer ${data.token}`;
        processQueue(null, data.token);
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        tokenStorage.clear();
        redirectToLogin();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // ── 403 Forbidden ─────────────────────────────────────────────────────────
    if (error.response?.status === 403) {
      console.warn('Access forbidden — insufficient permissions.');
    }

    return Promise.reject(error);
  }
);

function redirectToLogin() {
  tokenStorage.clear();
  if (window.location.pathname !== '/Login') {
    window.location.href = '/Login';
  }
}

// ── Username helper — reads from userData in localStorage ─────────────────────
export function getLoggedInUsername(): string {
  try {
    const raw = localStorage.getItem('userData');
    if (!raw) return 'Guest';
    // Handles both plain string and JSON object
    if (raw.startsWith('{')) {
      const parsed = JSON.parse(raw);
      return parsed?.username ?? parsed?.userName ?? parsed?.name ?? 'Guest';
    }
    return raw;
  } catch {
    return 'Guest';
  }
}

export default apiClient;
