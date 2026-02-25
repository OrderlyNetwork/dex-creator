import { useCallback } from "react";
import { useAccount } from "wagmi";
import { toast } from "react-toastify";
import { useTranslation } from "~/i18n";
import { useSignatureService } from "./useSignatureService";
import {
  checkAddressIsBound,
  bindDistributorCode as bindDistributorCodeApi,
} from "../service/distrubutorCode";

export function useBindDistrubutorCode() {
  const { t } = useTranslation();
  const { address } = useAccount();
  const signatureService = useSignatureService();

  const bindDistributorCode = useCallback(
    async (distributorCode: string) => {
      const errorMessage = t("distributor.failedToBindCode");

      try {
        const isBound = await checkAddressIsBound(address!);
        if (isBound) {
          toast.error(t("distributor.addressAlreadyBound"));
          return false;
        }

        const data = await signatureService?.generateBindDistributorCodeMessage(
          {
            inviteeAddress: address!,
            distributorCode: distributorCode,
          }
        );

        const res = await bindDistributorCodeApi(data);
        if (res) {
          return true;
        } else {
          toast.error(errorMessage);
        }
      } catch (error: any) {
        toast.error(error?.message || errorMessage);
      }

      return false;
    },
    [address, signatureService, t]
  );

  return { bindDistributorCode };
}
