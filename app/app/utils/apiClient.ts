/* eslint-disable @typescript-eslint/no-explicit-any */
import { toast } from "react-toastify";
import { API_BASE_URL } from "./wagmiConfig";

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

interface ApiClientOptions {
  endpoint: string;
  method?: HttpMethod;
  body?: any;
  token?: string | null;
  contentType?: string;
  useJsonBody?: boolean;
  showToastOnError?: boolean;
}

/**
 * Helper function for making authenticated API calls
 * Handles auth headers, error responses, and optional toast notifications
 */
export async function apiClient<T = any>({
  endpoint,
  method = "GET",
  body,
  token,
  contentType = "application/json",
  useJsonBody = true,
  showToastOnError = true,
}: ApiClientOptions): Promise<T> {
  try {
    // Prepare URL (handle both absolute and relative paths)
    const url = endpoint.startsWith("http")
      ? endpoint
      : `${API_BASE_URL}${
          endpoint.startsWith("/") ? endpoint : `/${endpoint}`
        }`;

    // Prepare headers
    const headers: HeadersInit = {};

    if (contentType) {
      headers["Content-Type"] = contentType;
    }

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    // Prepare request options
    const options: RequestInit = {
      method,
      headers,
    };

    // Add body if needed
    if (body && method !== "GET") {
      options.body = useJsonBody ? JSON.stringify(body) : body;
    }

    // Make the request
    const response = await fetch(url, options);

    // Handle authentication errors
    if (response.status === 401) {
      if (showToastOnError) {
        toast.error("Your session has expired. Please login again.");
      }
      // You might want to trigger a logout here or redirect
      throw new Error("Unauthorized: Your session has expired");
    }

    // Parse response
    let data;
    const contentTypeHeader = response.headers.get("content-type");
    if (contentTypeHeader && contentTypeHeader.includes("application/json")) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    // Check for error responses
    if (!response.ok) {
      const errorMessage =
        typeof data === "object" && data.message
          ? data.message
          : "An error occurred";

      if (showToastOnError) {
        toast.error(`API Error: ${errorMessage}`);
      }

      throw new Error(errorMessage);
    }

    return data as T;
  } catch (error) {
    // Handle network errors and other unexpected issues
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    // Only show toast if it's not already an auth error (which shows its own toast)
    if (
      showToastOnError &&
      !errorMessage.includes("Unauthorized: Your session has expired")
    ) {
      toast.error(`Request failed: ${errorMessage}`);
    }

    console.error("API request failed:", error);
    throw error;
  }
}

/**
 * Shorthand for GET requests
 */
export function get<T = any>(
  endpoint: string,
  token?: string | null,
  options: Partial<ApiClientOptions> = {}
) {
  return apiClient<T>({
    endpoint,
    method: "GET",
    token,
    ...options,
  });
}

/**
 * Shorthand for POST requests
 */
export function post<T = any>(
  endpoint: string,
  body: any,
  token?: string | null,
  options: Partial<ApiClientOptions> = {}
) {
  return apiClient<T>({
    endpoint,
    method: "POST",
    body,
    token,
    ...options,
  });
}

/**
 * Shorthand for PUT requests
 */
export function put<T = any>(
  endpoint: string,
  body: any,
  token?: string | null,
  options: Partial<ApiClientOptions> = {}
) {
  return apiClient<T>({
    endpoint,
    method: "PUT",
    body,
    token,
    ...options,
  });
}

/**
 * Shorthand for DELETE requests
 */
export function del<T = any>(
  endpoint: string,
  body?: any,
  token?: string | null,
  options: Partial<ApiClientOptions> = {}
) {
  return apiClient<T>({
    endpoint,
    method: "DELETE",
    body,
    token,
    ...options,
  });
}
