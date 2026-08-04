import type { MetadataRoute } from "next";
import { TOOLS } from "@/data/tools";
import { SITE_URL } from "@/lib/seo";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return [
    {
      url: `${SITE_URL}/`,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/tools`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    ...TOOLS.map((tool) => ({
      url: `${SITE_URL}/tools/${tool.slug}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: tool.featured ? 0.8 : tool.popular ? 0.7 : 0.6,
    })),
  ];
}
