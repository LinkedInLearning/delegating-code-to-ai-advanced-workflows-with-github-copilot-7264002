import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ResourceStack",
  description: "A modern resource organizer for links, notes, and tags.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-950 to-zinc-900">
          <div className="mx-auto max-w-6xl px-4 py-10">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
