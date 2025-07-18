import { useState } from "react";
import { Button } from "./Button";
import { useAccount, useChainId, useWalletClient } from "wagmi";
import { BrowserProvider } from "ethers";
import { addOrderlyKey } from "../utils/orderly";
import { toast } from "react-toastify";

interface OrderlyKeyLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (orderlyKey: Uint8Array) => void;
  onCancel: () => void;
  brokerId: string;
  accountId: string;
}

export default function OrderlyKeyLoginModal({
  isOpen,
  onClose,
  onSuccess,
  onCancel,
  brokerId,
  accountId,
}: OrderlyKeyLoginModalProps) {
  const { address } = useAccount();
  const chainId = useChainId();
  const { data: walletClient } = useWalletClient();
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateKey = async () => {
    if (!walletClient || !address) {
      toast.error("Please connect your wallet first");
      return;
    }

    setIsCreating(true);

    try {
      const provider = new BrowserProvider(walletClient);
      const signer = await provider.getSigner();

      const orderlyKey = await addOrderlyKey(
        signer,
        address,
        chainId,
        brokerId,
        "read",
        accountId
      );

      onSuccess(orderlyKey);
      onClose();
    } catch (error) {
      console.error("Failed to create orderly key:", error);
      toast.error("Failed to create orderly key. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleCancel = () => {
    onCancel();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center h-screen">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-background-dark/80 backdrop-blur-sm z-[1001]"
        onClick={isCreating ? undefined : onClose}
      ></div>

      {/* Modal */}
      <div className="relative z-[1002] max-w-md p-6 rounded-xl bg-background-light border border-primary-light/20 shadow-2xl slide-fade-in">
        <div className="text-center mb-6">
          <div className="bg-warning/20 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <div className="i-mdi:key text-warning w-8 h-8"></div>
          </div>
          <h2 className="text-xl font-bold mb-2 gradient-text">
            Create Orderly Key
          </h2>
          <p className="text-gray-300">
            To manage your referral settings, you'll need to create an Orderly
            API key by signing a message with your wallet.
          </p>
        </div>

        <div className="bg-background-dark/50 p-4 rounded-lg border border-secondary-light/10 mb-6">
          <h3 className="font-semibold mb-3 text-sm text-secondary-light">
            What happens next:
          </h3>
          <ul className="space-y-2 text-sm text-gray-400">
            <li className="flex items-start gap-2">
              <div className="i-mdi:numeric-1-circle text-primary w-4 h-4 flex-shrink-0 mt-0.5"></div>
              <span>Your wallet will prompt you to sign a message</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="i-mdi:numeric-2-circle text-primary w-4 h-4 flex-shrink-0 mt-0.5"></div>
              <span>An Orderly API key will be generated securely</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="i-mdi:numeric-3-circle text-primary w-4 h-4 flex-shrink-0 mt-0.5"></div>
              <span>
                The key will be stored locally for referral management
              </span>
            </li>
          </ul>
        </div>

        <div className="bg-background-dark/50 p-4 rounded-lg border border-secondary-light/10 mb-6">
          <h4 className="font-semibold mb-2 text-secondary-light">
            Security Note
          </h4>
          <p className="text-gray-400 text-sm">
            This key allows secure API access to manage your referral program.
            It will be stored locally in your browser and is unique to your DEX
            broker account. No gas fees or blockchain transactions are required.
          </p>
        </div>

        <div className="flex gap-3 justify-end">
          <Button
            variant="secondary"
            onClick={handleCancel}
            disabled={isCreating}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleCreateKey}
            isLoading={isCreating}
            loadingText="Creating Key"
          >
            Create Key
          </Button>
        </div>
      </div>
    </div>
  );
}
