import axios from "axios";
// import { getSession, refreshSession } from "better-auth";

// Create a base API URL from environment variable
const API_BASE_URL = `${process.env.NEXT_PUBLIC_BASE_URL}/api`;

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
/* api.interceptors.request.use(async (config) => {
  try {
    const session = await getSession();
    if (session?.accessToken) {
      config.headers.Authorization = `Bearer ${session.accessToken}`;
    }
    return config;
  } catch (error) {
    return Promise.reject(error);
  }
}); */

// Response interceptor to handle token refresh
/* api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh the token
        const session = await refreshSession();

        if (session?.accessToken) {
          // Update the auth header
          originalRequest.headers.Authorization = `Bearer ${session.accessToken}`;
          // Retry the request
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Let better-auth handle the redirect
        console.error("Failed to refresh token:", refreshError);
      }
    }

    return Promise.reject(error);
  }
); */

export default api;
