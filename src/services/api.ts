import axios from "axios";

// 1. Create your base Axios instance
const api = axios.create({
  // Replace with your actual backend URL or environment variable
  baseURL: import.meta.env.VITE_API_URL,

  // 👇 CRITICAL: This tells Axios to always send HttpOnly cookies with requests
  withCredentials: true,
});

// 2. Request Interceptor: Attach the current access token to headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // Or wherever you store your access token
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// ── Variables to manage concurrent requests during a token refresh ─
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token);
    }
  });
  failedQueue = [];
};

// 3. Response Interceptor: Catch 401s and trigger token refresh
api.interceptors.response.use(
  (response) => {
    return response; // If the request succeeds, just return it
  },
  async (error) => {
    const originalRequest = error.config;

    // Check if the error is a 401 (Unauthorized) AND we haven't already retried this request
    if (error.response?.status === 401 && !originalRequest._retry) {
      // If a refresh is already in progress, queue this request until it's done
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers["Authorization"] = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      // Mark the request so we don't get stuck in an infinite loop
      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // 👇 Make the refresh request.
        // We use base `axios` instead of `api` to bypass the interceptors so we don't trigger an infinite loop if the refresh fails.
        const response = await axios.post(
          `${api.defaults.baseURL}/auth/refresh`,
          {},
          { withCredentials: true },
        );

        const newAccessToken = response.data.access_token;

        // Save the new token back to local storage
        localStorage.setItem("token", newAccessToken);

        // Update the default headers for future requests
        api.defaults.headers.common["Authorization"] =
          `Bearer ${newAccessToken}`;

        // Update the failed request's header with the new token
        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;

        // Process any other requests that failed while we were refreshing
        processQueue(null, newAccessToken);

        // Retry the original request
        return api(originalRequest);
      } catch (refreshError) {
        // If the refresh request itself fails (e.g., the 7-day refresh token expired), clear everything
        processQueue(refreshError, null);

        localStorage.removeItem("token");

        // Redirect to login page to force the user to re-authenticate
        window.location.href = "/admin/login";

        return Promise.reject(refreshError);
      } finally {
        // Reset the flag
        isRefreshing = false;
      }
    }

    // If it's a different error (e.g., 404, 500), just pass it along to the component
    return Promise.reject(error);
  },
);

export default api;
