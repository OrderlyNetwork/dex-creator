import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { logger } from "hono/logger";
import { cors } from "hono/cors";
import dexRoutes from "./routes/dex";
import authRoutes from "./routes/auth";
import adminRoutes from "./routes/admin";
import themeRoutes from "./routes/theme";
import graduationRoutes from "./routes/graduation";
import landingPageRoutes from "./routes/landingPage";
import { leaderboard } from "./routes/leaderboard";
import { stats } from "./routes/stats";
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

export const app = new Hono();

let globalPrisma: import("@prisma/client").PrismaClient | null = null;

app.use("*", logger());
app.use("*", cors());
app.use("*", errorLoggerMiddleware);

app.use("/api/dex/*", authMiddleware);
app.use("/api/theme/*", authMiddleware);
app.use("/api/graduation/*", authMiddleware);
app.use("/api/landing-page/*", authMiddleware);

app.use("/api/admin/*", async (c, next) => {
  if (c.req.path === "/api/admin/check") {
    return authMiddleware(c, next);
  } else {
    return adminMiddleware(c, next);
  }
});

app.get("/", c => c.json({ message: "Orderly One API is running" }));
app.route("/api/dex", dexRoutes);
app.route("/api/auth", authRoutes);
app.route("/api/admin", adminRoutes);
app.route("/api/theme", themeRoutes);
app.route("/api/graduation", graduationRoutes);
app.route("/api/landing-page", landingPageRoutes);
app.route("/api/leaderboard", leaderboard);
app.route("/api/stats", stats);

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
