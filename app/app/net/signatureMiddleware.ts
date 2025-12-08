import { SWRHook, Middleware } from "swr";
import { useOrderlyKey } from "../context/OrderlyKeyContext";
import { getBaseUrl } from "../utils/orderly";
import { getSignHeader } from "./sign";
import { MessageFactor } from "./type";

export const signatureMiddleware: Middleware = (useSWRNext: SWRHook) => {
  const { accountId, orderlyKey } = useOrderlyKey();
  const apiBaseUrl = getBaseUrl();

  return (key, fetcher, config) => {
    try {
      const extendedFetcher = async (args: any) => {
        const url = Array.isArray(args) ? args[0] : args;

        const fullUrl = `${apiBaseUrl}${url}`;

        const payload: MessageFactor = {
          method: "GET",
          url,
        };

        const signature = await getSignHeader({
          accountId: accountId!,
          orderlyKey: orderlyKey!,
          payload,
        });
        // @ts-ignore
        return fetcher(fullUrl, {
          headers: signature,
        });
      };
      return useSWRNext(key, extendedFetcher, config);
    } catch (e) {
      console.error("signature error:", e);
      throw e;
    }
  };
};
