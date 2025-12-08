export type MessageFactor = {
  url: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  data?: any;
};

export type SignedMessagePayload = {
  "orderly-key": string;
  "orderly-timestamp": string;
  "orderly-signature": string;
  "orderly-account-id"?: string;
};
