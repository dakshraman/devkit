import type { Metadata } from "next";
import { DashboardPage } from "@/features/dashboard/dashboard-page";
import { buildMetadata, SITE_NAME, SITE_URL } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Dashboard",
  description:
    "DevKit developer dashboard — instant access to your favorite tools, recent history, and category navigation.",
  path: "/dashboard",
  keywords: ["developer dashboard", "quick tools", "favorite tools", "developer utilities"],
});

const dashboardJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: `${SITE_NAME} Dashboard`,
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Web",
  url: `${SITE_URL}/dashboard`,
  description: "DevKit developer dashboard with quick access to 50+ client-side tools.",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
};

export default function DashboardRoute() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(dashboardJsonLd) }}
      />
      <DashboardPage />
    </>
  );
}
