import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { TOOLS } from "@/data/tools";
import { ToolView } from "@/features/tools/tool-views";
import { buildMetadata, SITE_URL } from "@/lib/seo";

export function generateStaticParams() {
  return TOOLS.map((tool) => ({ slug: tool.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tool = TOOLS.find((item) => item.slug === slug);
  if (!tool) {
    return { title: "Tool Not Found" };
  }
  return buildMetadata({
    title: `${tool.name} — Free Client-Side Developer Tool`,
    description: `${tool.description} Fast, secure, and runs 100% in your browser with zero server uploads.`,
    path: `/tools/${slug}`,
    keywords: [
      ...tool.keywords,
      "free online tool",
      "client-side",
      "no upload",
      "in-browser",
      "privacy-friendly",
      "devkit",
      tool.category,
    ],
  });
}

export default async function ToolPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tool = TOOLS.find((item) => item.slug === slug);
  if (!tool) notFound();

  const webAppJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: tool.name,
    description: tool.description,
    url: `${SITE_URL}/tools/${slug}`,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "All (Web Browser, Chrome, Firefox, Safari, Edge)",
    browserRequirements: "Requires JavaScript. Runs 100% client-side in browser memory.",
    isAccessibleForFree: true,
    softwareVersion: "2.4.0",
    keywords: tool.keywords.join(", "),
    screenshot: `${SITE_URL}/opengraph-image`,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: `${SITE_URL}/`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Tools",
        item: `${SITE_URL}/tools`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: tool.name,
        item: `${SITE_URL}/tools/${tool.slug}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <AppShell>
        <ToolView slug={slug} />
      </AppShell>
    </>
  );
}
