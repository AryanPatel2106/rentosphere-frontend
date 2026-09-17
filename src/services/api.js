import axios from "axios";

// Resolve API base URL:
// 1. Explicit VITE_API_URL if provided (.env.development / .env.production / .env.local)
// 2. Development mode defaults to local backend http://localhost:5000/api/v1
// 3. Production mode defaults to live backend https://api.clouddrive.page/api/v1
const getBaseURL = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  if (import.meta.env.DEV) {
    return "http://localhost:5000/api/v1";
  }
  return "https://api.clouddrive.page/api/v1";
};

const api = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true,
});

// Request interceptor to automatically attach Authorization header when token is in localStorage
api.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem("accessToken") || localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
