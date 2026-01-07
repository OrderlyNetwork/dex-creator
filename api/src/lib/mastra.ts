import { Mastra } from "@mastra/core";
import { PostgresStore } from "@mastra/pg";
import { landingPageAgent } from "../mastra/agents/landingPageAgent";

if (!process.env.MASTRA_DATABASE_URL) {
  throw new Error("MASTRA_DATABASE_URL environment variable is required");
}

const postgresStore = new PostgresStore({
  id: "mastra-storage",
  connectionString: process.env.MASTRA_DATABASE_URL,
  schemaName: "mastra",
});

const mastra = new Mastra({
  storage: postgresStore,
  agents: {
    landingPageAgent,
  },
});

export { mastra };
