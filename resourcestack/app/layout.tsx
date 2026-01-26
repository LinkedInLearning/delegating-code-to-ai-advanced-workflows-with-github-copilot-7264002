import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ResourceStack",
  description: "A modern resource organizer for links, notes, and tags.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(() => {
  try {
    const key = 'rs-theme';
    const theme = localStorage.getItem(key);
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const useDark = theme === 'dark' || (theme !== 'light' && prefersDark);
    document.documentElement.classList.toggle('dark', useDark);
    if (theme) document.documentElement.dataset.theme = theme;
  } catch {}
})();`,
          }}
        />
      <link rel="manifest" href="/manifest.json" />
      <meta name="theme-color" content="#111827" />

      </head>
      <body>
        <div className="min-h-screen bg-gradient-to-b from-zinc-100 via-zinc-50 to-zinc-100 text-zinc-900 dark:from-zinc-950 dark:via-zinc-950 dark:to-zinc-900 dark:text-zinc-50">
          <div className="mx-auto max-w-6xl px-4 py-10">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
