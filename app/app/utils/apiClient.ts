/* eslint-disable @typescript-eslint/no-explicit-any */
import { toast } from "react-toastify";
import { i18n } from "~/i18n";
import { API_BASE_URL } from "./wagmiConfig";
import { parseZodError } from "./validation";
import { disconnectWallet } from "./globalDisconnect";

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
    const url = endpoint.startsWith("http")
      ? endpoint
      : `${API_BASE_URL}${
          endpoint.startsWith("/") ? endpoint : `/${endpoint}`
        }`;

    const headers: HeadersInit = {};

    if (contentType) {
      headers["Content-Type"] = contentType;
    }

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const options: RequestInit = {
      method,
      headers,
    };

    if (body && method !== "GET") {
      options.body = useJsonBody ? JSON.stringify(body) : body;
    }

    const response = await fetch(url, options);

    if (response.status === 401) {
      disconnectWallet();
      if (showToastOnError) {
        toast.error(i18n.t("apiClient.sessionExpiredReconnect"));
      }
      throw new Error(i18n.t("apiClient.unauthorizedSessionExpired"));
    }

    let data;
    const contentTypeHeader = response.headers.get("content-type");
    if (contentTypeHeader && contentTypeHeader.includes("application/json")) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      let errorMessage = i18n.t("error.anErrorOccurred");

      if (typeof data === "object") {
        errorMessage = parseZodError(data);
      }

      if (response.status === 429) {
        const rateLimitError = new Error(errorMessage);
        (rateLimitError as any).status = 429;
        (rateLimitError as any).data = data;
        throw rateLimitError;
      }

      const error = new Error(errorMessage);
      (error as any).status = response.status;
      throw error;
    }

    return data as T;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : i18n.t("apiClient.unknownError");

    const isRateLimitError = (error as any)?.status === 429;

    if (
      showToastOnError &&
      !errorMessage.includes(i18n.t("apiClient.unauthorizedSessionExpired")) &&
      !isRateLimitError
    ) {
      toast.error(i18n.t("apiClient.requestFailed", { errorMessage }));
    }

    console.error("API request failed:", error);
    throw error;
  }
}

/**
 * Helper function for making form data API calls with image uploads
 * Handles auth headers, error responses, and optional toast notifications
 */
export async function apiClientFormData<T = any>({
  endpoint,
  method = "POST",
  formData,
  token,
  showToastOnError = true,
}: {
  endpoint: string;
  method?: HttpMethod;
  formData: FormData;
  token?: string | null;
  showToastOnError?: boolean;
}): Promise<T> {
  try {
    const url = endpoint.startsWith("http")
      ? endpoint
      : `${API_BASE_URL}${
          endpoint.startsWith("/") ? endpoint : `/${endpoint}`
        }`;

    const headers: HeadersInit = {};

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const options: RequestInit = {
      method,
      headers,
      body: formData,
    };

    const response = await fetch(url, options);

    if (response.status === 401) {
      disconnectWallet();
      if (showToastOnError) {
        toast.error(i18n.t("apiClient.sessionExpiredReconnect"));
      }
      throw new Error(i18n.t("apiClient.unauthorizedSessionExpired"));
    }

    let data;
    const contentTypeHeader = response.headers.get("content-type");
    if (contentTypeHeader && contentTypeHeader.includes("application/json")) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      let errorMessage = i18n.t("error.anErrorOccurred");

      if (typeof data === "object") {
        errorMessage = parseZodError(data);
      }

      if (showToastOnError) {
        toast.error(i18n.t("apiClient.apiError", { errorMessage }));
      }

      throw new Error(errorMessage);
    }

    return data as T;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : i18n.t("apiClient.unknownError");

    const isRateLimitError = (error as any)?.status === 429;

    if (
      showToastOnError &&
      !errorMessage.includes(i18n.t("apiClient.unauthorizedSessionExpired")) &&
      !isRateLimitError
    ) {
      toast.error(i18n.t("apiClient.requestFailed", { errorMessage }));
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

/**
 * Helper function to create FormData for DEX requests with images
 */
export function createDexFormData(
  data: Record<string, any>,
  images: {
    primaryLogo?: Blob | null;
    secondaryLogo?: Blob | null;
    favicon?: Blob | null;
    pnlPosters?: (Blob | null)[];
  } = {}
): FormData {
  const formData = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      if (Array.isArray(value)) {
        formData.append(key, JSON.stringify(value));
      } else if (typeof value === "object") {
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, String(value));
      }
    }
  });

  if (images.primaryLogo) {
    formData.append("primaryLogo", images.primaryLogo, "primaryLogo.webp");
  }
  if (images.secondaryLogo) {
    formData.append(
      "secondaryLogo",
      images.secondaryLogo,
      "secondaryLogo.webp"
    );
  }
  if (images.favicon) {
    formData.append("favicon", images.favicon, "favicon.webp");
  }
  if (images.pnlPosters) {
    images.pnlPosters.forEach((poster, index) => {
      if (poster) {
        formData.append(`pnlPoster${index}`, poster, `pnlPoster${index}.webp`);
      }
    });
  }

  return formData;
}

/**
 * Shorthand for POST requests with form data (for image uploads)
 */
export function postFormData<T = any>(
  endpoint: string,
  formData: FormData,
  token?: string | null,
  options: { showToastOnError?: boolean } = {}
) {
  return apiClientFormData<T>({
    endpoint,
    method: "POST",
    formData,
    token,
    ...options,
  });
}

/**
 * Shorthand for PUT requests with form data (for image uploads)
 */
export function putFormData<T = any>(
  endpoint: string,
  formData: FormData,
  token?: string | null,
  options: { showToastOnError?: boolean } = {}
) {
  return apiClientFormData<T>({
    endpoint,
    method: "PUT",
    formData,
    token,
    ...options,
  });
}
