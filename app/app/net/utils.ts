import { getCurrentEnvironment } from "../utils/config";

export function isMainnet() {
  return getCurrentEnvironment() === "mainnet";
}
