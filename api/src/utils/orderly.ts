import { AbiCoder, keccak256, solidityPackedKeccak256 } from "ethers";

export function getOrderlyApiBaseUrl(): string {
  const deploymentEnv = process.env.DEPLOYMENT_ENV;

  if (process.env.IS_DOCKER === "true") {
    return "http://orderly-gateway-rest";
  }

  switch (deploymentEnv) {
    case "mainnet":
      return "https://api.orderly.org";
    case "staging":
      return "https://testnet-api.orderly.org";
    case "qa":
      return "https://qa-api-aliyun.orderly.org";
    case "dev":
    default:
      return "https://dev-api-aliyun.orderly.org";
  }
}

export function getAccountId(address: string, brokerId: string) {
  const abicoder = AbiCoder.defaultAbiCoder();
  return keccak256(
    abicoder.encode(
      ["address", "bytes32"],
      [address, solidityPackedKeccak256(["string"], [brokerId])]
    )
  );
}
