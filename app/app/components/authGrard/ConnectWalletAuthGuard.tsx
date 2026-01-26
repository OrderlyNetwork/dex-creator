import { cn } from "~/utils/css";
import { Card } from "../Card";
import WalletConnect from "../WalletConnect";

type ConnectWalletAuthGrardProps = {
  className?: string;
};

export const ConnectWalletAuthGrard = (props: ConnectWalletAuthGrardProps) => {
  return (
    <Card
      className={cn(
        "w-full py-5 md:py-10 px-4 md:px-8 flex flex-col gap-4 md:gap-5 items-center text-center",
        props.className
      )}
    >
      <h2 className="text-xl md:text-2xl font-semibold text-base-contrast">
        Connect wallet
      </h2>
      <p className="text-sm md:text-sm text-base-contrast-54">
        Authentication required. Please connect your wallet and login.
      </p>

      <div className="flex justify-center">
        <WalletConnect />
      </div>
    </Card>
  );
};
