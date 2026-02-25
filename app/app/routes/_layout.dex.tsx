import { useState, useEffect, useRef } from "react";
import type { MetaFunction } from "@remix-run/node";
import { toast } from "react-toastify";
import { useAuth } from "../context/useAuth";
import { useDex } from "../context/DexContext";
import { useModal } from "../context/ModalContext";
import { post, del } from "../utils/apiClient";
import WalletConnect from "../components/WalletConnect";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { useLocation, useNavigate } from "@remix-run/react";
import DexCreationStatus from "../components/DexCreationStatus";
import CustomDomainSection from "../components/CustomDomainSection";
import DexSetupAssistant from "../components/DexSetupAssistant";
import DexUpgrade from "../components/DexUpgrade";
import { useDexForm } from "../hooks/useDexForm";
import { DexData, defaultTheme } from "../types/dex";
import { useDistributorInfoByUrl } from "../hooks/useDistrubutorInfo";
import { MainnetChains } from "../components/ChainsSelect";
import clsx from "clsx";
import { useDistributor } from "../context/DistributorContext";
import { PointSystemIcon } from "../icons/PointSystemIcon";
import { Trans, useTranslation } from "~/i18n";

export const meta: MetaFunction = () => [
  { title: "Create Your DEX - Orderly One" },
  {
    name: "description",
    content:
      "Configure and deploy your perpetual DEX. Customize branding, features, and settings for your trading platform.",
  },
];

export default function DexRoute() {
  const { t } = useTranslation();
  const { isAuthenticated, token, isLoading } = useAuth();
  const {
    dexData,
    isLoading: isDexLoading,
    updateDexData,
    refreshDexData,
    clearDexData,
    isGraduationEligible,
    isGraduated,
    deploymentUrl: contextDeploymentUrl,
  } = useDex();
  const { openModal } = useModal();
  const navigate = useNavigate();
  const form = useDexForm();

  const [isSaving, setIsSaving] = useState(false);
  const [isForking, setIsForking] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [localDeploymentUrl, setLocalDeploymentUrl] = useState<string | null>(
    null
  );
  const deploymentUrl = localDeploymentUrl || contextDeploymentUrl;
  const [deploymentConfirmed, setDeploymentConfirmed] = useState(false);
  const loadedImagesForDexId = useRef<string | null>(null);
  const populatedFormForDexId = useRef<string | null>(null);
  const initializedThemeForDexId = useRef<string | null>(null);
  const distributorInfo = useDistributorInfoByUrl();
  const { isAmbassador } = useDistributor();
  const location = useLocation();

  useEffect(() => {
    if (dexData && populatedFormForDexId.current !== dexData.id) {
      populatedFormForDexId.current = dexData.id;
      form.populateFromDexData({
        brokerName: dexData.brokerName,
        telegramLink: dexData.telegramLink || "",
        discordLink: dexData.discordLink || "",
        xLink: dexData.xLink || "",
        walletConnectProjectId: dexData.walletConnectProjectId || "",
        privyAppId: dexData.privyAppId || "",
        privyTermsOfUse: dexData.privyTermsOfUse || "",
        privyLoginMethods: dexData.privyLoginMethods,
        enabledMenus: dexData.enabledMenus || "",
        customMenus: dexData.customMenus || "",
        enableAbstractWallet: dexData.enableAbstractWallet || false,
        enableServiceDisclaimerDialog:
          dexData.enableServiceDisclaimerDialog || false,
        enableCampaigns: dexData.enableCampaigns || false,
        chainIds: dexData.chainIds || [],
        defaultChain: dexData.defaultChain || undefined,
        disableMainnet: dexData.disableMainnet || false,
        disableTestnet: dexData.disableTestnet || false,
        disableEvmWallets: dexData.disableEvmWallets || false,
        disableSolanaWallets: dexData.disableSolanaWallets || false,
        tradingViewColorConfig: dexData.tradingViewColorConfig ?? null,
        availableLanguages: dexData.availableLanguages || [],
        seoSiteName: dexData.seoSiteName || "",
        seoSiteDescription: dexData.seoSiteDescription || "",
        seoSiteLanguage: dexData.seoSiteLanguage || "",
        seoSiteLocale: dexData.seoSiteLocale || "",
        seoTwitterHandle: dexData.seoTwitterHandle || "",
        seoThemeColor: dexData.seoThemeColor || "",
        seoKeywords: dexData.seoKeywords || "",
        analyticsScript: dexData.analyticsScript || "",
        themeCSS: dexData.themeCSS,
      });

      form.setViewCssCode(false);

      if (!dexData.themeCSS) {
        form.setCurrentTheme(defaultTheme);
      }

      setLocalDeploymentUrl(
        dexData.repoUrl
          ? `https://dex.orderly.network/${dexData.repoUrl.split("/").pop()}/`
          : null
      );
    }
  }, [
    dexData,
    form.populateFromDexData,
    form.setViewCssCode,
    form.setCurrentTheme,
  ]);

  useEffect(() => {
    if (
      dexData &&
      !form.currentTheme &&
      !dexData?.themeCSS &&
      initializedThemeForDexId.current !== dexData.id
    ) {
      initializedThemeForDexId.current = dexData.id;
      form.setCurrentTheme(defaultTheme);
    }
  }, [form.currentTheme, form.setCurrentTheme, dexData]);

  useEffect(() => {
    if (dexData && loadedImagesForDexId.current !== dexData.id) {
      loadedImagesForDexId.current = dexData.id;
      form.loadImagesFromBase64({
        primaryLogo: dexData.primaryLogo,
        secondaryLogo: dexData.secondaryLogo,
        favicon: dexData.favicon,
        pnlPosters: dexData.pnlPosters,
      });
    }
  }, [dexData, form.loadImagesFromBase64]);

  useEffect(() => {
    if (!dexData) {
      loadedImagesForDexId.current = null;
      populatedFormForDexId.current = null;
      initializedThemeForDexId.current = null;
    }
  }, [dexData]);

  // Handle smooth scrolling to DEX Creation Status when navigating from config
  useEffect(() => {
    const hash = window.location.hash;
    if (hash === "#dex-creation-status") {
      // Wait for the component to render, then scroll
      const timer = setTimeout(() => {
        const element = document.getElementById("dex-creation-status");
        if (element) {
          element.scrollIntoView({
            behavior: "smooth",
            block: "start",
            inline: "nearest",
          });
          // Clear the hash after scrolling
          window.history.replaceState(null, "", window.location.pathname);
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [dexData, isLoading, isDexLoading]);

  useEffect(() => {
    if (
      dexData &&
      dexData.customDomain &&
      !isGraduated &&
      isAuthenticated &&
      !isLoading &&
      !isDexLoading
    ) {
      const popupShownKey = `graduation-popup-shown-${dexData.id}`;
      const hasShownPopup = localStorage.getItem(popupShownKey);

      if (!hasShownPopup) {
        const timer = setTimeout(() => {
          openModal("graduationExplanation");
          localStorage.setItem(popupShownKey, "true");
        }, 1000);

        return () => clearTimeout(timer);
      }
    }
  }, [
    dexData,
    isGraduated,
    isAuthenticated,
    isLoading,
    isDexLoading,
    openModal,
  ]);

  useEffect(() => {
    // if user is ambassador, redirect to distributor page
    if (isAmbassador) {
      navigate(`/distributor${location.search}`);
    }
  }, [isAmbassador]);

  const handleRetryForking = async () => {
    if (!dexData || !dexData.id || !token) {
      toast.error(t("dex.infoUnavailable"));
      return;
    }

    setIsForking(true);

    try {
      const result = await post<{ dex: DexData }>(
        `api/dex/${dexData.id}/fork`,
        {},
        token
      );

      if (result && result.dex) {
        updateDexData(result.dex);

        if (result.dex.repoUrl) {
          toast.success(t("dex.repoForkedSuccess"));

          setLocalDeploymentUrl(
            `https://dex.orderly.network/${result.dex.repoUrl
              .split("/")
              .pop()}/`
          );
        } else {
          toast.error(t("dex.repoCreationFailed"));
        }
      } else {
        toast.error(t("dex.serverResponseFailed"));
      }
    } catch (error) {
      console.error("Error forking repository:", error);
      toast.error(t("dex.repoCreationFailed"));
    } finally {
      setIsForking(false);
    }
  };

  const handleSuccessfulDeployment = (
    url: string,
    isNewDeployment: boolean
  ) => {
    setLocalDeploymentUrl(url);
    setDeploymentConfirmed(true);

    if (isNewDeployment) {
      toast.success(t("dex.deployedSuccess"));
    }
  };

  const handleDelete = async () => {
    if (!dexData || !dexData.id || !token) {
      toast.error(t("dex.infoUnavailable"));
      return;
    }

    setIsDeleting(true);

    try {
      await del<{ message: string }>(`api/dex/${dexData.id}`, null, token);
      toast.success(t("dex.deletedSuccess"));

      form.resetForm();
      setLocalDeploymentUrl(null);

      clearDexData();

      navigate("/");
    } catch (error) {
      console.error("Error deleting DEX:", error);
      toast.error(t("dex.deleteFailed"));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleShowDeleteConfirm = () => {
    openModal("deleteConfirm", {
      onConfirm: handleDelete,
      entityName: t("dex.entityName"),
    });
  };

  const handleShowDomainRemoveConfirm = () => {
    if (!dexData || !dexData.id || !dexData.customDomain) return;

    openModal("deleteConfirm", {
      onConfirm: () => {
        setIsSaving(true);

        del(`api/dex/${dexData.id}/custom-domain`, null, token)
          .then(() => {
            updateDexData({
              customDomain: null,
            });
            toast.success(t("dex.customDomainRemovedSuccess"));
          })
          .catch(error => {
            console.error("Error removing custom domain:", error);
            toast.error(t("dex.customDomainRemoveFailed"));
          })
          .finally(() => {
            setIsSaving(false);
          });
      },
      entityName: t("dex.customDomainEntityName"),
      title: t("dex.removeCustomDomainTitle"),
      message: t("dex.removeCustomDomainMessage", {
        customDomain: dexData.customDomain,
      }),
    });
  };

  if (isLoading || isDexLoading) {
    return (
      <div className="w-full h-[calc(100vh-64px)] flex items-center justify-center px-4 mt-26 pb-52">
        <div className="text-center">
          <div className="i-svg-spinners:pulse-rings-multiple h-12 w-12 mx-auto text-primary-light mb-4"></div>
          <div className="text-base md:text-lg mb-2">
            {t("dex.loadingYourDex")}
          </div>
          <div className="text-xs md:text-sm text-gray-400">
            {t("dex.fetchConfigurationHint")}
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="w-full max-w-3xl mx-auto px-4 py-6 md:py-10 mt-26 pb-52">
        <div className="text-center">
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold mb-4 md:mb-6">
            {t("dex.createYourDex")}
          </h1>
          <div className="flex items-center justify-center mb-4">
            <p className="text-gray-400 mr-3">{t("dex.via")}</p>
            {MainnetChains.map((chain, index) => (
              <div
                style={{
                  zIndex: MainnetChains.length - index,
                }}
                className={clsx(
                  "flex items-center justify-center",
                  "w-[24px] h-[24px] ml-[-6px] bg-black rounded-full"
                )}
              >
                <img
                  key={chain.chain_id}
                  className="w-5 h-5 rounded-full"
                  src={`https://oss.orderly.network/static/network_logo/${chain.chain_id}.png`}
                  alt={chain.name}
                />
              </div>
            ))}
          </div>
          <h2 className="text-lg md:text-xl">
            {distributorInfo.distributor_name
              ? t("dex.joinBuildersWithDistributor", {
                  distributorName: distributorInfo.distributor_name,
                })
              : t("dex.joinBuilders")}
          </h2>
          <div className="text-base-contrast-54 mt-4 mb-15">
            <p>{t("dex.omnichainPerpetualsIntro")}</p>
            <p>{t("dex.deepLiquidityIntro")}</p>
          </div>

          <Card>
            <h2 className="text-md md:text-2xl font-medium mb-3 md:mb-4 text-base-contrast">
              {t("dex.connectWalletToStart")}
            </h2>
            <p className="px-10 mb-4 md:mb-6 text-xs md:text-sm text-base-contrast-54">
              {t("dex.authRequiredHint")}
            </p>
            <div className="flex justify-center">
              <WalletConnect />
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (!dexData && isAuthenticated && token) {
    return (
      <DexSetupAssistant
        token={token}
        updateDexData={updateDexData}
        refreshDexData={refreshDexData}
      />
    );
  }

  const dexConfigureCard = dexData && dexData.repoUrl && (
    <Card className="my-6 bg-gradient-to-r from-secondary/20 to-primary/20 border border-secondary/30">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 bg-secondary/20 p-2 rounded-full">
            <div className="i-mdi:cog text-secondary w-6 h-6"></div>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-1">
              {t("dex.configureYourDex")}
            </h3>
            <p className="text-gray-300">{t("dex.configureDescription")}</p>
          </div>
        </div>
        <Button
          as="a"
          href="/dex/config"
          className="whitespace-nowrap flex-shrink-0"
        >
          {t("dex.openSettings")}
        </Button>
      </div>
    </Card>
  );

  const graduationCard = isGraduationEligible && !isGraduated && dexData && (
    <Card className="my-6 bg-gradient-to-r from-primary/20 to-secondary/20 border border-primary/30">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 bg-primary/20 p-2 rounded-full">
            <div className="i-mdi:rocket-launch text-primary w-6 h-6"></div>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-1">
              {t("dex.readyToGraduate")}
            </h3>
            <p className="text-gray-300">{t("dex.graduateDescription")}</p>
          </div>
        </div>
        <Button
          as="a"
          href="/dex/graduation"
          className="whitespace-nowrap flex-shrink-0"
        >
          {t("dex.graduateNow")}
        </Button>
      </div>
    </Card>
  );

  const dexCardSetup = dexData && (
    <Card className="my-6 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 bg-purple-500/20 p-2 rounded-full">
            <div className="i-mdi:share-variant text-purple-400 w-6 h-6"></div>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-1">
              {t("dex.cardSetupTitle")}
            </h3>
            <p className="text-gray-300">{t("dex.cardSetupDescription")}</p>
          </div>
        </div>
        <Button
          as="a"
          href="/dex/card"
          className="whitespace-nowrap flex-shrink-0"
        >
          {t("dex.setupDexCard")}
        </Button>
      </div>
    </Card>
  );

  const graduatedDexCard = dexData && dexData.brokerId !== "demo" && (
    <Card
      className={`my-6 ${
        isGraduated
          ? "bg-gradient-to-r from-success/20 to-primary/20 border border-success/30"
          : "bg-gradient-to-r from-warning/20 to-primary/20 border border-warning/30"
      }`}
    >
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className={`flex-shrink-0 p-2 rounded-full ${
              isGraduated ? "bg-success/20" : "bg-warning/20"
            }`}
          >
            <div
              className={`w-6 h-6 ${
                isGraduated
                  ? "i-mdi:check-circle text-success"
                  : "i-mdi:account-key text-warning"
              }`}
            ></div>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-1">
              {isGraduated ? t("dex.graduatedDex") : t("dex.brokerIdCreated")}
            </h3>
            <p className="text-gray-300">
              {isGraduated ? (
                <Trans
                  i18nKey="dex.earningFeeShareWithLink"
                  components={[
                    <a
                      key="0"
                      href="/dex/graduation"
                      className="text-primary-light hover:underline"
                    />,
                  ]}
                />
              ) : (
                <Trans
                  i18nKey="dex.brokerIdCreatedDescription"
                  values={{ brokerId: dexData.brokerId }}
                  components={[
                    <span key="0" className="font-mono text-primary-light" />,
                  ]}
                />
              )}
            </p>
          </div>
        </div>
        <Button
          as="a"
          href="/dex/graduation"
          variant={isGraduated ? "success" : "primary"}
          leftIcon={
            <div
              className={`h-4 w-4 ${
                isGraduated ? "i-mdi:cash-multiple" : "i-mdi:account-plus"
              }`}
            ></div>
          }
          className="flex-shrink-0"
        >
          {isGraduated ? t("dex.viewBenefits") : t("dex.completeRegistration")}
        </Button>
      </div>
    </Card>
  );

  const pointSystemCard = dexData && dexData.repoUrl && (
    <Card
      className={`my-6 ${
        isGraduated
          ? "bg-gradient-to-r from-secondary/20 to-primary/20 border border-secondary/30"
          : "bg-gradient-to-r from-gray-500/20 to-gray-400/20 border border-gray-400/30"
      }`}
    >
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <PointSystemIcon className="flex-shrink-0" />

          <div>
            <h3 className="text-lg font-semibold mb-1">
              {t("dex.pointCampaignSetupTitle")}
            </h3>
            <p className="text-gray-300">
              {isGraduated
                ? t("dex.pointCampaignDescriptionGraduated")
                : t("dex.pointCampaignDescriptionLocked")}
            </p>
          </div>
        </div>
        {isGraduated ? (
          <Button
            as="a"
            href="/points"
            className="whitespace-nowrap flex-shrink-0"
          >
            {t("dex.setupPointSystem")}
          </Button>
        ) : (
          <Button
            as="a"
            href="/dex/graduation"
            variant="secondary"
            className="whitespace-nowrap flex-shrink-0"
          >
            {t("dex.graduateDex")}
          </Button>
        )}
      </div>
    </Card>
  );

  const referralSettingsCard = dexData && dexData.repoUrl && (
    <Card
      className={`my-6 ${
        isGraduated
          ? "bg-gradient-to-r from-warning/20 to-primary/20 border border-warning/30"
          : "bg-gradient-to-r from-gray-500/20 to-gray-400/20 border border-gray-400/30"
      }`}
    >
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className={`flex-shrink-0 p-2 rounded-full ${
              isGraduated ? "bg-warning/20" : "bg-gray-400/20"
            }`}
          >
            <div
              className={`w-6 h-6 ${
                isGraduated
                  ? "i-mdi:account-group text-warning"
                  : "i-mdi:lock text-gray-400"
              }`}
            ></div>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-1">
              {t("dex.referralSettingsTitle")}
            </h3>
            <p className="text-gray-300">
              {isGraduated
                ? t("dex.referralDescriptionGraduated")
                : t("dex.referralDescriptionLocked")}
            </p>
          </div>
        </div>
        {isGraduated ? (
          <Button
            as="a"
            href="/referral"
            className="whitespace-nowrap flex-shrink-0"
          >
            {t("dex.manageReferrals")}
          </Button>
        ) : (
          <Button
            as="a"
            href="/dex/graduation"
            variant="secondary"
            className="whitespace-nowrap flex-shrink-0"
          >
            {t("dex.graduateDex")}
          </Button>
        )}
      </div>
    </Card>
  );

  return (
    <div className="container mx-auto p-4 max-w-3xl mt-26 pb-52">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <h1 className="text-2xl md:text-3xl font-bold gradient-text">
          {dexData ? t("dex.manageYourDex") : t("dex.createYourDex")}
        </h1>
      </div>

      {!isAuthenticated && !isLoading ? (
        <div className="text-center mt-16">
          <Card className="p-8">
            <p className="text-lg mb-6">
              {t("dex.connectWalletToCreateOrManage")}
            </p>
            <div className="flex justify-center">
              <WalletConnect />
            </div>
          </Card>
        </div>
      ) : (
        <div className="space-y-8">
          <DexUpgrade dexData={dexData} token={token} />

          {dexConfigureCard}

          {graduationCard}

          {dexCardSetup}

          {graduatedDexCard}

          {pointSystemCard}

          {referralSettingsCard}

          <DexCreationStatus
            dexData={dexData}
            deploymentUrl={deploymentUrl}
            deploymentConfirmed={deploymentConfirmed}
            isForking={isForking}
            handleRetryForking={handleRetryForking}
            handleSuccessfulDeployment={handleSuccessfulDeployment}
          />

          {dexData && dexData.repoUrl && (
            <Card>
              <CustomDomainSection
                dexData={dexData}
                token={token}
                isSaving={isSaving}
                onDexDataUpdate={updateDexData}
                onSavingChange={setIsSaving}
                onShowDomainRemoveConfirm={handleShowDomainRemoveConfirm}
              />
            </Card>
          )}

          {dexData && !isGraduated && (
            <Card>
              <h3 className="text-lg font-bold mb-4 text-red-400">
                {t("dex.dangerZone")}
              </h3>
              <div className="border border-red-500/20 rounded-lg p-4 bg-red-500/5">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h4 className="font-medium text-red-400 mb-1">
                      {t("dex.deleteDex")}
                    </h4>
                    <p className="text-sm text-gray-400">
                      {t("dex.deleteDexWarning")}
                    </p>
                  </div>
                  <Button
                    variant="danger"
                    onClick={handleShowDeleteConfirm}
                    disabled={isDeleting}
                    className="whitespace-nowrap"
                  >
                    {isDeleting ? t("dex.deleting") : t("dex.deleteDex")}
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
