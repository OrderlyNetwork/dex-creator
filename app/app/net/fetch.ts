import { SWRConfiguration } from "swr";
import { getBaseUrl } from "../utils/orderly";

export async function request(url: string, options: RequestInit) {
  const apiBaseUrl = getBaseUrl();
  const fullUrl = url.startsWith("http") ? url : `${apiBaseUrl}${url}`;

  const response = await fetch(fullUrl, {
    ...options,
    headers: _createHeaders(options.headers, options.method),
  });

  if (response.ok) {
    const res = await response.json();
    return res;
  } else {
    try {
      const errorMsg = await response.json();
      if (response.status === 400) {
        throw new Error(
          errorMsg.message || errorMsg.code || response.statusText
        );
      }
      // TODO: throw error code
      throw new Error(errorMsg.message || errorMsg.code || response.statusText);
    } catch (e) {
      throw e;
    }
  }

  // throw new Error(response.statusText);
}

function _createHeaders(
  headers: HeadersInit = {},
  method?: string
): HeadersInit {
  const _headers = new Headers(headers);
  if (!_headers.has("Content-Type")) {
    if (method !== "DELETE") {
      _headers.append("Content-Type", "application/json;charset=utf-8");
    } else {
      _headers.append("Content-Type", "application/x-www-form-urlencoded");
    }
  }

  return _headers;
}

export async function get<R = any>(
  url: string,
  options?: RequestInit,
  formatter?: (data: any) => R
): Promise<R> {
  const res = await request(url, {
    method: "GET",
    ...options,
  });

  if (res.success) {
    if (typeof formatter === "function") {
      return formatter(res.data);
    }
    // Return the required data based on the returned data structure
    if (Array.isArray(res.data["rows"])) {
      return res.data["rows"] as unknown as R;
    }
    return res.data;
  }
  throw new Error(res.message);
}

export async function post(
  url: string,
  data: any,
  options?: Omit<RequestInit, "method">
): Promise<any> {
  const res = await request(url, {
    method: "POST",
    body: JSON.stringify(data),
    ...options,
  });

  return res;
}

export async function put(
  url: string,
  data: any,
  options?: Omit<RequestInit, "method">
): Promise<any> {
  const res = await request(url, {
    method: "PUT",
    body: JSON.stringify(data),
    ...options,
  });

  return res;
}

export async function del(
  url: string,
  options?: Omit<RequestInit, "method">
): Promise<any> {
  const res = await request(url, {
    method: "DELETE",
    ...options,
  });

  return res;
}

export const fetcher = (
  url: string,
  init: RequestInit = {},
  queryOptions: useQueryOptions<any>
) => get(url, init, queryOptions?.formatter);

export type useQueryOptions<T> = SWRConfiguration & {
  formatter?: (data: any) => T;
};
