import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:5000", // backend base URL
});

// Arrow function inside interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (!config.headers) config.headers = {};
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;
