import { get, post } from "../net/fetch";

/** verify distributor code from api */
export async function verifyDistributorCodeMessage(distributorCode: string) {
  const message = "Distributor code is not exists.";
  try {
    const res = await verifyDistributorCode(distributorCode);
    if (res) {
      return null;
    }
    return message;
  } catch (err) {
    console.error("Error verifying distributor code:", err);
    return message;
  }
}

export async function verifyDistributorCode(distributorCode: string) {
  const res = await get(
    `/v1/orderly_one/vanguard/verify_code?distributor_code=${distributorCode}`
  );
  return res?.exist;
}

export async function checkAddressIsBound(address: string) {
  const res = await get(`/v1/orderly_one/vanguard/check?address=${address}`);
  return res?.exist;
}

export async function bindDistributorCode(data: any) {
  const res = await post("/v1/orderly_one/vanguard/bind", data);
  return res?.success;
}
