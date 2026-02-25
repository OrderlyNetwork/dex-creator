import { i18n } from "~/i18n";

interface CachedTokenInfo {
  price: number | null;
  logo: string | null;
  symbol: string;
  decimals: number;
  timestamp: number;
}

interface CachedEthPrice {
  price: number;
  timestamp: number;
}

const CACHE_DURATION = 60 * 60 * 1000;
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000;

async function fetchWithRetry(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(url, options);

      if (response.status === 429) {
        const retryDelay = INITIAL_RETRY_DELAY * Math.pow(2, attempt);
        console.warn(
          `Rate limited by CoinGecko. Retrying in ${retryDelay}ms... (attempt ${attempt + 1}/${MAX_RETRIES})`
        );
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        continue;
      }

      return response;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (attempt < MAX_RETRIES - 1) {
        const retryDelay = INITIAL_RETRY_DELAY * Math.pow(2, attempt);
        console.warn(
          `Network error. Retrying in ${retryDelay}ms... (attempt ${attempt + 1}/${MAX_RETRIES})`
        );
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }
  }

  throw lastError || new Error(i18n.t("error.maxRetriesExceeded"));
}

function getCacheKey(
  type: "token" | "eth",
  chain?: string,
  address?: string
): string {
  if (type === "eth") {
    return `coingecko_eth_price`;
  }
  return `coingecko_token_${chain}_${address?.toLowerCase()}`;
}

function getCachedData<T>(key: string): T | null {
  try {
    const cached = localStorage.getItem(key);
    if (!cached) return null;

    const data = JSON.parse(cached);
    const now = Date.now();

    if (now - data.timestamp > CACHE_DURATION) {
      localStorage.removeItem(key);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error reading from cache:", error);
    return null;
  }
}

function setCachedData(key: string, data: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error("Error writing to cache:", error);
  }
}

export async function getEthPrice(): Promise<number | null> {
  const cacheKey = getCacheKey("eth");
  const cached = getCachedData<CachedEthPrice>(cacheKey);

  if (cached) {
    return cached.price;
  }

  try {
    const response = await fetchWithRetry(
      "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd"
    );

    if (response.ok) {
      const data = await response.json();
      const price = data.ethereum?.usd || null;

      if (price) {
        setCachedData(cacheKey, {
          price,
          timestamp: Date.now(),
        });
      }

      return price;
    }
  } catch (error) {
    console.error("Error fetching ETH price:", error);
  }

  return null;
}

export async function getTokenInfo(
  chain: string,
  address: string
): Promise<{
  price: number | null;
  logo: string | null;
} | null> {
  const cacheKey = getCacheKey("token", chain, address);
  const cached = getCachedData<CachedTokenInfo>(cacheKey);

  if (cached) {
    return {
      price: cached.price,
      logo: cached.logo,
    };
  }

  try {
    const platformId =
      chain === "ethereum"
        ? "ethereum"
        : chain === "arbitrum"
          ? "arbitrum-one"
          : "base";

    const response = await fetchWithRetry(
      `https://api.coingecko.com/api/v3/coins/${platformId}/contract/${address.toLowerCase()}`
    );

    if (response.ok) {
      const data = await response.json();
      const price = data.market_data?.current_price?.usd || null;
      const logo = data.image?.small || data.image?.thumb || null;

      setCachedData(cacheKey, {
        price,
        logo,
        symbol: data.symbol || "UNKNOWN",
        decimals: data.detail_platforms?.[platformId]?.decimal_place || 18,
        timestamp: Date.now(),
      });

      return { price, logo };
    } else {
      console.warn(`CoinGecko API returned ${response.status} for ${address}`);
    }
  } catch (error) {
    console.error(`Error fetching token info for ${address}:`, error);
  }

  return null;
}

export function clearTokenInfoCache(): void {
  try {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith("coingecko_")) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.error("Error clearing cache:", error);
  }
}
