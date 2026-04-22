import { z } from "@hono/zod-openapi";
import { ErrorResponseSchema } from "./common.js";

// Re-export common ErrorResponseSchema for graduation routes
export { ErrorResponseSchema };

export const VerifyTxSchema = z.object({
  txHash: z.string().min(10).max(100).openapi({
    description: "Transaction hash to verify",
    example: "0xabc123def456789...",
  }),
  chain: z.string().min(1).max(50).openapi({
    description: "Blockchain chain name",
    example: "ethereum",
  }),
  chainId: z.number().int().openapi({
    description: "Chain ID",
    example: 1,
  }),
  chain_type: z.enum(["EVM", "SOL"]).default("EVM").openapi({
    description: "Chain type",
    example: "EVM",
  }),
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
    )
    .openapi({
      description: "Desired broker ID",
      example: "my-broker",
    }),
  makerFee: z.number().min(-0.5).max(15).openapi({
    description: "Maker fee in basis points (-0.5 to 15). Negative values indicate rebates.",
    example: -0.1,
  }),
  takerFee: z.number().min(1).max(15).openapi({
    description: "Taker fee in basis points (1-15)",
    example: 2.5,
  }),
  rwaMakerFee: z.number().min(-0.5).max(15).openapi({
    description: "RWA maker fee in basis points (-0.5 to 15). Negative values indicate rebates.",
    example: -0.25,
  }),
  rwaTakerFee: z.number().min(3).max(15).openapi({
    description: "RWA taker fee in basis points (3-15)",
    example: 4.5,
  }),
  paymentType: z.enum(["usdc", "order", "usdt"]).default("order").openapi({
    description: "Payment token type",
    example: "order",
  }),
});

export const VerifyTxSuccessSchema = z
  .object({
    success: z.literal(true).openapi({
      description: "Verification successful",
      example: true,
    }),
    message: z.string().openapi({
      description: "Success message",
      example:
        "Transaction verified and broker ID 'my-broker' created successfully! Your DEX has graduated automatically.",
    }),
    amount: z.number().optional().openapi({
      description: "Amount paid in graduation fee",
      example: 1000,
    }),
    brokerCreationData: z.object({
      brokerId: z.string().openapi({
        description: "Created broker ID",
        example: "my-broker",
      }),
      transactionHashes: z
        .record(z.string())
        .optional()
        .openapi({
          description: "Transaction hashes from broker creation",
          example: { createBroker: "0xabc123..." },
        }),
    }),
  })
  .openapi("VerifyTxSuccess");

export const GraduationStatusSchema = z
  .object({
    success: z.boolean().openapi({
      example: true,
    }),
    currentBrokerId: z.string().openapi({
      description: "Current broker ID",
      example: "demo",
    }),
    approved: z.boolean().openapi({
      description: "Whether graduation is approved",
      example: false,
    }),
  })
  .openapi("GraduationStatus");

const FeeTokenSchema = z.object({
  amount: z.number().openapi({
    description: "Token amount required",
    example: 1000,
  }),
  currency: z.string().openapi({
    example: "USDC",
  }),
  stable: z.boolean().openapi({
    example: true,
  }),
});

export const FeeOptionsSchema = z
  .object({
    usdc: FeeTokenSchema,
    order: FeeTokenSchema.extend({
      currentPrice: z.number().openapi({
        description: "Current ORDER token price in USD",
        example: 2.5,
      }),
    }),
    usdt: FeeTokenSchema,
    receiverAddress: z.string().optional().openapi({
      description: "Address to send graduation payment",
      example: "0x1234567890123456789012345678901234567890",
    }),
  })
  .openapi("FeeOptions");

export const DexFeesSchema = z
  .object({
    success: z.boolean().openapi({
      example: true,
    }),
    fees: z.object({
      makerFee: z.number().openapi({
        description: "Maker fee in basis points",
        example: 5,
      }),
      takerFee: z.number().openapi({
        description: "Taker fee in basis points",
        example: 10,
      }),
      rwaMakerFee: z.number().openapi({
        description: "RWA maker fee in basis points",
        example: 5,
      }),
      rwaTakerFee: z.number().openapi({
        description: "RWA taker fee in basis points",
        example: 10,
      }),
    }),
  })
  .openapi("DexFees");

export const BrokerTierSchema = z
  .object({
    brokerId: z.string().openapi({
      description: "Broker ID",
      example: "my-broker",
    }),
    tier: z.string().openapi({
      description: "Broker tier level",
      example: "standard",
    }),
    volume: z.number().openapi({
      description: "Trading volume",
      example: 1000000,
    }),
  })
  .openapi("BrokerTier");

export const FinalizeAdminWalletSchema = z.object({
  multisigAddress: z.string().optional().openapi({
    description: "Multisig wallet address",
    example: "0x1234567890123456789012345678901234567890",
  }),
  multisigChainId: z.number().optional().openapi({
    description: "Chain ID for multisig",
    example: 1,
  }),
});

export const FinalizeAdminWalletResponseSchema = z
  .object({
    success: z.boolean().openapi({
      example: true,
    }),
    message: z.string().openapi({
      description: "Success message",
      example:
        "Admin wallet setup completed successfully. Your DEX has graduated!",
    }),
    isGraduated: z.boolean().openapi({
      example: true,
    }),
  })
  .openapi("FinalizeAdminWalletResponse");

export const GraduationStatusExtendedSchema = z
  .object({
    success: z.boolean().openapi({
      example: true,
    }),
    isGraduated: z.boolean().openapi({
      description: "Whether DEX has completed graduation",
      example: true,
    }),
    brokerId: z.string().openapi({
      description: "Current broker ID",
      example: "my-broker",
    }),
    isMultisig: z.boolean().openapi({
      description: "Whether using multisig admin",
      example: false,
    }),
    multisigAddress: z.string().nullable().openapi({
      description: "Multisig address if applicable",
      example: null,
    }),
    multisigChainId: z.number().nullable().openapi({
      description: "Multisig chain ID",
      example: null,
    }),
  })
  .openapi("GraduationStatusExtended");
