import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "3Bfreeze — Freeze Your Credit at All Three Bureaus",
    template: "%s | 3Bfreeze",
  },
  description:
    "Your simple solution for proactive credit security. Freeze your credit at Equifax, TransUnion, and Experian. Free by law.",
  metadataBase: new URL("https://3bfreeze.com"),
  openGraph: {
    title: "3Bfreeze — Freeze Your Credit at All Three Bureaus",
    description:
      "Freeze your credit at Equifax, TransUnion, and Experian. Free by law.",
    siteName: "3Bfreeze",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "3Bfreeze — Freeze Your Credit at All Three Bureaus",
    description:
      "Freeze your credit at Equifax, TransUnion, and Experian. Free by law.",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "3Bfreeze",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${plusJakarta.variable} ${geistMono.variable} antialiased`}
      >
        <TooltipProvider delayDuration={200}>
          {children}
        </TooltipProvider>
        <Toaster />
      </body>
    </html>
  );
}
