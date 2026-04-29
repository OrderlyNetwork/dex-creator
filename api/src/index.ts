import { serve } from "@hono/node-server";
import { OpenAPIHono } from "@hono/zod-openapi";
import { logger } from "hono/logger";
import { cors } from "hono/cors";
import { Scalar } from "@scalar/hono-api-reference";
import dexRoutes from "./routes/dex";
import authRoutes from "./routes/auth";
import adminRoutes from "./routes/admin";
import themeRoutes from "./routes/theme";
import graduationRoutes from "./routes/graduation";
import leaderboardRoutes from "./routes/leaderboard";
import statsRoutes from "./routes/stats";
import { leaderboardService } from "./services/leaderboardService";
import { authMiddleware, adminMiddleware } from "./lib/auth";
import { errorLoggerMiddleware } from "./lib/errorLogger";
import {
  initializeBrokerCreation,
  checkBrokerCreationPermissions,
  checkGasBalances,
} from "./lib/brokerCreation";
import { getCurrentEnvironment } from "./models/dex";
import { initializeSecretManager } from "./lib/secretManager";
import { runDatabaseMigrations, shouldRunMigrations } from "./lib/migrations";

declare module "hono" {
  interface ContextVariableMap {
    userId: string;
    isAdmin?: boolean;
  }
}

export const app = new OpenAPIHono();

let globalPrisma: import("@prisma/client").PrismaClient | null = null;

function getDefaultApiUrl(): string {
  return getCurrentEnvironment() === "mainnet"
    ? "https://dex-api.orderly.network"
    : "https://testnet-dex-api.orderly.network";
}

app.use("*", logger());
app.use("*", cors());
app.use("*", errorLoggerMiddleware);

app.use("/api/dex/*", authMiddleware);
app.use("/api/theme/*", authMiddleware);
app.use("/api/graduation/*", authMiddleware);

app.use("/api/admin/*", async (c, next) => {
  if (c.req.path === "/api/admin/check") {
    return authMiddleware(c, next);
  } else {
    return adminMiddleware(c, next);
  }
});

app.get(
  "/",
  Scalar({
    url: "/openapi.json",
    theme: "moon",
    pageTitle: "Orderly One API Documentation",
    metaData: {
      title: "Orderly One API Documentation",
      description: "Interactive API documentation for Orderly One DEX Creator",
    },
    content: () => {
      const spec = app.getOpenAPIDocument({
        openapi: "3.1.0",
        info: {
          title: "Orderly One API",
          version: "1.0.0",
          description:
            "Orderly One DEX Creator API - Create and manage decentralized exchanges",
        },
        servers: [
          {
            url: getDefaultApiUrl(),
            description: "API Server",
          },
        ],
      });
      return {
        ...spec,
        components: {
          ...(spec.components || {}),
          securitySchemes: {
            bearerAuth: {
              type: "http",
              scheme: "bearer",
              bearerFormat: "JWT",
              description: "JWT token obtained from /api/auth/verify",
            },
          },
        },
      };
    },
  })
);
app.route("/api/dex", dexRoutes);
app.route("/api/auth", authRoutes);
app.route("/api/admin", adminRoutes);
app.route("/api/theme", themeRoutes);
app.route("/api/graduation", graduationRoutes);
app.route("/api/leaderboard", leaderboardRoutes);
app.route("/api/stats", statsRoutes);

app.get("/openapi.json", c => {
  const spec = app.getOpenAPIDocument({
    openapi: "3.1.0",
    info: {
      title: "Orderly One API",
      version: "1.0.0",
      description:
        "Orderly One DEX Creator API - Create and manage decentralized exchanges",
    },
    servers: [
      {
        url: getDefaultApiUrl(),
        description: "API Server",
      },
    ],
    tags: [
      { name: "Authentication", description: "Authentication endpoints" },
      { name: "DEX", description: "DEX management endpoints" },
      { name: "Admin", description: "Admin-only endpoints" },
      { name: "Theme", description: "Theme customization endpoints" },
      { name: "Graduation", description: "DEX graduation endpoints" },
      { name: "Leaderboard", description: "Trading leaderboards" },
      { name: "Stats", description: "Platform statistics" },
    ],
  });

  const specWithSecurity = {
    ...spec,
    components: {
      ...(spec.components || {}),
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "JWT token obtained from /api/auth/verify",
        },
      },
    },
  };

  return c.json(specWithSecurity);
});

app.notFound(c => {
  return c.json(
    {
      message: "Not Found",
      status: 404,
    },
    404
  );
});

app.onError((err, c) => {
  console.error(`${err}`);
  return c.json(
    {
      message: "Internal Server Error",
      status: 500,
    },
    500
  );
});

if (process.env.NODE_ENV !== "test") {
  (async () => {
    try {
      console.log("🔧 Initializing secret manager...");
      await initializeSecretManager();
      console.log("✅ Secret manager initialized successfully");
    } catch (error) {
      console.error("❌ Failed to initialize secret manager:", error);
      process.exit(1);
    }

    const { initializePrisma } = await import("./lib/prisma");
    try {
      const prisma = await initializePrisma();
      await prisma.$connect();
      console.log("Connected to the database");

      globalPrisma = prisma;
    } catch (error) {
      console.error("Failed to connect to the database:", error);
      process.exit(1);
    }

    try {
      console.log("📊 Initializing leaderboard service...");
      await leaderboardService.initialize();
      console.log("✅ Leaderboard service initialized successfully");
    } catch (error) {
      console.error("❌ Failed to initialize leaderboard service:", error);
      process.exit(1);
    }

    if (shouldRunMigrations()) {
      try {
        console.log("🗄️ Running database migrations...");
        const migrationResult = await runDatabaseMigrations();
        if (!migrationResult.success) {
          console.error(
            "❌ Database migrations failed:",
            migrationResult.error
          );
          process.exit(1);
        }
        console.log("✅ Database migrations completed successfully");
      } catch (error) {
        console.error("❌ Database migrations failed:", error);
        process.exit(1);
      }
    }

    try {
      await initializeBrokerCreation();
    } catch (error) {
      console.error("❌ Failed to initialize broker creation system:", error);
      process.exit(1);
    }

    try {
      console.log("🔍 Checking broker creation permissions on startup...");
      const environment = getCurrentEnvironment();
      const permissionData = await checkBrokerCreationPermissions(environment);
      if (permissionData.hasPermissions) {
        console.log(`✅ Broker creation permissions check completed`);
      } else {
        console.warn("⚠️ Broker creation permissions check failed:");
        permissionData.errors?.forEach(error => console.warn(error));
      }
    } catch (error) {
      console.error("⚠️ Broker creation permissions check failed:", error);
      process.exit(1);
    }

    try {
      console.log("💰 Checking gas balances on all chains...");
      const environment = getCurrentEnvironment();
      const gasBalanceData = await checkGasBalances(environment);
      if (gasBalanceData.success) {
        console.log("✅ All chains have sufficient gas balances");
      } else {
        console.warn("⚠️ Gas balance warnings detected:");
        gasBalanceData.warnings.forEach(warning => console.warn(warning));
        console.warn(
          "This may affect broker creation functionality. Consider adding ETH to the wallet."
        );
      }
    } catch (error) {
      console.error("⚠️ Gas balance check failed:", error);
      process.exit(1);
    }
  })().catch((err: Error) => {
    console.error("Application startup failed:", err);
    process.exit(1);
  });
}

if (process.env.NODE_ENV !== "test") {
  process.on("SIGINT", async () => {
    leaderboardService.stop();
    if (globalPrisma) {
      await globalPrisma.$disconnect();
    }
    process.exit(0);
  });

  process.on("SIGTERM", async () => {
    leaderboardService.stop();
    if (globalPrisma) {
      await globalPrisma.$disconnect();
    }
    process.exit(0);
  });
}

if (process.env.NODE_ENV !== "test") {
  const port = process.env.PORT || 3001;
  console.log(`Server is running on port ${port}`);
  serve({
    fetch: app.fetch,
    port: Number(port),
  });
}
