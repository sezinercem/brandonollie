import type { MetadataRoute } from "next";
import { site } from "@/lib/site";
export default function sitemap(): MetadataRoute.Sitemap {
  // Add real public routes here as they are built. Do not fabricate modification dates.
  return site.indexable ? ["/", "/brickwork", "/landscaping", "/pressure-washing", "/contact"].map(path => ({ url: `${site.url}${path}` })) : [];
}
