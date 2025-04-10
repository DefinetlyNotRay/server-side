import axios from "axios";

const API_URL = "http://localhost:5000";

// Create an axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to include the auth token
api.interceptors.request.use(
  (config) => {
    // Get token directly from localStorage
    const token = localStorage.getItem("token");

    if (token) {
      // Ensure the token is properly formatted
      config.headers.Authorization = `Bearer ${token}`;
      console.log("Setting Authorization header with token");
    } else {
      console.warn("No auth token found in localStorage");
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log("API Response:", response.config.url, response.status);
    return response;
  },
  (error) => {
    console.error(
      "API Error:",
      error.config?.url,
      error.response?.status,
      error.message
    );
    
    // Handle authentication errors
    if (error.response && error.response.status === 401) {
      console.log("Authentication error - clearing token");
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Redirect to login if not already there
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
