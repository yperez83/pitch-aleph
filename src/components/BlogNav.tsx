import React from 'react';
import Link from 'next/link';

interface BlogHeaderProps {
  current?: 'list' | 'article' | 'fixtures' | 'news' | 'launchpad';
}

const NAV_LINKS = [
  { href: '/launchpad', label: 'Launchpad', id: 'launchpad' },
  { href: '/news', label: 'News', id: 'news' },
  { href: '/fixtures', label: 'Fixtures', id: 'fixtures' },
  { href: '/dev-blog', label: 'Dev Blog', id: 'list' }
];

export function BlogHeader({ current = 'list' }: BlogHeaderProps) {
  return (
    <header className="w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-6 py-3.5">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <img
            src="/86f51b48a_generated_image.png"
            alt="PitchAleph Logo"
            className="w-7 h-7 rounded-full border border-emerald-500/40 group-hover:border-emerald-400 transition-colors"
          />
          <span className="font-bold text-sm tracking-tight text-white group-hover:text-emerald-400 transition-colors flex items-center gap-1.5">
            <span>Pitch Aleph</span>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-1.5 py-0.2 rounded">
              ℵ₀
            </span>
          </span>
        </Link>

        <nav className="flex items-center gap-3 sm:gap-4 font-mono text-xs">
          {current === 'article' ? (
            <Link
              href="/dev-blog"
              className="text-slate-400 hover:text-white transition-colors"
            >
              ← All Articles
            </Link>
          ) : (
            <Link
              href="/"
              className="text-slate-400 hover:text-white transition-colors"
            >
              ← Back to App
            </Link>
          )}

          {NAV_LINKS.filter((item) => (current === 'article' ? item.id !== 'list' : true)).map(
            (item) => {
              const isCurrent =
                current === item.id || (current === 'article' && item.id === 'list');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`hidden sm:inline transition-colors ${
                    isCurrent
                      ? 'text-emerald-400 font-bold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30'
                      : 'text-slate-400 hover:text-emerald-400'
                  }`}
                >
                  {item.label}
                </Link>
              );
            }
          )}

          <Link
            href="/api/docs"
            target="_blank"
            className="text-slate-400 hover:text-emerald-400 transition-colors hidden md:inline"
          >
            API Docs ↗
          </Link>
        </nav>
      </div>
    </header>
  );
}

export function BlogFooter({ showPoweredBy = false }: { showPoweredBy?: boolean } = {}) {
  return (
    <footer className="w-full border-t border-slate-800/80 bg-slate-950 py-8 px-4 sm:px-6 mt-16 font-mono text-xs text-slate-500">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span>PitchAleph ℵ₀ Quantitative Research Dispatch</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/" className="hover:text-slate-300 transition-colors">
            Engine
          </Link>
          <Link href="/launchpad" className="hover:text-emerald-400 transition-colors">
            Launchpad
          </Link>
          <Link href="/news" className="hover:text-emerald-400 transition-colors">
            Live Tests
          </Link>
          <Link href="/dev-blog" className="text-emerald-400 hover:text-emerald-300 transition-colors">
            Dev Blog
          </Link>
          {showPoweredBy && (
            <a
              href="https://postparticle.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-white transition-colors"
            >
              Postparticle CMS ↗
            </a>
          )}
        </div>
      </div>
    </footer>
  );
}
