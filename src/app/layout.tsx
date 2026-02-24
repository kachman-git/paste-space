import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ToastProvider } from "@/components/ui/Toast";
import "./globals.css";

const roboto = Roboto({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "PasteSpace — Universal Copy & Paste Platform",
  description:
    "Share text, files, images, code, and links instantly. Create a space, paste anything, and share with anyone in real-time.",
  keywords: ["clipboard", "paste", "share", "real-time", "collaboration"],
  icons: {
    icon: "/icon.svg",
  },
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
      <body className={`${roboto.variable} antialiased`}>
        <ThemeProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
