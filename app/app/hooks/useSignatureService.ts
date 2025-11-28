import { useMemo } from "react";
import { SignatureService } from "../service/signature";
import { useAccount, useChainId, useWalletClient } from "wagmi";

export function useSignatureService() {
  const chainId = useChainId();
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();

  const signatureService = useMemo(() => {
    if (!walletClient || !address || !chainId) {
      return null;
    }

    return new SignatureService({
      walletClient,
      chainId,
      address,
    });
  }, [walletClient, chainId, address]);

  return signatureService;
}
