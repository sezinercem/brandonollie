import { env } from "cloudflare:workers";
import { ContactError, deliverEnquiry, originAllowed, readContactBody, validateEnquiry } from "@/lib/contact";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const headers = { "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow" };
  const reply = (body: object, status: number, extra: Record<string, string> = {}) => Response.json(body, { status, headers: { ...headers, ...extra } });
  const bindings = env as unknown as { DB: D1Database; CONTACT_ALLOWED_ORIGINS?: string };
  const development = process.env.NODE_ENV !== "production";
  if (!originAllowed(request.headers.get("origin"), bindings.CONTACT_ALLOWED_ORIGINS, development) || request.headers.get("sec-fetch-site") === "cross-site") return reply({ error: "Please submit your enquiry from our contact page." }, 403);
  try {
    const ip = development ? "local-preview" : request.headers.get("cf-connecting-ip");
    if (!ip) return reply({ error: "Please try again shortly, or contact us by phone or email." }, 503);
    const limit = await checkRateLimit(bindings.DB, ip, Date.now(), { limit: 3, seconds: 600, scope: "contact" });
    if (!limit.allowed) return reply({ error: "You have sent several enquiries. Please wait before trying again, or call us." }, 429, { "Retry-After": String(limit.retryAfter) });
    const enquiry = validateEnquiry(await readContactBody(request));
    if (enquiry.website) return reply({ ok: true }, 202); // Honeypot; do not forward spam.
    await deliverEnquiry(enquiry);
    return reply({ ok: true }, 202);
  } catch (error) {
    if (error instanceof ContactError) return reply({ error: error.message }, error.status);
    // No names, email addresses, messages, or provider responses in logs.
    console.error("Contact enquiry could not be forwarded");
    return reply({ error: "We couldn’t send your enquiry just now. Your details are still here — please try again later, call 07394 633885 or email info@goldkrest.group." }, 503);
  }
}
