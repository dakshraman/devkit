import type { Metadata } from "next";
import { HistoryClientPage } from "@/features/history/history-page";

export const metadata: Metadata = {
  title: "History & Recent Activity",
  description:
    "Your recent tools, favorites and copy history — stored only in your browser.",
  robots: { index: false, follow: false },
};

export default function HistoryPage() {
  return <HistoryClientPage />;
}
