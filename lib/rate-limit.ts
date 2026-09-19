import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

interface Bucket { count: number; resetsAt: number }
export interface QuotaResult { allowed: boolean; remaining: number; retryAfter: number; configured: boolean }

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 10;
const buckets = new Map<string, Bucket>();
const hasRedis = Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
const distributedLimiter = hasRedis ? new Ratelimit({
  redis: Redis.fromEnv(), limiter: Ratelimit.slidingWindow(MAX_REQUESTS, "1 m"),
  prefix: "shieldcircle:scan", analytics: true,
}) : null;

function consumeLocal(identifier: string, now: number): QuotaResult {
  const current = buckets.get(identifier);
  if (!current || current.resetsAt <= now) {
    buckets.set(identifier, { count: 1, resetsAt: now + WINDOW_MS });
    return { allowed: true, remaining: MAX_REQUESTS - 1, retryAfter: 0, configured: true };
  }
  if (current.count >= MAX_REQUESTS) return { allowed: false, remaining: 0, retryAfter: Math.max(1, Math.ceil((current.resetsAt - now) / 1000)), configured: true };
  current.count += 1;
  return { allowed: true, remaining: MAX_REQUESTS - current.count, retryAfter: 0, configured: true };
}

/** Uses shared Redis in production and a deterministic local bucket in development/test. */
export async function consumeScanQuota(identifier: string, now = Date.now()): Promise<QuotaResult> {
  if (distributedLimiter) {
    const result = await distributedLimiter.limit(identifier);
    return { allowed: result.success, remaining: result.remaining, retryAfter: result.success ? 0 : Math.max(1, Math.ceil((result.reset - now) / 1000)), configured: true };
  }
  const localAllowed = process.env.NODE_ENV !== "production" || process.env.ALLOW_IN_MEMORY_RATE_LIMIT === "true";
  if (!localAllowed) return { allowed: false, remaining: 0, retryAfter: 0, configured: false };
  return consumeLocal(identifier, now);
}
