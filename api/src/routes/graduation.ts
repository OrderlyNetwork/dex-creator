import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import {
  verifyOrderTransaction,
  updatePreferredBrokerId,
  getDexFees,
} from "../models/graduation";
import { getUserDex } from "../models/dex";
import { prisma } from "../lib/prisma";

const verifyTxSchema = z.object({
  txHash: z.string().min(10).max(100),
  chain: z.string().min(1).max(50),
  preferredBrokerId: z.string().min(3).max(50),
  makerFee: z.number().int().min(0),
  takerFee: z.number().int().min(3),
});

const graduationRoutes = new Hono();

graduationRoutes.post(
  "/verify-tx",
  zValidator("json", verifyTxSchema),
  async c => {
    try {
      const userId = c.get("userId");

      const { txHash, chain, preferredBrokerId, makerFee, takerFee } =
        c.req.valid("json");

      const dex = await getUserDex(userId);
      if (!dex) {
        return c.json(
          { success: false, message: "You must create a DEX first" },
          { status: 400 }
        );
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return c.json(
          { success: false, message: "User not found" },
          { status: 404 }
        );
      }

      const verificationResult = await verifyOrderTransaction(
        txHash,
        chain,
        user.address
      );

      if (!verificationResult.success) {
        return c.json(verificationResult, { status: 400 });
      }

      const brokerIdValidation = /^[a-z0-9-_]+$/.test(preferredBrokerId);
      if (!brokerIdValidation) {
        return c.json(
          {
            success: false,
            message:
              "Invalid broker ID format. Use only lowercase letters, numbers, hyphens, and underscores.",
          },
          { status: 400 }
        );
      }

      const updateResult = await updatePreferredBrokerId(
        userId,
        preferredBrokerId,
        makerFee,
        takerFee
      );

      if (!updateResult.success) {
        return c.json(updateResult, { status: 400 });
      }

      return c.json({
        success: true,
        message:
          "Transaction verified and preferred broker ID updated successfully",
        amount: verificationResult.amount,
        preferredBrokerId,
        telegramGroupLink: updateResult.telegramGroupLink,
        makerFee,
        takerFee,
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

// Get the user's preferred broker ID
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
      preferredBrokerId: dex.preferredBrokerId,
      currentBrokerId: dex.brokerId,
      approved:
        dex.brokerId !== "demo" && dex.brokerId === dex.preferredBrokerId,
      telegramGroupLink: dex.telegramInviteLink,
      graduatedAt: dex.graduatedAt,
      makerFee: dex.makerFee,
      takerFee: dex.takerFee,
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

// Get DEX fee configuration
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

export default graduationRoutes;
