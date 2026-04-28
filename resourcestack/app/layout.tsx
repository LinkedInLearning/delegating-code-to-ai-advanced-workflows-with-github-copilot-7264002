import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ResourceStack",
  description: "A modern resource organizer for links, notes, and tags.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
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
      <body className="antialiased">
        <div className="relative min-h-screen">
          {/* Decorative gradient backgrounds */}
          <div className="pointer-events-none fixed inset-0 -z-10">
            <div className="absolute left-1/2 top-0 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-gradient-to-r from-blue-400 to-violet-400 opacity-10 blur-3xl"></div>
            <div className="absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-gradient-to-l from-violet-400 to-pink-400 opacity-10 blur-3xl"></div>
          </div>
          
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
