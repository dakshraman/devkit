import type { MetadataRoute } from "next";
import { TOOLS } from "@/data/tools";
import { SITE_URL } from "@/lib/seo";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    {
      url: `${SITE_URL}/`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/tools`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/dashboard`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...TOOLS.map((tool) => ({
      url: `${SITE_URL}/tools/${tool.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: tool.popular ? 0.85 : tool.featured ? 0.8 : 0.7,
    })),
  ];
}
