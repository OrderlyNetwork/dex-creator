import { useState } from "react";
import { Trans, useTranslation } from "~/i18n";
import { toast } from "react-toastify";
import { Button } from "./Button";
import { post } from "../utils/apiClient";
import { useModal } from "../context/ModalContext";

interface DexData {
  id: string;
  brokerName: string;
  brokerId: string;
  themeCSS?: string | null;
  primaryLogo?: string | null;
  secondaryLogo?: string | null;
  favicon?: string | null;
  pnlPosters?: string[] | null;
  telegramLink?: string | null;
  discordLink?: string | null;
  xLink?: string | null;
  walletConnectProjectId?: string | null;
  privyAppId?: string | null;
  privyTermsOfUse?: string | null;
  enabledMenus?: string | null;
  customMenus?: string | null;
  enableAbstractWallet?: boolean;
  chainIds?: number[] | null;
  repoUrl?: string | null;
  customDomain?: string | null;
  disableMainnet?: boolean;
  disableTestnet?: boolean;
  disableEvmWallets?: boolean;
  disableSolanaWallets?: boolean;
  tradingViewColorConfig?: string | null;
  availableLanguages?: string[] | null;
  seoSiteName?: string | null;
  seoSiteDescription?: string | null;
  seoSiteLanguage?: string | null;
  seoSiteLocale?: string | null;
  seoTwitterHandle?: string | null;
  seoThemeColor?: string | null;
  seoKeywords?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface CustomDomainSectionProps {
  dexData: DexData;
  token: string | null;
  isSaving: boolean;
  onDexDataUpdate: (updatedData: DexData) => void;
  onSavingChange: (saving: boolean) => void;
  onShowDomainRemoveConfirm: () => void;
}

export default function CustomDomainSection({
  dexData,
  token,
  isSaving,
  onDexDataUpdate,
  onSavingChange,
  onShowDomainRemoveConfirm,
}: CustomDomainSectionProps) {
  const { t } = useTranslation();
  const [customDomain, setCustomDomain] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const { openModal, closeModal } = useModal();

  const handleSetDomain = async () => {
    const normalizedDomain = customDomain.trim().toLowerCase();

    const domainRegex =
      /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)*\.[a-z]{2,}$/;

    if (!normalizedDomain) {
      toast.error(t("customDomainSection.domainEmpty"));
      return;
    }

    if (normalizedDomain !== customDomain) {
      toast.error(t("customDomainSection.domainLowercase"));
      return;
    }

    if (!domainRegex.test(normalizedDomain)) {
      toast.error(t("customDomainSection.domainInvalid"));
      return;
    }

    if (
      normalizedDomain.includes("..") ||
      normalizedDomain.startsWith(".") ||
      normalizedDomain.endsWith(".")
    ) {
      toast.error(t("customDomainSection.domainNoConsecutiveDots"));
      return;
    }

    const ipRegex = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/;
    if (ipRegex.test(normalizedDomain)) {
      toast.error(t("customDomainSection.ipNotAllowed"));
      return;
    }

    if (!isEditing) {
      openModal("tradingViewLicenseAcknowledgment", {
        onAcknowledge: () =>
          handleSetDomainAfterAcknowledgment(normalizedDomain),
        onViewGuide: () => {
          openModal("tradingViewLicense");
        },
      });
    } else {
      handleSetDomainAfterAcknowledgment(normalizedDomain);
    }
  };

  const handleSetDomainAfterAcknowledgment = async (domainToSet: string) => {
    closeModal();
    onSavingChange(true);

    try {
      await post(
        `api/dex/${dexData.id}/custom-domain`,
        { domain: domainToSet },
        token
      );

      onDexDataUpdate({
        ...dexData,
        customDomain: domainToSet,
      });

      toast.success(
        isEditing
          ? t("customDomainSection.domainUpdatedSuccess")
          : t("customDomainSection.domainConfiguredSuccess")
      );
      setIsEditing(false);
      setCustomDomain("");
    } catch (error) {
      console.error("Error setting custom domain:", error);
      toast.error(
        isEditing
          ? t("customDomainSection.failedToUpdate")
          : t("customDomainSection.failedToSet")
      );
    } finally {
      onSavingChange(false);
    }
  };

  const handleEditDomain = () => {
    setCustomDomain(dexData.customDomain || "");
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setCustomDomain("");
  };

  const copyToClipboard = (text: string, successMessage: string) => {
    navigator.clipboard.writeText(text);
    toast.success(successMessage);
  };

  return (
    <div>
      <h3 className="text-lg font-bold mb-4">
        {t("customDomainSection.title")}
      </h3>
      <p className="text-sm text-gray-300 mb-4">
        {t("customDomainSection.intro")}
      </p>

      {!dexData.customDomain && (
        <div className="mb-4 p-3 bg-warning/10 rounded-lg border border-warning/30">
          <h5 className="text-sm font-bold mb-2 flex items-center">
            <div className="i-mdi:alert-circle h-4 w-4 mr-2 text-warning"></div>
            {t("customDomainSection.limitedMobileFunctionality")}
          </h5>
          <p className="text-xs text-gray-300 mb-2">
            {t("customDomainSection.limitedMobileDesc")}
          </p>
          <p className="text-xs text-gray-300">
            {t("customDomainSection.configureCustomDomain")}
          </p>
        </div>
      )}

      <div className="mb-4 p-3 bg-red-900/30 rounded-lg border border-red-500/30">
        <h5 className="text-sm font-bold mb-2 flex items-center">
          <div className="i-mdi:alert h-4 w-4 mr-2 text-red-400"></div>
          {t("customDomainSection.importantLicenseRequirement")}
        </h5>
        <p className="text-xs text-gray-300 mb-3">
          {t("customDomainSection.licenseNote")}
        </p>
        <div className="flex flex-col gap-2">
          <a
            href="https://www.tradingview.com/advanced-charts/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary-light hover:underline flex items-center"
          >
            {t("customDomainSection.applyForLicense")}
            <div className="i-mdi:open-in-new h-3.5 w-3.5 ml-1"></div>
          </a>
          <button
            onClick={() => openModal("tradingViewLicense")}
            className="text-xs text-secondary-light hover:underline flex items-center"
          >
            {t("customDomainSection.needHelp")}
            <div className="i-mdi:help-circle-outline h-3.5 w-3.5 ml-1"></div>
          </button>
        </div>
      </div>

      {dexData.customDomain ? (
        <div className="mb-4">
          {!isEditing ? (
            <>
              <div className="flex flex-col md:flex-row gap-3 items-start md:items-center mb-4">
                <div className="bg-success/10 text-success px-3 py-1 rounded-full text-sm flex items-center">
                  <div className="i-mdi:check-circle h-4 w-4 mr-1"></div>
                  {t("customDomainSection.domainConfigured")}
                </div>
                <div className="text-sm">
                  {t("customDomainSection.availableAt")}{" "}
                  <a
                    href={`https://${dexData.customDomain}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-light hover:underline inline-flex items-center"
                  >
                    {dexData.customDomain}
                    <div className="i-mdi:open-in-new h-3.5 w-3.5 ml-1"></div>
                  </a>
                </div>
              </div>

              <div className="bg-info/10 rounded-lg border border-info/20 p-4 mb-4">
                <h5 className="text-sm font-bold mb-2 flex items-center">
                  <div className="i-mdi:information-outline text-info mr-2 h-4 w-4"></div>
                  {t("customDomainSection.dnsConfigStatus")}
                </h5>
                <p className="text-sm text-gray-300 mb-3">
                  {t("customDomainSection.dnsPropagationNote")}
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    onClick={handleEditDomain}
                    variant="secondary"
                    size="sm"
                    disabled={isSaving}
                  >
                    <span className="flex items-center gap-1">
                      <div className="i-mdi:pencil h-4 w-4"></div>
                      {t("customDomainSection.editDomain")}
                    </span>
                  </Button>
                  <Button
                    onClick={onShowDomainRemoveConfirm}
                    variant="danger"
                    size="sm"
                    isLoading={isSaving}
                    loadingText={t("customDomainSection.removing")}
                    disabled={isSaving}
                  >
                    <span className="flex items-center gap-1">
                      <div className="i-mdi:delete h-4 w-4"></div>
                      {t("customDomainSection.removeCustomDomain")}
                    </span>
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="mb-4">
              <div className="flex flex-col md:flex-row gap-3 items-start md:items-center mb-4">
                <div className="bg-warning/10 text-warning px-3 py-1 rounded-full text-sm flex items-center">
                  <div className="i-mdi:pencil h-4 w-4 mr-1"></div>
                  {t("customDomainSection.editingDomain")}
                </div>
                <div className="text-sm text-gray-300">
                  {t("customDomainSection.currentDomain")}:{" "}
                  {dexData.customDomain}
                </div>
              </div>

              <div className="mb-4">
                <label
                  htmlFor="editCustomDomain"
                  className="block text-sm font-bold mb-1"
                >
                  {t("customDomainSection.domainName")}
                </label>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-2">
                  <input
                    id="editCustomDomain"
                    type="text"
                    value={customDomain}
                    onChange={e => setCustomDomain(e.target.value)}
                    // i18n-ignore
                    placeholder="example.com"
                    className="flex-1 bg-background-dark/80 border border-light/10 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-primary-light focus:border-primary-light"
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={handleSetDomain}
                      variant="primary"
                      size="sm"
                      isLoading={isSaving}
                      loadingText={t("customDomainSection.saving")}
                      disabled={!customDomain || isSaving}
                    >
                      <span className="flex items-center gap-1">
                        <div className="i-mdi:check h-4 w-4"></div>
                        {t("common.update")}
                      </span>
                    </Button>
                    <Button
                      onClick={handleCancelEdit}
                      variant="secondary"
                      size="sm"
                      disabled={isSaving}
                    >
                      <span className="flex items-center gap-1">
                        <div className="i-mdi:close h-4 w-4"></div>
                        {t("common.cancel")}
                      </span>
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {t("customDomainSection.domainInputHint")}
                </p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="mb-4">
          <div className="mb-4">
            <label
              htmlFor="customDomain"
              className="block text-sm font-bold mb-1"
            >
              {t("customDomainSection.domainName")}
            </label>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-2">
              <input
                id="customDomain"
                type="text"
                value={customDomain}
                onChange={e => setCustomDomain(e.target.value)}
                // i18n-ignore
                placeholder="example.com"
                className="flex-1 bg-background-dark/80 border border-light/10 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-primary-light focus:border-primary-light"
              />
              <Button
                onClick={handleSetDomain}
                variant="primary"
                size="sm"
                isLoading={isSaving}
                loadingText={t("customDomainSection.saving")}
                disabled={!customDomain || isSaving}
                className="w-full sm:w-auto"
              >
                <span className="flex items-center gap-1 justify-center sm:justify-start">
                  <div className="i-mdi:link h-4 w-4"></div>
                  {t("customDomainSection.setDomain")}
                </span>
              </Button>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {t("customDomainSection.domainInputHint")}
            </p>
          </div>
        </div>
      )}

      <div className="mb-4 p-4 bg-primary-light/5 rounded-lg border border-primary-light/20">
        <h5 className="text-sm font-bold mb-2 flex items-center">
          <div className="i-mdi:shopping-cart h-4 w-4 mr-2 text-primary-light"></div>
          {t("customDomainSection.needToPurchaseDomain")}
        </h5>
        <p className="text-sm text-gray-300 mb-3">
          {t("customDomainSection.purchaseDomainDesc")}
        </p>
        <Button
          onClick={() =>
            openModal("domainSetupGuide", {
              customDomain: dexData.customDomain,
            })
          }
          variant="primary"
          size="sm"
        >
          <span className="flex items-center gap-1">
            <div className="i-mdi:book-open-variant h-4 w-4"></div>
            {t("customDomainSection.showStepByStepGuide")}
          </span>
        </Button>
      </div>

      <div className="rounded-lg border border-light/10 p-4 bg-base-8/50">
        <h5 className="text-sm font-bold mb-3 flex items-center">
          <div className="i-mdi:dns h-4 w-4 mr-2 text-primary-light"></div>
          {t("customDomainSection.dnsInstructions")}
        </h5>
        <p className="text-sm text-gray-300 mb-3">
          {t("customDomainSection.dnsIntro")}:
        </p>

        {/* Check if it's an apex domain or subdomain */}
        {dexData.customDomain &&
        dexData.customDomain.split(".").length === 2 ? (
          // Apex domain - show A records and www CNAME
          <div className="space-y-3">
            <div className="bg-base-9/70 rounded p-3 font-mono text-xs overflow-x-auto">
              <div className="mb-2 text-gray-400">
                <Trans
                  i18nKey="customDomainSection.step1AddARecords"
                  components={[
                    <span key="0" className="text-primary-light" />,
                    <span key="1" className="text-primary-light" />,
                  ]}
                />
              </div>
              <div className="space-y-1">
                <div className="flex items-center">
                  <span className="text-gray-400">
                    {t("customDomainSection.dnsRecordType")}:
                  </span>{" "}
                  <div className="flex items-center">
                    <span className="text-white">A</span>
                    <button
                      className="ml-1.5 text-gray-400 hover:text-primary-light transition-colors"
                      onClick={() =>
                        copyToClipboard(
                          "A",
                          t("customDomainSection.copiedToClipboard")
                        )
                      }
                      aria-label="Copy record type to clipboard"
                    >
                      <div className="i-mdi:content-copy h-3.5 w-3.5"></div>
                    </button>
                  </div>
                </div>
                <div className="flex items-center">
                  <span className="text-gray-400">
                    {t("customDomainSection.dnsRecordName")}:
                  </span>{" "}
                  <div className="flex items-center">
                    <span className="text-white">@</span>
                    <button
                      className="ml-1.5 text-gray-400 hover:text-primary-light transition-colors"
                      onClick={() =>
                        copyToClipboard(
                          "@",
                          t("customDomainSection.copiedToClipboard")
                        )
                      }
                      aria-label="Copy @ symbol to clipboard"
                    >
                      <div className="i-mdi:content-copy h-3.5 w-3.5"></div>
                    </button>
                  </div>
                </div>
                <div className="text-gray-400">
                  {t("customDomainSection.valuesCreate4Records")}
                </div>
                {[
                  "185.199.108.153",
                  "185.199.109.153",
                  "185.199.110.153",
                  "185.199.111.153",
                ].map(ip => (
                  <div key={ip} className="flex items-center ml-2">
                    <span className="text-white">{ip}</span>
                    <button
                      className="ml-1.5 text-gray-400 hover:text-primary-light transition-colors"
                      onClick={() =>
                        copyToClipboard(
                          ip,
                          t("customDomainSection.copiedToClipboard")
                        )
                      }
                      aria-label={`Copy IP address ${ip} to clipboard`}
                    >
                      <div className="i-mdi:content-copy h-3.5 w-3.5"></div>
                    </button>
                  </div>
                ))}
                <div className="flex items-center">
                  {/* i18n-ignore */}
                  <span className="text-gray-400">TTL:</span>{" "}
                  <div className="flex items-center">
                    <span className="text-white">3600</span>
                    <button
                      className="ml-1.5 text-gray-400 hover:text-primary-light transition-colors"
                      onClick={() =>
                        copyToClipboard(
                          "3600",
                          t("customDomainSection.copiedToClipboard")
                        )
                      }
                      aria-label="Copy TTL value to clipboard"
                    >
                      <div className="i-mdi:content-copy h-3.5 w-3.5"></div>
                    </button>{" "}
                    {t("customDomainSection.ttlOrAutomatic")}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-base-9/70 rounded p-3 font-mono text-xs overflow-x-auto">
              <div className="mb-2 text-gray-400">
                {t("customDomainSection.step2AddCname")}
              </div>
              <div className="space-y-1">
                <div className="flex items-center">
                  <span className="text-gray-400">
                    {t("customDomainSection.dnsRecordType")}:
                  </span>{" "}
                  <div className="flex items-center">
                    {/* i18n-ignore */}
                    <span className="text-white">CNAME</span>
                    <button
                      className="ml-1.5 text-gray-400 hover:text-primary-light transition-colors"
                      onClick={() =>
                        copyToClipboard(
                          "CNAME",
                          t("customDomainSection.copiedToClipboard")
                        )
                      }
                      aria-label="Copy record type to clipboard"
                    >
                      <div className="i-mdi:content-copy h-3.5 w-3.5"></div>
                    </button>
                  </div>
                </div>
                <div className="flex items-center">
                  <span className="text-gray-400">
                    {t("customDomainSection.dnsRecordName")}:
                  </span>{" "}
                  <div className="flex items-center">
                    {/* i18n-ignore */}
                    <span className="text-white">www</span>
                    <button
                      className="ml-1.5 text-gray-400 hover:text-primary-light transition-colors"
                      onClick={() =>
                        copyToClipboard(
                          "www",
                          t("customDomainSection.copiedToClipboard")
                        )
                      }
                      aria-label="Copy www to clipboard"
                    >
                      <div className="i-mdi:content-copy h-3.5 w-3.5"></div>
                    </button>
                  </div>
                </div>
                <div className="flex items-center">
                  <span className="text-gray-400">
                    {t("customDomainSection.dnsRecordValue")}:
                  </span>{" "}
                  <div className="flex items-center">
                    {/* i18n-ignore */}
                    <span className="text-white">
                      orderlynetworkdexcreator.github.io
                    </span>
                    <button
                      className="ml-1.5 text-gray-400 hover:text-primary-light transition-colors"
                      onClick={() =>
                        copyToClipboard(
                          "orderlynetworkdexcreator.github.io",
                          t("customDomainSection.copiedToClipboard")
                        )
                      }
                      aria-label="Copy domain value to clipboard"
                    >
                      <div className="i-mdi:content-copy h-3.5 w-3.5"></div>
                    </button>
                  </div>
                </div>
                <div className="flex items-center">
                  {/* i18n-ignore */}
                  <span className="text-gray-400">TTL:</span>{" "}
                  <div className="flex items-center">
                    <span className="text-white">3600</span>
                    <button
                      className="ml-1.5 text-gray-400 hover:text-primary-light transition-colors"
                      onClick={() =>
                        copyToClipboard(
                          "3600",
                          t("customDomainSection.copiedToClipboard")
                        )
                      }
                      aria-label="Copy TTL value to clipboard"
                    >
                      <div className="i-mdi:content-copy h-3.5 w-3.5"></div>
                    </button>{" "}
                    {t("customDomainSection.ttlOrAutomatic")}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : dexData.customDomain &&
          dexData.customDomain.split(".").length > 2 ? (
          // Subdomain - show CNAME record
          <div className="bg-base-9/70 rounded p-3 font-mono text-xs overflow-x-auto mb-3">
            <div className="mb-1 text-gray-400">
              {t("customDomainSection.addCnameRecord")}
            </div>
            <div className="flex items-center">
              <span className="text-gray-400">
                {t("customDomainSection.dnsRecordName")}:
              </span>{" "}
              <div className="flex items-center">
                <span className="text-white">
                  {dexData.customDomain.split(".")[0]}
                </span>
                <button
                  className="ml-1.5 text-gray-400 hover:text-primary-light transition-colors"
                  onClick={() =>
                    copyToClipboard(
                      dexData.customDomain?.split(".")[0] || "",
                      t("customDomainSection.copiedToClipboard")
                    )
                  }
                  aria-label="Copy subdomain name to clipboard"
                >
                  <div className="i-mdi:content-copy h-3.5 w-3.5"></div>
                </button>
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-gray-400">
                {t("customDomainSection.dnsRecordValue")}:
              </span>{" "}
              <div className="flex items-center">
                {/* i18n-ignore */}
                <span className="text-white">
                  orderlynetworkdexcreator.github.io
                </span>
                <button
                  className="ml-1.5 text-gray-400 hover:text-primary-light transition-colors"
                  onClick={() =>
                    copyToClipboard(
                      "orderlynetworkdexcreator.github.io",
                      t("customDomainSection.copiedToClipboard")
                    )
                  }
                  aria-label="Copy domain value to clipboard"
                >
                  <div className="i-mdi:content-copy h-3.5 w-3.5"></div>
                </button>
              </div>
            </div>
            <div className="flex items-center">
              {/* i18n-ignore */}
              <span className="text-gray-400">TTL:</span>{" "}
              <div className="flex items-center">
                <span className="text-white">3600</span>
                <button
                  className="ml-1.5 text-gray-400 hover:text-primary-light transition-colors"
                  onClick={() =>
                    copyToClipboard(
                      "3600",
                      t("customDomainSection.copiedToClipboard")
                    )
                  }
                  aria-label="Copy TTL value to clipboard"
                >
                  <div className="i-mdi:content-copy h-3.5 w-3.5"></div>
                </button>{" "}
                {t("customDomainSection.ttlOrAutomatic")}
              </div>
            </div>
          </div>
        ) : (
          // No domain configured yet - show generic instructions
          <div className="bg-base-9/70 rounded p-3 font-mono text-xs overflow-x-auto mb-3">
            <div className="mb-2 text-gray-400">
              {t("customDomainSection.dnsConfigDepends")}
            </div>
            <div className="mb-3">
              <div className="text-primary-light mb-1">
                {t("customDomainSection.forApexDomains")}
              </div>
              <div className="ml-2 space-y-1">
                <div className="mb-2">
                  <div className="text-warning text-xs mb-1">
                    {t("customDomainSection.step1ARecords")}
                  </div>
                  <div>
                    {t("customDomainSection.dnsRecordType")}:{" "}
                    <span className="text-white">A</span>
                  </div>
                  <div>
                    {t("customDomainSection.dnsRecordName")}:{" "}
                    <span className="text-white">@</span>
                  </div>
                  <div>
                    {t("customDomainSection.dnsRecordValues")}:{" "}
                    <span className="text-white">
                      185.199.108.153, 185.199.109.153, 185.199.110.153,
                      185.199.111.153
                    </span>
                  </div>
                </div>
                <div>
                  <div className="text-warning text-xs mb-1">
                    {t("customDomainSection.step2WwwCname")}
                  </div>
                  <div>
                    {t("customDomainSection.dnsRecordType")}:{" "}
                    <span className="text-white">CNAME</span>
                  </div>
                  <div>
                    {t("customDomainSection.dnsRecordName")}:{" "}
                    <span className="text-white">www</span>
                  </div>
                  <div>
                    {t("customDomainSection.dnsRecordValue")}:{" "}
                    <span className="text-white">
                      orderlynetworkdexcreator.github.io
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <div className="text-primary-light mb-1">
                {t("customDomainSection.forSubdomains")}
              </div>
              <div className="ml-2 space-y-1">
                <div>
                  {t("customDomainSection.dnsRecordType")}:{" "}
                  <span className="text-white">CNAME</span>
                </div>
                <div>
                  {t("customDomainSection.dnsRecordName")}:{" "}
                  <span className="text-white">dex</span> (
                  {t("customDomainSection.yourSubdomain")})
                </div>
                <div>
                  {t("customDomainSection.dnsRecordValue")}:
                  <span className="text-white">
                    {/* i18n-ignore */}orderlynetworkdexcreator.github.io
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mb-3 p-3 bg-info/10 rounded-lg border border-info/20">
          <h6 className="text-xs font-medium mb-2 flex items-center">
            <div className="i-mdi:information-outline h-3.5 w-3.5 mr-1.5 text-info"></div>
            {t("customDomainSection.importantAboutDomainUpdates")}
          </h6>
          <p className="text-xs text-gray-300">
            {t("customDomainSection.domainUpdateNote")}
          </p>
          <p className="text-xs text-gray-300 mt-1">
            {t("customDomainSection.monitorDeployment")}
          </p>
        </div>

        <div className="text-xs text-gray-400">
          {dexData.customDomain &&
          dexData.customDomain.split(".").length === 2 ? (
            <div className="flex items-start gap-1 mb-1">
              <div className="i-mdi:information-outline h-3.5 w-3.5 mt-0.5 flex-shrink-0"></div>
              <span>
                {t("customDomainSection.apexDomainNote", {
                  domain: dexData.customDomain,
                })}
              </span>
            </div>
          ) : dexData.customDomain &&
            dexData.customDomain.split(".").length > 2 ? (
            <div className="flex items-start gap-1 mb-1">
              <div className="i-mdi:information-outline h-3.5 w-3.5 mt-0.5 flex-shrink-0"></div>
              <span>
                {t("customDomainSection.subdomainNote", {
                  subdomain: `${dexData.customDomain.split(".")[0]}.${dexData.customDomain.split(".").slice(1).join(".")}`,
                })}
              </span>
            </div>
          ) : (
            <div className="flex items-start gap-1 mb-1">
              <div className="i-mdi:information-outline h-3.5 w-3.5 mt-0.5 flex-shrink-0"></div>
              <span>{t("customDomainSection.chooseDomainType")}</span>
            </div>
          )}
          <div className="flex items-start gap-1">
            <div className="i-mdi:clock-outline h-3.5 w-3.5 mt-0.5 flex-shrink-0"></div>
            <span>{t("customDomainSection.dnsPropagationTime")}</span>
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-warning/20 p-4 bg-warning/5">
        <h5 className="text-sm font-bold mb-3 flex items-center">
          <div className="i-mdi:security h-4 w-4 mr-2 text-warning"></div>
          {t("customDomainSection.recommendedEmailSecurity")}
        </h5>
        <p className="text-sm text-gray-300 mb-4">
          {t("customDomainSection.emailSecurityDesc")}
        </p>

        <div className="space-y-4">
          <div>
            <div className="text-xs font-bold mb-2 text-warning flex items-center">
              <div className="i-mdi:shield-lock h-3.5 w-3.5 mr-1"></div>
              {t("customDomainSection.spfRecord")}
            </div>
            <div className="bg-base-9/70 rounded p-3 font-mono text-xs overflow-x-auto">
              <div className="space-y-1">
                <div className="flex items-center">
                  <span className="text-gray-400">
                    {t("customDomainSection.dnsRecordType")}:
                  </span>{" "}
                  <div className="flex items-center">
                    {/* i18n-ignore */}
                    <span className="text-white ml-1">TXT</span>
                    <button
                      className="ml-1.5 text-gray-400 hover:text-primary-light transition-colors"
                      onClick={() =>
                        copyToClipboard(
                          "TXT",
                          t("customDomainSection.copiedToClipboard")
                        )
                      }
                      aria-label="Copy record type to clipboard"
                    >
                      <div className="i-mdi:content-copy h-3.5 w-3.5"></div>
                    </button>
                  </div>
                </div>
                <div className="flex items-center">
                  <span className="text-gray-400">
                    {t("customDomainSection.dnsRecordName")}:
                  </span>{" "}
                  <div className="flex items-center">
                    <span className="text-white ml-1">@</span>
                    <button
                      className="ml-1.5 text-gray-400 hover:text-primary-light transition-colors"
                      onClick={() =>
                        copyToClipboard(
                          "@",
                          t("customDomainSection.copiedToClipboard")
                        )
                      }
                      aria-label="Copy @ symbol to clipboard"
                    >
                      <div className="i-mdi:content-copy h-3.5 w-3.5"></div>
                    </button>
                  </div>
                </div>
                <div className="flex items-center">
                  <span className="text-gray-400">
                    {t("customDomainSection.dnsRecordValue")}:
                  </span>{" "}
                  <div className="flex items-center">
                    {/* i18n-ignore */}
                    <span className="text-white ml-1">v=spf1 -all</span>
                    <button
                      className="ml-1.5 text-gray-400 hover:text-primary-light transition-colors"
                      onClick={() =>
                        copyToClipboard(
                          "v=spf1 -all",
                          t("customDomainSection.copiedToClipboard")
                        )
                      }
                      aria-label="Copy SPF record value to clipboard"
                    >
                      <div className="i-mdi:content-copy h-3.5 w-3.5"></div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="text-xs font-bold mb-2 text-warning flex items-center">
              <div className="i-mdi:email-lock h-3.5 w-3.5 mr-1"></div>
              {t("customDomainSection.dmarcRecord")}
            </div>
            <div className="bg-base-9/70 rounded p-3 font-mono text-xs overflow-x-auto">
              <div className="space-y-1">
                <div className="flex items-center">
                  <span className="text-gray-400">
                    {t("customDomainSection.dnsRecordType")}:
                  </span>{" "}
                  <div className="flex items-center">
                    {/* i18n-ignore */}
                    <span className="text-white ml-1">TXT</span>
                    <button
                      className="ml-1.5 text-gray-400 hover:text-primary-light transition-colors"
                      onClick={() =>
                        copyToClipboard(
                          "TXT",
                          t("customDomainSection.copiedToClipboard")
                        )
                      }
                      aria-label="Copy record type to clipboard"
                    >
                      <div className="i-mdi:content-copy h-3.5 w-3.5"></div>
                    </button>
                  </div>
                </div>
                <div className="flex items-center">
                  <span className="text-gray-400">
                    {t("customDomainSection.dnsRecordName")}:
                  </span>{" "}
                  <div className="flex items-center">
                    <span className="text-white ml-1">_dmarc</span>
                    <button
                      className="ml-1.5 text-gray-400 hover:text-primary-light transition-colors"
                      onClick={() =>
                        copyToClipboard(
                          "_dmarc",
                          t("customDomainSection.copiedToClipboard")
                        )
                      }
                      aria-label="Copy _dmarc to clipboard"
                    >
                      <div className="i-mdi:content-copy h-3.5 w-3.5"></div>
                    </button>
                  </div>
                </div>
                <div className="flex items-start">
                  <span className="text-gray-400 flex-shrink-0">
                    {t("customDomainSection.dnsRecordValue")}:
                  </span>{" "}
                  <div className="flex items-start ml-1">
                    {/* i18n-ignore */}
                    <span className="text-white break-all">
                      v=DMARC1; p=reject; sp=reject; aspf=s; adkim=s
                    </span>
                    <button
                      className="ml-1.5 text-gray-400 hover:text-primary-light transition-colors flex-shrink-0"
                      onClick={() =>
                        copyToClipboard(
                          "v=DMARC1; p=reject; sp=reject; aspf=s; adkim=s",
                          t("customDomainSection.copiedToClipboard")
                        )
                      }
                      aria-label="Copy DMARC record value to clipboard"
                    >
                      <div className="i-mdi:content-copy h-3.5 w-3.5"></div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-3 p-3 bg-info/10 rounded-lg border border-info/20">
          <div className="text-xs text-gray-300 space-y-1.5">
            <div className="flex items-start gap-1.5">
              <div className="i-mdi:information-outline h-3.5 w-3.5 mt-0.5 flex-shrink-0 text-info"></div>
              <span>
                <Trans
                  i18nKey="customDomainSection.whatTheseRecordsDo"
                  components={[<strong key="0" />]}
                />
              </span>
            </div>
            <div className="flex items-start gap-1.5">
              <div className="i-mdi:shield-check h-3.5 w-3.5 mt-0.5 flex-shrink-0 text-success"></div>
              <span>
                <Trans
                  i18nKey="customDomainSection.whyThisMatters"
                  components={[<strong key="0" />]}
                />
              </span>
            </div>
            <div className="flex items-start gap-1.5">
              <div className="i-mdi:alert-circle-outline h-3.5 w-3.5 mt-0.5 flex-shrink-0 text-warning"></div>
              <span>
                <Trans
                  i18nKey="customDomainSection.noteEmailRecords"
                  components={[<strong key="0" />]}
                />
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
