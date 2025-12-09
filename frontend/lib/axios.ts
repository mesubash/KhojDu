// Axios HTTP client with token management and auto-refresh

import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from "axios";
import { toast } from "sonner"

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8089/api";

// Create axios instance
const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // ✅ CRITICAL: Include HTTP-only cookies in requests
  timeout: 30000, // 30 second timeout
});

// Track if we're currently refreshing to prevent multiple refresh calls
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any = null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// Request interceptor: Add accessToken from localStorage to Authorization header
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // ✅ SECURITY: Read accessToken from localStorage
    // RefreshToken is sent automatically via HTTP-only cookie
    if (typeof window !== "undefined") {
      const accessToken = localStorage.getItem("__kd_token");
      if (accessToken && config.headers) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Helper: redirect to login with current path
const redirectToLogin = (message?: string) => {
  if (typeof window === "undefined") return
  if (message) {
    try {
      localStorage.setItem("__kd_login_notice", message)
    } catch (_) {
      // ignore storage failures
    }
    toast.error(message)
  }
  const current = window.location.pathname + window.location.search
  window.location.href = `/auth/login?redirect=${encodeURIComponent(current)}`
}

// Response interceptor: Handle token refresh on 401 errors
axiosInstance.interceptors.response.use(
  (response) => response, // Pass through successful responses
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // ✅ DON'T try to refresh token for auth endpoints (login, register, etc.)
    // These endpoints should fail normally without trying to refresh
    const authEndpoints = [
      "/auth/login",
      "/auth/register",
      "/auth/refresh",
      "/auth/forgot-password",
      "/auth/reset-password",
    ];
    const isAuthEndpoint = authEndpoints.some((endpoint) =>
      originalRequest.url?.includes(endpoint)
    );

    // If this is an auth endpoint, surface the error directly without any session messaging
    if (isAuthEndpoint) {
      return Promise.reject(error);
    }

    // If error is not 401 or request doesn't exist, reject immediately
    if (error.response?.status !== 401 || !originalRequest) {
      if (error.response?.status === 401 && typeof window !== "undefined") {
        const hadToken = !!localStorage.getItem("__kd_token")
        localStorage.removeItem("__kd_token");
        localStorage.removeItem("__kd_user");
        redirectToLogin(hadToken ? "Session expired. Please log in again." : "Please log in to access this content.");
      }
      return Promise.reject(error);
    }

    // If 401 and no access token was ever set, just redirect to login
    const hadToken = typeof window !== "undefined" && !!localStorage.getItem("__kd_token")
    if (!hadToken) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("__kd_token")
        localStorage.removeItem("__kd_user")
      }
      redirectToLogin("Please log in to access this content.")
      return Promise.reject(error)
    }

    if (isAuthEndpoint) {
      // For auth endpoints, just reject the error without refresh attempt
      if (
        originalRequest.url?.includes("/auth/refresh") &&
        typeof window !== "undefined"
      ) {
        (window as any).__getAccessToken = () => null;
      }
      return Promise.reject(error);
    }

    // If already retried, don't retry again
    if (originalRequest._retry) {
      return Promise.reject(error);
    }

    // If currently refreshing, queue this request
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          return axiosInstance(originalRequest);
        })
        .catch((err) => {
          return Promise.reject(err);
        });
    }

    // Mark as retrying and start refresh process
    originalRequest._retry = true;
    isRefreshing = true;

    try {
      // Attempt to refresh token (cookie sent automatically)
      const { data } = await axios.post(
        `${API_BASE_URL}/auth/refresh`,
        {},
        {
          withCredentials: true, // Send refresh token cookie
        }
      );

      // ✅ SECURITY: Store new access token in localStorage
      const newAccessToken = data.data.accessToken;
      if (typeof window !== "undefined") {
        localStorage.setItem("__kd_token", newAccessToken);
        
        // ✅ Also update user data if provided
        if (data.data.user) {
          localStorage.setItem("__kd_user", JSON.stringify(data.data.user));
        }
        
        console.log("[Axios] ✅ Token refreshed and stored");
      }

      // Update original request with new token
      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      }

      // Process queued requests with new token
      processQueue(null, newAccessToken);

      // Retry original request
      return axiosInstance(originalRequest);
    } catch (refreshError) {
      // Refresh failed, clear token from localStorage
      processQueue(refreshError, null);

      if (typeof window !== "undefined") {
        localStorage.removeItem("__kd_token");
        localStorage.removeItem("__kd_user");
        console.log("[Axios] ❌ Token refresh failed, cleared session");
        redirectToLogin("Session expired. Please log in again.");
      }

      // ✅ Don't redirect here - let middleware handle navigation
      // The 401 error will be returned to the caller
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default axiosInstance;

// Export a clean axios instance without interceptors for auth endpoints
export const axiosWithoutInterceptors = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
  timeout: 30000,
});
