import type { Metadata } from "next";
import { site } from "./site";
export function pageMetadata(title: string, description: string, path: string): Metadata {
  return {
    title, description,
    ...(site.url ? { alternates: { canonical: path } } : {}),
    openGraph: { title: `${title} | ${site.name}`, description, type: "website", siteName: site.name, locale: site.locale, ...(site.url ? { url: `${site.url}${path}` } : {}) },
    twitter: { card: "summary", title: `${title} | ${site.name}`, description },
  };
}
