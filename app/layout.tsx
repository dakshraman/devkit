import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import type { ReactNode } from "react";
import "./globals.css";
import { Providers } from "@/app/providers";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "DevKit",
    template: "%s | DevKit",
  },
  description: "All-in-one developer productivity toolkit for front-end developers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${mono.variable} antialiased`}>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{const s=localStorage.getItem("devkit:settings");const theme=s?JSON.parse(s)?.theme:localStorage.getItem("devkit:theme")||"dark";document.documentElement.classList.toggle("dark",theme==="dark");document.documentElement.style.colorScheme=theme}catch(e){document.documentElement.classList.add("dark");document.documentElement.style.colorScheme="dark"}`,
          }}
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
