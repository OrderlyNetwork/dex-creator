import { useState, useEffect } from "react";
import type { MetaFunction } from "@remix-run/node";
import { toast } from "react-toastify";
import { useAuth } from "../context/useAuth";
import { useDex } from "../context/DexContext";
import { useOrderlyKey } from "../context/OrderlyKeyContext";
import { useModal } from "../context/ModalContext";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import WalletConnect from "../components/WalletConnect";
import { Link } from "@remix-run/react";
import { useAccount } from "wagmi";
import {
  getAutoReferralInfo,
  updateAutoReferral,
  type AutoReferralSettings,
  type AutoReferralInfo,
} from "../utils/orderly";
import { BackDexDashboard } from "../components/BackDexDashboard";

export const meta: MetaFunction = () => [
  { title: "Referral Program - Orderly One" },
  {
    name: "description",
    content:
      "Manage your DEX referral program. Set up auto-referral codes and earn from trader activity.",
  },
];

export default function ReferralRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  const { dexData, brokerId, isGraduated } = useDex();
  const { orderlyKey, accountId, hasValidKey, setOrderlyKey } = useOrderlyKey();
  const { openModal } = useModal();
  const { address } = useAccount();

  const [isCreatingKey, setIsCreatingKey] = useState(false);
  const [isLoadingReferralInfo, setIsLoadingReferralInfo] = useState(false);
  const [isSavingReferral, setIsSavingReferral] = useState(false);
  const [referralInfo, setReferralInfo] = useState<AutoReferralInfo | null>(
    null
  );

  const [requiredTradingVolume, setRequiredTradingVolume] = useState(10000);
  const [maxRebate, setMaxRebate] = useState(20);
  const [sliderPosition, setSliderPosition] = useState(50);
  const [description, setDescription] = useState("");
  const [isEnabled, setIsEnabled] = useState(true);

  const [maxRebateError, setMaxRebateError] = useState<string | null>(null);

  const stepSize = maxRebate > 0 ? 100 / maxRebate : 1;
  const referrerRebate = Math.round((maxRebate * sliderPosition) / 100);
  const refereeRebate = maxRebate - referrerRebate;

  const validateMaxRebate = (value: number): string | null => {
    if (value <= 0) {
      return "Max rebate must be greater than 0%";
    }
    if (value > 100) {
      return "Max rebate cannot exceed 100%";
    }
    return null;
  };

  const handleMaxRebateChange = (value: number) => {
    setMaxRebate(value);
    const error = validateMaxRebate(value);
    setMaxRebateError(error);
  };

  useEffect(() => {
    if (hasValidKey && accountId && orderlyKey) {
      loadReferralInfo();
    }
  }, [hasValidKey, accountId, orderlyKey]);

  const loadReferralInfo = async () => {
    if (!hasValidKey || !accountId || !orderlyKey) return;

    setIsLoadingReferralInfo(true);
    try {
      const info = await getAutoReferralInfo(accountId, orderlyKey);

      if (!info) {
        setReferralInfo(null);
        setRequiredTradingVolume(10000);
        setMaxRebate(20);
        setMaxRebateError(null);
        setSliderPosition(50);
        setDescription("");
        setIsEnabled(false);
        return;
      }

      setReferralInfo(info);
      setRequiredTradingVolume(info.required_trading_volume);
      const maxRebateValue = info.max_rebate * 100;
      setMaxRebate(maxRebateValue);
      setMaxRebateError(null);

      const referrerRebateValue = info.referrer_rebate * 100;
      const sliderPos =
        maxRebateValue > 0 ? (referrerRebateValue / maxRebateValue) * 100 : 50;
      setSliderPosition(Math.round(sliderPos));

      setDescription(info.description);
      setIsEnabled(info.enable);
    } catch (error) {
      console.error("Failed to load referral info:", error);
      toast.error("Failed to load referral settings");
    } finally {
      setIsLoadingReferralInfo(false);
    }
  };

  const handleCreateOrderlyKey = async () => {
    if (!address || !brokerId || !accountId) {
      toast.error("Missing required information for key creation");
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
      toast.error("Failed to create orderly key");
    } finally {
      setIsCreatingKey(false);
    }
  };

  const handleSaveReferralSettings = async () => {
    if (!hasValidKey || !accountId || !orderlyKey) {
      toast.error("Orderly key required to save settings");
      return;
    }

    const maxRebateValidationError = validateMaxRebate(maxRebate);
    if (maxRebateValidationError) {
      setMaxRebateError(maxRebateValidationError);
      toast.error("Please fix validation errors before saving");
      return;
    }

    setIsSavingReferral(true);

    try {
      const settings: AutoReferralSettings = {
        required_trading_volume: requiredTradingVolume,
        max_rebate: maxRebate / 100,
        referrer_rebate: referrerRebate / 100,
        referee_rebate: refereeRebate / 100,
        enable: isEnabled,
        description: description,
      };

      await updateAutoReferral(accountId, orderlyKey, settings);
      toast.success("Referral settings updated successfully!");

      await loadReferralInfo();
    } catch (error) {
      console.error("Failed to save referral settings:", error);
      toast.error("Failed to save referral settings");
    } finally {
      setIsSavingReferral(false);
    }
  };

  const handleOpenAdminLogin = () => {
    if (!hasValidKey || !orderlyKey || !accountId) {
      toast.error("Orderly key required to access admin credentials");
      return;
    }

    openModal("adminLogin", {
      orderlyKey,
      accountId,
    });
  };

  if (isLoading) {
    return (
      <div className="w-full h-[calc(100vh-64px)] flex items-center justify-center px-4 mt-26 pb-52">
        <div className="text-center">
          <div className="i-svg-spinners:pulse-rings-multiple h-12 w-12 mx-auto text-primary-light mb-4"></div>
          <div className="text-base md:text-lg mb-2">
            Loading Referral Settings
          </div>
          <div className="text-xs md:text-sm text-gray-400">
            Please wait while we prepare your referral dashboard
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
            Referral Settings
          </h1>
          <Card>
            <h2 className="text-lg md:text-xl font-medium mb-3 md:mb-4">
              Authentication Required
            </h2>
            <p className="mb-4 md:mb-6 text-sm md:text-base text-gray-300">
              Please connect your wallet and login to access referral settings.
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
          <BackDexDashboard />
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold mb-4 md:mb-6">
            Referral Settings
          </h1>
          <Card>
            <h2 className="text-lg md:text-xl font-medium mb-3 md:mb-4">
              No DEX Found
            </h2>
            <p className="mb-4 md:mb-6 text-sm md:text-base text-gray-300">
              You need to create a DEX first before you can set up referrals.
            </p>
            <div className="flex justify-center">
              <Link to="/dex" className="btn-connect">
                Create Your DEX
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
            <BackDexDashboard />
            <h1 className="text-2xl md:text-3xl font-bold gradient-text">
              Referral Settings
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
                Graduation Required
              </h3>
              <p className="text-gray-300 mb-4">
                Referral settings are only available for graduated DEXs. You
                need to graduate your DEX first to start earning revenue and
                enable referral programs.
              </p>

              <div className="bg-background-dark/50 p-4 rounded-lg border border-secondary-light/10 mb-6">
                <h4 className="font-semibold mb-2 text-secondary-light">
                  Why graduation is required:
                </h4>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li className="flex items-start gap-2">
                    <div className="i-mdi:cash-multiple text-primary w-4 h-4 flex-shrink-0 mt-0.5"></div>
                    <span>
                      Referrals are tied to revenue sharing from trading fees
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="i-mdi:account-group text-primary w-4 h-4 flex-shrink-0 mt-0.5"></div>
                    <span>
                      Graduated DEXs can offer rebates and rewards to traders
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="i-mdi:shield-check text-primary w-4 h-4 flex-shrink-0 mt-0.5"></div>
                    <span>
                      Ensures your DEX has the necessary infrastructure for
                      referrals
                    </span>
                  </li>
                </ul>
              </div>

              <Button
                as="a"
                href="/dex/graduation"
                className="flex items-center gap-2"
              >
                <div className="i-mdi:rocket-launch w-4 h-4"></div>
                Graduate Your DEX
              </Button>
            </div>
          </div>
        </Card>

        <Card className="mt-6">
          <h3 className="text-lg font-medium mb-4">
            Preview: Referral Features
          </h3>
          <p className="text-gray-300 mb-4">
            Once your DEX is graduated, you'll have access to these referral
            management features:
          </p>

          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-background-dark/30 border border-light/5">
                <div className="i-mdi:percent text-secondary w-5 h-5 flex-shrink-0 mt-0.5"></div>
                <div>
                  <h4 className="font-medium text-white mb-1">
                    Auto Referral Program
                  </h4>
                  <p className="text-gray-400">
                    Set trading volume thresholds and automatic rebate rates
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-background-dark/30 border border-light/5">
                <div className="i-mdi:chart-line text-secondary w-5 h-5 flex-shrink-0 mt-0.5"></div>
                <div>
                  <h4 className="font-medium text-white mb-1">
                    Revenue Sharing
                  </h4>
                  <p className="text-gray-400">
                    Configure referrer and referee rebate percentages
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-background-dark/30 border border-light/5">
                <div className="i-mdi:cog text-secondary w-5 h-5 flex-shrink-0 mt-0.5"></div>
                <div>
                  <h4 className="font-medium text-white mb-1">
                    Program Management
                  </h4>
                  <p className="text-gray-400">
                    Enable/disable programs and update settings in real-time
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-background-dark/30 border border-light/5">
                <div className="i-mdi:shield-check text-secondary w-5 h-5 flex-shrink-0 mt-0.5"></div>
                <div>
                  <h4 className="font-medium text-white mb-1">
                    Secure API Access
                  </h4>
                  <p className="text-gray-400">
                    Manage settings through secure Orderly Network integration
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-background-dark/30 border border-light/5">
                <div className="i-mdi:tools text-secondary w-5 h-5 flex-shrink-0 mt-0.5"></div>
                <div>
                  <h4 className="font-medium text-white mb-1">
                    Advanced Dashboard
                  </h4>
                  <p className="text-gray-400">
                    Access to Orderly Admin Dashboard for creating custom
                    referral codes and detailed analytics
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <BackDexDashboard />
          <h1 className="text-2xl md:text-3xl font-bold gradient-text">
            Referral Settings
          </h1>
        </div>
      </div>

      <div className="space-y-6">
        {/* Orderly Key Setup Section */}
        {!hasValidKey && (
          <Card className="border border-warning/20 bg-warning/5">
            <div className="flex gap-4 items-start">
              <div className="bg-warning/20 p-2 rounded-full flex-shrink-0">
                <div className="i-mdi:key text-warning w-6 h-6"></div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-medium text-warning">
                  Orderly Key Required
                </h3>
                <p className="text-gray-300 mt-1 mb-4">
                  To manage referral settings, you need to create an Orderly key
                  that allows secure API access to the Orderly Network. This key
                  will be stored locally and used for managing your referral
                  program.
                </p>
                <Button
                  onClick={handleCreateOrderlyKey}
                  disabled={isCreatingKey}
                  className="flex items-center gap-2"
                >
                  {isCreatingKey ? (
                    <>
                      <div className="i-svg-spinners:pulse-rings-multiple w-4 h-4"></div>
                      Creating Key...
                    </>
                  ) : (
                    <>
                      <div className="i-mdi:key-plus w-4 h-4"></div>
                      Create Orderly Key
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Referral Settings Form */}
        {hasValidKey && (
          <>
            <Card>
              <h2 className="text-xl font-medium mb-4">
                Auto Referral Configuration
              </h2>
              <p className="text-gray-300 mb-6">
                Configure your automatic referral program settings. Users who
                meet the trading volume requirements will be automatically
                enrolled in your referral program.
              </p>

              {isLoadingReferralInfo ? (
                <div className="flex items-center justify-center py-8">
                  <div className="i-svg-spinners:pulse-rings-multiple w-8 h-8 text-primary"></div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Enable Toggle - Top of form */}
                  <div className="flex items-center justify-between p-4 bg-background-dark/30 rounded-lg border border-light/10">
                    <div className="flex-1 pr-4">
                      <h3 className="text-sm font-medium mb-1">
                        Auto Referral Program
                      </h3>
                      <p className="text-xs text-gray-400">
                        Enable automatic enrollment for users who meet trading
                        requirements
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsEnabled(!isEnabled)}
                      className={`relative inline-flex h-6 w-12 flex-shrink-0 items-center rounded-full transition-colors ${
                        isEnabled ? "bg-primary" : "bg-gray-600"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          isEnabled ? "translate-x-7" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>

                  {/* Form Fields */}
                  <div
                    className={`space-y-6 ${!isEnabled ? "opacity-60" : ""}`}
                  >
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Required Trading Volume (USDC)
                        </label>
                        <input
                          type="number"
                          value={requiredTradingVolume}
                          onChange={e =>
                            setRequiredTradingVolume(Number(e.target.value))
                          }
                          className="w-full px-3 py-2 rounded-lg bg-background-dark border border-light/10 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                          min="0"
                          step="1000"
                          disabled={!isEnabled}
                        />
                        <p className="text-xs text-gray-400 mt-1">
                          Minimum trading volume required to join referral
                          program
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Max Rebate (%)
                        </label>
                        <input
                          type="number"
                          value={maxRebate}
                          onChange={e =>
                            handleMaxRebateChange(Number(e.target.value))
                          }
                          className={`w-full px-3 py-2 rounded-lg bg-background-dark border text-white disabled:opacity-50 disabled:cursor-not-allowed ${
                            maxRebateError
                              ? "border-error focus:border-error"
                              : "border-light/10 focus:border-primary"
                          }`}
                          min="0"
                          max="100"
                          step="0.1"
                          disabled={!isEnabled}
                        />
                        {maxRebateError ? (
                          <p className="text-xs text-error mt-1">
                            {maxRebateError}
                          </p>
                        ) : (
                          <p className="text-xs text-gray-400 mt-1">
                            Maximum rebate percentage for participants
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Rebate Split Slider */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="text-sm font-medium text-gray-300">
                            Default referrer rebate
                          </h4>
                          <p className="text-lg font-bold">{referrerRebate}%</p>
                        </div>
                        <div className="text-right">
                          <h4 className="text-sm font-medium text-gray-300">
                            Default referee rebate
                          </h4>
                          <p className="text-lg font-bold">{refereeRebate}%</p>
                        </div>
                      </div>

                      <div className="relative">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          step={stepSize}
                          value={sliderPosition}
                          onChange={e =>
                            setSliderPosition(Number(e.target.value))
                          }
                          disabled={!isEnabled}
                          className="w-full h-2 bg-gradient-to-r from-secondary to-primary rounded-lg appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed slider"
                        />
                        <style>{`
                          .slider::-webkit-slider-thumb {
                            appearance: none;
                            width: 20px;
                            height: 20px;
                            border-radius: 50%;
                            background: #ffffff;
                            cursor: pointer;
                            border: 2px solid rgb(176, 132, 233);
                            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
                          }
                          .slider::-moz-range-thumb {
                            width: 20px;
                            height: 20px;
                            border-radius: 50%;
                            background: #ffffff;
                            cursor: pointer;
                            border: 2px solid rgb(176, 132, 233);
                            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
                          }
                        `}</style>
                      </div>

                      <p className="text-xs text-gray-400 text-center">
                        Adjust the split between referrer and referee rebates.
                        Total rebate: {maxRebate}%
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Description
                      </label>
                      <textarea
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-background-dark border border-light/10 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                        rows={3}
                        placeholder="Describe your referral program..."
                        disabled={!isEnabled}
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      onClick={handleSaveReferralSettings}
                      disabled={isSavingReferral || !!maxRebateError}
                      className="flex items-center gap-2"
                    >
                      {isSavingReferral ? (
                        <>
                          <div className="i-svg-spinners:pulse-rings-multiple w-4 h-4"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <div className="i-mdi:content-save w-4 h-4"></div>
                          Save Settings
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </Card>

            {/* Current Settings Display */}
            {referralInfo && (
              <Card>
                <h3 className="text-lg font-medium mb-4">Current Settings</h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">
                        Trading Volume Required:
                      </span>
                      <span>
                        {referralInfo.required_trading_volume.toLocaleString()}{" "}
                        USDC
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Max Rebate:</span>
                      <span>{(referralInfo.max_rebate * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Referrer Rebate:</span>
                      <span>
                        {(referralInfo.referrer_rebate * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Referee Rebate:</span>
                      <span>
                        {(referralInfo.referee_rebate * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Status:</span>
                      <span
                        className={
                          referralInfo.enable ? "text-success" : "text-warning"
                        }
                      >
                        {referralInfo.enable ? "Enabled" : "Disabled"}
                      </span>
                    </div>
                  </div>
                </div>
                {referralInfo.description && (
                  <div className="mt-4 pt-4 border-t border-light/10">
                    <span className="text-gray-400 text-sm">Description:</span>
                    <p className="text-sm mt-1">{referralInfo.description}</p>
                  </div>
                )}
              </Card>
            )}

            {/* Advanced Referral Management */}
            <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20">
              <div className="flex gap-4 items-start">
                <div className="bg-primary/20 p-3 rounded-full flex-shrink-0">
                  <div className="i-mdi:tools text-primary w-6 h-6"></div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium mb-2">
                    Advanced Referral Management
                  </h3>
                  <p className="text-gray-300 mb-4">
                    For more advanced referral features, you can use the Orderly
                    Admin Dashboard which provides additional tools for managing
                    your referral program.
                  </p>

                  <div className="bg-background-dark/50 p-4 rounded-lg border border-secondary-light/10 mb-4">
                    <h4 className="font-semibold mb-3 text-sm text-secondary-light">
                      Additional features available:
                    </h4>
                    <ul className="space-y-2 text-sm text-gray-400">
                      <li className="flex items-start gap-2">
                        <div className="i-mdi:ticket-percent text-secondary w-4 h-4 flex-shrink-0 mt-0.5"></div>
                        <span>
                          Create specific referral codes manually for targeted
                          campaigns
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="i-mdi:chart-box text-secondary w-4 h-4 flex-shrink-0 mt-0.5"></div>
                        <span>
                          Detailed analytics and performance tracking for
                          referrals
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="i-mdi:account-group text-secondary w-4 h-4 flex-shrink-0 mt-0.5"></div>
                        <span>
                          Advanced user management and referral relationship
                          tracking
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="i-mdi:cog-box text-secondary w-4 h-4 flex-shrink-0 mt-0.5"></div>
                        <span>
                          Fine-grained control over referral program parameters
                        </span>
                      </li>
                    </ul>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      variant="primary"
                      onClick={() =>
                        window.open("https://admin.orderly.network/", "_blank")
                      }
                      className="flex items-center gap-2"
                    >
                      <div className="i-mdi:open-in-new w-4 h-4"></div>
                      Open Admin Dashboard
                    </Button>

                    <Button
                      variant="secondary"
                      onClick={handleOpenAdminLogin}
                      disabled={!hasValidKey}
                      className="flex items-center gap-2"
                    >
                      <div className="i-mdi:key w-4 h-4"></div>
                      Get Login Credentials
                    </Button>
                  </div>

                  <div className="mt-3 text-xs text-gray-400 flex items-start gap-1.5">
                    <div className="i-mdi:information-outline w-4 h-4 flex-shrink-0 mt-0.5"></div>
                    <p>
                      Use the same wallet that you used to set up your DEX to
                      access your broker settings in the admin dashboard. Click
                      "Get Login Credentials" to copy the required keys and
                      account ID for login.
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
