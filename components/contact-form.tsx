"use client";
import { useRef, useState } from "react";
import { ArrowUpRight, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export function ContactForm({ service = "" }: { service?: string }) {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");
  const statusRef = useRef<HTMLDivElement>(null);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "sending" || status === "sent") return;
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    const data = Object.fromEntries(new FormData(form));
    setStatus("sending"); setError("");
    try {
      const response = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data), signal: AbortSignal.timeout(20000) });
      const result = await response.json() as { ok?: boolean; error?: string };
      if (!response.ok || !result.ok) throw new Error(result.error || "We couldn’t send your enquiry. Please try again or contact us directly.");
      setStatus("sent"); form.reset();
    } catch (issue) {
      setError(issue instanceof Error && issue.name !== "TimeoutError" ? issue.message : "The connection timed out. Please try again or contact us directly.");
      setStatus("error");
    }
    requestAnimationFrame(() => statusRef.current?.focus());
  }
  return <div className="enquiry-form-panel"><p className="eyebrow">TELL US ABOUT YOUR PROJECT</p><h2>Send an enquiry</h2><p className="form-intro">Fill in the details below and we’ll be in touch. Fields marked * are required.</p>
    <form className="enquiry-form" onSubmit={submit} aria-busy={status === "sending"}>
      <fieldset disabled={status === "sending" || status === "sent"}>
        <div className="form-grid"><div className="form-field"><Label htmlFor="enquiry-name">Your name *</Label><Input id="enquiry-name" name="name" autoComplete="name" required maxLength={100} /></div><div className="form-field"><Label htmlFor="enquiry-email">Email address *</Label><Input id="enquiry-email" name="email" type="email" autoComplete="email" required maxLength={254} /></div><div className="form-field"><Label htmlFor="enquiry-phone">Phone number</Label><Input id="enquiry-phone" name="phone" type="tel" autoComplete="tel" maxLength={40} /></div><div className="form-field"><Label htmlFor="enquiry-location">Town or postcode</Label><Input id="enquiry-location" name="location" autoComplete="postal-code" maxLength={160} /></div></div>
        <div className="form-field"><Label htmlFor="enquiry-service">Type of work</Label><Input id="enquiry-service" name="service" defaultValue={service} placeholder="For example, brickwork or garden landscaping" maxLength={100} /></div>
        <div className="form-field"><Label htmlFor="enquiry-message">Tell us about your project *</Label><Textarea id="enquiry-message" name="message" rows={6} required minLength={10} maxLength={4000} placeholder="What would you like us to help with?" /></div>
        <div className="form-honeypot" aria-hidden="true"><label htmlFor="enquiry-website">Leave this field empty</label><input id="enquiry-website" name="website" tabIndex={-1} autoComplete="off" /></div>
        <p className="form-privacy">We use your details to respond to your enquiry. Our delivery service, <a href="https://formsubmit.co/privacy.pdf" target="_blank" rel="noopener noreferrer">FormSubmit</a>, processes your message and keeps a submission archive for 30 days. Please don’t include sensitive information.</p>
        <Button type="submit" className="button button-gold form-submit" disabled={status === "sending" || status === "sent"}>{status === "sending" ? "Sending enquiry…" : "Send enquiry"}<ArrowUpRight size={18} aria-hidden="true" /></Button>
      </fieldset>
      <div ref={statusRef} tabIndex={-1} role={status === "error" ? "alert" : "status"} aria-live="polite" className={`form-status ${status === "error" ? "form-error" : status === "sent" ? "form-success" : ""}`}>
        {status === "error" && error}{status === "sent" && <><CheckCircle2 size={22} aria-hidden="true" /><span>Thank you. Your enquiry has been submitted. We’ll be in touch using the details you provided.</span></>}
      </div>
      <noscript><p>Please enable JavaScript to use the form, or email <a href="mailto:info@goldkrest.group">info@goldkrest.group</a>.</p></noscript>
    </form>
  </div>;
}
