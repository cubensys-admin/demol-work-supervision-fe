import axios from "axios";
import { env } from "@/shared/config/env";

/**
 * Public API client for non-authenticated endpoints
 * Does not include auth interceptors
 */
export const publicApiClient = axios.create({
  baseURL: env.apiBaseUrl,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

// Simple response interceptor for error handling (no auth required)
publicApiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("Public API Error:", error);
    return Promise.reject(error);
  }
);
