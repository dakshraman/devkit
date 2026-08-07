import type { Metadata } from "next";
import { ToolsIndexPage } from "@/features/tools/tools-index-page";
import { buildMetadata, SITE_NAME, SITE_URL } from "@/lib/seo";
import { TOOLS } from "@/data/tools";

export const metadata: Metadata = buildMetadata({
  title: "All Tools",
  description:
    "Browse all 39 DevKit tools — formatters, generators, converters, analyzers and references. Every tool runs 100% in your browser with no account or upload.",
  path: "/tools",
  keywords: ["all tools", "developer utilities", "free dev tools", "browser tools"],
});

const itemListJsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: `${SITE_NAME} tools`,
  numberOfItems: TOOLS.length,
  itemListElement: TOOLS.map((tool, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: tool.name,
    url: `${SITE_URL}/tools/${tool.slug}`,
  })),
};

export default function ToolsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      <ToolsIndexPage />
    </>
  );
}