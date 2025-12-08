import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import {
  verifyOrderTransaction,
  getDexFees,
  getDexBrokerTier,
  invalidateDexFeesCache,
} from "../models/graduation";
import { getUserDex, convertDexToDexConfig } from "../models/dex";
import { getPrisma } from "../lib/prisma";
import { setupRepositoryWithSingleCommit } from "../lib/github.js";
import {
  updateBrokerAdminAccountId,
  getAdminAccountIdFromOrderlyDb,
} from "../lib/orderlyDb.js";
import { getOrderlyApiBaseUrl, getAccountId } from "../utils/orderly.js";
import { getSecret } from "../lib/secretManager.js";
import { ALL_CHAINS, ChainName } from "../../../config";
import { createBroker } from "../lib/createBroker";

let orderPriceCache: { price: number; timestamp: number } | null = null;
const CACHE_TTL = 60 * 1000;

const verifyTxSchema = z.object({
  txHash: z.string().min(10).max(100),
  chain: z.string().min(1).max(50),
  chainId: z.number().int(),
  chain_type: z.enum(["EVM", "SOL"]).default("EVM"),
  brokerId: z
    .string()
    .min(5, "Broker ID must be at least 5 characters")
    .max(15, "Broker ID cannot exceed 15 characters")
    .regex(
      /^[a-z0-9_-]+$/,
      "Broker ID must contain only lowercase letters, numbers, hyphens, and underscores"
    )
    .refine(
      value => !value.includes("orderly"),
      "Broker ID cannot contain 'orderly'"
    ),
  makerFee: z.number().min(0).max(150), // 0-15 bps in 0.1 bps units
  takerFee: z.number().min(30).max(150), // 3-15 bps in 0.1 bps units
  rwaMakerFee: z.number().min(0).max(150), // 0-15 bps in 0.1 bps units
  rwaTakerFee: z.number().min(0).max(150), // 3-15 bps in 0.1 bps units
  paymentType: z.enum(["usdc", "order"]).default("order"),
});

const finalizeAdminWalletSchema = z.object({
  multisigAddress: z.string().optional(),
  multisigChainId: z.number().optional(),
});

const graduationRoutes = new Hono();

graduationRoutes.post(
  "/verify-tx",
  zValidator("json", verifyTxSchema),
  async c => {
    try {
      const {
        txHash,
        chain,
        chainId,
        chain_type,
        brokerId,
        makerFee,
        takerFee,
        rwaMakerFee,
        rwaTakerFee,
        paymentType,
      } = c.req.valid("json");

      const userId = c.get("userId");

      const dex = await getUserDex(userId);
      if (!dex || !dex.repoUrl) {
        return c.json(
          { success: false, message: "You must create a DEX first" },
          { status: 400 }
        );
      }

      const prismaClient = await getPrisma();
      const user = await prismaClient.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return c.json(
          { success: false, message: "User not found" },
          { status: 404 }
        );
      }

      if (dex.brokerId && dex.brokerId !== "demo") {
        return c.json(
          {
            success: false,
            message:
              "You have already graduated. Each user can only graduate once.",
          },
          { status: 400 }
        );
      }

      const verificationResult = await verifyOrderTransaction(
        txHash,
        chain,
        user.address,
        paymentType
      );

      if (!verificationResult.success) {
        return c.json(verificationResult, { status: 400 });
      }

      const existingDex = await prismaClient.dex.findFirst({
        where: {
          brokerId: brokerId,
        },
      });

      if (existingDex) {
        return c.json(
          {
            success: false,
            message:
              "This broker ID is already taken. Please choose another one.",
          },
          { status: 400 }
        );
      }

      const brokerCreationResult = await createBroker({
        broker_id: brokerId,
        broker_name: dex.brokerName,
        chain_id: chainId,
        chain_type,
        address: user.address,
        default_maker_fee_rate: makerFee,
        default_taker_fee_rate: takerFee,
        default_rwa_maker_fee_rate: rwaMakerFee,
        default_rwa_taker_fee_rate: rwaTakerFee,
      });

      if (!brokerCreationResult.success) {
        return c.json(brokerCreationResult, { status: 400 });
      }

      try {
        const updatedDex = await prismaClient.dex.update({
          where: { userId },
          data: {
            brokerId,
            isGraduated: false,
            graduationTxHash: txHash,
          },
        });

        await prismaClient.usedTransactionHash.create({
          data: {
            txHash,
            userId,
            dexId: updatedDex.id,
            chainId: ALL_CHAINS[chain as ChainName]?.chainId,
          },
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        if (
          error.code === "P2002" &&
          error.meta?.target?.includes("graduationTxHash")
        ) {
          return c.json(
            {
              success: false,
              message:
                "This transaction hash has already been used for graduation. Please use a different transaction.",
            },
            { status: 400 }
          );
        }
        if (error.code === "P2002" && error.meta?.target?.includes("txHash")) {
          return c.json(
            {
              success: false,
              message:
                "This transaction hash has already been used for graduation. Please use a different transaction.",
            },
            { status: 400 }
          );
        }
        throw error;
      }

      try {
        console.log(
          `🔄 Updating GitHub repository with new broker ID: ${brokerId}`
        );

        const repoUrlMatch = dex.repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
        if (repoUrlMatch) {
          const [, owner, repo] = repoUrlMatch;

          const dexConfig = convertDexToDexConfig(dex);
          dexConfig.brokerId = brokerId;

          await setupRepositoryWithSingleCommit(
            owner,
            repo,
            dexConfig,
            {
              primaryLogo: dex.primaryLogo,
              secondaryLogo: dex.secondaryLogo,
              favicon: dex.favicon,
              pnlPosters: dex.pnlPosters.length > 0 ? dex.pnlPosters : null,
            },
            dex.customDomain,
            user.address
          );

          console.log(
            `✅ Successfully updated GitHub repository with broker ID: ${brokerId}`
          );
        } else {
          console.warn(
            `⚠️ Could not extract repository info from URL: ${dex.repoUrl}`
          );
        }
      } catch (repoError) {
        console.error("❌ Error updating GitHub repository:", repoError);
      }

      return c.json({
        success: true,
        message: `Transaction verified and broker ID '${brokerId}' created successfully! Your DEX has graduated automatically.`,
        amount: verificationResult.amount,
        brokerCreationData: {
          brokerId,
          transactionHashes: brokerCreationResult.transactionHashes || {},
        },
      });
    } catch (error) {
      console.error("Error in graduation verification:", error);
      return c.json(
        {
          success: false,
          message: `Error processing request: ${error instanceof Error ? error.message : String(error)}`,
        },
        { status: 500 }
      );
    }
  }
);

graduationRoutes.get("/status", async c => {
  try {
    const userId = c.get("userId");

    const dex = await getUserDex(userId);
    if (!dex) {
      return c.json(
        { success: false, message: "You must create a DEX first" },
        { status: 400 }
      );
    }

    return c.json({
      success: true,
      currentBrokerId: dex.brokerId,
      approved: dex.brokerId !== "demo" && dex.brokerId === dex.brokerId,
    });
  } catch (error) {
    console.error("Error getting graduation status:", error);
    return c.json(
      {
        success: false,
        message: `Error getting status: ${error instanceof Error ? error.message : String(error)}`,
      },
      { status: 500 }
    );
  }
});

graduationRoutes.get("/fees", async c => {
  try {
    const userId = c.get("userId");

    const result = await getDexFees(userId);

    if (result.success) {
      return c.json(result);
    } else {
      return c.json(
        {
          success: false,
          message: result.message,
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error getting DEX fees:", error);
    return c.json(
      {
        success: false,
        message: `Error getting DEX fees: ${error instanceof Error ? error.message : String(error)}`,
      },
      { status: 500 }
    );
  }
});

graduationRoutes.get("/tier", async c => {
  try {
    const userId = c.get("userId");

    const result = await getDexBrokerTier(userId);

    if (result.success) {
      return c.json(result.data);
    } else {
      return c.json(
        {
          message: result.error,
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error getting broker tier:", error);
    return c.json(
      {
        message: `Error getting broker tier: ${error instanceof Error ? error.message : String(error)}`,
      },
      { status: 500 }
    );
  }
});

graduationRoutes.post("/fees/invalidate-cache", async c => {
  try {
    const userId = c.get("userId");

    const result = await invalidateDexFeesCache(userId);

    if (result.success) {
      return c.json(result.data);
    } else {
      return c.json({ message: result.error }, { status: 400 });
    }
  } catch (error) {
    console.error("Error invalidating fee cache:", error);
    return c.json(
      {
        message: `Error invalidating fee cache: ${error instanceof Error ? error.message : String(error)}`,
      },
      { status: 500 }
    );
  }
});

graduationRoutes.post(
  "/finalize-admin-wallet",
  zValidator("json", finalizeAdminWalletSchema),
  async c => {
    try {
      const userId = c.get("userId");

      const dex = await getUserDex(userId);
      if (!dex) {
        return c.json(
          { success: false, message: "You must create a DEX first" },
          { status: 400 }
        );
      }

      if (!dex.brokerId || dex.brokerId === "demo") {
        return c.json(
          { success: false, message: "You must have a broker ID first" },
          { status: 400 }
        );
      }

      const prismaClient = await getPrisma();
      const user = await prismaClient.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return c.json(
          { success: false, message: "User not found" },
          { status: 404 }
        );
      }

      const { multisigAddress, multisigChainId } = c.req.valid("json");
      const addressToCheck = multisigAddress || user.address;

      const orderlyResponse = await fetch(
        `${getOrderlyApiBaseUrl()}/v1/get_account?address=${addressToCheck}&broker_id=${dex.brokerId}`
      );

      if (!orderlyResponse.ok) {
        return c.json(
          {
            success: false,
            message: "Failed to check registration status with Orderly API",
          },
          { status: 400 }
        );
      }

      const orderlyData = await orderlyResponse.json();

      if (!orderlyData.success || !orderlyData.data) {
        return c.json(
          {
            success: false,
            message: "You must register your EVM address with Orderly first",
          },
          { status: 400 }
        );
      }

      try {
        const adminAccountId = orderlyData.data.account_id;
        console.log(
          `🔄 Updating admin account ID for broker ${dex.brokerId} to ${adminAccountId}`
        );

        const updateResult = await updateBrokerAdminAccountId(
          dex.brokerId,
          adminAccountId
        );

        if (updateResult.success) {
          console.log(
            `✅ Successfully updated admin account ID for broker ${dex.brokerId}`
          );
        } else {
          console.warn(
            `⚠️ Failed to update admin account ID for broker ${dex.brokerId}: ${updateResult.error}`
          );
        }
      } catch (orderlyDbError) {
        console.error(
          `❌ Error updating admin account ID for broker ${dex.brokerId}:`,
          orderlyDbError
        );
      }

      await prismaClient.dex.update({
        where: { userId },
        data: {
          isGraduated: true,
          multisigChainId: multisigChainId || null,
        },
      });

      return c.json({
        success: true,
        message:
          "Admin wallet setup completed successfully. Your DEX has graduated!",
        isGraduated: true,
      });
    } catch (error) {
      console.error("Error finalizing admin wallet:", error);
      return c.json(
        {
          success: false,
          message: `Error finalizing admin wallet: ${error instanceof Error ? error.message : String(error)}`,
        },
        { status: 500 }
      );
    }
  }
);

graduationRoutes.get("/graduation-status", async c => {
  try {
    const userId = c.get("userId");

    const dex = await getUserDex(userId);
    if (!dex) {
      return c.json(
        { success: false, message: "You must create a DEX first" },
        { status: 400 }
      );
    }

    const prismaClient = await getPrisma();
    const user = await prismaClient.user.findUnique({
      where: { id: userId },
    });

    let isMultisig = false;
    let multisigAddress: string | null = null;

    if (user && dex.isGraduated && dex.brokerId) {
      try {
        const adminResult = await getAdminAccountIdFromOrderlyDb(dex.brokerId);

        if (adminResult.success && adminResult.data.adminAccountId) {
          const userAccountId = getAccountId(user.address, dex.brokerId);

          isMultisig = adminResult.data.adminAccountId !== userAccountId;

          if (isMultisig) {
            const accountResponse = await fetch(
              `${getOrderlyApiBaseUrl()}/v1/public/account?account_id=${adminResult.data.adminAccountId}`
            );

            if (accountResponse.ok) {
              const accountData = await accountResponse.json();
              if (
                accountData.success &&
                accountData.data?.address &&
                accountData.data?.broker_id === dex.brokerId
              ) {
                multisigAddress = accountData.data.address;
              }
            }
          }
        }
      } catch (error) {
        console.error("Error checking multisig status:", error);
        isMultisig = false;
        multisigAddress = null;
      }
    }

    return c.json({
      success: true,
      isGraduated: dex.isGraduated,
      brokerId: dex.brokerId,
      isMultisig,
      multisigAddress,
      multisigChainId: dex.multisigChainId,
    });
  } catch (error) {
    console.error("Error getting graduation status:", error);
    return c.json(
      {
        success: false,
        message: `Error getting graduation status: ${error instanceof Error ? error.message : String(error)}`,
      },
      { status: 500 }
    );
  }
});

graduationRoutes.get("/fee-options", async c => {
  try {
    const usdcAmount = process.env.GRADUATION_USDC_AMOUNT;
    const orderRequiredPrice = process.env.GRADUATION_ORDER_REQUIRED_PRICE;
    const orderMinimumPrice = process.env.GRADUATION_ORDER_MINIMUM_PRICE;
    if (!usdcAmount || !orderRequiredPrice || !orderMinimumPrice) {
      return c.json(
        {
          success: false,
          message: "Graduation fee configuration is incomplete",
        },
        { status: 500 }
      );
    }

    const now = Date.now();
    if (!orderPriceCache || now - orderPriceCache.timestamp >= CACHE_TTL) {
      const coingeckoResponse = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=orderly-network&vs_currencies=usd"
      );

      if (!coingeckoResponse.ok) {
        return c.json(
          {
            success: false,
            message: "Failed to fetch ORDER token price",
          },
          { status: 500 }
        );
      }

      const priceData = await coingeckoResponse.json();
      const currentOrderPrice = priceData["orderly-network"]?.usd;

      if (!currentOrderPrice) {
        return c.json(
          {
            success: false,
            message: "ORDER token price not available",
          },
          { status: 500 }
        );
      }

      orderPriceCache = {
        price: currentOrderPrice,
        timestamp: now,
      };
    }

    const currentOrderPrice = orderPriceCache!.price;

    const requiredPrice = parseFloat(orderRequiredPrice);
    const minimumPrice = parseFloat(orderMinimumPrice);

    const orderAmount = requiredPrice / currentOrderPrice;

    return c.json({
      usdc: {
        amount: parseFloat(usdcAmount),
        currency: "USDC",
        stable: true,
      },
      order: {
        amount: orderAmount,
        currentPrice: currentOrderPrice,
        requiredPrice: requiredPrice,
        minimumPrice: minimumPrice,
        currency: "ORDER",
        stable: false,
      },
      receiverAddress: await getSecret("orderReceiverAddress"),
    });
  } catch (error) {
    console.error("Error getting graduation fee options:", error);
    return c.json(
      {
        success: false,
        message: `Error getting graduation fee options: ${error instanceof Error ? error.message : String(error)}`,
      },
      { status: 500 }
    );
  }
});

export default graduationRoutes;
