import React, { useEffect, useMemo, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "@radix-ui/react-dropdown-menu";
import clsx from "clsx";
import { useChainId, useSwitchChain } from "wagmi";
import { isMainnet } from "../net";

export type TChain = {
  name: string;
  public_rpc_url: string;
  chain_id: string;
  currency_symbol: string;
  currency_decimal: number;
  explorer_base_url: string;
  vault_address: string;
};

export const MainnetChains: TChain[] = [
  {
    name: "Ethereum",
    public_rpc_url: "https://ethereum-rpc.publicnode.com",
    chain_id: "1",
    currency_symbol: "ETH",
    currency_decimal: 18,
    explorer_base_url: "https://etherscan.io/",
    vault_address: "0x816f722424b49cf1275cc86da9840fbd5a6167e9",
  },
  {
    name: "Arbitrum",
    public_rpc_url: "https://arb1.arbitrum.io/rpc",
    chain_id: "42161",
    currency_symbol: "ETH",
    currency_decimal: 18,
    explorer_base_url: "https://arbiscan.io",
    vault_address: "0x816f722424B49Cf1275cc86DA9840Fbd5a6167e9",
  },
  {
    name: "Base",
    public_rpc_url: "https://base-rpc.publicnode.com",
    chain_id: "8453",
    currency_symbol: "ETH",
    currency_decimal: 18,
    explorer_base_url: "https://basescan.org/",
    vault_address: "0x816f722424b49cf1275cc86da9840fbd5a6167e9",
  },
];

export const TestnetChains: TChain[] = [
  {
    name: "Sepolia",
    public_rpc_url: "https://ethereum-sepolia-rpc.publicnode.com",
    chain_id: "11155111",
    currency_symbol: "ETH",
    currency_decimal: 18,
    explorer_base_url: "https://sepolia.etherscan.io/",
    vault_address: "0x0EaC556c0C2321BA25b9DC01e4e3c95aD5CDCd2f",
  },
  {
    name: "Arbitrum Sepolia",
    public_rpc_url: "https://arbitrum-sepolia.gateway.tenderly.co",
    chain_id: "421614",
    currency_symbol: "ETH",
    currency_decimal: 18,
    explorer_base_url: "https://sepolia.arbiscan.io",
    vault_address: "0x0EaC556c0C2321BA25b9DC01e4e3c95aD5CDCd2f",
  },
  {
    name: "Base Sepolia",
    public_rpc_url: "https://base-sepolia-rpc.publicnode.com",
    chain_id: "84532",
    currency_symbol: "ETH",
    currency_decimal: 18,
    explorer_base_url: "https://base-sepolia.blockscout.com/",
    vault_address: "0xdc7348975aE9334DbdcB944DDa9163Ba8406a0ec",
  },
];

type ChainsSelectProps = {
  className?: string;
};

export const ChainsSelect: React.FC<ChainsSelectProps> = props => {
  const [open, setOpen] = useState(false);
  const [currentChainId, setCurrentChainId] = useState(
    parseInt(MainnetChains[0].chain_id)
  );

  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  const chains = useMemo(() => {
    return [...MainnetChains, ...(isMainnet() ? [] : TestnetChains)];
  }, []);

  useEffect(() => {
    setCurrentChainId(chainId);
  }, [chainId]);

  const onChangeChain = async (chain: TChain) => {
    setCurrentChainId(parseInt(chain.chain_id));
    switchChain({ chainId: parseInt(chain.chain_id) });
  };

  return (
    <div className="select-none">
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger>
          {currentChainId && (
            <div
              className={clsx(
                "flex items-center justify-center cursor-pointer",
                "w-[80px] h-[40px] md:w-[80px] md:h-[40px] pl-2",
                "border border-[rgba(255,255,255,0.12)]",
                "bg-transparent hover:bg-[rgba(255,255,255,0.08)] rounded-full",
                props.className
              )}
            >
              <ChainIcon chainId={currentChainId} />
              <DropdownIcon
                className={clsx(
                  "w-[24px] h-[24px] md:w-[24px] md:h-[24px]",
                  "text-white ml-1",
                  "transition-all duration-300",
                  open ? "rotate-180" : "rotate-0"
                )}
              />
            </div>
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className={clsx(
            "bg-background-light backdrop-blur-[25px] max-h-[200px] overflow-auto orderly-scrollbar",
            "p-2 md:p-4",
            "w-[180px] md:w-[225px]",
            "mt-[8px] rounded-[8px]"
          )}
          onCloseAutoFocus={e => e.preventDefault()}
          align="start"
        >
          {chains?.map(chain => {
            return (
              <ChainItem
                key={chain.chain_id}
                chain={chain}
                onClick={() => onChangeChain(chain)}
                selected={currentChainId === parseInt(chain.chain_id)}
              />
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

const ChainIcon: React.FC<{
  className?: string;
  chainId: number;
}> = props => {
  return (
    <img
      className={clsx(
        "w-[24px] h-[24px] md:w-[24px] md:h-[24px] rounded-full",
        props.className
      )}
      src={`https://oss.orderly.network/static/network_logo/${props.chainId}.png`}
    />
  );
};

type ChainItemProps = {
  chain: TChain;
  selected: boolean;
  onClick: () => void;
};

const ChainItem: React.FC<ChainItemProps> = props => {
  const { chain } = props;
  return (
    <div
      className="flex justify-between items-center p-[8px] hover:bg-[rgba(255,255,255,0.08)] rounded-[8px] cursor-pointer "
      onClick={props.onClick}
    >
      <div className="flex items-center">
        <img
          className="w-[16px] h-[16px] md:w-[24px] md:h-[24px]"
          src={`https://oss.orderly.network/static/network_logo/${chain.chain_id}.png`}
          alt={chain.name}
        />
        <div className="text-xs md:text-sm leading-[18px] text-primary-54 ml-[8px]">
          {chain.name}
        </div>
      </div>

      {props.selected && (
        <CircleCheckedIcon className="text-primary-light w-[20px] h-[20px] md:w-[20px] md:h-[20px]" />
      )}
    </div>
  );
};

const CircleCheckedIcon: React.FC<{ className: string }> = props => {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <mask
        id="mask0_1691_14938"
        style={{ maskType: "alpha" }}
        maskUnits="userSpaceOnUse"
        x="0"
        y="0"
        width="20"
        height="20"
      >
        <rect width="20" height="20" fill="#D9D9D9" />
      </mask>
      <g mask="url(#mask0_1691_14938)">
        <path d="M8.9375 13L13.8958 8.0625L12.8333 7L8.9375 10.875L7.16667 9.125L6.10417 10.1875L8.9375 13ZM10 18C8.90278 18 7.86806 17.7917 6.89583 17.375C5.92361 16.9583 5.07292 16.3854 4.34375 15.6562C3.61458 14.9271 3.04167 14.0764 2.625 13.1042C2.20833 12.1319 2 11.0972 2 10C2 8.88889 2.20833 7.85069 2.625 6.88542C3.04167 5.92014 3.61458 5.07292 4.34375 4.34375C5.07292 3.61458 5.92361 3.04167 6.89583 2.625C7.86806 2.20833 8.90278 2 10 2C11.1111 2 12.1493 2.20833 13.1146 2.625C14.0799 3.04167 14.9271 3.61458 15.6562 4.34375C16.3854 5.07292 16.9583 5.92014 17.375 6.88542C17.7917 7.85069 18 8.88889 18 10C18 11.0972 17.7917 12.1319 17.375 13.1042C16.9583 14.0764 16.3854 14.9271 15.6562 15.6562C14.9271 16.3854 14.0799 16.9583 13.1146 17.375C12.1493 17.7917 11.1111 18 10 18Z" />
      </g>
    </svg>
  );
};

const DropdownIcon: React.FC<{ className: string }> = props => {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <mask
        id="mask0_747_38605"
        style={{ maskType: "alpha" }}
        maskUnits="userSpaceOnUse"
        x="0"
        y="0"
        width="24"
        height="24"
      >
        <rect width="24" height="24" />
      </mask>
      <g mask="url(#mask0_747_38605)">
        <path d="M12.0001 14.4001L7.2001 9.6001H16.8001L12.0001 14.4001Z" />
      </g>
    </svg>
  );
};
