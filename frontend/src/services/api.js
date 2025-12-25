import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL.replace(/\/$/, "") + "/api",
});

// Add Authorization header automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle responses globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If token expired or unauthorized, log out user
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      // Redirect to login page
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
