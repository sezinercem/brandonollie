export const RATE_LIMIT = 120;
export const WINDOW_SECONDS = 60;
export const INCREMENT_SQL = `INSERT INTO rate_limits (key, count, expires_at) VALUES (?, 1, ?)
ON CONFLICT(key) DO UPDATE SET count = MIN(rate_limits.count + 1, ?)
RETURNING count`;
export const CLEANUP_SQL = `DELETE FROM rate_limits WHERE key IN
(SELECT key FROM rate_limits WHERE expires_at <= ? ORDER BY expires_at LIMIT 100)`;
export async function rateKey(ip: string, window: number): Promise<string> {
  // Rotating pseudonymous key; no raw IP addresses are stored.
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`${window}:${ip}`));
  return Array.from(new Uint8Array(digest), n => n.toString(16).padStart(2, "0")).join("");
}
export async function checkRateLimit(db: D1Database, ip: string, now = Date.now(), policy = { limit: RATE_LIMIT, seconds: WINDOW_SECONDS, scope: "page" }) {
  const seconds = Math.floor(now / 1000);
  const window = Math.floor(seconds / policy.seconds);
  const reset = (window + 1) * policy.seconds;
  const key = await rateKey(`${policy.scope}:${ip}`, window);
  const results = await db.batch([
    db.prepare(INCREMENT_SQL).bind(key, reset + policy.seconds, policy.limit + 1),
    db.prepare(CLEANUP_SQL).bind(seconds),
  ]);
  const count = (results[0].results[0] as { count: number } | undefined)?.count;
  if (typeof count !== "number") throw new Error("Rate limit unavailable");
  return { allowed: count <= policy.limit, remaining: Math.max(0, policy.limit - count), retryAfter: reset - seconds };
}
