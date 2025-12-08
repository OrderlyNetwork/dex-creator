import { SecretManagerServiceClient } from "@google-cloud/secret-manager";

interface SecretCache {
  [key: string]: string;
}

let secretCache: SecretCache = {};
let isInitialized = false;
let initializationPromise: Promise<SecretConfig> | null = null;

export interface SecretConfig {
  databaseUrl: string;
  orderlyDatabaseUrl: string;
  nexusDatabaseUrl: string;
  svDatabaseUrl: string;
  githubToken: string;
  templatePat: string;
  orderReceiverAddress: string;
  brokerCreationPrivateKey: string;
  brokerCreationPrivateKeySol: string;
  creatorBrokerApiAccountId: string;
  creatorBrokerApiSecretKey: string;
}

function getSecretNames(deploymentEnv: string): Record<string, string> {
  switch (deploymentEnv) {
    case "mainnet":
      return {
        databaseUrl: `projects/964694002890/secrets/dex-creator-postgres-db-prod-evm/versions/latest`,
        orderlyDatabaseUrl: `projects/964694002890/secrets/dex-creator-woo-db-prod-evm/versions/latest`,
        nexusDatabaseUrl: `projects/964694002890/secrets/dex-creator-nexus-db-prod-evm/versions/latest`,
        svDatabaseUrl: `projects/964694002890/secrets/dex-creator-sv-db-prod-evm/versions/latest`,
        githubToken: `projects/964694002890/secrets/dex-creator-github-token-prod-evm/versions/latest`,
        templatePat: `projects/964694002890/secrets/dex-creator-template-pat-prod-evm/versions/latest`,
        orderReceiverAddress: `projects/964694002890/secrets/dex-creator-order-receiver-address-prod-evm/versions/latest`,
        brokerCreationPrivateKey: `projects/100655379011/secrets/dex-creator-broker-creation-private-key-prod-evm/versions/latest`,
        brokerCreationPrivateKeySol: `projects/964694002890/secrets/dex-creator-broker-creation-private-key-sol-prod-evm/versions/latest`,
        creatorBrokerApiAccountId: `projects/964694002890/secrets/dex-creator-creator-broker-api-account-id-prod-evm/versions/latest`,
        creatorBrokerApiSecretKey: `projects/964694002890/secrets/dex-creator-creator-broker-api-secret-key-prod-evm/versions/latest`,
      };
    case "staging":
      return {
        databaseUrl: `projects/964694002890/secrets/dex-creator-postgres-db-staging-evm/versions/latest`,
        orderlyDatabaseUrl: `projects/964694002890/secrets/dex-creator-woo-db-staging-evm/versions/latest`,
        nexusDatabaseUrl: `projects/964694002890/secrets/dex-creator-nexus-db-staging-evm/versions/latest`,
        svDatabaseUrl: `projects/964694002890/secrets/dex-creator-sv-db-staging-evm/versions/latest`,
        githubToken: `projects/964694002890/secrets/dex-creator-github-token-staging-evm/versions/latest`,
        templatePat: `projects/964694002890/secrets/dex-creator-template-pat-staging-evm/versions/latest`,
        orderReceiverAddress: `projects/964694002890/secrets/dex-creator-order-receiver-address-staging-evm/versions/latest`,
        brokerCreationPrivateKey: `projects/964694002890/secrets/dex-creator-broker-creation-private-key-staging-evm/versions/latest`,
        brokerCreationPrivateKeySol: `projects/964694002890/secrets/dex-creator-broker-creation-private-key-sol-staging-evm/versions/latest`,
        creatorBrokerApiAccountId: `projects/964694002890/secrets/dex-creator-creator-broker-api-account-id-staging-evm/versions/latest`,
        creatorBrokerApiSecretKey: `projects/964694002890/secrets/dex-creator-creator-broker-api-secret-key-staging-evm/versions/latest`,
      };
    default:
      return {};
  }
}

async function fetchSecret(
  client: SecretManagerServiceClient,
  secretName: string,
  envVarName: string
): Promise<string> {
  try {
    console.log(`🔑 Fetching ${envVarName} from secret: ${secretName}`);
    const [version] = await client.accessSecretVersion({
      name: secretName,
    });
    const secret = version.payload?.data?.toString();
    if (!secret) {
      throw new Error(`Secret ${secretName} is empty or invalid`);
    }
    console.log(`✅ Fetched ${envVarName} from Google Secret Manager`);
    return secret;
  } catch (error) {
    console.error(
      `❌ Failed to get ${envVarName} from Google Secret Manager:`,
      error
    );
    const envValue = process.env[envVarName];
    if (envValue) {
      console.log(`⚠️ Using environment variable for ${envVarName}`);
      return envValue;
    } else {
      throw new Error(
        `Required secret '${envVarName}' not found in Secret Manager or environment variables`
      );
    }
  }
}

export async function initializeSecretManager(): Promise<SecretConfig> {
  if (isInitialized) {
    return getSecretConfig();
  }

  if (initializationPromise) {
    return initializationPromise;
  }

  console.log("🔧 Initializing secret manager...");

  initializationPromise = initializeSecretsInternal();

  try {
    const result = await initializationPromise;
    initializationPromise = null;
    return result;
  } catch (error) {
    initializationPromise = null;
    throw error;
  }
}

async function initializeSecretsInternal(): Promise<SecretConfig> {
  const deploymentEnv = process.env.DEPLOYMENT_ENV;

  if (!deploymentEnv || deploymentEnv === "qa" || deploymentEnv === "dev") {
    console.log(
      "🔧 Using environment variables for secrets (qa/dev environment)"
    );

    const requiredEnvVars = [
      "DATABASE_URL",
      "ORDERLY_DATABASE_URL",
      "ORDERLY_DATABASE_URL_NEXUS",
      "ORDERLY_DATABASE_URL_SV",
      "GITHUB_TOKEN",
      "TEMPLATE_PAT",
      "ORDER_RECEIVER_ADDRESS",
      "BROKER_CREATION_PRIVATE_KEY",
      "BROKER_CREATION_PRIVATE_KEY_SOL",
      "CREATOR_BROKER_API_ACCOUNT_ID",
      "CREATOR_BROKER_API_SECRET_KEY",
    ];

    const missingEnvVars = requiredEnvVars.filter(
      envVar => !process.env[envVar]
    );

    if (missingEnvVars.length > 0) {
      throw new Error(
        `Missing required environment variables for ${deploymentEnv || "local"} environment: ${missingEnvVars.join(", ")}`
      );
    }

    secretCache = {
      databaseUrl: process.env.DATABASE_URL!,
      orderlyDatabaseUrl: process.env.ORDERLY_DATABASE_URL!,
      nexusDatabaseUrl: process.env.ORDERLY_DATABASE_URL_NEXUS!,
      svDatabaseUrl: process.env.ORDERLY_DATABASE_URL_SV!,
      githubToken: process.env.GITHUB_TOKEN!,
      templatePat: process.env.TEMPLATE_PAT!,
      orderReceiverAddress: process.env.ORDER_RECEIVER_ADDRESS!,
      brokerCreationPrivateKey: process.env.BROKER_CREATION_PRIVATE_KEY!,
      brokerCreationPrivateKeySol: process.env.BROKER_CREATION_PRIVATE_KEY_SOL!,
      creatorBrokerApiAccountId: process.env.CREATOR_BROKER_API_ACCOUNT_ID!,
      creatorBrokerApiSecretKey: process.env.CREATOR_BROKER_API_SECRET_KEY!,
    };
    isInitialized = true;
    return getSecretConfig();
  }

  const secretNames = getSecretNames(deploymentEnv);

  if (Object.keys(secretNames).length === 0) {
    throw new Error(
      `Unknown deployment environment: ${deploymentEnv}. Please set environment variables directly.`
    );
  }

  const client = new SecretManagerServiceClient();

  const [
    databaseUrl,
    orderlyDatabaseUrl,
    nexusDatabaseUrl,
    svDatabaseUrl,
    githubToken,
    templatePat,
    orderReceiverAddress,
    brokerCreationPrivateKey,
    brokerCreationPrivateKeySol,
    creatorBrokerApiAccountId,
    creatorBrokerApiSecretKey,
  ] = await Promise.all([
    fetchSecret(client, secretNames.databaseUrl, "DATABASE_URL"),
    fetchSecret(client, secretNames.orderlyDatabaseUrl, "ORDERLY_DATABASE_URL"),
    fetchSecret(
      client,
      secretNames.nexusDatabaseUrl,
      "ORDERLY_DATABASE_URL_NEXUS"
    ),
    fetchSecret(client, secretNames.svDatabaseUrl, "ORDERLY_DATABASE_URL_SV"),
    fetchSecret(client, secretNames.githubToken, "GITHUB_TOKEN"),
    fetchSecret(client, secretNames.templatePat, "TEMPLATE_PAT"),
    fetchSecret(
      client,
      secretNames.orderReceiverAddress,
      "ORDER_RECEIVER_ADDRESS"
    ),
    fetchSecret(
      client,
      secretNames.brokerCreationPrivateKey,
      "BROKER_CREATION_PRIVATE_KEY"
    ),
    fetchSecret(
      client,
      secretNames.brokerCreationPrivateKeySol,
      "BROKER_CREATION_PRIVATE_KEY_SOL"
    ),
    fetchSecret(
      client,
      secretNames.creatorBrokerApiAccountId,
      "CREATOR_BROKER_API_ACCOUNT_ID"
    ),
    fetchSecret(
      client,
      secretNames.creatorBrokerApiSecretKey,
      "CREATOR_BROKER_API_SECRET_KEY"
    ),
  ]);

  secretCache = {
    databaseUrl,
    orderlyDatabaseUrl,
    nexusDatabaseUrl,
    svDatabaseUrl,
    githubToken,
    templatePat,
    orderReceiverAddress,
    brokerCreationPrivateKey,
    brokerCreationPrivateKeySol,
    creatorBrokerApiAccountId,
    creatorBrokerApiSecretKey,
  };

  isInitialized = true;
  return getSecretConfig();
}

export function getSecretConfig(): SecretConfig {
  if (!isInitialized) {
    throw new Error(
      "Secret manager not initialized. Call initializeSecretManager() first."
    );
  }

  return {
    databaseUrl: secretCache.databaseUrl,
    orderlyDatabaseUrl: secretCache.orderlyDatabaseUrl,
    nexusDatabaseUrl: secretCache.nexusDatabaseUrl,
    svDatabaseUrl: secretCache.svDatabaseUrl,
    githubToken: secretCache.githubToken,
    templatePat: secretCache.templatePat,
    orderReceiverAddress: secretCache.orderReceiverAddress,
    brokerCreationPrivateKey: secretCache.brokerCreationPrivateKey,
    brokerCreationPrivateKeySol: secretCache.brokerCreationPrivateKeySol,
    creatorBrokerApiAccountId: secretCache.creatorBrokerApiAccountId,
    creatorBrokerApiSecretKey: secretCache.creatorBrokerApiSecretKey,
  };
}

export async function getSecret(key: keyof SecretConfig): Promise<string> {
  if (!isInitialized) {
    await initializeSecretManager();
  }

  const config = getSecretConfig();
  return config[key];
}
