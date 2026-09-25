export const CONTACT_RECIPIENT = "info@goldkrest.group";
export const CONTACT_ENDPOINT = `https://formsubmit.co/ajax/${CONTACT_RECIPIENT}`;
export const MAX_CONTACT_BYTES = 16384;
export const CONTACT_ORIGIN = "https://brandonollie.cemseziner.chatgpt.site";
export type Enquiry = { name: string; email: string; phone: string; location: string; service: string; message: string; website: string };
export class ContactError extends Error {
  status: number;
  constructor(message: string, status = 400) { super(message); this.status = status; }
}

export function validateEnquiry(value: unknown): Enquiry {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new ContactError("Please check your enquiry and try again.");
  const raw = value as Record<string, unknown>;
  const field = (key: string, max: number, required = false) => {
    if (raw[key] !== undefined && typeof raw[key] !== "string") throw new ContactError(`Please check the ${key} field.`);
    const text = ((raw[key] as string) ?? "").trim();
    if ((required && !text) || text.length > max || /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(text)) throw new ContactError(`Please check the ${key} field.`);
    return text;
  };
  const enquiry = { name: field("name", 100, true), email: field("email", 254, true), phone: field("phone", 40), location: field("location", 160), service: field("service", 100), message: field("message", 4000, true), website: field("website", 200) };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(enquiry.email)) throw new ContactError("Please enter a valid email address.");
  if (/[\r\n]/.test(enquiry.name + enquiry.email + enquiry.phone + enquiry.service)) throw new ContactError("Please check your contact details.");
  if (enquiry.message.length < 10) throw new ContactError("Please add a little more detail about your project.");
  return enquiry;
}

export async function readContactBody(request: Request): Promise<unknown> {
  if (request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !== "application/json") throw new ContactError("Unsupported request format.", 415);
  const reader = request.body?.getReader();
  if (!reader) throw new ContactError("Your enquiry is empty.");
  const chunks: Uint8Array[] = []; let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > MAX_CONTACT_BYTES) { await reader.cancel(); throw new ContactError("Your enquiry is too long.", 413); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const bytes = new Uint8Array(size); let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
  try { return JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes)); }
  catch { throw new ContactError("Please check your enquiry and try again."); }
}

export function originAllowed(origin: string | null, configured: string | undefined, development: boolean): boolean {
  const allowed = new Set([CONTACT_ORIGIN]);
  for (const value of (configured ?? "").split(",").map(s => s.trim()).filter(Boolean)) {
    try { const url = new URL(value); if (url.protocol === "https:" && url.origin === value) allowed.add(value); } catch { /* Ignore invalid deployment configuration. */ }
  }
  if (development) { allowed.add("http://localhost:5173"); allowed.add("http://127.0.0.1:5173"); }
  return origin !== null && allowed.has(origin);
}

export async function deliverEnquiry(enquiry: Enquiry, fetcher: typeof fetch = fetch): Promise<void> {
  const response = await fetcher(CONTACT_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json", Referer: `${CONTACT_ORIGIN}/contact` },
    signal: AbortSignal.timeout(12000),
    body: JSON.stringify({ name: enquiry.name, email: enquiry.email, phone: enquiry.phone || "Not supplied", location: enquiry.location || "Not supplied", service: enquiry.service || "General enquiry", message: enquiry.message,
      _subject: "New website enquiry — Goldkrest Group", _template: "table", _captcha: "false" }),
  });
  if (!response.ok) throw new Error("Email service unavailable");
  const result = await response.json() as { success?: unknown; message?: unknown };
  // The provider accepts submissions for forwarding only after inbox activation.
  if (!(result.success === true || result.success === "true")) throw new Error("Email service did not accept the enquiry");
  if (typeof result.message === "string" && /activat|confirm|verify|check your email/i.test(result.message)) throw new Error("Email activation required");
}
