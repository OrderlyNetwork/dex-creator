import { useState, useEffect } from "react";
import type { MetaFunction } from "@remix-run/node";
import { toast } from "react-toastify";
import { useAuth } from "../../context/useAuth";
import { useDex } from "../../context/DexContext";
import { useOrderlyKey } from "../../context/OrderlyKeyContext";
import { useModal } from "../../context/ModalContext";
import { Card } from "../../components/Card";
import WalletConnect from "../../components/WalletConnect";
import SegmentedControl from "../../components/SegmentedControl";
import { Link } from "@remix-run/react";
import { useAccount } from "wagmi";
import OrderlyKeyRequiredCard from "./OrderlyKeyRequiredCard";
import SingleLevelSettings from "./SingleLevelSettings";
import MultiLevelSettings from "./MultiLevelSettings";
import AdvancedReferralManagement from "./AdvancedReferralManagement";
import { Button } from "~/components/Button";
import { useTranslation } from "~/i18n";
import {
  enableMultiLevelReferral,
  getMultiLevelReferralInfo,
  getReferralAdminInfo,
  hasUsedSingleLevelReferral,
  type MultiLevelReferralInfo,
} from "~/utils/orderly";

export const meta: MetaFunction = () => [
  { title: "Referral Program - Orderly One" },
  {
    name: "description",
    content:
      "Manage your DEX referral program. Set up auto-referral codes and earn from trader activity.",
  },
];

export default function ReferralRoute() {
  const { t } = useTranslation();
  const { isAuthenticated, isLoading } = useAuth();
  const { dexData, brokerId, isGraduated, isLoading: isDexLoading } = useDex();
  const {
    orderlyKey,
    accountId,
    hasValidKey,
    setOrderlyKey,
    isOrderlyKeyReady,
  } = useOrderlyKey();
  const { openModal } = useModal();
  const { address } = useAccount();

  const [isCreatingKey, setIsCreatingKey] = useState(false);
  const [referralType, setReferralType] = useState("single-level");
  const [multiLevelInfo, setMultiLevelInfo] =
    useState<MultiLevelReferralInfo | null>(null);
  const [isLoadingMultiLevel, setIsLoadingMultiLevel] = useState(false);
  const [hasUsedSingleLevel, setHasUsedSingleLevel] = useState(false);
  const [isCheckingSingleLevel, setIsCheckingSingleLevel] = useState(false);

  const referralTypeOptions = [
    { value: "single-level", label: t("referral.type.singleLevel") },
    { value: "multi-level", label: t("referral.type.multiLevel") },
  ];

  const loadMultiLevelReferralInfo = async () => {
    if (!hasValidKey || !accountId || !orderlyKey) return;

    setIsLoadingMultiLevel(true);
    try {
      const info = await getMultiLevelReferralInfo(accountId, orderlyKey);
      setMultiLevelInfo(info);
    } catch (error) {
      console.error("Failed to load multi-level referral info:", error);
      setMultiLevelInfo(null);
    } finally {
      setIsLoadingMultiLevel(false);
    }
  };

  // Check if user has used single-level referral
  useEffect(() => {
    if (!hasValidKey || !accountId || !orderlyKey) return;

    const checkSingleLevelUsage = async () => {
      setIsCheckingSingleLevel(true);
      try {
        const referralInfo = await getReferralAdminInfo(accountId, orderlyKey);
        const hasUsed = hasUsedSingleLevelReferral(referralInfo);
        setHasUsedSingleLevel(hasUsed);

        if (!hasUsed) {
          setReferralType("multi-level");
        }
      } catch (error) {
        console.error("Failed to check single-level usage:", error);
        setHasUsedSingleLevel(true);
      } finally {
        setIsCheckingSingleLevel(false);
      }
    };

    checkSingleLevelUsage();
  }, [hasValidKey, accountId, orderlyKey]);

  useEffect(() => {
    if (!hasValidKey || !accountId || !orderlyKey) return;
    loadMultiLevelReferralInfo();
    const interval = setInterval(() => {
      loadMultiLevelReferralInfo();
    }, 600000);
    return () => {
      clearInterval(interval);
    };
  }, [hasValidKey, accountId, orderlyKey]);

  const handleCreateOrderlyKey = async () => {
    if (!address || !brokerId || !accountId) {
      toast.error(t("referral.toast.missingKeyInfo"));
      return;
    }

    setIsCreatingKey(true);

    try {
      openModal("orderlyKeyLogin", {
        onSuccess: (newKey: Uint8Array) => {
          setOrderlyKey(newKey);
        },
        onCancel: () => {
          setIsCreatingKey(false);
        },
        brokerId,
        accountId,
      });
    } catch (error) {
      console.error("Failed to create orderly key:", error);
      toast.error(t("referral.toast.createKeyFailed"));
    } finally {
      setIsCreatingKey(false);
    }
  };

  const handleOpenAdminLogin = () => {
    if (!hasValidKey || !orderlyKey || !accountId) {
      toast.error(t("referral.toast.orderlyKeyRequiredAdmin"));
      return;
    }

    openModal("adminLogin", {
      orderlyKey,
      accountId,
    });
  };

  const handleOpenUpgradeModal = () => {
    if (!hasValidKey || !orderlyKey || !accountId) {
      toast.error(t("referral.toast.orderlyKeyRequiredUpgrade"));
      return;
    }
    openModal("mlrConfirm", {
      onConfirm: async () => {
        try {
          await enableMultiLevelReferral(accountId, orderlyKey, true);

          toast.success(t("referral.toast.mlrEnabled"));

          // 刷新 Multi-Level Referral 信息
          await loadMultiLevelReferralInfo();
        } catch (error) {
          console.error("Failed to enable multi-level referral:", error);
          const errorMessage =
            error instanceof Error
              ? error.message
              : t("referral.toast.mlrEnableFailed");
          toast.error(errorMessage);
          throw error;
        }
      },
    });
  };

  const isPageLoading =
    isLoading ||
    (isAuthenticated && isDexLoading) ||
    (!!dexData && isGraduated && !isOrderlyKeyReady) ||
    (!!dexData &&
      isGraduated &&
      hasValidKey &&
      (isCheckingSingleLevel || isLoadingMultiLevel));

  if (isPageLoading) {
    return (
      <div className="w-full h-[calc(100vh-64px)] flex items-center justify-center px-4 mt-26 pb-52">
        <div className="text-center">
          <div className="i-svg-spinners:pulse-rings-multiple h-12 w-12 mx-auto text-primary-light mb-4"></div>
          <div className="text-base md:text-lg mb-2">
            {t("referral.loading.settings")}
          </div>
          <div className="text-xs md:text-sm text-gray-400">
            {t("referral.loading.dashboard")}
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
            {t("referral.pageTitle")}
          </h1>
          <Card>
            <h2 className="text-lg md:text-xl font-medium mb-3 md:mb-4">
              {t("referral.authRequired.title")}
            </h2>
            <p className="mb-4 md:mb-6 text-sm md:text-base text-gray-300">
              {t("referral.authRequired.description")}
            </p>
            <div className="flex justify-center">
              <WalletConnect />
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (!dexData) {
    return (
      <div className="w-full max-w-3xl mx-auto px-4 py-6 md:py-10 mt-26 pb-52">
        <div className="text-center">
          <Link
            to="/dex"
            className="text-sm text-gray-400 hover:text-primary-light mb-2 inline-flex items-center"
          >
            <div className="i-mdi:arrow-left h-4 w-4 mr-1"></div>
            {t("referral.backToDexDashboard")}
          </Link>
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold mb-4 md:mb-6">
            {t("referral.pageTitle")}
          </h1>
          <Card>
            <h2 className="text-lg md:text-xl font-medium mb-3 md:mb-4">
              {t("referral.noDex.title")}
            </h2>
            <p className="mb-4 md:mb-6 text-sm md:text-base text-gray-300">
              {t("referral.noDex.description")}
            </p>
            <div className="flex justify-center">
              <Link to="/dex" className="btn-connect">
                {t("referral.createYourDex")}
              </Link>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (!isGraduated) {
    return (
      <div className="container mx-auto p-4 max-w-3xl mt-26 pb-52">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <Link
              to="/dex"
              className="text-sm text-gray-400 hover:text-primary-light mb-2 inline-flex items-center"
            >
              <div className="i-mdi:arrow-left h-4 w-4 mr-1"></div>
              {t("referral.backToDexDashboard")}
            </Link>
            <h1 className="text-2xl md:text-3xl font-bold gradient-text">
              {t("referral.pageTitle")}
            </h1>
          </div>
        </div>

        <Card className="border border-warning/20 bg-warning/5">
          <div className="flex gap-4 items-start">
            <div className="bg-warning/20 p-3 rounded-full flex-shrink-0">
              <div className="i-mdi:lock text-warning w-6 h-6"></div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-medium text-warning mb-2">
                {t("referral.graduationRequired.title")}
              </h3>
              <p className="text-gray-300 mb-4">
                {t("referral.graduationRequired.description")}
              </p>

              <div className="bg-background-dark/50 p-4 rounded-lg border border-secondary-light/10 mb-6">
                <h4 className="font-semibold mb-2 text-secondary-light">
                  {t("referral.graduationRequired.whyTitle")}
                </h4>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li className="flex items-start gap-2">
                    <div className="i-mdi:cash-multiple text-primary w-4 h-4 flex-shrink-0 mt-0.5"></div>
                    <span>{t("referral.graduationRequired.reason1")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="i-mdi:account-group text-primary w-4 h-4 flex-shrink-0 mt-0.5"></div>
                    <span>{t("referral.graduationRequired.reason2")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="i-mdi:shield-check text-primary w-4 h-4 flex-shrink-0 mt-0.5"></div>
                    <span>{t("referral.graduationRequired.reason3")}</span>
                  </li>
                </ul>
              </div>

              <Button
                as="a"
                href="/dex/graduation"
                className="flex items-center gap-2"
              >
                <div className="i-mdi:rocket-launch w-4 h-4"></div>
                {t("referral.graduationRequired.graduateCta")}
              </Button>
            </div>
          </div>
        </Card>

        <Card className="mt-6">
          <h3 className="text-lg font-medium mb-4">
            {t("referral.preview.title")}
          </h3>
          <p className="text-gray-300 mb-4">{t("referral.preview.intro")}</p>

          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-background-dark/30 border border-light/5">
                <div className="i-mdi:percent text-secondary w-5 h-5 flex-shrink-0 mt-0.5"></div>
                <div>
                  <h4 className="font-medium text-white mb-1">
                    {t("referral.preview.autoReferral.title")}
                  </h4>
                  <p className="text-gray-400">
                    {t("referral.preview.autoReferral.description")}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-background-dark/30 border border-light/5">
                <div className="i-mdi:chart-line text-secondary w-5 h-5 flex-shrink-0 mt-0.5"></div>
                <div>
                  <h4 className="font-medium text-white mb-1">
                    {t("referral.preview.revenueSharing.title")}
                  </h4>
                  <p className="text-gray-400">
                    {t("referral.preview.revenueSharing.description")}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-background-dark/30 border border-light/5">
                <div className="i-mdi:cog text-secondary w-5 h-5 flex-shrink-0 mt-0.5"></div>
                <div>
                  <h4 className="font-medium text-white mb-1">
                    {t("referral.preview.programManagement.title")}
                  </h4>
                  <p className="text-gray-400">
                    {t("referral.preview.programManagement.description")}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-background-dark/30 border border-light/5">
                <div className="i-mdi:shield-check text-secondary w-5 h-5 flex-shrink-0 mt-0.5"></div>
                <div>
                  <h4 className="font-medium text-white mb-1">
                    {t("referral.preview.secureApi.title")}
                  </h4>
                  <p className="text-gray-400">
                    {t("referral.preview.secureApi.description")}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-background-dark/30 border border-light/5">
                <div className="i-mdi:tools text-secondary w-5 h-5 flex-shrink-0 mt-0.5"></div>
                <div>
                  <h4 className="font-medium text-white mb-1">
                    {t("referral.preview.advancedDashboard.title")}
                  </h4>
                  <p className="text-gray-400">
                    {t("referral.preview.advancedDashboard.description")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-3xl mt-26 pb-52">
      <div className="flex flex-col gap-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <Link
              to="/dex"
              className="text-sm text-gray-400 hover:text-primary-light mb-2 inline-flex items-center"
            >
              <div className="i-mdi:arrow-left h-4 w-4 mr-1"></div>
              {t("referral.backToDexDashboard")}
            </Link>
            <h1 className="text-2xl md:text-3xl font-bold gradient-text">
              {t("referral.pageTitle")}
            </h1>
          </div>
        </div>

        {hasValidKey && hasUsedSingleLevel && !isCheckingSingleLevel && (
          <div className="self-start">
            <SegmentedControl
              options={referralTypeOptions}
              value={referralType}
              onChange={setReferralType}
            />
          </div>
        )}

        {/* Main Content */}
        <div className="space-y-12">
          {/* Orderly Key Setup Section */}
          {!hasValidKey && (
            <OrderlyKeyRequiredCard
              isCreatingKey={isCreatingKey}
              onCreateOrderlyKey={handleCreateOrderlyKey}
            />
          )}

          {/* Referral Settings Form */}
          {hasValidKey && !isCheckingSingleLevel && (
            <>
              {isLoadingMultiLevel ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="i-svg-spinners:pulse-rings-multiple w-8 h-8 mx-auto text-primary mb-4"></div>
                    <div className="text-sm text-gray-400">
                      {t("referral.loading.settingsInline")}
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {hasUsedSingleLevel && (
                    <div hidden={referralType !== "single-level"}>
                      <SingleLevelSettings
                        hasValidKey={hasValidKey}
                        accountId={accountId}
                        orderlyKey={orderlyKey}
                        isMultiLevelEnabled={multiLevelInfo?.enable ?? false}
                      />
                    </div>
                  )}

                  {/* Multi-level tab content */}
                  <div hidden={referralType !== "multi-level"}>
                    <MultiLevelSettings
                      onUpgradeClick={handleOpenUpgradeModal}
                      isMultiLevelEnabled={multiLevelInfo?.enable ?? false}
                      multiLevelInfo={multiLevelInfo}
                      isLoading={isLoadingMultiLevel}
                      accountId={accountId}
                      orderlyKey={orderlyKey}
                      onSaved={loadMultiLevelReferralInfo}
                    />
                  </div>

                  <AdvancedReferralManagement
                    hasValidKey={hasValidKey}
                    onOpenAdminLogin={handleOpenAdminLogin}
                    hideFirstFeature={referralType === "multi-level"}
                  />
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
