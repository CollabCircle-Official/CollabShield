interface Bucket { count: number; resetsAt: number }

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 10;
const buckets = new Map<string, Bucket>();

/** Best-effort per-instance limiter. Production deployments should also enforce limits at the edge. */
export function consumeScanQuota(identifier: string, now = Date.now()): { allowed: boolean; remaining: number; retryAfter: number } {
  const current = buckets.get(identifier);
  if (!current || current.resetsAt <= now) {
    buckets.set(identifier, { count: 1, resetsAt: now + WINDOW_MS });
    return { allowed: true, remaining: MAX_REQUESTS - 1, retryAfter: 0 };
  }
  if (current.count >= MAX_REQUESTS) {
    return { allowed: false, remaining: 0, retryAfter: Math.max(1, Math.ceil((current.resetsAt - now) / 1000)) };
  }
  current.count += 1;
  return { allowed: true, remaining: MAX_REQUESTS - current.count, retryAfter: 0 };
}
