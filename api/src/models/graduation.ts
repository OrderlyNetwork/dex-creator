import { getPrisma } from "../lib/prisma";
import { ethers } from "ethers";
import {
  ALL_CHAINS,
  ORDER_ADDRESSES,
  USDC_ADDRESSES,
  USDT_ADDRESSES,
  GRADUATION_SUPPORTED_CHAINS,
  type ChainName,
} from "../../../config";
import { getSecret } from "../lib/secretManager.js";
import { createProvider } from "../lib/fallbackProvider.js";
import {
  getBrokerFeesFromOrderlyDb,
  invalidateBrokerFeesCache,
  getBrokerTierFromOrderlyDb,
  type BrokerTier,
} from "../lib/orderlyDb";
import { type Result } from "../lib/types";

const CACHE_TTL = 60 * 1000;
let orderPriceCache: { price: number; timestamp: number } | null = null;

export async function getOrderPrice(): Promise<number | null> {
  const now = Date.now();
  if (orderPriceCache && now - orderPriceCache.timestamp < CACHE_TTL) {
    return orderPriceCache.price;
  }

  try {
    const response = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=orderly-network&vs_currencies=usd"
    );
    if (response.ok) {
      const priceData = await response.json();
      const price = priceData["orderly-network"]?.usd;
      if (price) {
        orderPriceCache = { price, timestamp: now };
        return price;
      }
    }
  } catch {
    console.warn("Failed to fetch ORDER price from CoinGecko");
  }

  return orderPriceCache?.price ?? null;
}

async function withRPCTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number = 30000,
  errorMessage: string = "RPC timeout"
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(errorMessage)), timeoutMs)
    ),
  ]);
}

export interface BrokerCreationData {
  brokerId: string;
  transactionHashes: Record<number, string>; // chainId -> txHash
}

export enum TransactionVerificationError {
  TRANSACTION_NOT_FOUND = "Transaction not found",
  TRANSACTION_FAILED = "Transaction failed",
  WRONG_SENDER = "was not sent from your wallet",
  CHAIN_NOT_SUPPORTED = "Chain not supported",
  TX_ALREADY_USED = "This transaction hash has already been used for graduation",
  INSUFFICIENT_AMOUNT = "Insufficient amount transferred",
  NO_TRANSFERS_FOUND = "No ORDER token transfers to the required address found",
  CONFIGURATION_ERROR = "Graduation fee configuration is incomplete",
}

function getOrderReceiverAddress(): Promise<string> {
  return getSecret("orderReceiverAddress");
}

const DEFAULT_MAKER_FEE = 0;
const DEFAULT_TAKER_FEE = 3;
const DEFAULT_RWA_MAKER_FEE = 0;
const DEFAULT_RWA_TAKER_FEE = 5;

const ACCEPTED_CHAINS = [
  ...GRADUATION_SUPPORTED_CHAINS.mainnet,
  ...GRADUATION_SUPPORTED_CHAINS.testnet,
];

const ERC20_TRANSFER_EVENT_ABI = [
  "event Transfer(address indexed from, address indexed to, uint256 value)",
];

export async function verifyOrderTransaction(
  txHash: string,
  chain: string,
  userWalletAddress: string,
  paymentType: "usdc" | "order" | "usdt" = "order",
  isCustom = false
): Promise<{ success: boolean; message: string; amount?: string }> {
  if (!(ACCEPTED_CHAINS as readonly string[]).includes(chain)) {
    return {
      success: false,
      message: `${TransactionVerificationError.CHAIN_NOT_SUPPORTED}. Supported chains: ${ACCEPTED_CHAINS.join(", ")}`,
    };
  }

  const prismaClient = await getPrisma();

  const existingUsedTx = await prismaClient.usedTransactionHash.findUnique({
    where: {
      txHash: txHash,
    },
  });

  if (existingUsedTx) {
    return {
      success: false,
      message: TransactionVerificationError.TX_ALREADY_USED,
    };
  }

  const TOKEN_ADDRESSES: Record<string, Record<string, string>> = {
    usdc: USDC_ADDRESSES as Record<string, string>,
    order: ORDER_ADDRESSES as Record<string, string>,
    usdt: USDT_ADDRESSES as Record<string, string>,
  };

  const tokenAddress = TOKEN_ADDRESSES[paymentType]?.[chain];

  if (!tokenAddress) {
    return {
      success: false,
      message: `No ${paymentType.toUpperCase()} token address configured for chain: ${chain}`,
    };
  }

  const receiverAddress = await getOrderReceiverAddress();

  try {
    const chainConfig = ALL_CHAINS[chain as ChainName];
    if (!chainConfig?.rpcUrl) {
      return {
        success: false,
        message: `No RPC URL configured for chain: ${chain}`,
      };
    }

    const provider = createProvider(chain as ChainName, true);

    await new Promise(resolve => setTimeout(resolve, 5_000));
    const receipt = await withRPCTimeout(
      provider.getTransactionReceipt(txHash),
      30000,
      "Transaction receipt timeout"
    );
    if (!receipt) {
      return {
        success: false,
        message: TransactionVerificationError.TRANSACTION_NOT_FOUND,
      };
    }

    if (receipt.status === 0) {
      return {
        success: false,
        message: TransactionVerificationError.TRANSACTION_FAILED,
      };
    }

    const transaction = await withRPCTimeout(
      provider.getTransaction(txHash),
      30000,
      "Transaction details timeout"
    );
    if (!transaction) {
      return {
        success: false,
        message: TransactionVerificationError.TRANSACTION_NOT_FOUND,
      };
    }

    if (transaction.from.toLowerCase() !== userWalletAddress.toLowerCase()) {
      return {
        success: false,
        message: `Transaction ${TransactionVerificationError.WRONG_SENDER}`,
      };
    }

    const iface = new ethers.Interface(ERC20_TRANSFER_EVENT_ABI);

    const orderTransferEvents = receipt.logs
      .filter(log => {
        return log.address.toLowerCase() === tokenAddress.toLowerCase();
      })
      .map(log => {
        try {
          return iface.parseLog({
            topics: log.topics as string[],
            data: log.data,
          });
        } catch {
          return null;
        }
      })
      .filter(event => event !== null);

    const validTransfers = orderTransferEvents.filter(event => {
      if (!event) return false;

      const to = event.args[1].toLowerCase();
      return to === receiverAddress.toLowerCase();
    });

    if (validTransfers.length === 0) {
      return {
        success: false,
        message: `No ${paymentType.toUpperCase()} ${TransactionVerificationError.NO_TRANSFERS_FOUND} in this transaction`,
      };
    }

    const totalTransferred = validTransfers.reduce((sum, event) => {
      if (!event) return sum;
      const amount = event.args[2];
      return sum + amount;
    }, ethers.getBigInt(0));

    let tokenDecimals = paymentType === "usdc" ? 6 : 18;
    try {
      const tokenContract = new ethers.Contract(
        tokenAddress,
        ["function decimals() view returns (uint8)"],
        provider
      );
      tokenDecimals = await withRPCTimeout(
        tokenContract.decimals(),
        15000,
        "Token decimals timeout"
      );
    } catch (error) {
      console.warn(
        `Could not read decimals for token ${tokenAddress}, using default 18:`,
        error
      );
    }

    const totalTransferredDecimal = ethers.formatUnits(
      totalTransferred,
      tokenDecimals
    );

    const graduationFeeAmount = isCustom
      ? process.env.GRADUATION_USDC_AMOUNT_CUSTOM
      : process.env.GRADUATION_USDC_AMOUNT;

    if (!graduationFeeAmount) {
      return {
        success: false,
        message: TransactionVerificationError.CONFIGURATION_ERROR,
      };
    }

    const transferredAmount = parseFloat(totalTransferredDecimal);
    const requiredFeeUsd = parseFloat(graduationFeeAmount);

    if (paymentType === "order") {
      const currentPrice = await getOrderPrice();
      if (currentPrice && transferredAmount * currentPrice < requiredFeeUsd) {
        return {
          success: false,
          message: `${TransactionVerificationError.INSUFFICIENT_AMOUNT}. Required: $${requiredFeeUsd} USD worth of ORDER, Received: ~$${(transferredAmount * currentPrice).toFixed(2)} (${totalTransferredDecimal} ORDER)`,
          amount: totalTransferredDecimal,
        };
      }
    } else {
      if (transferredAmount < requiredFeeUsd) {
        return {
          success: false,
          message: `${TransactionVerificationError.INSUFFICIENT_AMOUNT}. Required: ${requiredFeeUsd} ${paymentType.toUpperCase()}, Received: ${totalTransferredDecimal} ${paymentType.toUpperCase()}`,
          amount: totalTransferredDecimal,
        };
      }
    }

    return {
      success: true,
      message: `Successfully verified ${paymentType.toUpperCase()} transfer of ${totalTransferredDecimal}`,
      amount: totalTransferredDecimal,
    };
  } catch (error) {
    console.error("Error verifying ORDER transaction:", error);
    return {
      success: false,
      message: `Error verifying transaction: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

export async function getDexFees(userId: string): Promise<
  | {
      success: true;
      makerFee: number;
      takerFee: number;
      rwaMakerFee: number;
      rwaTakerFee: number;
    }
  | { success: false; message: string }
> {
  try {
    const prismaClient = await getPrisma();
    const dex = await prismaClient.dex.findFirst({
      where: { userId },
    });

    if (!dex) {
      return {
        success: false,
        message: "DEX not found",
      };
    }

    if (!dex.brokerId || dex.brokerId === "demo") {
      return {
        success: true,
        makerFee: DEFAULT_MAKER_FEE,
        takerFee: DEFAULT_TAKER_FEE,
        rwaMakerFee: DEFAULT_RWA_MAKER_FEE,
        rwaTakerFee: DEFAULT_RWA_TAKER_FEE,
      };
    }

    const result = await getBrokerFeesFromOrderlyDb(dex.brokerId);

    if (!result.success) {
      console.error(
        `Failed to fetch fees from Orderly DB for broker ${dex.brokerId}: ${result.error}`
      );
      return {
        success: true,
        makerFee: DEFAULT_MAKER_FEE,
        takerFee: DEFAULT_TAKER_FEE,
        rwaMakerFee: DEFAULT_RWA_MAKER_FEE,
        rwaTakerFee: DEFAULT_RWA_TAKER_FEE,
      };
    }

    return {
      success: true,
      makerFee: result.data.makerFee,
      takerFee: result.data.takerFee,
      rwaMakerFee: result.data.rwaMakerFee,
      rwaTakerFee: result.data.rwaTakerFee,
    };
  } catch (error) {
    console.error("Error getting DEX fees:", error);
    return {
      success: false,
      message: `Error getting DEX fees: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

export async function getDexBrokerTier(
  userId: string
): Promise<Result<BrokerTier>> {
  try {
    const prismaClient = await getPrisma();
    const dex = await prismaClient.dex.findFirst({
      where: { userId },
    });

    if (!dex) {
      return {
        success: false,
        error: "DEX not found",
      };
    }

    if (!dex.brokerId || dex.brokerId === "demo") {
      return {
        success: false,
        error: "No broker tier available for demo brokers",
      };
    }

    const result = await getBrokerTierFromOrderlyDb(dex.brokerId);

    if (!result.success) {
      console.error(
        `Failed to fetch tier from Orderly DB for broker ${dex.brokerId}: ${result.error}`
      );

      return {
        success: true,
        data: {
          tier: "PUBLIC",
          stakingVolume: "0",
          tradingVolume: "0",
          makerFeeRate: "0",
          takerFeeRate: "3",
          logDate: new Date().toISOString().split("T")[0],
        },
      };
    }

    return {
      success: true,
      data: result.data,
    };
  } catch (error) {
    console.error("Error getting broker tier:", error);
    return {
      success: false,
      error: `Error getting broker tier: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

export async function invalidateDexFeesCache(
  userId: string
): Promise<Result<{ message: string }>> {
  try {
    const prismaClient = await getPrisma();
    const dex = await prismaClient.dex.findFirst({
      where: { userId },
    });

    if (!dex) {
      return {
        success: false,
        error: "DEX not found",
      };
    }

    if (!dex.brokerId || dex.brokerId === "demo") {
      return {
        success: false,
        error: "Cannot invalidate cache for demo brokers",
      };
    }

    invalidateBrokerFeesCache(dex.brokerId);

    return {
      success: true,
      data: {
        message: "Fee cache invalidated successfully",
      },
    };
  } catch (error) {
    console.error("Error invalidating fee cache:", error);
    return {
      success: false,
      error: `Error invalidating fee cache: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}
