import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import {
  verifyOrderTransaction,
  getDexFees,
  getDexBrokerTier,
  invalidateDexFeesCache,
  getOrderPrice,
} from "../models/graduation";
import {
  getUserDex,
  convertDexToDexConfig,
  getCurrentEnvironment,
} from "../models/dex";
import { getPrisma } from "../lib/prisma";
import { setupRepositoryWithSingleCommit } from "../lib/github.js";
import { getAdminAccountIdFromOrderlyDb } from "../lib/orderlyDb.js";
import { getOrderlyApiBaseUrl, getAccountId } from "../utils/orderly.js";
import { getSecret } from "../lib/secretManager.js";
import { ALL_CHAINS, ChainName } from "../../../config";
import { createAutomatedBrokerId } from "../lib/brokerCreation";
import { updateAdminAccount } from "../lib/adminAccount";
import {
  ErrorResponseSchema,
  VerifyTxSchema,
  VerifyTxSuccessSchema,
  GraduationStatusSchema,
  FeeOptionsSchema,
  DexFeesSchema,
  BrokerTierSchema,
  FinalizeAdminWalletSchema,
  FinalizeAdminWalletResponseSchema,
  GraduationStatusExtendedSchema,
} from "../schemas/graduation.js";

const app = new OpenAPIHono();

const verifyTxRoute = createRoute({
  method: "post",
  path: "/verify-tx",
  tags: ["Graduation"],
  summary: "Verify graduation transaction",
  description:
    "Verify a graduation payment transaction and create the broker ID",
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: VerifyTxSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Transaction verified and broker created successfully",
      content: {
        "application/json": {
          schema: VerifyTxSuccessSchema,
        },
      },
    },
    400: {
      description: "Invalid request",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
    404: {
      description: "User not found",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
    500: {
      description: "Server error",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

app.openapi(verifyTxRoute, async c => {
  try {
    const body = c.req.valid("json");
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
    } = body;

    const userId = c.get("userId");

    const dex = await getUserDex(userId);
    if (!dex || (!dex.repoUrl && dex.integrationType !== "custom")) {
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
      paymentType,
      dex.integrationType === "custom"
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

    const brokerCreationResult = await createAutomatedBrokerId(
      brokerId,
      getCurrentEnvironment(),
      {
        brokerName: dex.brokerName,
        makerFee: makerFee,
        takerFee: takerFee,
        rwaMakerFee: rwaMakerFee,
        rwaTakerFee: rwaTakerFee,
        address: user.address,
        chain_id: chainId,
        chain_type,
      }
    );

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

    if (dex.integrationType !== "custom") {
      try {
        console.log(
          `🔄 Updating GitHub repository with new broker ID: ${brokerId}`
        );

        const repoUrlMatch = dex.repoUrl?.match(
          /github\.com\/([^/]+)\/([^/]+)/
        );
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
});

const getStatusRoute = createRoute({
  method: "get",
  path: "/status",
  tags: ["Graduation"],
  summary: "Get graduation status",
  description: "Get the current graduation status for the user's DEX",
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: "Graduation status retrieved successfully",
      content: {
        "application/json": {
          schema: GraduationStatusSchema,
        },
      },
    },
    400: {
      description: "Invalid request",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
    500: {
      description: "Server error",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

app.openapi(getStatusRoute, async c => {
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

const getFeesRoute = createRoute({
  method: "get",
  path: "/fees",
  tags: ["Graduation"],
  summary: "Get DEX fees",
  description: "Get the trading fees for the user's DEX",
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: "DEX fees retrieved successfully",
      content: {
        "application/json": {
          schema: DexFeesSchema,
        },
      },
    },
    400: {
      description: "Invalid request",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
    500: {
      description: "Server error",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

app.openapi(getFeesRoute, async c => {
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

const getTierRoute = createRoute({
  method: "get",
  path: "/tier",
  tags: ["Graduation"],
  summary: "Get broker tier",
  description: "Get the broker tier information for the user's DEX",
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: "Broker tier retrieved successfully",
      content: {
        "application/json": {
          schema: BrokerTierSchema,
        },
      },
    },
    400: {
      description: "Invalid request",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
    500: {
      description: "Server error",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

app.openapi(getTierRoute, async c => {
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

app.post("/fees/invalidate-cache", async c => {
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

const finalizeAdminWalletRoute = createRoute({
  method: "post",
  path: "/finalize-admin-wallet",
  tags: ["Graduation"],
  summary: "Finalize admin wallet setup",
  description: "Finalize the admin wallet setup and mark DEX as graduated",
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: FinalizeAdminWalletSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Admin wallet setup completed successfully",
      content: {
        "application/json": {
          schema: FinalizeAdminWalletResponseSchema,
        },
      },
    },
    400: {
      description: "Invalid request",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
    404: {
      description: "User not found",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
    500: {
      description: "Server error",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

app.openapi(finalizeAdminWalletRoute, async c => {
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

      const updateResult = await updateAdminAccount({
        broker_id: dex.brokerId,
        admin_account_id: adminAccountId,
      });

      if (updateResult.success) {
        console.log(
          `✅ Successfully updated admin account ID for broker ${dex.brokerId}`
        );
      } else {
        console.warn(
          `⚠️ Failed to update admin account ID for broker ${dex.brokerId}: ${updateResult.message}`
        );
      }

      if (!updateResult.success) {
        return c.json(updateResult, { status: 400 });
      }
    } catch (error) {
      console.error(
        `❌ Error updating admin account ID for broker ${dex.brokerId}:`,
        error
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
});

const getGraduationStatusRoute = createRoute({
  method: "get",
  path: "/graduation-status",
  tags: ["Graduation"],
  summary: "Get detailed graduation status",
  description: "Get detailed graduation status including multisig information",
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: "Graduation status retrieved successfully",
      content: {
        "application/json": {
          schema: GraduationStatusExtendedSchema,
        },
      },
    },
    400: {
      description: "Invalid request",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
    500: {
      description: "Server error",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

app.openapi(getGraduationStatusRoute, async c => {
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

const getFeeOptionsRoute = createRoute({
  method: "get",
  path: "/fee-options",
  tags: ["Graduation"],
  summary: "Get graduation fee options",
  description:
    "Get the available fee options for graduation (USDC, ORDER, or USDT)",
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: "Fee options retrieved successfully",
      content: {
        "application/json": {
          schema: FeeOptionsSchema,
        },
      },
    },
    500: {
      description: "Server error",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

app.openapi(getFeeOptionsRoute, async c => {
  try {
    const userId = c.get("userId");
    const dex = await getUserDex(userId);
    const isCustom =
      c.req.query("isCustom") === "true" || dex?.integrationType === "custom";

    const graduationFeeAmount = isCustom
      ? process.env.GRADUATION_USDC_AMOUNT_CUSTOM
      : process.env.GRADUATION_USDC_AMOUNT;

    if (!graduationFeeAmount) {
      return c.json(
        {
          success: false,
          message: "Graduation fee configuration is incomplete",
        },
        { status: 500 }
      );
    }

    const feeAmount = parseFloat(graduationFeeAmount);
    const currentOrderPrice = await getOrderPrice();

    const orderAmount = currentOrderPrice ? feeAmount / currentOrderPrice : 0;

    return c.json({
      usdc: {
        amount: feeAmount,
        currency: "USDC",
        stable: true,
      },
      order: {
        amount: orderAmount,
        currentPrice: currentOrderPrice,
        currency: "ORDER",
        stable: false,
      },
      usdt: {
        amount: feeAmount,
        currency: "USDT",
        stable: true,
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

export default app;
