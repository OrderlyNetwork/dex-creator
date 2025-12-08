import { getOrderlyApiBaseUrl } from "../utils/orderly";
import { getSignature } from "./sign";
import { getSecret } from "./secretManager";

type CreateBrokerData = {
  broker_id: string;
  broker_name: string;
  address: string;
  chain_id: number;
  chain_type: "EVM" | "SOL";
  default_maker_fee_rate: number;
  default_taker_fee_rate: number;
  default_rwa_maker_fee_rate: number;
  default_rwa_taker_fee_rate: number;
};

export async function createBroker(data: CreateBrokerData) {
  const accountId = await getSecret("creatorBrokerApiAccountId");
  const secretKey = await getSecret("creatorBrokerApiSecretKey");

  const path = "/v1/orderly_one/broker";
  const fullUrl = `${getOrderlyApiBaseUrl()}/v1/orderly_one/broker`;

  const payload = {
    url: path,
    method: "POST",
    data,
  };

  const signature = await getSignature(accountId, secretKey, payload);

  const response = await fetch(fullUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...signature,
    },
    body: JSON.stringify(data),
  });

  return response.json();
}
