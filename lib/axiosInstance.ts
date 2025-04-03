import axios from "axios";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Optional: intercept requests
axiosInstance.interceptors.request.use(
  (config) => {
    // config.headers["Authorization"] = `Bearer ${localStorage.getItem("token")}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Optional: intercept responses
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;
