import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return ["", "/methodology", "/faq", "/privacy", "/terms"].map((path) => ({ url: new URL(path || "/", siteUrl()).toString(), lastModified: new Date(), changeFrequency: path ? "monthly" : "weekly", priority: path ? .6 : 1 }));
}
