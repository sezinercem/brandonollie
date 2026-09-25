import { NextRequest, NextResponse } from "next/server";
import { env } from "cloudflare:workers";
import { checkRateLimit, RATE_LIMIT } from "./lib/rate-limit";
import { site } from "./lib/site";

export async function proxy(request: NextRequest) {
  const dev = process.env.NODE_ENV !== "production";
  const nonce = btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(16))));
  const csp = ["default-src 'self'", `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${dev ? " 'unsafe-eval'" : ""}`,
    `style-src 'self'${dev ? " 'unsafe-inline'" : ` 'nonce-${nonce}'`}`, "img-src 'self' data:", "font-src 'self'",
    `connect-src 'self'${dev ? " ws: wss:" : ""}`, "object-src 'none'", "base-uri 'none'", "form-action 'self'",
    "frame-ancestors 'none'", ...(!dev ? ["upgrade-insecure-requests"] : [])].join("; ");
  function protect(response: NextResponse) {
    response.headers.set("Content-Security-Policy", csp);
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=(), usb=()");
    response.headers.set("Cross-Origin-Opener-Policy", "same-origin");
    response.headers.set("X-DNS-Prefetch-Control", "off");
    response.headers.set("Cache-Control", "private, no-store");
    if (!site.indexable || response.status >= 400) response.headers.set("X-Robots-Tag", "noindex, nofollow");
    if (!dev) response.headers.set("Strict-Transport-Security", "max-age=31536000");
    return response;
  }
  function reject(message: string, status: number) {
    return protect(new NextResponse(request.method === "HEAD" ? null : message, { status }));
  }
  if (request.url.length > 4096) return reject("Request URL too long", 414);
  // The only write endpoint is the validated, same-origin, rate-limited enquiry form.
  if (!["GET", "HEAD"].includes(request.method) && !(request.method === "POST" && request.nextUrl.pathname === "/api/contact")) {
    const response = reject("Method not allowed", 405);
    response.headers.set("Allow", "GET, HEAD");
    return response;
  }
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);
  try {
    const bindings = env as unknown as { DB: D1Database };
    // Cloudflare sets CF-Connecting-IP at its edge. Never trust X-Forwarded-For.
    // Local preview shares one bucket; production fails closed if identity is absent.
    const ip = dev ? "local-preview" : request.headers.get("cf-connecting-ip");
    if (!ip) throw new Error("Trusted client identity unavailable");
    const limit = await checkRateLimit(bindings.DB, ip);
    const response = limit.allowed ? protect(NextResponse.next({ request: { headers: requestHeaders } }))
      : reject("Too many requests. Please try again shortly.", 429);
    response.headers.set("X-RateLimit-Limit", String(RATE_LIMIT));
    response.headers.set("X-RateLimit-Remaining", String(limit.remaining));
    if (!limit.allowed) response.headers.set("Retry-After", String(limit.retryAfter));
    return response;
  } catch {
    // Do not silently disable protection when its database is unavailable.
    const response = reject("Temporarily unavailable. Please try again shortly.", 503);
    response.headers.set("Retry-After", "60");
    console.error("Request protection unavailable");
    return response;
  }
}
export const config = { matcher: ["/((?!_next/|assets/|@vite/|@id/|@fs/|node_modules/|favicon.svg).*)"] };
