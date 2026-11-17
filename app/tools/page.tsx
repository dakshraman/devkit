import type { Metadata } from "next";
import { ToolsIndexPage } from "@/features/tools/tools-index-page";
import { buildMetadata, SITE_NAME, SITE_URL } from "@/lib/seo";
import { TOOLS } from "@/data/tools";

export const metadata: Metadata = buildMetadata({
  title: "All 54 Developer Utilities & Converters",
  description:
    `Browse all ${TOOLS.length} DevKit developer tools — JSON formatters, JWT decoders, PDF tools, image resizers, AST explorers, and network testers. 100% in-browser execution with zero server uploads.`,
  path: "/tools",
  keywords: [
    "all tools",
    "developer utilities",
    "free dev tools",
    "browser tools",
    "client-side pdf merge",
    "json formatter online",
    "jwt decoder free",
    "uuid generator",
    "offline developer tools",
  ],
});

const itemListJsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: `${SITE_NAME} Developer Utilities Directory`,
  description: `Complete catalog of ${TOOLS.length} client-side developer tools.`,
  numberOfItems: TOOLS.length,
  itemListElement: TOOLS.map((tool, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: tool.name,
    description: tool.description,
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
