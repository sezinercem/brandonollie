import type { MetadataRoute } from "next";
import { site } from "@/lib/site";
export default function manifest(): MetadataRoute.Manifest {
  return { name: site.name, short_name: site.name, start_url: "/", display: "browser",
    background_color: "#303A1C", theme_color: "#303A1C", icons: [{ src: "/favicon.svg", sizes: "any", type: "image/svg+xml" }] };
}
