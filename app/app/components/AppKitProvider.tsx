import { ReactNode, useEffect, useRef } from "react";
import { WagmiProvider, useChainId } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { wagmiAdapter } from "../utils/wagmiConfig";
import { toast } from "react-toastify";
import { getChainById } from "../../../config";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true,
      staleTime: 30000,
    },
  },
});

function getChainName(chainId: number): string {
  const chain = getChainById(chainId);
  return chain ? chain.name : `Chain ${chainId}`;
}

interface AppKitProviderProps {
  children: ReactNode;
}

function ChainWatcher({ children }: { children: ReactNode }) {
  const chainId = useChainId();
  const prevChainIdRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (
      chainId &&
      prevChainIdRef.current !== undefined &&
      chainId !== prevChainIdRef.current
    ) {
      const chainName = getChainName(chainId);
      const toastId = `chain-switched-success`;
      toast.info(`Switched to ${chainName}`, {
        toastId,
        // avoid show multiple toast notifications
        updateId: toastId,
        autoClose: 2000,
      });
    }

    prevChainIdRef.current = chainId;
  }, [chainId]);

  return <>{children}</>;
}

export function AppKitProvider({ children }: AppKitProviderProps) {
  useEffect(() => {
    const intervalId = setInterval(
      () => {
      queryClient.invalidateQueries();
      },
      15 * 60 * 1000
    );

    return () => clearInterval(intervalId);
  }, []);

  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <ChainWatcher>{children}</ChainWatcher>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
