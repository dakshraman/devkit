import type { Metadata } from "next";
import { LandingPage } from "@/features/landing/landing-page";
import { buildMetadata, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/seo";
import { TOOLS } from "@/data/tools";

export const metadata: Metadata = buildMetadata({
  title: `${SITE_NAME} — All-in-One Local-First Developer Toolkit`,
  description: SITE_DESCRIPTION,
  path: "/",
  keywords: [
    "developer tools",
    "devkit",
    "client-side dev tools",
    "json formatter",
    "jwt decoder",
    "uuid generator",
    "base64 encoder",
    "hash generator",
    "ast explorer",
    "wasm explorer",
    "api tester",
    "websocket tester",
    "offline dev tools",
    "pwa dev tools",
  ],
});

const softwareJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: SITE_NAME,
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Web",
  url: SITE_URL,
  description: SITE_DESCRIPTION,
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  featureList: TOOLS.slice(0, 15).map((t) => t.name),
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareJsonLd) }}
      />
      <LandingPage />
    </>
  );
}
