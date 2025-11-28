import { getPublicKeyAsync, signAsync, utils } from "@noble/ed25519";
import {
  encodeBase58,
  solidityPackedKeccak256,
  keccak256,
  AbiCoder,
  JsonRpcSigner,
} from "ethers";
import { Address } from "viem";

export type BrokerInfo = {
  broker_id: string;
  broker_name: string;
};

export async function getBrokers(): Promise<BrokerInfo[]> {
  const res = await fetch(`${getBaseUrl()}/v1/public/broker/name`);
  if (!res.ok) {
    throw new Error("Failed to fetch brokers");
  }
  const json = await res.json();
  if (!json.success) {
    throw new Error(json.message);
  }
  return json.data.rows.sort((a: BrokerInfo, b: BrokerInfo) =>
    a.broker_id.localeCompare(b.broker_id)
  );
}

export const usdFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 2,
});

export type Scope = "read" | "read,trading";

export type AutoReferralSettings = {
  required_trading_volume: number;
  max_rebate: number;
  referrer_rebate: number;
  referee_rebate: number;
  enable: boolean;
  description: string;
};

export type AutoReferralInfo = {
  required_trading_volume: number;
  max_rebate: number;
  referrer_rebate: number;
  referee_rebate: number;
  description: string;
  enable: boolean;
};

const ORDERLY_KEY_LOCAL_STORAGE = "orderly-key";

export const MESSAGE_TYPES = {
  EIP712Domain: [
    { name: "name", type: "string" },
    { name: "version", type: "string" },
    { name: "chainId", type: "uint256" },
    { name: "verifyingContract", type: "address" },
  ],
  Registration: [
    { name: "brokerId", type: "string" },
    { name: "chainId", type: "uint256" },
    { name: "timestamp", type: "uint64" },
    { name: "registrationNonce", type: "uint256" },
  ],
  AddOrderlyKey: [
    { name: "brokerId", type: "string" },
    { name: "chainId", type: "uint256" },
    { name: "orderlyKey", type: "string" },
    { name: "scope", type: "string" },
    { name: "timestamp", type: "uint64" },
    { name: "expiration", type: "uint64" },
  ],
  DelegateAddOrderlyKey: [
    { name: "delegateContract", type: "address" },
    { name: "brokerId", type: "string" },
    { name: "chainId", type: "uint256" },
    { name: "orderlyKey", type: "string" },
    { name: "scope", type: "string" },
    { name: "timestamp", type: "uint64" },
    { name: "expiration", type: "uint64" },
  ],
  Withdraw: [
    { name: "brokerId", type: "string" },
    { name: "chainId", type: "uint256" },
    { name: "receiver", type: "address" },
    { name: "token", type: "string" },
    { name: "amount", type: "uint256" },
    { name: "withdrawNonce", type: "uint64" },
    { name: "timestamp", type: "uint64" },
  ],
  DelegateWithdraw: [
    { name: "delegateContract", type: "address" },
    { name: "brokerId", type: "string" },
    { name: "chainId", type: "uint256" },
    { name: "receiver", type: "address" },
    { name: "token", type: "string" },
    { name: "amount", type: "uint256" },
    { name: "withdrawNonce", type: "uint64" },
    { name: "timestamp", type: "uint64" },
  ],
  SettlePnl: [
    { name: "brokerId", type: "string" },
    { name: "chainId", type: "uint256" },
    { name: "settleNonce", type: "uint64" },
    { name: "timestamp", type: "uint64" },
  ],
  BindDistributorCode: [
    {
      name: "inviteeAddress",
      type: "address",
    },
    {
      name: "distributorCode",
      type: "string",
    },
  ],
};

export async function checkAccountRegistration(
  address: string,
  brokerId: string
): Promise<{ isRegistered: boolean; accountId?: string }> {
  const response = await fetch(
    `${getBaseUrl()}/v1/get_account?address=${address}&broker_id=${brokerId}`
  );

  if (!response.ok) {
    throw new Error("Failed to check account registration status");
  }

  const json = await response.json();

  if (json.success && json.data?.account_id) {
    return {
      isRegistered: true,
      accountId: json.data.account_id,
    };
  }

  return { isRegistered: false };
}

export async function pollAccountRegistration(
  address: string,
  brokerId: string,
  maxAttempts: number = 20,
  initialDelay: number = 1000
): Promise<string> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const result = await checkAccountRegistration(address, brokerId);

      if (result.isRegistered && result.accountId) {
        return result.accountId;
      }

      if (attempt < maxAttempts) {
        const delay = initialDelay * attempt;
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    } catch (error) {
      console.warn(`Registration check attempt ${attempt} failed:`, error);

      if (attempt < maxAttempts) {
        const delay = initialDelay * attempt;
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw new Error(
    "Account registration polling timed out. Please try again later."
  );
}

export async function registerAccount(
  signer: JsonRpcSigner,
  address: string,
  chainId: number | string,
  brokerId: string
): Promise<string> {
  const registrationCheck = await checkAccountRegistration(address, brokerId);

  if (registrationCheck.isRegistered && registrationCheck.accountId) {
    return registrationCheck.accountId;
  }

  const nonceRes = await fetch(`${getBaseUrl()}/v1/registration_nonce`);
  const nonceJson = await nonceRes.json();
  const registrationNonce = nonceJson.data.registration_nonce as string;

  const registerMessage = {
    brokerId,
    chainId: Number(chainId),
    timestamp: Date.now(),
    registrationNonce,
  };

  const signature = await signer.signTypedData(
    getOffChainDomain(chainId),
    {
      Registration: MESSAGE_TYPES.Registration,
    },
    registerMessage
  );

  const registerRes = await fetch(`${getBaseUrl()}/v1/register_account`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: registerMessage,
      signature,
      userAddress: address,
    }),
  });
  const registerJson = await registerRes.json();
  if (!registerJson.success) {
    throw new Error(registerJson.message);
  }
  return registerJson.data.account_id;
}

export async function addOrderlyKey(
  signer: JsonRpcSigner,
  address: string,
  chainId: number | string,
  brokerId: string,
  scope: Scope,
  accountId: string
): Promise<Uint8Array> {
  const privateKey = utils.randomPrivateKey();
  const orderlyKey = `ed25519:${encodeBase58(
    await getPublicKeyAsync(privateKey)
  )}`;
  const timestamp = Date.now();
  const addKeyMessage = {
    brokerId,
    chainId: Number(chainId),
    orderlyKey,
    scope,
    timestamp,
    expiration: timestamp + 1_000 * 60 * 60 * 24 * 365, // 1 year
  };
  const signature = await signer.signTypedData(
    getOffChainDomain(chainId),
    {
      AddOrderlyKey: MESSAGE_TYPES.AddOrderlyKey,
    },
    addKeyMessage
  );

  const keyRes = await fetch(`${getBaseUrl()}/v1/orderly_key`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: addKeyMessage,
      signature,
      userAddress: address,
    }),
  });
  const keyJson = await keyRes.json();
  if (!keyJson.success) {
    throw new Error(keyJson.message);
  }
  saveOrderlyKey(accountId, privateKey);
  return privateKey;
}

export async function addDelegateOrderlyKey(
  signer: JsonRpcSigner,
  signerAddress: string,
  delegateContract: string,
  chainId: number | string,
  brokerId: string,
  scope: Scope,
  accountId: string
): Promise<Uint8Array> {
  const privateKey = utils.randomPrivateKey();
  const orderlyKey = `ed25519:${encodeBase58(
    await getPublicKeyAsync(privateKey)
  )}`;
  const timestamp = Date.now();
  const addKeyMessage = {
    delegateContract,
    brokerId,
    chainId: Number(chainId),
    orderlyKey,
    scope,
    timestamp,
    expiration: timestamp + 1_000 * 60 * 60 * 24 * 365, // 1 year
  };
  const signature = await signer.signTypedData(
    getOffChainDomain(chainId),
    {
      DelegateAddOrderlyKey: MESSAGE_TYPES.DelegateAddOrderlyKey,
    },
    addKeyMessage
  );

  const keyRes = await fetch(`${getBaseUrl()}/v1/delegate_orderly_key`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: addKeyMessage,
      signature,
      userAddress: signerAddress,
    }),
  });
  const keyJson = await keyRes.json();
  if (!keyJson.success) {
    throw new Error(keyJson.message);
  }
  saveOrderlyKey(accountId, privateKey);
  return privateKey;
}

export async function delegateWithdraw(
  signer: JsonRpcSigner,
  signerAddress: string,
  delegateContract: string,
  chainId: number | string,
  brokerId: string,
  receiver: string,
  token: string,
  amount: number,
  accountId: string,
  orderlyKey: Uint8Array
): Promise<void> {
  const nonceRes = await signAndSendRequest(
    accountId,
    orderlyKey,
    `${getBaseUrl()}/v1/withdraw_nonce`
  );
  const nonceJson = await nonceRes.json();
  const withdrawNonce = nonceJson.data.withdraw_nonce as string;

  const delegateWithdrawMessage = {
    delegateContract,
    brokerId,
    chainId: Number(chainId),
    receiver,
    token,
    amount,
    timestamp: Date.now(),
    withdrawNonce,
  };

  const signature = await signer.signTypedData(
    getOnChainDomain(chainId),
    {
      DelegateWithdraw: MESSAGE_TYPES.DelegateWithdraw,
    },
    delegateWithdrawMessage
  );

  const delegateWithdrawRes = await signAndSendRequest(
    accountId,
    orderlyKey,
    `${getBaseUrl()}/v1/delegate_withdraw_request`,
    {
      method: "POST",
      body: JSON.stringify({
        message: delegateWithdrawMessage,
        signature,
        userAddress: signerAddress,
        verifyingContract: getVerifyingAddress(),
      }),
    }
  );
  const withdrawJson = await delegateWithdrawRes.json();
  if (!withdrawJson.success) {
    throw new Error(withdrawJson.message);
  }
}

export async function getClientHolding(
  accountId: string,
  orderlyKey: Uint8Array
): Promise<{ token: string; holding: number }[]> {
  const response = await signAndSendRequest(
    accountId,
    orderlyKey,
    `${getBaseUrl()}/v1/client/holding`
  );

  const data = await response.json();
  if (!data.success) {
    throw new Error(data.message || "Failed to fetch holdings");
  }
  return data.data?.holding || [];
}

export async function privateFetch(
  input: URL | string,
  init?: RequestInit | undefined
): Promise<any> {
  const timestamp = Date.now();
  const encoder = new TextEncoder();

  const url = new URL(input);
  let message = `${String(timestamp)}${init?.method ?? "GET"}${url.pathname}`;
  if (init?.body) {
    message += init.body;
  }

  // const response = await fetch(`${getBaseUrl()}${input}`,{
  //   headers: {
  //     "Content-Type":
  //       init?.method !== "GET" && init?.method !== "DELETE"
  //         ? "application/json"
  //         : "application/x-www-form-urlencoded",
  //     "orderly-timestamp": String(timestamp),
  //     "orderly-signature": base64EncodeURL(orderlySignature),
  //     ...(init?.headers ?? {}),
  //   },
  //   ...(init ?? {}),);
  // const data = await response.json();
  // return data.data;
}

async function signAndSendRequest(
  accountId: string,
  orderlyKey: Uint8Array | string,
  input: URL | string,
  init?: RequestInit | undefined
): Promise<Response> {
  const timestamp = Date.now();
  const encoder = new TextEncoder();

  const url = new URL(input);
  let message = `${String(timestamp)}${init?.method ?? "GET"}${url.pathname}`;
  if (init?.body) {
    message += init.body;
  }
  const orderlySignature = await signAsync(encoder.encode(message), orderlyKey);

  return fetch(input, {
    headers: {
      "Content-Type":
        init?.method !== "GET" && init?.method !== "DELETE"
          ? "application/json"
          : "application/x-www-form-urlencoded",
      "orderly-timestamp": String(timestamp),
      "orderly-account-id": accountId,
      "orderly-key": `ed25519:${encodeBase58(
        await getPublicKeyAsync(orderlyKey)
      )}`,
      "orderly-signature": base64EncodeURL(orderlySignature),
      ...(init?.headers ?? {}),
    },
    ...(init ?? {}),
  });
}

export async function updateAutoReferral(
  accountId: string,
  orderlyKey: Uint8Array,
  settings: AutoReferralSettings
): Promise<void> {
  const response = await signAndSendRequest(
    accountId,
    orderlyKey,
    `${getBaseUrl()}/v1/referral/auto_referral/update`,
    {
      method: "POST",
      body: JSON.stringify(settings),
    }
  );

  const json = await response.json();
  if (!json.success) {
    throw new Error(json.message || "Failed to update auto referral settings");
  }
}

export async function updateBrokerFees(
  accountId: string,
  orderlyKey: Uint8Array,
  makerFeeRate: number,
  takerFeeRate: number,
  rwaMakerFeeRate?: number,
  rwaTakerFeeRate?: number
): Promise<void> {
  const body: {
    maker_fee_rate: number;
    taker_fee_rate: number;
    rwa_maker_fee_rate?: number;
    rwa_taker_fee_rate?: number;
  } = {
    maker_fee_rate: makerFeeRate,
    taker_fee_rate: takerFeeRate,
  };

  if (rwaMakerFeeRate !== undefined) {
    body.rwa_maker_fee_rate = rwaMakerFeeRate;
  }

  if (rwaTakerFeeRate !== undefined) {
    body.rwa_taker_fee_rate = rwaTakerFeeRate;
  }

  const response = await signAndSendRequest(
    accountId,
    orderlyKey,
    `${getBaseUrl()}/v1/broker/fee_rate/default`,
    {
      method: "POST",
      body: JSON.stringify(body),
    }
  );

  const json = await response.json();
  if (!json.success) {
    throw new Error(json.message || "Failed to update broker fees");
  }
}

export async function getAutoReferralInfo(
  accountId: string,
  orderlyKey: Uint8Array
): Promise<AutoReferralInfo | null> {
  const response = await signAndSendRequest(
    accountId,
    orderlyKey,
    `${getBaseUrl()}/v1/referral/auto_referral/info`
  );

  const json = await response.json();
  if (!json.success) {
    throw new Error(json.message || "Failed to get auto referral info");
  }
  return json.data || null;
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

export function loadOrderlyKey(accountId: string): Uint8Array | undefined {
  const deploymentEnv = import.meta.env.VITE_DEPLOYMENT_ENV || "dev";
  const key = window.localStorage.getItem(
    `${ORDERLY_KEY_LOCAL_STORAGE}:${accountId}:${deploymentEnv}`
  );
  if (!key) return;
  return base64DecodeURL(key);
}

export function saveOrderlyKey(
  accountId: string,
  privateKey: Uint8Array
): void {
  const deploymentEnv = import.meta.env.VITE_DEPLOYMENT_ENV || "dev";
  window.localStorage.setItem(
    `${ORDERLY_KEY_LOCAL_STORAGE}:${accountId}:${deploymentEnv}`,
    base64EncodeURL(privateKey)
  );
}

function base64EncodeURL(byteArray: Uint8Array) {
  return btoa(
    Array.from(new Uint8Array(byteArray))
      .map((val) => {
        return String.fromCharCode(val);
      })
      .join("")
  )
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

function base64DecodeURL(b64urlstring: string): Uint8Array {
  return new Uint8Array(
    atob(b64urlstring.replace(/-/g, "+").replace(/_/g, "/"))
      .split("")
      .map((val) => {
        return val.charCodeAt(0);
      })
  );
}

export type EIP712Domain = {
  name: string;
  version: string;
  chainId: number;
  verifyingContract: Address;
};

export function getOffChainDomain(chainId: number | string): EIP712Domain {
  return {
    name: "Orderly",
    version: "1",
    chainId: Number(chainId),
    verifyingContract: "0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC",
  };
}

export function getOnChainDomain(chainId: number | string): EIP712Domain {
  return {
    name: "Orderly",
    version: "1",
    chainId: Number(chainId),
    verifyingContract: getVerifyingAddress(),
  };
}

export function getBaseUrl(): string {
  const deploymentEnv = import.meta.env.VITE_DEPLOYMENT_ENV;

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

function getVerifyingAddress(): Address {
  const deploymentEnv = import.meta.env.VITE_DEPLOYMENT_ENV;

  switch (deploymentEnv) {
    case "mainnet":
      return "0x6F7a338F2aA472838dEFD3283eB360d4Dff5D203";
    case "staging":
      return "0x1826B75e2ef249173FC735149AE4B8e9ea10abff";
    case "qa":
      return "0x50F59504D3623Ad99302835da367676d1f7E3D44";
    case "dev":
    default:
      return "0x8794E7260517B1766fc7b55cAfcd56e6bf08600e";
  }
}
