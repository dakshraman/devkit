import { DashboardPage } from "@/features/dashboard/dashboard-page";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/seo";

const softwareJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: SITE_NAME,
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Web",
  url: SITE_URL,
  description: SITE_DESCRIPTION,
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  featureList: [
    "JSON formatter",
    "Base64 encoder/decoder",
    "UUID generator",
    "Hash generator",
    "JWT decoder",
    "Regex playground",
    "Markdown editor",
  ],
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareJsonLd) }}
      />
      <DashboardPage />
    </>
  );
}