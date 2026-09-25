import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import { site, structuredData } from "@/lib/site";
import "./globals.css";
import { SiteHeader, SiteFooter, AnimatedBackground } from "@/components/site-shell";
export const metadata: Metadata = {
  ...(site.url ? { metadataBase: new URL(site.url) } : {}),
  title: { default: site.title, template: `%s | ${site.name}` },
  description: site.description,
  applicationName: site.name,
  robots: { index: site.indexable, follow: site.indexable,
    googleBot: { index: site.indexable, follow: site.indexable, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } },
  openGraph: { type: "website", title: site.title, description: site.description,
    siteName: site.name, locale: site.locale, ...(site.url ? { url: site.url } : {}) },
  twitter: { card: "summary", title: site.title, description: site.description },
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
  manifest: "/manifest.webmanifest",
  formatDetection: { telephone: false },
  verification: { ...(site.verification.google ? { google: site.verification.google } : {}),
    ...(site.verification.bing ? { other: { "msvalidate.01": site.verification.bing } } : {}) },
};
export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#303A1C", colorScheme: "light" };
export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const nonce = (await headers()).get("x-nonce") ?? undefined;
  const data = structuredData();
  return <html lang={site.language}><body id="top"><a href="#main-content" className="skip-link">Skip to content</a><AnimatedBackground /><SiteHeader /><main id="main-content">{children}</main><SiteFooter />{data && <script type="application/ld+json" nonce={nonce}
    dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />}</body></html>;
}
