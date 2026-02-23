import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import "./globals.css";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "PasteSpace — Universal Copy & Paste Platform",
  description:
    "Share text, files, images, code, and links instantly. Create a space, paste anything, and share with anyone in real-time.",
  keywords: ["clipboard", "paste", "share", "real-time", "collaboration"],
  openGraph: {
    title: "PasteSpace — Universal Copy & Paste Platform",
    description: "Share anything instantly. Create a space, paste, and share.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} antialiased`}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
