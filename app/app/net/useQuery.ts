import useSWR from "swr";
import type { SWRHook, SWRResponse } from "swr";
import { fetcher, useQueryOptions } from "./fetch";
import { getBaseUrl } from "../utils/orderly";

/**
 * useQuery
 * @description for public api
 * @param query
 * @param options
 */
export const useQuery = <T>(
  query: Parameters<SWRHook>[0],
  options?: useQueryOptions<T>
): SWRResponse<T> => {
  const apiBaseUrl = getBaseUrl();
  const { formatter, ...swrOptions } = options || {};

  return useSWR<T>(
    query,
    (url, init) => {
      return fetcher(
        url.startsWith("http") ? url : `${apiBaseUrl}${url}`,
        init,
        {
          formatter,
        }
      );
    },
    swrOptions
  );
};
