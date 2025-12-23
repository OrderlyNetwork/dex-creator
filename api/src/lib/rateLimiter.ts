/**
 * In-memory rate limiter for DEX deployment operations
 * Prevents DoS attacks by limiting deployment frequency per user account
 */

import { Context } from "hono";

interface RateLimitEntry {
  lastRequest: number;
  count: number;
}

class RateLimiter {
  private userLimits = new Map<string, RateLimitEntry>();
  private readonly cooldownMs: number;
  private readonly cleanupInterval: NodeJS.Timeout;

  constructor(cooldownMinutes: number = 5) {
    this.cooldownMs = cooldownMinutes * 60 * 1000;

    this.cleanupInterval = setInterval(
      () => {
        this.cleanup();
      },
      10 * 60 * 1000
    );
  }

  /**
   * Check if a user is rate limited for DEX deployments
   * @param userId The user ID
   * @returns true if rate limited, false if allowed
   */
  isRateLimited(userId: string): boolean {
    const now = Date.now();

    const userEntry = this.userLimits.get(userId);
    if (userEntry && now - userEntry.lastRequest < this.cooldownMs) {
      console.log(
        `Rate limit hit for user ${userId}: ${Math.ceil(
          (this.cooldownMs - (now - userEntry.lastRequest)) / 1000
        )}s remaining`
      );
      return true;
    }

    return false;
  }
  /**
   * Record a deployment request for a user
   * @param userId The user ID
   */
  recordRequest(userId: string): void {
    const now = Date.now();

    this.userLimits.set(userId, {
      lastRequest: now,
      count: (this.userLimits.get(userId)?.count || 0) + 1,
    });

    console.log(`Recorded deployment request for user ${userId}`);
  }

  /**
   * Get remaining cooldown time in seconds
   * @param userId The user ID
   * @returns Remaining cooldown in seconds, or 0 if not rate limited
   */
  getRemainingCooldown(userId: string): number {
    const now = Date.now();
    const userEntry = this.userLimits.get(userId);

    if (!userEntry) {
      return 0;
    }

    const remainingMs = this.cooldownMs - (now - userEntry.lastRequest);
    return Math.max(0, Math.ceil(remainingMs / 1000));
  }

  /**
   * Clean up old entries to prevent memory leaks
   */
  private cleanup(): void {
    const now = Date.now();
    const expiredThreshold = now - this.cooldownMs * 2;

    for (const [userId, entry] of this.userLimits.entries()) {
      if (entry.lastRequest < expiredThreshold) {
        this.userLimits.delete(userId);
      }
    }

    console.log(`Rate limiter cleanup: ${this.userLimits.size} users tracked`);
  }

  /**
   * Manually clear rate limit for a user (for admin use)
   * @param userId The user ID to clear
   */
  clearUserLimit(userId: string): void {
    this.userLimits.delete(userId);
    console.log(`Cleared rate limit for user ${userId}`);
  }

  /**
   * Cleanup on shutdown
   */
  destroy(): void {
    clearInterval(this.cleanupInterval);
    this.userLimits.clear();
  }
}

export const deploymentRateLimiter = new RateLimiter(2);
export const themeRateLimiter = new RateLimiter(0.5);
export const fineTuneRateLimiter = new RateLimiter(10 / 60);

export function createDeploymentRateLimit(rateLimiter: RateLimiter) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return async (c: Context, next: any) => {
    const userId = c.get("userId");

    if (rateLimiter.isRateLimited(userId)) {
      const remainingSeconds = rateLimiter.getRemainingCooldown(userId);

      return c.json(
        {
          error: "Rate limit exceeded",
          message: `Please wait ${remainingSeconds} seconds before creating or updating another DEX`,
          retryAfter: remainingSeconds,
        },
        429
      );
    }

    await next();

    const response = c.res;
    if (response && response.status >= 200 && response.status < 300) {
      rateLimiter.recordRequest(userId);
    }
  };
}

process.on("SIGTERM", () => {
  deploymentRateLimiter.destroy();
  themeRateLimiter.destroy();
  fineTuneRateLimiter.destroy();
});

process.on("SIGINT", () => {
  deploymentRateLimiter.destroy();
  themeRateLimiter.destroy();
  fineTuneRateLimiter.destroy();
});
