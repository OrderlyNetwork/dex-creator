import { useEffect, useState, FormEvent, ChangeEvent } from "react";
import { Button } from "./Button";
import { toast } from "react-toastify";
import { useOrderlyKey } from "../context/OrderlyKeyContext";
import { updateBrokerFees } from "../utils/orderly";
import { useModal } from "../context/ModalContext";
import { post } from "../utils/apiClient";
import { useAuth } from "../context/useAuth";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";
import { i18n, Trans, useTranslation } from "~/i18n";

const MIN_MAKER_FEE = 0;
const MIN_TAKER_FEE = 3;
const MAX_FEE = 15;
const MIN_RWA_MAKER_FEE = 0;
const MIN_RWA_TAKER_FEE = 0;
const MAX_RWA_FEE = 15;

interface FeeConfigWithCalculatorProps {
  makerFee: number;
  takerFee: number;
  rwaMakerFee?: number;
  rwaTakerFee?: number;
  readOnly?: boolean;
  isSavingFees?: boolean;
  onFeesChange?: (
    makerFee: number,
    takerFee: number,
    rwaMakerFee?: number,
    rwaTakerFee?: number
  ) => void;
  feeError?: string | null;
  defaultOpenCalculator?: boolean;
  showSaveButton?: boolean;
  alwaysShowConfig?: boolean;
  useOrderlyApi?: boolean;
  brokerId?: string;
}

const formatNumber = (value: number, maxDecimals: number = 1) => {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: maxDecimals,
  }).format(value);
};

export const FeeConfigWithCalculator: React.FC<
  FeeConfigWithCalculatorProps
> = ({
  makerFee: initialMakerFee,
  takerFee: initialTakerFee,
  rwaMakerFee: initialRwaMakerFee = 0,
  rwaTakerFee: initialRwaTakerFee = 5,
  readOnly = false,
  isSavingFees = false,
  onFeesChange,
  defaultOpenCalculator = false,
  showSaveButton = true,
  alwaysShowConfig = false,
  useOrderlyApi = false,
  brokerId,
}) => {
  const { t } = useTranslation();
  const { orderlyKey, accountId, hasValidKey, setOrderlyKey } = useOrderlyKey();
  const { openModal } = useModal();
  const { token } = useAuth();
  const [isUpdatingFees, setIsUpdatingFees] = useState(false);
  const [showFeeConfig, setShowFeeConfig] = useState(alwaysShowConfig);
  const [makerFee, setMakerFee] = useState<number>(initialMakerFee);
  const [takerFee, setTakerFee] = useState<number>(initialTakerFee);
  const [rwaMakerFee, setRwaMakerFee] = useState<number>(initialRwaMakerFee);
  const [rwaTakerFee, setRwaTakerFee] = useState<number>(initialRwaTakerFee);
  const [makerFeeError, setMakerFeeError] = useState<string | null>(null);
  const [takerFeeError, setTakerFeeError] = useState<string | null>(null);
  const [rwaMakerFeeError, setRwaMakerFeeError] = useState<string | null>(null);
  const [rwaTakerFeeError, setRwaTakerFeeError] = useState<string | null>(null);
  const [feeError, setFeeError] = useState<string | null>(null);

  const [showCalculator, setShowCalculator] = useState(defaultOpenCalculator);
  const [tradingVolume, setTradingVolume] = useState(10000000);
  const [selectedTier, setSelectedTier] = useState<
    "public" | "silver" | "gold" | "platinum" | "diamond"
  >("public");

  useEffect(() => {
    setMakerFee(initialMakerFee);
    setTakerFee(initialTakerFee);
    setRwaMakerFee(initialRwaMakerFee);
    setRwaTakerFee(initialRwaTakerFee);
  }, [
    initialMakerFee,
    initialTakerFee,
    initialRwaMakerFee,
    initialRwaTakerFee,
  ]);

  const validateFees = (
    type: "maker" | "taker" | "rwaMaker" | "rwaTaker",
    value: number
  ) => {
    if (type === "maker") {
      if (value < MIN_MAKER_FEE) {
        setMakerFeeError(
          `${i18n.t("feeConfigWithCalculator.makerFeeMin", { min: MIN_MAKER_FEE })} bps`
        );
        return false;
      } else if (value > MAX_FEE) {
        setMakerFeeError(
          `${i18n.t("feeConfigWithCalculator.makerFeeMax", { max: MAX_FEE })} bps`
        );
        return false;
      } else {
        setMakerFeeError(null);
        return true;
      }
    } else if (type === "taker") {
      if (value < MIN_TAKER_FEE) {
        setTakerFeeError(
          `${i18n.t("feeConfigWithCalculator.takerFeeMin", { min: MIN_TAKER_FEE })} bps`
        );
        return false;
      } else if (value > MAX_FEE) {
        setTakerFeeError(
          `${i18n.t("feeConfigWithCalculator.takerFeeMax", { max: MAX_FEE })} bps`
        );
        return false;
      } else {
        setTakerFeeError(null);
        return true;
      }
    } else if (type === "rwaMaker") {
      if (value < MIN_RWA_MAKER_FEE) {
        setRwaMakerFeeError(
          `${i18n.t("feeConfigWithCalculator.rwaMakerFeeMin", {
            min: MIN_RWA_MAKER_FEE,
          })} bps`
        );
        return false;
      } else if (value > MAX_RWA_FEE) {
        setRwaMakerFeeError(
          `${i18n.t("feeConfigWithCalculator.rwaMakerFeeMax", {
            max: MAX_RWA_FEE,
          })} bps`
        );
        return false;
      } else {
        setRwaMakerFeeError(null);
        return true;
      }
    } else {
      if (value < MIN_RWA_TAKER_FEE) {
        setRwaTakerFeeError(
          `${i18n.t("feeConfigWithCalculator.rwaTakerFeeMin", {
            min: MIN_RWA_TAKER_FEE,
          })} bps`
        );
        return false;
      } else if (value > MAX_RWA_FEE) {
        setRwaTakerFeeError(
          `${i18n.t("feeConfigWithCalculator.rwaTakerFeeMax", {
            max: MAX_RWA_FEE,
          })} bps`
        );
        return false;
      } else {
        setRwaTakerFeeError(null);
        return true;
      }
    }
  };

  const handleMakerFeeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    if (value === "") {
      setMakerFee(0);
      setMakerFeeError(null);
      return;
    }

    const bpsValue = parseFloat(value);
    if (isNaN(bpsValue)) {
      return;
    }

    if (value.includes(".") && value.split(".")[1].length > 1) {
      setMakerFeeError(t("feeConfigWithCalculator.oneDecimalPlace"));
      return;
    }

    setMakerFee(bpsValue);
    validateFees("maker", bpsValue);

    if (onFeesChange) {
      onFeesChange(bpsValue, takerFee, rwaMakerFee, rwaTakerFee);
    }
  };

  const handleTakerFeeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    if (value === "") {
      setTakerFee(0);
      setTakerFeeError(null);
      return;
    }

    const bpsValue = parseFloat(value);
    if (isNaN(bpsValue)) {
      return;
    }

    if (value.includes(".") && value.split(".")[1].length > 1) {
      setTakerFeeError(t("feeConfigWithCalculator.oneDecimalPlace65"));
      return;
    }

    setTakerFee(bpsValue);
    validateFees("taker", bpsValue);

    if (onFeesChange) {
      onFeesChange(makerFee, bpsValue, rwaMakerFee, rwaTakerFee);
    }
  };

  const handleMakerFeeBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "") {
      setMakerFee(0);
      setMakerFeeError(null);
      return;
    }

    const bpsValue = parseFloat(value);
    if (isNaN(bpsValue)) {
      return;
    }

    if (!(value.includes(".") && value.split(".")[1].length > 1)) {
      setMakerFee(bpsValue);
      validateFees("maker", bpsValue);
    }
  };

  const handleTakerFeeBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "") {
      setTakerFee(0);
      setTakerFeeError(null);
      return;
    }

    const bpsValue = parseFloat(value);
    if (isNaN(bpsValue)) {
      return;
    }

    if (!(value.includes(".") && value.split(".")[1].length > 1)) {
      setTakerFee(bpsValue);
      validateFees("taker", bpsValue);
    }
  };

  const handleRwaMakerFeeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    if (value === "") {
      setRwaMakerFee(0);
      setRwaMakerFeeError(null);
      return;
    }

    const bpsValue = parseFloat(value);
    if (isNaN(bpsValue)) {
      return;
    }

    if (value.includes(".") && value.split(".")[1].length > 1) {
      setRwaMakerFeeError(t("feeConfigWithCalculator.oneDecimalPlace"));
      return;
    }

    setRwaMakerFee(bpsValue);
    validateFees("rwaMaker", bpsValue);

    if (onFeesChange) {
      onFeesChange(makerFee, takerFee, bpsValue, rwaTakerFee);
    }
  };

  const handleRwaTakerFeeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    if (value === "") {
      setRwaTakerFee(0);
      setRwaTakerFeeError(null);
      return;
    }

    const bpsValue = parseFloat(value);
    if (isNaN(bpsValue)) {
      return;
    }

    if (value.includes(".") && value.split(".")[1].length > 1) {
      setRwaTakerFeeError(t("feeConfigWithCalculator.oneDecimalPlace50"));
      return;
    }

    setRwaTakerFee(bpsValue);
    validateFees("rwaTaker", bpsValue);

    if (onFeesChange) {
      onFeesChange(makerFee, takerFee, rwaMakerFee, bpsValue);
    }
  };

  const handleRwaMakerFeeBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "") {
      setRwaMakerFee(0);
      setRwaMakerFeeError(null);
      return;
    }

    const bpsValue = parseFloat(value);
    if (isNaN(bpsValue)) {
      return;
    }

    if (!(value.includes(".") && value.split(".")[1].length > 1)) {
      setRwaMakerFee(bpsValue);
      validateFees("rwaMaker", bpsValue);
    }
  };

  const handleRwaTakerFeeBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "") {
      setRwaTakerFee(0);
      setRwaTakerFeeError(null);
      return;
    }

    const bpsValue = parseFloat(value);
    if (isNaN(bpsValue)) {
      return;
    }

    if (!(value.includes(".") && value.split(".")[1].length > 1)) {
      setRwaTakerFee(bpsValue);
      validateFees("rwaTaker", bpsValue);
    }
  };

  const handleSaveFees = async (e: FormEvent) => {
    e.preventDefault();
    setFeeError(null);

    if (
      makerFeeError ||
      takerFeeError ||
      rwaMakerFeeError ||
      rwaTakerFeeError
    ) {
      setFeeError(t("feeConfigWithCalculator.correctErrors"));
      return;
    }

    const isMakerValid = validateFees("maker", makerFee);
    const isTakerValid = validateFees("taker", takerFee);
    const isRwaMakerValid = validateFees("rwaMaker", rwaMakerFee);
    const isRwaTakerValid = validateFees("rwaTaker", rwaTakerFee);

    if (
      !isMakerValid ||
      !isTakerValid ||
      !isRwaMakerValid ||
      !isRwaTakerValid
    ) {
      setFeeError(t("feeConfigWithCalculator.feeValuesOutsideRange"));
      return;
    }

    if (useOrderlyApi) {
      if (!hasValidKey || !orderlyKey || !accountId) {
        toast.error(t("feeConfigWithCalculator.orderlyKeyRequired"));
        return;
      }

      setIsUpdatingFees(true);

      try {
        const makerFeeRate = makerFee / 10_000;
        const takerFeeRate = takerFee / 10_000;
        const rwaMakerFeeRate = rwaMakerFee / 10_000;
        const rwaTakerFeeRate = rwaTakerFee / 10_000;

        await updateBrokerFees(
          accountId,
          orderlyKey,
          makerFeeRate,
          takerFeeRate,
          rwaMakerFeeRate,
          rwaTakerFeeRate
        );
        toast.success(t("feeConfigWithCalculator.feesUpdatedSuccess"));

        try {
          await post("api/graduation/fees/invalidate-cache", {}, token);
        } catch (error) {
          console.error("Error invalidating fee cache:", error);
        }

        if (onFeesChange) {
          onFeesChange(makerFee, takerFee, rwaMakerFee, rwaTakerFee);
        }
      } catch (error) {
        console.error("Error updating fees:", error);
        toast.error(
          error instanceof Error
            ? error.message
            : t("feeConfigWithCalculator.failedToUpdateFees")
        );
      } finally {
        setIsUpdatingFees(false);
      }
    }
  };

  const tierBaseFees = {
    public: { maker: 0, taker: 3.0 },
    silver: { maker: 0, taker: 2.75 },
    gold: { maker: 0, taker: 2.5 },
    platinum: { maker: 0, taker: 2.0 },
    diamond: { maker: 0, taker: 1.0 },
  };

  const tierInfo = {
    public: {
      name: i18n.t("feeConfigWithCalculator.tier.public"),
      requirement: i18n.t("feeConfigWithCalculator.tier.publicRequirement"),
      fee: "3.00 bps",
    },
    silver: {
      name: i18n.t("feeConfigWithCalculator.tier.silver"),
      requirement: i18n.t("feeConfigWithCalculator.tier.silverRequirement"),
      fee: "2.75 bps",
    },
    gold: {
      name: i18n.t("feeConfigWithCalculator.tier.gold"),
      requirement: i18n.t("feeConfigWithCalculator.tier.goldRequirement"),
      fee: "2.50 bps",
    },
    platinum: {
      name: i18n.t("feeConfigWithCalculator.tier.platinum"),
      requirement: i18n.t("feeConfigWithCalculator.tier.platinumRequirement"),
      fee: "2.00 bps",
    },
    diamond: {
      name: i18n.t("feeConfigWithCalculator.tier.diamond"),
      requirement: i18n.t("feeConfigWithCalculator.tier.diamondRequirement"),
      fee: "1.00 bps",
    },
  };

  const calculateRevenue = (
    volume: number,
    makerFee: number,
    takerFee: number,
    tier: keyof typeof tierBaseFees = selectedTier
  ) => {
    const BASE_MAKER_FEE = tierBaseFees[tier].maker;
    const BASE_TAKER_FEE = tierBaseFees[tier].taker;

    const actualMakerFee = Math.max(0, makerFee - BASE_MAKER_FEE);
    const actualTakerFee = Math.max(0, takerFee - BASE_TAKER_FEE);

    const makerVolume = volume * 0.5;
    const takerVolume = volume * 0.5;

    const makerFeePercent = actualMakerFee / 10000;
    const takerFeePercent = actualTakerFee / 10000;

    const makerRevenue = makerVolume * makerFeePercent;
    const takerRevenue = takerVolume * takerFeePercent;

    return {
      makerRevenue,
      takerRevenue,
      totalRevenue: makerRevenue + takerRevenue,
    };
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setTradingVolume(isNaN(value) ? 0 : value);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 1,
      compactDisplay: "short",
      notation: "compact",
    }).format(amount);
  };

  const { makerRevenue, takerRevenue, totalRevenue } = calculateRevenue(
    tradingVolume,
    makerFee,
    takerFee,
    selectedTier
  );

  const handleTierChange = (value: keyof typeof tierBaseFees) => {
    setSelectedTier(value);
  };

  return (
    <div className="space-y-6">
      {/* Fee Configuration Section */}
      <div className="bg-light/5 rounded-lg p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">
            {t("feeConfigWithCalculator.feeConfiguration")}
          </h3>
          {!readOnly && !alwaysShowConfig && (
            <button
              type="button"
              onClick={() => setShowFeeConfig(!showFeeConfig)}
              className="text-primary-light hover:text-primary flex items-center gap-1 text-sm"
            >
              {showFeeConfig
                ? t("feeConfigWithCalculator.hide")
                : t("feeConfigWithCalculator.configure")}
              <div
                className={`i-mdi:chevron-right w-4 h-4 transition-transform ${showFeeConfig ? "rotate-90" : ""}`}
              ></div>
            </button>
          )}
        </div>

        {!readOnly && (showFeeConfig || alwaysShowConfig) ? (
          <form onSubmit={handleSaveFees} className="slide-fade-in">
            <div className="mb-4">
              <p className="text-sm text-gray-300 mb-4">
                {t("feeConfigWithCalculator.feeConfigDesc")}
              </p>

              <div className="bg-warning/10 rounded-lg p-3 mb-4">
                <div className="text-sm flex items-start gap-2">
                  <span className="i-mdi:alert-circle text-warning w-5 h-5 flex-shrink-0 mt-0.5"></span>
                  <span>
                    <Trans
                      i18nKey="feeConfigWithCalculator.importantFeeNoteBlock"
                      components={[
                        <span key="0" className="font-medium text-warning" />,
                        <span key="1" className="underline" />,
                        <span key="2" className="font-medium" />,
                      ]}
                    />
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label
                    htmlFor="makerFee"
                    className="block text-sm font-bold mb-1"
                  >
                    {t("feeConfigWithCalculator.makerFeeLabel")} (bps)
                  </label>
                  <div className="flex items-center">
                    <input
                      type="number"
                      id="makerFee"
                      value={makerFee}
                      onChange={handleMakerFeeChange}
                      onBlur={handleMakerFeeBlur}
                      step="0.1"
                      min="0"
                      max="50"
                      className={`w-full px-3 py-2 bg-background-dark border ${makerFeeError ? "border-error" : "border-light/10"} rounded-lg`}
                      placeholder="0.0"
                    />
                    <span className="ml-2 text-gray-400 text-sm">
                      bps (0.01%)
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {t("feeConfigWithCalculator.feeRange", {
                      min: MIN_MAKER_FEE,
                      minPercent: (MIN_MAKER_FEE * 0.01).toFixed(2),
                      max: MAX_FEE,
                      maxPercent: (MAX_FEE * 0.01).toFixed(2),
                      unit: "bps",
                    })}
                  </p>
                  {makerFeeError && (
                    <p className="text-xs text-error mt-1">{makerFeeError}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="takerFee"
                    className="block text-sm font-bold mb-1"
                  >
                    {t("feeConfigWithCalculator.takerFeeLabel")} (bps)
                  </label>
                  <div className="flex items-center">
                    <input
                      type="number"
                      id="takerFee"
                      value={takerFee}
                      onChange={handleTakerFeeChange}
                      onBlur={handleTakerFeeBlur}
                      step="0.1"
                      min="0"
                      max="50"
                      className={`w-full px-3 py-2 bg-background-dark border ${takerFeeError ? "border-error" : "border-light/10"} rounded-lg`}
                      placeholder="0.0"
                    />
                    <span className="ml-2 text-gray-400 text-sm">
                      bps (0.01%)
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {t("feeConfigWithCalculator.feeRange", {
                      min: MIN_TAKER_FEE,
                      minPercent: (MIN_TAKER_FEE * 0.01).toFixed(2),
                      max: MAX_FEE,
                      maxPercent: (MAX_FEE * 0.01).toFixed(2),
                      unit: "bps",
                    })}
                  </p>
                  {takerFeeError && (
                    <p className="text-xs text-error mt-1">{takerFeeError}</p>
                  )}
                </div>
              </div>

              <div className="mb-4">
                <h4 className="text-sm font-semibold mb-2 text-gray-200">
                  {t("feeConfigWithCalculator.rwaAssetFees")}
                </h4>
                <p className="text-xs text-gray-400 mb-3">
                  {t("feeConfigWithCalculator.rwaAssetFeesDesc")}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="rwaMakerFee"
                      className="block text-sm font-bold mb-1"
                    >
                      {t("feeConfigWithCalculator.rwaMakerFeeLabel")} (bps)
                    </label>
                    <div className="flex items-center">
                      <input
                        type="number"
                        id="rwaMakerFee"
                        value={rwaMakerFee}
                        onChange={handleRwaMakerFeeChange}
                        onBlur={handleRwaMakerFeeBlur}
                        step="0.1"
                        min="0"
                        max="50"
                        className={`w-full px-3 py-2 bg-background-dark border ${rwaMakerFeeError ? "border-error" : "border-light/10"} rounded-lg`}
                        placeholder="0.0"
                      />
                      <span className="ml-2 text-gray-400 text-sm">
                        bps (0.01%)
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      {t("feeConfigWithCalculator.feeRange", {
                        min: MIN_RWA_MAKER_FEE,
                        minPercent: (MIN_RWA_MAKER_FEE * 0.01).toFixed(2),
                        max: MAX_RWA_FEE,
                        maxPercent: (MAX_RWA_FEE * 0.01).toFixed(2),
                        unit: "bps",
                      })}
                    </p>
                    {rwaMakerFeeError && (
                      <p className="text-xs text-error mt-1">
                        {rwaMakerFeeError}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="rwaTakerFee"
                      className="block text-sm font-bold mb-1"
                    >
                      {t("feeConfigWithCalculator.rwaTakerFeeLabel")} (bps)
                    </label>
                    <div className="flex items-center">
                      <input
                        type="number"
                        id="rwaTakerFee"
                        value={rwaTakerFee}
                        onChange={handleRwaTakerFeeChange}
                        onBlur={handleRwaTakerFeeBlur}
                        step="0.1"
                        min="0"
                        max="50"
                        className={`w-full px-3 py-2 bg-background-dark border ${rwaTakerFeeError ? "border-error" : "border-light/10"} rounded-lg`}
                        placeholder="0.0"
                      />
                      <span className="ml-2 text-gray-400 text-sm">
                        bps (0.01%)
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      {t("feeConfigWithCalculator.feeRange", {
                        min: MIN_RWA_TAKER_FEE,
                        minPercent: (MIN_RWA_TAKER_FEE * 0.01).toFixed(2),
                        max: MAX_RWA_FEE,
                        maxPercent: (MAX_RWA_FEE * 0.01).toFixed(2),
                        unit: "bps",
                      })}
                    </p>
                    {rwaTakerFeeError && (
                      <p className="text-xs text-error mt-1">
                        {rwaTakerFeeError}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {feeError && (
                <div className="mb-4 text-error text-sm">{feeError}</div>
              )}

              <div className="flex items-center gap-2 text-sm bg-info/10 rounded p-3 mb-4">
                <span className="i-mdi:information-outline text-info w-5 h-5 flex-shrink-0"></span>
                <span>
                  {t("feeConfigWithCalculator.settingCompetitiveFees")}
                </span>
              </div>

              {!readOnly && showSaveButton && (
                <>
                  {useOrderlyApi && !hasValidKey && (
                    <div className="bg-warning/10 border border-warning/20 rounded-lg p-3 mb-4">
                      <div className="flex items-start gap-2">
                        <div className="i-mdi:key text-warning w-5 h-5 mt-0.5 flex-shrink-0"></div>
                        <div className="flex-1">
                          <h4 className="text-warning font-medium text-sm mb-1">
                            {t(
                              "feeConfigWithCalculator.orderlyKeyRequiredTitle"
                            )}
                          </h4>
                          <p className="text-xs text-gray-400 mb-2">
                            {t(
                              "feeConfigWithCalculator.orderlyKeyRequiredDesc"
                            )}
                          </p>
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() =>
                              openModal("orderlyKeyLogin", {
                                onSuccess: (newKey: Uint8Array) => {
                                  setOrderlyKey(newKey);
                                },
                                onCancel: () => {},
                                brokerId: brokerId,
                                accountId: accountId,
                              })
                            }
                            className="flex items-center gap-2"
                          >
                            <div className="i-mdi:key-plus w-4 h-4"></div>
                            {t("feeConfigWithCalculator.createOrderlyKey")}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  <Button
                    type="submit"
                    variant="primary"
                    isLoading={isSavingFees || isUpdatingFees}
                    loadingText={t("feeConfigWithCalculator.saving")}
                    className="w-full"
                    disabled={
                      !!makerFeeError ||
                      !!takerFeeError ||
                      !!rwaMakerFeeError ||
                      !!rwaTakerFeeError ||
                      (useOrderlyApi && !hasValidKey)
                    }
                  >
                    {t("feeConfigWithCalculator.saveFeeConfiguration")}
                  </Button>
                </>
              )}
            </div>
          </form>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-300">
                {readOnly
                  ? t("feeConfigWithCalculator.currentFeeStructure")
                  : t("feeConfigWithCalculator.currentFeeStructureColon")}
              </span>
            </div>
            <div className="mb-3">
              <div className="text-xs font-semibold text-gray-400 mb-2">
                {t("feeConfigWithCalculator.standardFees")}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-background-dark/50 p-3 rounded">
                  <div className="text-sm text-gray-400">
                    {t("feeConfigWithCalculator.makerFee")}
                  </div>
                  <div className="text-xl font-semibold">
                    {formatNumber(makerFee)}{" "}
                    <span className="text-sm font-normal text-gray-400">
                      bps
                    </span>
                  </div>
                  <div className="text-xs text-gray-400">
                    ({formatNumber(makerFee * 0.01, 3)}%)
                  </div>
                </div>
                <div className="bg-background-dark/50 p-3 rounded">
                  <div className="text-sm text-gray-400">
                    {t("feeConfigWithCalculator.takerFee")}
                  </div>
                  <div className="text-xl font-semibold">
                    {formatNumber(takerFee)}{" "}
                    <span className="text-sm font-normal text-gray-400">
                      bps
                    </span>
                  </div>
                  <div className="text-xs text-gray-400">
                    ({formatNumber(takerFee * 0.01, 3)}%)
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="text-xs font-semibold text-gray-400 mb-2">
                {t("feeConfigWithCalculator.rwaAssetFees")}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-background-dark/50 p-3 rounded">
                  <div className="text-sm text-gray-400">
                    {t("feeConfigWithCalculator.rwaMakerFee")}
                  </div>
                  <div className="text-xl font-semibold">
                    {formatNumber(rwaMakerFee)}{" "}
                    <span className="text-sm font-normal text-gray-400">
                      bps
                    </span>
                  </div>
                  <div className="text-xs text-gray-400">
                    ({formatNumber(rwaMakerFee * 0.01, 3)}%)
                  </div>
                </div>
                <div className="bg-background-dark/50 p-3 rounded">
                  <div className="text-sm text-gray-400">
                    {t("feeConfigWithCalculator.rwaTakerFee")}
                  </div>
                  <div className="text-xl font-semibold">
                    {formatNumber(rwaTakerFee)}{" "}
                    <span className="text-sm font-normal text-gray-400">
                      bps
                    </span>
                  </div>
                  <div className="text-xs text-gray-400">
                    ({formatNumber(rwaTakerFee * 0.01, 3)}%)
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 bg-info/10 rounded-lg p-3 flex items-start gap-2 text-xs">
              <span className="i-mdi:information-outline text-info w-4 h-4 flex-shrink-0 mt-0.5"></span>
              <span className="text-gray-300">
                <Trans
                  i18nKey="feeConfigWithCalculator.noteTotalFeesTrans"
                  components={[
                    <span key="0" className="font-medium" />,
                    <a
                      key="1"
                      href="https://app.orderly.network/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-light hover:underline"
                    />,
                  ]}
                />
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Revenue Calculator */}
      <div className="border-t border-light/10 pt-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold flex items-center">
            <span className="i-mdi:calculator mr-2 h-5 w-5 text-success"></span>
            {t("feeConfigWithCalculator.revenueCalculator")}
          </h3>
          <button
            type="button"
            onClick={() => setShowCalculator(!showCalculator)}
            className="text-primary-light hover:text-primary flex items-center gap-1 text-sm"
          >
            {showCalculator
              ? t("feeConfigWithCalculator.hideCalculator")
              : t("feeConfigWithCalculator.showCalculator")}
            <span
              className={`i-mdi:chevron-right w-4 h-4 transition-transform ${showCalculator ? "rotate-90" : ""}`}
            ></span>
          </button>
        </div>

        {showCalculator && (
          <div className="bg-light/5 rounded-lg p-4 mb-4 slide-fade-in">
            <p className="text-sm text-gray-300 mb-4">
              {t("feeConfigWithCalculator.estimateRevenueDesc")}
            </p>

            <div className="grid grid-cols-1 gap-4 mb-4">
              <div>
                <label
                  htmlFor="tradingVolume"
                  className="block text-sm font-bold mb-1"
                >
                  {t("feeConfigWithCalculator.monthlyVolume")}
                </label>
                <div className="flex items-center">
                  <span className="bg-background-dark border-r border-light/10 px-3 py-2 rounded-l-lg text-gray-400">
                    $
                  </span>
                  <input
                    type="number"
                    id="tradingVolume"
                    min="0"
                    step="1000"
                    value={tradingVolume}
                    onChange={handleVolumeChange}
                    className="w-full px-3 py-2 bg-background-dark border border-light/10 rounded-r-lg"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {t("feeConfigWithCalculator.enterVolume")}
                </p>
              </div>

              <div>
                <label
                  htmlFor="tierSelect"
                  className="block text-sm font-bold mb-1"
                >
                  {t("feeConfigWithCalculator.builderStakingTier")}
                </label>
                {/* <select
                  id="tierSelect"
                  value={selectedTier}
                  onChange={e =>
                    handleTierChange(
                      e.target.value as keyof typeof tierBaseFees
                    )
                  }
                  className="w-full h-[42px] px-3 py-2 bg-background-dark border border-light/10 rounded-lg"
                >
                  {Object.entries(tierInfo).map(([key, info]) => (
                    <option key={key} value={key}>
                      {info.name} ({info.fee})
                    </option>
                  ))}
                </select> */}
                <Select value={selectedTier} onValueChange={handleTierChange}>
                  <SelectTrigger className="w-full h-[42px] px-3 py-5 bg-background-dark border border-light/10 rounded-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(tierInfo).map(([key, info]) => (
                      <SelectItem
                        key={key}
                        value={key}
                        // className={selectedTier === key ? "bg-primary/10" : ""}
                      >
                        {info.name} ({info.fee})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-400 mt-1">
                  {tierInfo[selectedTier].requirement}
                </p>
              </div>
            </div>

            <div className="bg-success/5 rounded-lg p-4 mb-4">
              <h4 className="text-sm font-semibold mb-3 text-gray-200">
                {t("feeConfigWithCalculator.estimatedRevenue")}
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-background-dark/50 p-3 rounded">
                  <div className="text-sm text-gray-400">
                    {t("feeConfigWithCalculator.makerRevenue")}
                  </div>
                  <div className="text-xl font-semibold text-success">
                    {formatCurrency(makerRevenue)}
                  </div>
                  <div className="text-xs text-gray-400">
                    (
                    {formatNumber(
                      Math.max(0, makerFee - tierBaseFees[selectedTier].maker)
                    )}{" "}
                    bps {t("feeConfigWithCalculator.afterBaseFee")})
                  </div>
                </div>

                <div className="bg-background-dark/50 p-3 rounded">
                  <div className="text-sm text-gray-400">
                    {t("feeConfigWithCalculator.takerRevenue")}
                  </div>
                  <div className="text-xl font-semibold text-success">
                    {formatCurrency(takerRevenue)}
                  </div>
                  <div className="text-xs text-gray-400">
                    (
                    {formatNumber(
                      Math.max(0, takerFee - tierBaseFees[selectedTier].taker)
                    )}{" "}
                    bps {t("feeConfigWithCalculator.afterBaseFee")})
                  </div>
                </div>

                <div className="bg-success/10 p-3 rounded">
                  <div className="text-sm text-gray-300">
                    {t("feeConfigWithCalculator.totalRevenue")}
                  </div>
                  <div className="text-xl font-semibold text-success">
                    {formatCurrency(totalRevenue)}
                  </div>
                  <div className="text-xs text-gray-300">
                    {t("feeConfigWithCalculator.perMonth")}
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-start gap-2 text-xs">
                <span className="i-mdi:information-outline text-info w-4 h-4 flex-shrink-0 mt-0.5"></span>
                <span className="text-gray-300">
                  {t("feeConfigWithCalculator.calculationNote", {
                    makerBps: tierBaseFees[selectedTier].maker,
                    takerBps: tierBaseFees[selectedTier].taker,
                    tierName: tierInfo[selectedTier].name,
                  })}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
