import { useEffect, useState, ChangeEvent } from "react";

// Export the fee constants for use in other components
export const MIN_MAKER_FEE = 0;
export const MIN_TAKER_FEE = 3;
export const MAX_FEE = 15;

interface FeeConfigWithCalculatorProps {
  makerFee: number;
  takerFee: number;
  readOnly?: boolean;
  defaultOpenCalculator?: boolean;
  onMakerFeeChange?: (value: number) => void;
  onTakerFeeChange?: (value: number) => void;
  makerFeeError?: string | null;
  takerFeeError?: string | null;
}

export const FeeConfigWithCalculator: React.FC<
  FeeConfigWithCalculatorProps
> = ({
  makerFee: initialMakerFee,
  takerFee: initialTakerFee,
  readOnly = false,
  defaultOpenCalculator = false,
  onMakerFeeChange,
  onTakerFeeChange,
  makerFeeError,
  takerFeeError,
}) => {
  // State for fee configuration
  const [showFeeConfig, setShowFeeConfig] = useState(false);
  const [makerFee, setMakerFee] = useState<number>(initialMakerFee);
  const [takerFee, setTakerFee] = useState<number>(initialTakerFee);

  const [showCalculator, setShowCalculator] = useState(defaultOpenCalculator);
  const [tradingVolume, setTradingVolume] = useState(10000000);

  useEffect(() => {
    setMakerFee(initialMakerFee);
  }, [initialMakerFee]);

  useEffect(() => {
    setTakerFee(initialTakerFee);
  }, [initialTakerFee]);

  const handleMakerFeeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setMakerFee(value);
    if (onMakerFeeChange) {
      onMakerFeeChange(value);
    }
  };

  const handleTakerFeeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setTakerFee(value);
    if (onTakerFeeChange) {
      onTakerFeeChange(value);
    }
  };

  // Revenue calculator functions
  const calculateRevenue = (
    volume: number,
    makerFee: number,
    takerFee: number
  ) => {
    // Assuming 50/50 split between maker and taker volume
    const makerVolume = volume * 0.5;
    const takerVolume = volume * 0.5;

    // Convert bps to percentage (100 bps = 1%)
    const makerFeePercent = makerFee / 10000;
    const takerFeePercent = takerFee / 10000;

    // Calculate revenue
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

  // Calculate revenue based on current fees
  const { makerRevenue, takerRevenue, totalRevenue } = calculateRevenue(
    tradingVolume,
    makerFee,
    takerFee
  );

  // Fixed fee note message to display in all cases
  const feeNoteMessage = readOnly
    ? "Fees are set during graduation and cannot be changed later without contacting support."
    : "These fees will be set permanently when you graduate your DEX and can only be changed later by contacting support.";

  return (
    <div className="space-y-6">
      {/* Fee Configuration Section */}
      <div className="bg-light/5 rounded-lg p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Fee Configuration</h3>
          {!readOnly && (
            <button
              type="button"
              onClick={() => setShowFeeConfig(!showFeeConfig)}
              className="text-primary-light hover:text-primary flex items-center gap-1 text-sm"
            >
              {showFeeConfig ? "Hide" : "Configure"}
              <div
                className={`i-mdi:chevron-right w-4 h-4 transition-transform ${showFeeConfig ? "rotate-90" : ""}`}
              ></div>
            </button>
          )}
        </div>

        {showFeeConfig ? (
          <form>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label
                    htmlFor="makerFee"
                    className="block text-sm font-medium mb-1"
                  >
                    Maker Fee (bps)
                  </label>
                  <div className="flex items-center">
                    <input
                      type="number"
                      id="makerFee"
                      min={MIN_MAKER_FEE}
                      max={MAX_FEE}
                      step="1"
                      value={makerFee}
                      onChange={handleMakerFeeChange}
                      className={`w-full px-3 py-2 bg-background-dark border ${makerFeeError ? "border-error" : "border-light/10"} rounded-lg`}
                    />
                    <span className="ml-2 text-gray-400 text-sm">
                      bps (0.01%)
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Minimum: {MIN_MAKER_FEE} bps (0.00%), Maximum: {MAX_FEE} bps
                    ({(MAX_FEE * 0.01).toFixed(2)}%)
                  </p>
                  {makerFeeError && (
                    <p className="text-xs text-error mt-1">{makerFeeError}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="takerFee"
                    className="block text-sm font-medium mb-1"
                  >
                    Taker Fee (bps)
                  </label>
                  <div className="flex items-center">
                    <input
                      type="number"
                      id="takerFee"
                      min={MIN_TAKER_FEE}
                      max={MAX_FEE}
                      step="1"
                      value={takerFee}
                      onChange={handleTakerFeeChange}
                      className={`w-full px-3 py-2 bg-background-dark border ${takerFeeError ? "border-error" : "border-light/10"} rounded-lg`}
                    />
                    <span className="ml-2 text-gray-400 text-sm">
                      bps (0.01%)
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Minimum: {MIN_TAKER_FEE} bps (0.03%), Maximum: {MAX_FEE} bps
                    ({(MAX_FEE * 0.01).toFixed(2)}%)
                  </p>
                  {takerFeeError && (
                    <p className="text-xs text-error mt-1">{takerFeeError}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm bg-info/10 rounded p-3 mb-4">
                <div className="i-mdi:information-outline text-info w-5 h-5 flex-shrink-0"></div>
                <p>
                  Setting competitive fees can attract more traders to your DEX.
                  The fee split you receive will be based on the fees your
                  traders pay.
                </p>
              </div>
            </div>
          </form>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-300">
                {readOnly ? "Current Fee Structure" : "Current Fee Structure:"}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-background-dark/50 p-3 rounded">
                <div className="text-sm text-gray-400">Maker Fee</div>
                <div className="text-xl font-semibold">
                  {makerFee}{" "}
                  <span className="text-sm font-normal text-gray-400">bps</span>
                </div>
                <div className="text-xs text-gray-400">
                  ({(makerFee * 0.01).toFixed(2)}%)
                </div>
              </div>
              <div className="bg-background-dark/50 p-3 rounded">
                <div className="text-sm text-gray-400">Taker Fee</div>
                <div className="text-xl font-semibold">
                  {takerFee}{" "}
                  <span className="text-sm font-normal text-gray-400">bps</span>
                </div>
                <div className="text-xs text-gray-400">
                  ({(takerFee * 0.01).toFixed(2)}%)
                </div>
              </div>
            </div>

            {/* Fee Note - built into the component now */}
            <div className="mt-4 bg-info/10 rounded-lg p-3 flex items-start gap-2 text-xs">
              <div className="i-mdi:information-outline text-info w-4 h-4 flex-shrink-0 mt-0.5"></div>
              <p className="text-gray-300">{feeNoteMessage}</p>
            </div>

            <div className="mt-4 bg-info/10 rounded-lg p-3 flex items-start gap-2 text-xs">
              <div className="i-mdi:information-outline text-info w-4 h-4 flex-shrink-0 mt-0.5"></div>
              <p className="text-gray-300">
                <span className="font-medium">Note:</span> These are your custom
                fees. Traders will pay these fees{" "}
                <span className="italic">plus</span> the Orderly base fee (3.00
                bps taker for Public tier). You earn revenue from your custom
                fees only. Upgrade your tier through the{" "}
                <a
                  href="https://app.orderly.network/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-light hover:underline"
                >
                  Builder Staking Programme
                </a>{" "}
                to reduce the base fee.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Revenue Calculator */}
      <div className="border-t border-light/10 pt-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold flex items-center">
            <div className="i-mdi:calculator mr-2 h-5 w-5 text-success"></div>
            Revenue Calculator
          </h3>
          <button
            type="button"
            onClick={() => setShowCalculator(!showCalculator)}
            className="text-primary-light hover:text-primary flex items-center gap-1 text-sm"
          >
            {showCalculator ? "Hide Calculator" : "Show Calculator"}
            <div
              className={`i-mdi:chevron-right w-4 h-4 transition-transform ${showCalculator ? "rotate-90" : ""}`}
            ></div>
          </button>
        </div>

        {showCalculator && (
          <div className="bg-light/5 rounded-lg p-4">
            <div className="mb-4">
              <label
                htmlFor="tradingVolume"
                className="block text-sm font-medium mb-1"
              >
                Monthly Trading Volume (USD)
              </label>
              <div className="flex items-center">
                <input
                  type="number"
                  id="tradingVolume"
                  min="1000"
                  step="1000"
                  value={tradingVolume}
                  onChange={handleVolumeChange}
                  className="w-full px-3 py-2 bg-background-dark border border-light/10 rounded-lg"
                />
                <span className="ml-2 text-gray-400 text-sm">USD</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Enter your expected monthly trading volume
              </p>
            </div>

            <div className="bg-background-dark/50 p-4 rounded-lg space-y-4">
              <h4 className="text-md font-semibold">
                Monthly Revenue Estimate
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-background-dark/80 p-3 rounded">
                  <div className="text-sm text-gray-400">Maker Revenue</div>
                  <div className="text-lg font-semibold">
                    {formatCurrency(makerRevenue)}
                  </div>
                  <div className="text-xs text-gray-400">
                    from {makerFee} bps fee
                  </div>
                </div>

                <div className="bg-background-dark/80 p-3 rounded">
                  <div className="text-sm text-gray-400">Taker Revenue</div>
                  <div className="text-lg font-semibold">
                    {formatCurrency(takerRevenue)}
                  </div>
                  <div className="text-xs text-gray-400">
                    from {takerFee} bps fee
                  </div>
                </div>

                <div className="bg-primary/10 p-3 rounded">
                  <div className="text-sm text-primary-light">
                    Total Revenue
                  </div>
                  <div className="text-lg font-semibold text-primary">
                    {formatCurrency(totalRevenue)}
                  </div>
                  <div className="text-xs text-primary-light/80">
                    on {formatCurrency(tradingVolume)} volume
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-start gap-2 text-xs">
                <div className="i-mdi:information-outline text-info w-4 h-4 flex-shrink-0 mt-0.5"></div>
                <p className="text-gray-300">
                  This calculation assumes an equal split between maker and
                  taker volume. Actual revenue may vary based on market
                  conditions, trading patterns, and fee changes. You only earn
                  revenue from your custom fees, not from the Orderly base fees.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
