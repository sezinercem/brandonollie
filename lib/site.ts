// Replace provisional copy and supply the real domain before enabling indexing.
export const site = {
  name: "Goldkrest Group",
  title: "Goldkrest Group | A Golden Standard",
  description: "Specialist brickwork, stone restoration, lime pointing, landscaping and pressure washing. Built on 15 years of hands-on experience.",
  url: "", // Canonical HTTPS origin, without a trailing slash.
  language: "en",
  locale: "en_GB",
  indexable: false,
  verification: { google: "", bing: "" },
  business: { legalName: "", email: "info@goldkrest.group", telephone: "+447394633885", sameAs: [] as string[] },
};
if (site.indexable && (!site.url || !site.url.startsWith("https://"))) {
  throw new Error("A canonical HTTPS domain is required before enabling indexing.");
}
if (site.url) {
  const url = new URL(site.url);
  if (url.origin !== site.url || url.protocol !== "https:") throw new Error("Use a bare HTTPS origin for site.url.");
}
export function structuredData() {
  if (!site.indexable) return null;
  return { "@context": "https://schema.org", "@graph": [
    { "@type": "WebSite", "@id": `${site.url}/#website`, url: site.url, name: site.name, inLanguage: site.language },
    { "@type": "Organization", "@id": `${site.url}/#organization`, url: site.url, name: site.name,
      ...(site.business.legalName ? { legalName: site.business.legalName } : {}),
      ...(site.business.email ? { email: site.business.email } : {}),
      ...(site.business.telephone ? { telephone: site.business.telephone } : {}),
      ...(site.business.sameAs.length ? { sameAs: site.business.sameAs } : {}),
    },
  ] };
}
