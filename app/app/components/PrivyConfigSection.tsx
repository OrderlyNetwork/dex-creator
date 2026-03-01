import React from "react";
import FormInput from "./FormInput";
import { Card } from "./Card";
import { Trans, useTranslation } from "~/i18n";

export interface PrivyConfigProps {
  privyAppId: string;
  privyTermsOfUse: string;
  handleInputChange: (
    field: string
  ) => (e: React.ChangeEvent<HTMLInputElement>) => void;
  urlValidator: (value: string) => string | null;
  enableAbstractWallet: boolean;
  onEnableAbstractWalletChange: (checked: boolean) => void;
  disableEvmWallets?: boolean;
  disableSolanaWallets?: boolean;
  onDisableEvmWalletsChange?: (disabled: boolean) => void;
  onDisableSolanaWalletsChange?: (disabled: boolean) => void;
  privyLoginMethods?: string[];
  onPrivyLoginMethodsChange?: (methods: string[]) => void;
  idPrefix?: string;
}

const PrivyConfigSection: React.FC<PrivyConfigProps> = ({
  privyAppId,
  privyTermsOfUse,
  handleInputChange,
  urlValidator,
  enableAbstractWallet,
  onEnableAbstractWalletChange,
  disableEvmWallets = false,
  disableSolanaWallets = false,
  onDisableEvmWalletsChange,
  onDisableSolanaWalletsChange,
  privyLoginMethods = ["email"],
  onPrivyLoginMethodsChange,
  idPrefix = "",
}) => {
  const { t } = useTranslation();
  const isPrivyConfigured = privyAppId.trim() !== "";

  const loginMethodOptions = [
    {
      id: "email",
      label: t("privyConfigSection.email"),
      description: t("privyConfigSection.emailAuth"),
      setupRequired: false,
    },
    {
      id: "passkey",
      label: t("privyConfigSection.passkey"),
      description: t("privyConfigSection.passkeyAuth"),
      setupRequired: true,
      setupText: t("privyConfigSection.requiresPasskey"),
    },
    {
      id: "twitter",
      // i18n-ignore: platform/brand name
      label: "X",
      description: t("privyConfigSection.signInWithX"),
      setupRequired: true,
      setupText: t("privyConfigSection.requiresOAuth"),
    },
    {
      id: "google",
      // i18n-ignore: brand name
      label: "Google",
      description: t("privyConfigSection.signInWithGoogle"),
      setupRequired: true,
      setupText: t("privyConfigSection.requiresOAuth"),
    },
  ];

  const handleLoginMethodChange = (methodId: string, checked: boolean) => {
    if (!onPrivyLoginMethodsChange) return;

    if (checked) {
      if (!privyLoginMethods.includes(methodId)) {
        onPrivyLoginMethodsChange([...privyLoginMethods, methodId]);
      }
    } else {
      onPrivyLoginMethodsChange(privyLoginMethods.filter(m => m !== methodId));
    }
  };

  return (
    <>
      <Card className="mb-3 p-3 slide-fade-in" variant="default">
        <div className="flex items-start gap-2">
          <div className="i-mdi:information-outline text-primary-light h-4 w-4 mt-0.5 flex-shrink-0"></div>
          <div>
            <p className="text-xs text-primary-light font-medium mb-1">
              {t("privyConfigSection.enhancedWalletOptions")}
            </p>
            <p className="text-xs text-gray-300 mb-1">
              <span className="text-primary-light font-medium">
                {t("privyConfigSection.whyUsePrivy")}
              </span>{" "}
              {t("privyConfigSection.privyProvidesMultiple")}
            </p>
            <ul className="text-xs text-gray-300 list-disc pl-4 space-y-0.5">
              <li>{t("privyConfigSection.socialLogins")}</li>
              <li>{t("privyConfigSection.emailPhoneAuth")}</li>
              <li>{t("privyConfigSection.multipleWalletTypes")}</li>
              <li>{t("privyConfigSection.embeddedWallets")}</li>
            </ul>
          </div>
        </div>
      </Card>
      <FormInput
        id={`${idPrefix}privyAppId`}
        label={
          <div className="flex items-center gap-1">
            {t("privyConfigSection.privyAppId")}
          </div>
        }
        value={privyAppId}
        onChange={handleInputChange("privyAppId")}
        placeholder={t("privyConfigSection.placeholderAppId")}
        helpText={
          <>
            <Trans
              i18nKey="privyConfigSection.getAppIdBySigningUp"
              components={[
                <a
                  key="0"
                  href="https://dashboard.privy.io"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-light hover:underline"
                />,
                <strong key="1" />,
                <strong key="2" />,
              ]}
            />
          </>
        }
      />
      <FormInput
        id={`${idPrefix}privyTermsOfUse`}
        label={
          <div className="flex items-center gap-1">
            {t("privyConfigSection.privyTermsOfUseUrl")}
            <span className="text-gray-400 text-sm font-normal">
              ({t("privyConfigSection.optional")})
            </span>
          </div>
        }
        value={privyTermsOfUse}
        onChange={handleInputChange("privyTermsOfUse")}
        type="url"
        placeholder="https://example.com/terms"
        validator={urlValidator}
        helpText={<>{t("privyConfigSection.termsOfUseHelp")}</>}
      />

      {/* Login Methods Configuration - Always shown but disabled when Privy not configured */}
      <div className="mt-4">
        <h4 className="text-base font-medium mb-3">
          {t("privyConfigSection.loginMethods")}
        </h4>
        <p className="text-xs text-gray-400 mb-3">
          {t("privyConfigSection.chooseAuthMethods")}
          {!isPrivyConfigured && (
            <span className="text-orange-400 ml-1">
              {t("privyConfigSection.configurePrivyAppId")}
            </span>
          )}
        </p>
        <div className="space-y-3">
          {loginMethodOptions.map(method => (
            <label
              key={method.id}
              className={`flex items-start gap-3 p-3 rounded-lg border border-light/10 bg-light/5 transition-all duration-200 ease-in-out ${
                !isPrivyConfigured
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-light/10 cursor-pointer"
              }`}
            >
              <input
                type="checkbox"
                checked={privyLoginMethods.includes(method.id)}
                onChange={e =>
                  handleLoginMethodChange(method.id, e.target.checked)
                }
                disabled={!isPrivyConfigured}
                className="form-checkbox mt-1 rounded bg-dark border-gray-500 text-primary focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <div className="flex-1">
                <div
                  className={`text-sm font-medium ${!isPrivyConfigured ? "text-gray-500" : "text-gray-200"}`}
                >
                  {method.label}
                </div>
                <div
                  className={`text-xs mt-1 ${!isPrivyConfigured ? "text-gray-600" : "text-gray-400"}`}
                >
                  {method.description}
                </div>
                {method.setupRequired && (
                  <div className="text-xs mt-1 text-blue-400">
                    {method.setupText}
                  </div>
                )}
              </div>
            </label>
          ))}
        </div>
      </div>

      <div className="mt-4">
        <h4 className="text-base font-medium mb-3">
          {t("privyConfigSection.walletConfiguration")}
        </h4>
        <div className="space-y-4">
          {/* Wallet Type Controls - Always shown but disabled when Privy not configured */}
          <label
            className={`flex items-start gap-3 p-3 rounded-lg border border-light/10 bg-light/5 transition-all duration-200 ease-in-out ${
              !isPrivyConfigured
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-light/10 cursor-pointer"
            }`}
          >
            <input
              type="checkbox"
              checked={!disableEvmWallets}
              onChange={e => onDisableEvmWalletsChange?.(!e.target.checked)}
              disabled={!isPrivyConfigured}
              className="form-checkbox mt-1 rounded bg-dark border-gray-500 text-primary focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <div className="flex-1">
              <div
                className={`text-sm font-medium ${!isPrivyConfigured ? "text-gray-500" : "text-gray-200"}`}
              >
                {t("privyConfigSection.enableEvmWallets")}
              </div>
              <div
                className={`text-xs mt-1 ${!isPrivyConfigured ? "text-gray-600" : "text-gray-400"}`}
              >
                {t("privyConfigSection.evmWalletsDesc")}
              </div>
            </div>
          </label>

          <label
            className={`flex items-start gap-3 p-3 rounded-lg border border-light/10 bg-light/5 transition-all duration-200 ease-in-out ${
              !isPrivyConfigured
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-light/10 cursor-pointer"
            }`}
          >
            <input
              type="checkbox"
              checked={!disableSolanaWallets}
              onChange={e => onDisableSolanaWalletsChange?.(!e.target.checked)}
              disabled={!isPrivyConfigured}
              className="form-checkbox mt-1 rounded bg-dark border-gray-500 text-primary focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <div className="flex-1">
              <div
                className={`text-sm font-medium ${!isPrivyConfigured ? "text-gray-500" : "text-gray-200"}`}
              >
                {t("privyConfigSection.enableSolanaWallets")}
              </div>
              <div
                className={`text-xs mt-1 ${!isPrivyConfigured ? "text-gray-600" : "text-gray-400"}`}
              >
                {t("privyConfigSection.solanaWalletsDesc")}
              </div>
            </div>
          </label>

          <label
            className={`flex items-start gap-3 p-3 rounded-lg border border-light/10 bg-light/5 transition-all duration-200 ease-in-out ${
              !isPrivyConfigured
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-light/10 cursor-pointer"
            }`}
          >
            <input
              type="checkbox"
              id={`${idPrefix}enableAbstractWallet`}
              checked={enableAbstractWallet}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                onEnableAbstractWalletChange(e.target.checked)
              }
              disabled={!isPrivyConfigured}
              className="form-checkbox mt-1 rounded bg-dark border-gray-500 text-primary focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <div className="flex-1">
              <div
                className={`text-sm font-medium ${!isPrivyConfigured ? "text-gray-500" : "text-gray-200"}`}
              >
                {t("privyConfigSection.enableAbstractWallet")}
              </div>
              <div
                className={`text-xs mt-1 ${!isPrivyConfigured ? "text-gray-600" : "text-gray-400"}`}
              >
                {isPrivyConfigured
                  ? t("privyConfigSection.abstractWalletEnabled")
                  : t("privyConfigSection.abstractWalletRequiresPrivy")}
              </div>
            </div>
          </label>
        </div>
      </div>
    </>
  );
};

export default PrivyConfigSection;
