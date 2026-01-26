import { useRef, useEffect } from "react";
import useSWRMutation, { type SWRMutationConfiguration } from "swr/mutation";
import { getBaseUrl } from "../utils/orderly";
import { useOrderlyKey } from "../context/OrderlyKeyContext";
import { getSignHeader } from "./sign";
import { request } from "./fetch";
import { MessageFactor, SignedMessagePayload } from "./type";

type HTTP_METHOD = "POST" | "PUT" | "DELETE" | "GET";

const fetcher = (
  url: string,
  options: {
    arg: {
      data?: any;
      params?: any;
      method: HTTP_METHOD;
      signature: SignedMessagePayload;
    };
  }
) => {
  const init: RequestInit = {
    method: options.arg.method,
    headers: {
      ...options.arg.signature,
    },
  };

  if (options.arg.data) {
    init.body = JSON.stringify(options.arg.data);
  }

  if (
    typeof options.arg.params === "object" &&
    Object.keys(options.arg.params).length
  ) {
    const search = new URLSearchParams(options.arg.params);
    url = `${url}?${search.toString()}`;
  }

  return request(url, init);
};

/**
 * This hook is used to execute API requests for data mutation, such as POST, DELETE, PUT, etc.
 */
export const useMutation = <T, E>(
  /**
   * The URL to send the request to. If the URL does not start with "http",
   * it will be prefixed with the API base URL.
   */
  url: string,
  /**
   * The HTTP method to use for the request. Defaults to "POST".
   */
  method: HTTP_METHOD = "POST",
  /**
   * The configuration object for the mutation.
   * @see [useSWRMutation](https://swr.vercel.app/docs/mutation#api)
   *
   * @link https://swr.vercel.app/docs/mutation#api
   */
  options?: SWRMutationConfiguration<T, E>
) => {
  const apiBaseUrl = getBaseUrl();

  const { accountId, orderlyKey } = useOrderlyKey();

  // Use ref to store the latest url and method to avoid closure issues
  const urlRef = useRef(url);
  const methodRef = useRef(method);

  // Update refs when url or method changes
  useEffect(() => {
    urlRef.current = url;
    methodRef.current = method;
  }, [url, method]);

  let fullUrl = url;
  if (!url.startsWith("http")) {
    fullUrl = `${apiBaseUrl}${url}`;
  }

  const { trigger, data, error, reset, isMutating } = useSWRMutation(
    () => fullUrl,
    // method === "POST" ? fetcher : deleteFetcher,
    fetcher,
    options
  );

  const mutation = async (
    /**
     * The data to send with the request.
     */
    data: Record<string, any> | null,
    /**
     * The query parameters to send with the request.
     */
    params?: Record<string, any>,
    options?: SWRMutationConfiguration<T, E>
  ): Promise<any> => {
    // Use ref to get the latest url and method values
    const currentUrl = urlRef.current;
    const currentMethod = methodRef.current;

    let newUrl = currentUrl;

    if (typeof params === "object" && Object.keys(params).length) {
      const search = new URLSearchParams(params);
      newUrl = `${currentUrl}?${search.toString()}`;
    }

    const payload: MessageFactor = {
      method: currentMethod,
      url: newUrl,
      data,
    };

    const signature = await getSignHeader({
      accountId: accountId!,
      orderlyKey: orderlyKey!,
      payload,
    });

    return trigger(
      {
        data,
        params,
        method: currentMethod,
        signature,
      },
      options
    );
  };

  return [mutation, { data, error, reset, isMutating }] as const;
};
