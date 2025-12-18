import React from "react";
import ConfirmDialog from "../../components/ConfirmDialog";
import { Button } from "../../../../../components/Button";
import { Tooltip } from "@orderly.network/ui";
import { SwapIcon } from "../../icons";
import { WalletIcon, TokenIcon, ChainIcon } from "../../components";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@radix-ui/react-dropdown-menu";
import { cn } from "../../utils";

export interface RevenueWithdrawModalUIProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  availableBalance: number;
  fee: number;
  selectedChainId: number | null;
  chains: Array<{
    chain_id: number;
    name: string;
    display_name?: string;
  }>;
  onChainChange: (chainId: number) => void;
  walletAddress: string;
  walletName?: string;
  isLoadingBalance: boolean;
  quantity: string;
  onQuantityChange: (value: string) => void;
  confirmDisabled: boolean;
  onMaxClick: () => void;
  showQty: string;
  minAmountWarningMessage: string | null;
}

const RevenueWithdrawModalUI: React.FC<RevenueWithdrawModalUIProps> = ({
  open,
  onClose,
  onConfirm,
  availableBalance,
  fee,
  selectedChainId,
  chains,
  onChainChange,
  walletAddress,
  walletName,
  isLoadingBalance,
  quantity,
  onQuantityChange,
  confirmDisabled,
  onMaxClick,
  showQty,
  minAmountWarningMessage,
}) => {
  const selectedChain = chains.find(
    chain => chain.chain_id === selectedChainId
  );
  const selectedChainLabel =
    selectedChain?.display_name || selectedChain?.name || "Select network";
  const formattedBalance = availableBalance.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={isOpen => {
        if (!isOpen) {
          onClose();
        }
      }}
      title="Withdraw: distributor's balance"
      onOk={() => {
        if (!confirmDisabled) {
          onConfirm();
        }
      }}
      onCancel={onClose}
      okText="Withdraw"
      cancelText="Cancel"
      contentClassName="max-w-[480px]"
      confirmDisable={confirmDisabled}
      footer={
        <div className="flex gap-2.5 w-full">
          <button
            onClick={onClose}
            className="flex-1 h-10 px-5 rounded-full text-sm font-medium border border-base-contrast-12 text-base-contrast-54 hover:text-base-contrast hover:border-base-contrast transition-colors inline-flex items-center justify-center"
          >
            Cancel
          </button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              if (!confirmDisabled) {
                onConfirm();
              }
            }}
            disabled={confirmDisabled}
            className="flex-1 h-10 justify-center"
          >
            Withdraw
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-5">
        {/* Quantity Input Section */}
        <div className="flex flex-col gap-2.5">
          <Tooltip
            open={!!minAmountWarningMessage}
            content={minAmountWarningMessage || ""}
            side="top"
            align="center"
            arrow={{
              className: "!fill-danger",
            }}
            className="max-w-[348px] px-3 !bg-danger py-2 rounded-lg text-xs text-white"
            sideOffset={8}
          >
            <div
              className={cn(
                "w-full flex h-14 items-center gap-2 px-4 py-5 rounded-lg border bg-base-700",
                minAmountWarningMessage
                  ? "border-danger"
                  : "border-base-contrast-12"
              )}
            >
              <span className="shrink-0 text-sm font-medium leading-[1.25em] text-base-contrast-54">
                Quantity
              </span>
              <input
                type="text"
                inputMode="numeric"
                value={quantity}
                onChange={e => {
                  const value = e.target.value;
                  if (value === "" || /^\d*\.?\d*$/.test(value)) {
                    onQuantityChange(value);
                  }
                }}
                placeholder="0"
                className="flex-1 bg-transparent text-base-contrast text-sm font-medium leading-[1.2em] outline-none border-none text-right placeholder:text-base-contrast-36"
              />
              <div className="flex items-center gap-1 shrink-0">
                <TokenIcon name="USDC" size="sm" />
                <span className="text-sm font-medium text-base-contrast-80">
                  USDC
                </span>
              </div>
            </div>
          </Tooltip>
          <div className="flex items-center justify-start">
            <div className="flex items-center gap-2 text-xs font-medium text-base-contrast-36">
              <span>Available:</span>
              {isLoadingBalance ? (
                <span>Loading...</span>
              ) : (
                <>
                  <span>{formattedBalance}</span>
                  <span>USDC</span>
                  <button
                    className="text-purple-light hover:text-purple-light/80 transition-colors"
                    onClick={onMaxClick}
                  >
                    Max
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-base-contrast-12" />

        {/* Wallet and Network Section */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-base-contrast-36">
              Wallet
            </span>
            <div className="flex items-center gap-1">
              {walletName ? (
                <WalletIcon name={walletName} size="xs" />
              ) : (
                <div className="w-3.5 h-3.5 rounded-full bg-purple-fallback border border-base-contrast-12 flex items-center justify-center" />
              )}
              <span className="text-xs font-medium text-base-contrast-80">
                {walletAddress
                  ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
                  : "--"}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-0.5">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="w-full h-14 px-4 py-5 rounded-lg border border-base-contrast-12 bg-base-700 text-base-contrast-80 flex items-center justify-between focus:outline-none"
                >
                  <div className="flex flex-col gap-0.5 items-start">
                    <span className="text-xs font-medium text-base-contrast-54 leading-[18px]">
                      Network
                    </span>
                    <div className="flex items-center gap-1 text-sm font-medium text-base-contrast-80">
                      {selectedChainId ? (
                        <ChainIcon
                          chainId={selectedChainId}
                          size="sm"
                          alt={selectedChainLabel}
                          className="w-[18px] h-[18px]"
                        />
                      ) : (
                        <div className="w-[18px] h-[18px] rounded-full bg-purple-fallback border border-base-contrast-12 flex items-center justify-center" />
                      )}
                      <span>{selectedChainLabel}</span>
                    </div>
                  </div>
                  <SwapIcon className="w-[10px] h-[9px]" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                side="bottom"
                sideOffset={0}
                className="w-[var(--radix-dropdown-menu-trigger-width)] border border-base-contrast-12 rounded-xl shadow-lg z-[150]"
                style={{
                  backgroundColor: "rgb(15, 17, 35)",
                }}
              >
                {chains.map((chain, index) => {
                  const isActive = chain.chain_id === selectedChainId;
                  return (
                    <DropdownMenuItem
                      key={chain.chain_id}
                      className={cn(
                        "h-[30px] px-4 py-2 text-sm text-base-contrast-80 transition-colors flex items-center justify-between",
                        index !== 0 && "mt-0.5",
                        "hover:bg-base-6 rounded-sm focus:bg-base-6"
                      )}
                      onSelect={() => onChainChange(chain.chain_id)}
                    >
                      <div className="flex items-center gap-1 min-w-0">
                        <ChainIcon
                          chainId={chain.chain_id}
                          size="sm"
                          alt={chain.display_name || chain.name}
                          className="w-[18px] h-[18px]"
                        />
                        <span className="truncate">
                          {chain.display_name || chain.name}
                        </span>
                      </div>
                      {isActive && (
                        <div className="w-1 h-1 rounded-full shrink-0 bg-[linear-gradient(270deg,#59B0FE_0%,#26FEFE_100%)]" />
                      )}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="w-full flex h-14 items-center gap-2 px-4 py-5 rounded-lg border border-base-contrast-12 bg-base-700">
            <span className="shrink-0 text-sm font-medium leading-[1.25em] text-base-contrast-54">
              Quantity
            </span>
            <span className="flex-1 bg-transparent text-base-contrast text-sm font-medium leading-[1.2em] text-right">
              {showQty || "0"}
            </span>
            <div className="flex items-center gap-1 shrink-0">
              <TokenIcon name="USDC" size="sm" />
              <span className="text-sm font-medium text-base-contrast-80">
                USDC
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-start">
          <span className="text-xs font-medium text-base-contrast-36">
            Fee ≈ <span className="text-base-contrast-80">{fee}</span> USDC
          </span>
        </div>
      </div>
    </ConfirmDialog>
  );
};

export default RevenueWithdrawModalUI;
