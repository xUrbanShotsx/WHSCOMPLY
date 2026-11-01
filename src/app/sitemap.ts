import type { MetadataRoute } from "next";
import { states, topics } from "@/lib/content";
import { LAST_UPDATED, SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date(LAST_UPDATED);
  const entry = (
    path: string,
    priority: number,
    changeFrequency: "weekly" | "monthly",
  ) => ({
    url: `${SITE_URL}${path}`,
    lastModified,
    changeFrequency,
    priority,
  });
  return [
    entry("", 1, "weekly"),
    entry("/solutions", 0.9, "monthly"),
    entry("/pricing", 0.9, "monthly"),
    entry("/about", 0.6, "monthly"),
    entry("/resources", 0.6, "monthly"),
    entry("/states", 0.7, "monthly"),
    ...topics.map((t) => entry(`/solutions/${t.slug}`, 0.8, "monthly")),
    ...states.map((s) => entry(`/states/${s.slug}`, 0.7, "monthly")),
  ];
}
