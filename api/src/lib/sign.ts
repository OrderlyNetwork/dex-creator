import { getPublicKeyAsync, signAsync } from "@noble/ed25519";
import { encodeBase58 } from "ethers";
import { default as bs58 } from "bs58";

type SignedMessagePayload = {
  "orderly-key": string;
  "orderly-timestamp": string;
  "orderly-signature": string;
  "orderly-account-id"?: string;
};

export async function getSignature(
  accountId: string,
  secretKey: string,
  payload: {
    url: string;
    method: string;
    data?: any;
  }
): Promise<SignedMessagePayload> {
  const orderlyKey = bs58.decode(secretKey);

  const timestamp = Date.now();
  const { method, url, data } = payload;

  let message = `${timestamp}${method ?? "POST"}${url}`;
  if (data) {
    message += JSON.stringify(data);
  }

  const encoder = new TextEncoder();
  const orderlySignature = await signAsync(encoder.encode(message), orderlyKey);

  const publicKey = await getPublicKeyAsync(orderlyKey);
  const orderlyKeyHeader = `ed25519:${encodeBase58(publicKey)}`;

  return {
    "orderly-timestamp": `${timestamp}`,
    "orderly-key": orderlyKeyHeader,
    "orderly-signature": base64EncodeURL(orderlySignature),
    "orderly-account-id": accountId,
  };
}

function base64EncodeURL(byteArray: Uint8Array) {
  return btoa(
    Array.from(new Uint8Array(byteArray))
      .map(val => {
        return String.fromCharCode(val);
      })
      .join("")
  )
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}
