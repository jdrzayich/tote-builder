import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tote Storage Builder",
  description: "Quote-request tote storage configurator (v1).",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-b from-neutral-50 to-white text-neutral-900">
        {children}
      </body>
    </html>
  );
}
