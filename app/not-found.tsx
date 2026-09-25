import type { Metadata } from "next";
export const metadata: Metadata = { title: "Page not found", robots: { index: false, follow: false }, alternates: { canonical: null } };
export default function NotFound() { return <section className="error-page section-wrap"><div><h1>Page not found</h1><a href="/">Return home</a></div></section>; }
