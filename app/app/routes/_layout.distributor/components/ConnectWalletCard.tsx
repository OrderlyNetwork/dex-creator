import { Card } from "../../../components/Card";
import WalletConnect from "../../../components/WalletConnect";
import { useTranslation } from "~/i18n";

export const ConnectWalletCard = () => {
  const { t } = useTranslation();
  return (
    <Card className="w-full py-15 md:py-30 px-4 md:px-8 flex flex-col gap-4 md:gap-5 items-center text-center">
      <h2 className="text-xl md:text-2xl font-semibold text-base-contrast">
        {t("distributor.connectWalletTitle")}
      </h2>
      <p className="text-sm md:text-sm text-base-contrast-54">
        {t("distributor.connectWalletDesc")}
      </p>

      <div className="flex justify-center">
        <WalletConnect />
      </div>
    </Card>
  );
};
