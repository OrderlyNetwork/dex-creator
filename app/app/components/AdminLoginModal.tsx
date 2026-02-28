import { useEffect, useState } from "react";
import { Button } from "./Button";
import { toast } from "react-toastify";
import { useTranslation, i18n } from "~/i18n";
import { getPublicKeyAsync } from "@noble/ed25519";
import { encodeBase58 } from "ethers";

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderlyKey: Uint8Array;
  accountId: string;
}

export default function AdminLoginModal({
  isOpen,
  onClose,
  orderlyKey,
  accountId,
}: AdminLoginModalProps) {
  const { t } = useTranslation();
  const [showPrivateKey, setShowPrivateKey] = useState(false);

  if (!isOpen) return null;

  const privateKeyHex = `ed25519:${encodeBase58(orderlyKey)}`;

  const getPublicKey = async () => {
    try {
      const publicKeyBytes = await getPublicKeyAsync(orderlyKey);
      return `ed25519:${encodeBase58(publicKeyBytes)}`;
    } catch (error) {
      console.error("Failed to get public key:", error);
      return i18n.t("adminLoginModal.errorGeneratingPublicKey");
    }
  };

  const [publicKey, setPublicKey] = useState<string>("");

  useEffect(() => {
    getPublicKey().then(setPublicKey);
  }, [orderlyKey]);

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(t("adminLoginModal.labelCopiedToClipboard", { label }));
    } catch (error) {
      console.error("Failed to copy:", error);
      toast.error(t("adminLoginModal.failedToCopy"));
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center h-screen md:p-4">
      <div
        className="absolute inset-0 bg-background-dark/80 backdrop-blur-sm z-[1001]"
        onClick={onClose}
      ></div>

      <div className="relative z-[1002] w-full h-full md:h-auto md:max-w-lg md:max-h-[90vh] overflow-y-auto p-6 md:rounded-xl bg-background-light border-0 md:border md:border-primary-light/20 shadow-2xl slide-fade-in">
        <h3 className="text-xl font-bold mb-4 gradient-text">
          {t("adminLoginModal.title")}
        </h3>

        <div className="mb-6 space-y-4">
          <p className="text-gray-300">
            {t("adminLoginModal.copyCredentialsDesc")}
          </p>

          {/* Account ID */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-secondary-light">
              {t("adminLoginModal.accountId")}
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={accountId}
                readOnly
                className="flex-1 px-3 py-2 rounded-lg bg-background-dark border border-light/10 text-white font-mono text-sm"
              />
              <Button
                variant="secondary"
                onClick={() =>
                  copyToClipboard(accountId, t("adminLoginModal.accountId"))
                }
                className="flex-shrink-0"
              >
                <div className="i-mdi:content-copy w-4 h-4"></div>
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-secondary-light">
              {t("adminLoginModal.publicKey")}
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={publicKey}
                readOnly
                className="flex-1 px-3 py-2 rounded-lg bg-background-dark border border-light/10 text-white font-mono text-sm"
              />
              <Button
                variant="secondary"
                onClick={() =>
                  copyToClipboard(publicKey, t("adminLoginModal.publicKey"))
                }
                className="flex-shrink-0"
              >
                <div className="i-mdi:content-copy w-4 h-4"></div>
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-secondary-light">
              {t("adminLoginModal.privateKey")}
            </label>
            <div className="flex gap-2">
              <input
                type={showPrivateKey ? "text" : "password"}
                value={privateKeyHex}
                readOnly
                className="flex-1 px-3 py-2 rounded-lg bg-background-dark border border-light/10 text-white font-mono text-sm"
              />
              <Button
                variant="secondary"
                onClick={() => setShowPrivateKey(!showPrivateKey)}
                className="flex-shrink-0"
              >
                <div
                  className={`w-4 h-4 ${showPrivateKey ? "i-mdi:eye-off" : "i-mdi:eye"}`}
                ></div>
              </Button>
              <Button
                variant="secondary"
                onClick={() =>
                  copyToClipboard(
                    privateKeyHex,
                    t("adminLoginModal.privateKey")
                  )
                }
                className="flex-shrink-0"
              >
                <div className="i-mdi:content-copy w-4 h-4"></div>
              </Button>
            </div>
            <p className="text-xs text-gray-400">
              {t("adminLoginModal.neverSharePrivateKey")}
            </p>
          </div>
        </div>

        <div className="bg-background-dark/50 p-4 rounded-lg border border-secondary-light/10 text-sm mb-6">
          <h4 className="font-semibold mb-2 text-secondary-light">
            {t("adminLoginModal.howToLogIn")}:
          </h4>
          <ol className="text-gray-400 space-y-1 list-decimal list-inside">
            <li>{t("adminLoginModal.step1")}</li>
            <li>{t("adminLoginModal.step2")}</li>
            <li>{t("adminLoginModal.step3")}</li>
            <li>{t("adminLoginModal.step4")}</li>
            <li>{t("adminLoginModal.step5")}</li>
          </ol>
        </div>

        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={onClose}>
            {t("adminLoginModal.close")}
          </Button>
          <Button
            variant="primary"
            onClick={() =>
              window.open("https://admin.orderly.network/", "_blank")
            }
          >
            {t("adminLoginModal.openAdminDashboard")}
          </Button>
        </div>
      </div>
    </div>
  );
}
