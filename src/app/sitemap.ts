import type { MetadataRoute } from "next";
import { abs } from "@/lib/site";
import { programs } from "@/lib/programs";
import { staff } from "@/lib/staff";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const page = (path: string, priority: number, changeFrequency: "daily" | "weekly" | "monthly" = "weekly") => ({
    url: abs(path),
    lastModified,
    changeFrequency,
    priority,
  });
  return [
    page("/", 1, "daily"),
    page("/program", 0.9, "daily"),
    page("/themes", 0.8),
    page("/themes/siu", 0.7),
    page("/themes/gia", 0.7),
    page("/guide", 0.8),
    page("/about", 0.7),
    page("/team", 0.6),
    page("/interactive", 0.7),
    page("/interactive/echoes", 0.7),
    page("/interactive/drift", 0.5, "monthly"),
    page("/interactive/quiz", 0.5, "monthly"),
    page("/interactive/labels", 0.4, "monthly"),
    page("/interactive/home", 0.4, "monthly"),
    ...programs.map((p) => page(`/program/${p.slug}`, 0.8)),
    ...staff.map((s) => page(`/interactive/echoes/${s.id}`, 0.5, "monthly")),
  ];
}
