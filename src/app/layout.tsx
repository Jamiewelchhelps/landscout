import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LandScout — Intelligent Land Listings",
  description:
    "A premium land listing and intelligence platform that makes buying rural and undeveloped land easy and informative.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
