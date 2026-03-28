import type { Metadata } from 'next';
import Link from 'next/link';
import type { ReactNode } from 'react';
import './globals.css';

export const metadata: Metadata = {
  title: 'AnimeHub UA',
  description: 'Стрімінговий каталог онґоїнґ аніме українською',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="uk">
      <body className="min-h-screen bg-zinc-950 text-zinc-100 antialiased">
        <header className="sticky top-0 z-50 border-b border-zinc-800/70 bg-zinc-950/90 backdrop-blur">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
            <Link href="/" className="text-xl font-bold text-orange-500">
              AnimeHub UA
            </Link>
            <span className="rounded-full border border-zinc-700 px-3 py-1 text-xs text-zinc-300">
              Top Ongoing
            </span>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 pb-24 pt-6">{children}</main>

        <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-800 bg-zinc-950/95 backdrop-blur md:hidden">
          <div className="mx-auto grid h-16 max-w-md grid-cols-3 items-center text-center text-xs text-zinc-300">
            <Link href="/" className="font-medium text-orange-500">
              Головна
            </Link>
            <Link href="/#search" className="font-medium hover:text-orange-400">
              Пошук
            </Link>
            <Link href="/" className="font-medium hover:text-orange-400">
              Оновлення
            </Link>
          </div>
        </nav>
      </body>
    </html>
  );
}
