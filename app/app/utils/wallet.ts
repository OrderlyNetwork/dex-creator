import { i18n } from "~/i18n";

export function parseWalletError(error: any) {
  if (
    error instanceof Error &&
    error.message?.toLowerCase().includes("user rejected")
  ) {
    return i18n.t("wallet.userRejectedRequest");
  }
  return error?.message;
}
