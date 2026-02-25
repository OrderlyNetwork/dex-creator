import { useState } from "react";
import { useTranslation } from "~/i18n";
import { Button } from "./Button";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: () => void;
}

export default function LoginModal({
  isOpen,
  onClose,
  onLogin,
}: LoginModalProps) {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      await onLogin();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center h-screen">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-background-dark/80 backdrop-blur-sm z-[1001]"
        onClick={isLoading ? undefined : onClose}
      ></div>

      {/* Modal */}
      <div className="relative z-[1002] max-w-md p-6 rounded-xl bg-background-light border border-primary-light/20 shadow-2xl slide-fade-in">
        <h3 className="text-xl font-bold mb-4 gradient-text">
          {t("loginModal.title")}
        </h3>

        <div className="mb-6 space-y-4">
          <p className="text-gray-300">{t("loginModal.description")}</p>

          <div className="bg-background-dark/50 p-4 rounded-lg border border-secondary-light/10 text-sm">
            <h4 className="font-semibold mb-2 text-secondary-light">
              {t("loginModal.whySign")}
            </h4>
            <p className="text-gray-400">{t("loginModal.whySignDesc")}</p>
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            {t("loginModal.later")}
          </Button>
          <Button
            variant="primary"
            onClick={handleLogin}
            isLoading={isLoading}
            loadingText={t("loginModal.signing")}
          >
            {t("loginModal.signMessage")}
          </Button>
        </div>
      </div>
    </div>
  );
}
