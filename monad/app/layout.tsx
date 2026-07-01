import { Atkinson_Hyperlegible, Stack_Sans_Notch } from "next/font/google";

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Monad",
  description: "Monad workflow dashboard",
};

const stackSansNotch = Stack_Sans_Notch({
  subsets: ["latin"],
  variable: "--font-heading",
});

const atkinson = Atkinson_Hyperlegible({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-body",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${atkinson.variable} ${stackSansNotch.variable}`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
