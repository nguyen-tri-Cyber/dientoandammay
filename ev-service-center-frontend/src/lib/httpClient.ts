import axios from "axios";

const REQUEST_TIMEOUT_MS = 10000;
const isBrowser = typeof window !== "undefined";
const getDefaultApiUrl = () => {
  if (isBrowser) {
    return `${window.location.protocol}//${window.location.hostname}:8080`;
  }

  return process.env.API_INTERNAL_URL || "http://localhost:8080";
};

const baseURL = process.env.NEXT_PUBLIC_API_URL || getDefaultApiUrl();

export const httpClient = axios.create({
  baseURL,
  timeout: REQUEST_TIMEOUT_MS,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor
httpClient.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = isBrowser ? localStorage.getItem("token") : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor
httpClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const { status, data } = error.response;

      // Handle specific error cases
      if (status === 401 && isBrowser) {
        // Unauthorized - clear token and redirect to login
        localStorage.removeItem("token");
        window.location.href = "/signin";
      }

      // Throw error with message from server
      throw new Error(data?.message || "An error occurred");
    } else if (error.code === "ECONNABORTED") {
      throw new Error("Request timed out. Please check the API server.");
    } else if (error.request) {
      // The request was made but no response was received
      throw new Error("No response from server");
    } else {
      // Something happened in setting up the request that triggered an Error
      throw new Error("Error setting up request");
    }
  }
); 
