import axios, { AxiosError } from "axios";
import type { InternalAxiosRequestConfig } from "axios";
import toast from "react-hot-toast";

const API_URL =
  import.meta.env.VITE_API_URL ??
  "https://news-detector-sb51.onrender.com/api";

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor: Attach JWT Token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle errors globally
api.interceptors.response.use(
  (response) => {
    // If backend returns APIResponse format, check if success is false
    if (response.data && response.data.success === false) {
      toast.error(response.data.message || "An error occurred");
    }
    return response;
  },
  (error: AxiosError) => {
    const responseData = error.response?.data as any;
    const errorMessage = responseData?.message || responseData?.detail || "Something went wrong";

    // Check status codes
    if (error.response) {
      switch (error.response.status) {
        case 401:
          // Unauthorized: Clear session if already logged in
          if (localStorage.getItem("token")) {
            localStorage.removeItem("token");
            toast.error("Session expired. Please log in again.");
            // Wait brief moment and redirect to login
            setTimeout(() => {
              window.location.href = "/login";
            }, 1000);
          }
          break;
        case 403:
          toast.error("You are not authorized to perform this action.");
          break;
        case 404:
          // Hide or ignore depending on route, show toast otherwise
          toast.error(errorMessage || "Requested resource not found.");
          break;
        case 409:
          toast.error(errorMessage || "Conflict: resource already exists.");
          break;
        case 422:
          // Pydantic Validation Error
          const details = responseData?.detail || responseData?.data;
          if (Array.isArray(details) && details.length > 0) {
            const firstError = details[0];
            const msg = firstError.msg || firstError.message || "Invalid input";
            const loc = firstError.loc;
            const field = Array.isArray(loc) && loc.length > 0
              ? loc[loc.length - 1]
              : "";
            const prefix = field && field !== "body" ? `${field}: ` : "";
            toast.error(`${prefix}${msg}`);
          } else {
            toast.error(errorMessage || "Validation error.");
          }
          break;
        case 500:
          toast.error("Internal Server Error. Please try again later.");
          break;
        default:
          toast.error(errorMessage);
          break;
      }
    } else if (error.request) {
      toast.error("Network Error: Could not connect to the backend server.");
    } else {
      toast.error("An unexpected error occurred.");
    }

    return Promise.reject(error);
  }
);
