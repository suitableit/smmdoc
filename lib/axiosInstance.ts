import axios from "axios";

// Determine the correct base URL based on the current environment
const getBaseUrl = () => {
  // Check if we're running in the browser
  if (typeof window !== 'undefined') {
    // Use the current window location origin as the base URL
    return window.location.origin;
  }
  // Default to localhost when running on server
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
};

const axiosInstance = axios.create({
  baseURL: getBaseUrl(),
  withCredentials: false, // Ensure this is false to avoid CORS issues with wildcard origins
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  },
  timeout: 15000, // 15 seconds timeout
});

// Optional: intercept requests
axiosInstance.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    
    // Make sure withCredentials remains false for all requests
    config.withCredentials = false;
    
    // Ensure we're using the correct URL for API requests
    if (config.url && config.url.startsWith('/api/')) {
      config.baseURL = getBaseUrl();
      console.log(`Using base URL: ${config.baseURL} for API request`);
    }
    
    return config;
  },
  (error) => {
    console.error("Request error:", error);
    return Promise.reject(error);
  }
);

// Optional: intercept responses
axiosInstance.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error("Response error:", error);
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error("Error data:", error.response.data);
      console.error("Error status:", error.response.status);
      console.error("Error headers:", error.response.headers);
    } else if (error.request) {
      // The request was made but no response was received
      console.error("Error request:", error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error("Error message:", error.message);
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
