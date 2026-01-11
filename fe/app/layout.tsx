import "@/styles/globals.css";

import { Inter, Playfair_Display } from "next/font/google";

import type { Metadata } from "next";
import { Providers } from "@/app/providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

export const metadata: Metadata = {
  title: "Ask Ally | The AI Secretary for your Google Calendar",
  description: "Your intelligent calendar assistant powered by AI. Manage your Google Calendar with natural language commands.",
  metadataBase: new URL("https://askally.io"),
  openGraph: {
    title: "Ask Ally | The AI Secretary for your Google Calendar",
    description: "Your intelligent calendar assistant powered by AI. Manage your Google Calendar with natural language commands.",
    url: "https://askally.io",
    siteName: "Ask Ally",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ask Ally | The AI Secretary for your Google Calendar",
    description: "Your intelligent calendar assistant powered by AI.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <head />
      <body
        className={`${inter.variable} ${playfair.variable} font-sans bg-background text-foreground`}
        suppressHydrationWarning={true}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
