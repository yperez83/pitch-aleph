import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { getArticles, websiteUrl } from '@/lib/content';
import { readBlogFilters, type BlogSearchParams } from '@/lib/filters';
import BlogFilters from '@/components/BlogFilters';

export const metadata: Metadata = {
  title: 'Dev Blog | Pitch Aleph Engineering & Quantitative Research',
  description: 'Technical dispatches, spatial simulation methodology, and quantitative predictive engine research from the Pitch Aleph engineering team.',
  alternates: {
    canonical: `${websiteUrl}/dev-blog`,
  },
  openGraph: {
    title: 'Dev Blog | Pitch Aleph Engineering',
    description: 'Technical dispatches and quantitative research from Pitch Aleph.',
    url: `${websiteUrl}/dev-blog`,
    type: 'website',
  },
};

export default async function DevBlogPage({
  searchParams,
}: {
  searchParams: Promise<BlogSearchParams>;
}) {
  const resolvedParams = await searchParams;
  const { q, tag, dateOrder, pageNumber, errors } = readBlogFilters(resolvedParams);

  let data = null;
  let fetchError: string | null = null;

  if (errors.length === 0) {
    try {
      data = await getArticles({
        q,
        tag,
        order: dateOrder,
        page: pageNumber,
        pageSize: 9,
      });
    } catch (err) {
      fetchError = err instanceof Error ? err.message : 'Unable to connect to content service.';
    }
  }

  function createPaginationHref(targetPage: number) {
    const params = new URLSearchParams();
    if (targetPage > 1) params.set('page', String(targetPage));
    if (dateOrder !== 'desc') params.set('order', dateOrder);
    if (q) params.set('q', q);
    if (tag) params.set('tag', tag);
    const qs = params.toString();
    return `/dev-blog${qs ? `?${qs}` : ''}`;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col font-sans relative selection:bg-emerald-500/30 selection:text-emerald-300">
      {/* Background ambient radial gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/20 via-slate-950 to-slate-950 pointer-events-none fixed" />

      {/* Top Navigation Bar */}
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
            <Link
              href="/"
              className="text-slate-400 hover:text-white transition-colors"
            >
              ← Back to App
            </Link>
            <Link
              href="/dev-blog"
              className="px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold"
            >
              Dev Blog
            </Link>
            <Link
              href="/api/docs"
              target="_blank"
              className="text-slate-400 hover:text-emerald-400 transition-colors hidden sm:inline"
            >
              API Docs ↗
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14 z-10">
        {/* Header Hero */}
        <div className="mb-10 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs mb-3 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>ENGINEERING & QUANT DISPATCHES</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white">
            Pitch Aleph <span className="text-emerald-400">Dev Blog</span>
          </h1>
          <p className="mt-3 text-slate-300 max-w-2xl text-sm sm:text-base leading-relaxed">
            In-depth write-ups on spatial geometry modelling, isotonic calibration, regime-shift detection, and backtested sports market economics.
          </p>
        </div>

        {/* Search & Tag Filter Bar */}
        <Suspense fallback={<div className="h-16 bg-slate-900/50 rounded-xl mb-8 animate-pulse" />}>
          <BlogFilters
            key={JSON.stringify([q, tag, dateOrder, pageNumber, errors])}
            initialQ={q}
            initialTag={tag}
            initialOrder={dateOrder}
          />
        </Suspense>

        {/* Validation Errors */}
        {errors.length > 0 && (
          <div
            role="alert"
            className="w-full bg-red-950/40 border border-red-500/40 rounded-xl p-4 sm:p-5 mb-8 text-sm font-mono text-red-300"
          >
            <div className="font-bold mb-1 text-red-200">Invalid Search Filter:</div>
            <ul className="list-disc list-inside space-y-1">
              {errors.map((err) => (
                <li key={err}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Server Fetch Error */}
        {fetchError && (
          <div
            role="alert"
            className="w-full bg-amber-950/40 border border-amber-500/40 rounded-xl p-4 sm:p-5 mb-8 text-sm font-mono text-amber-200"
          >
            <div className="font-bold mb-1">Content Service Notice</div>
            <p className="text-slate-300 text-xs sm:text-sm">
              {fetchError}. Articles published in Postparticle will render automatically once available.
            </p>
          </div>
        )}

        {/* Article Grid */}
        {data && data.items.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {data.items.map((article) => {
              const coverImg = article.coverUrl || article.socialImageUrl;
              return (
                <article
                  key={article.slug}
                  className="bg-slate-900/80 border border-slate-800/90 hover:border-emerald-500/40 rounded-xl overflow-hidden flex flex-col transition-all hover:bg-slate-850 group shadow-lg hover:shadow-emerald-500/5"
                >
                  {coverImg && (
                    <div className="w-full h-44 overflow-hidden bg-slate-950 relative border-b border-slate-800/80">
                      <img
                        src={coverImg}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}

                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
                        <time dateTime={article.articleDate}>
                          {article.articleDate}
                        </time>
                        {article.author && (
                          <span className="text-slate-500 truncate max-w-[120px]">
                            {article.author}
                          </span>
                        )}
                      </div>

                      <h2 className="text-lg font-bold text-white group-hover:text-emerald-300 transition-colors line-clamp-2 mb-2 leading-snug">
                        <Link href={`/dev-blog/${article.slug}`}>
                          {article.title}
                        </Link>
                      </h2>

                      <p className="text-xs sm:text-sm text-slate-300 line-clamp-3 mb-4 leading-relaxed font-normal">
                        {article.excerpt}
                      </p>
                    </div>

                    <div>
                      {article.tags && article.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {article.tags.map((t) => (
                            <Link
                              key={t}
                              href={`/dev-blog?tag=${encodeURIComponent(t)}`}
                              className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 hover:text-emerald-300 hover:bg-slate-700 transition-colors"
                            >
                              #{t}
                            </Link>
                          ))}
                        </div>
                      )}

                      <Link
                        href={`/dev-blog/${article.slug}`}
                        className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
                      >
                        <span>Read full article</span>
                        <span className="text-[10px]">→</span>
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : data && data.items.length === 0 ? (
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center my-8">
            <div className="w-12 h-12 rounded-full bg-slate-800 text-slate-400 mx-auto mb-4 flex items-center justify-center font-mono text-xl">
              ✍️
            </div>
            <h3 className="text-lg font-bold text-white mb-2">
              No Published Articles Yet
            </h3>
            <p className="text-slate-400 text-sm max-w-md mx-auto mb-6">
              {q || tag
                ? 'No articles match your current search or tag filters. Try clearing filters.'
                : 'Articles published in the Postparticle workspace will appear right here automatically.'}
            </p>
            {(q || tag) && (
              <Link
                href="/dev-blog"
                className="inline-block px-4 py-2 bg-emerald-500 text-slate-950 font-mono text-xs font-bold rounded-lg hover:bg-emerald-400 transition-colors"
              >
                Clear Filters
              </Link>
            )}
          </div>
        ) : null}

        {/* Pagination Navigation */}
        {data && (data.total > data.pageSize || pageNumber > 1) && (
          <nav
            aria-label="Blog pagination"
            className="flex items-center justify-between border-t border-slate-800 pt-6 font-mono text-sm"
          >
            {pageNumber > 1 ? (
              <Link
                href={createPaginationHref(pageNumber - 1)}
                className="px-4 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-colors"
              >
                ← Previous Page
              </Link>
            ) : (
              <div />
            )}

            <span className="text-xs text-slate-500">
              Page {data.page} of {Math.max(1, Math.ceil(data.total / data.pageSize))}
            </span>

            {pageNumber * data.pageSize < data.total ? (
              <Link
                href={createPaginationHref(pageNumber + 1)}
                className="px-4 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-colors"
              >
                Next Page →
              </Link>
            ) : (
              <div />
            )}
          </nav>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-800/80 bg-slate-950/80 py-8 px-4 sm:px-6 text-center text-xs font-mono text-slate-500 z-10">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>© {new Date().getFullYear()} Pitch Aleph · Quantitative Sports Simulation</span>
          <div className="flex items-center gap-4">
            <Link href="/" className="hover:text-slate-300 transition-colors">
              Engine Dashboard
            </Link>
            <Link href="/dev-blog" className="text-emerald-400 hover:text-emerald-300 transition-colors">
              Dev Blog
            </Link>
            <a
              href="https://postparticle.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-300 transition-colors"
            >
              Powered by Postparticle
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
