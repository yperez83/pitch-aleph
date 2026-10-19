import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getArticle, websiteUrl } from '@/lib/content';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);

  const title = article.seoTitle || article.title;
  const description = article.seoDescription || article.excerpt;
  const canonicalUrl = `${websiteUrl}/dev-blog/${article.slug}`;
  const image = article.socialImageUrl || article.coverUrl;

  return {
    title: `${title} | Pitch Aleph Dev Blog`,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: 'article',
      title,
      description,
      url: canonicalUrl,
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt,
      authors: article.author ? [article.author] : [],
      tags: article.tags,
      images: image ? [{ url: image }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: image ? [image] : [],
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticle(slug);

  const coverImage = article.coverUrl || article.socialImageUrl;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: article.title,
    description: article.excerpt,
    datePublished: article.publishedAt || article.articleDate,
    dateModified: article.updatedAt || article.publishedAt,
    author: {
      '@type': 'Person',
      name: article.author || 'Pitch Aleph Engineering',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Pitch Aleph',
      url: websiteUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${websiteUrl}/86f51b48a_generated_image.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${websiteUrl}/dev-blog/${article.slug}`,
    },
    image: coverImage ? [coverImage] : undefined,
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col font-sans relative selection:bg-emerald-500/30 selection:text-emerald-300">
      {/* Background ambient radial gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/20 via-slate-950 to-slate-950 pointer-events-none fixed" />

      {/* Top Navigation Bar */}
      <header className="w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-6 py-3.5">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
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
              href="/dev-blog"
              className="text-slate-400 hover:text-white transition-colors"
            >
              ← All Articles
            </Link>
            <Link
              href="/"
              className="text-slate-400 hover:text-emerald-400 transition-colors hidden sm:inline"
            >
              Engine
            </Link>
          </nav>
        </div>
      </header>

      {/* Article Container */}
      <main className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14 z-10">
        <article className="w-full">
          {/* Breadcrumbs */}
          <nav aria-label="Breadcrumb" className="font-mono text-xs text-slate-500 mb-6 flex items-center gap-2">
            <Link href="/" className="hover:text-slate-300 transition-colors">Home</Link>
            <span>/</span>
            <Link href="/dev-blog" className="hover:text-slate-300 transition-colors">Dev Blog</Link>
            <span>/</span>
            <span className="text-slate-400 truncate max-w-[200px]">{article.title}</span>
          </nav>

          {/* Metadata bar */}
          <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-slate-400 mb-3">
            <time dateTime={article.articleDate} className="text-emerald-400 font-semibold">
              {article.articleDate}
            </time>
            {article.author && (
              <>
                <span className="text-slate-600">•</span>
                <span>By {article.author}</span>
              </>
            )}
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-6 leading-tight">
            {article.title}
          </h1>

          {/* Excerpt Lead */}
          {article.excerpt && (
            <p className="text-base sm:text-lg text-slate-300 mb-8 font-normal leading-relaxed border-l-2 border-emerald-500/50 pl-4 bg-emerald-950/10 py-1 rounded-r">
              {article.excerpt}
            </p>
          )}

          {/* Cover Image */}
          {coverImage && (
            <div className="w-full rounded-2xl overflow-hidden mb-10 border border-slate-800 bg-slate-900 shadow-2xl">
              <img
                src={coverImage}
                alt={article.title}
                className="w-full max-h-[460px] object-cover"
              />
            </div>
          )}

          {/* Markdown Article Body */}
          <div className="prose prose-invert max-w-none text-slate-200 leading-relaxed text-sm sm:text-base space-y-5 font-normal">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              skipHtml={true}
              components={{
                h1: ({ node, ...props }) => (
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-8 mb-4 border-b border-slate-800 pb-2" {...props} />
                ),
                h2: ({ node, ...props }) => (
                  <h2 className="text-xl sm:text-2xl font-bold text-white mt-8 mb-3" {...props} />
                ),
                h3: ({ node, ...props }) => (
                  <h3 className="text-lg sm:text-xl font-bold text-white mt-6 mb-2" {...props} />
                ),
                p: ({ node, ...props }) => (
                  <p className="text-slate-300 leading-relaxed mb-4" {...props} />
                ),
                ul: ({ node, ...props }) => (
                  <ul className="list-disc list-inside space-y-1 mb-4 text-slate-300" {...props} />
                ),
                ol: ({ node, ...props }) => (
                  <ol className="list-decimal list-inside space-y-1 mb-4 text-slate-300" {...props} />
                ),
                blockquote: ({ node, ...props }) => (
                  <blockquote className="border-l-2 border-emerald-500/60 pl-4 my-4 italic text-slate-300 bg-slate-900/40 py-1.5 rounded-r" {...props} />
                ),
                pre: ({ node, ...props }) => (
                  <pre className="overflow-x-auto p-4 rounded-xl bg-slate-900/90 border border-slate-800 font-mono text-xs text-slate-200 my-5 shadow-inner" {...props} />
                ),
                code: ({ node, className, children, ...props }: any) => {
                  const isInline = !className && typeof children === 'string' && !children.includes('\n');
                  if (isInline) {
                    return (
                      <code className="px-1.5 py-0.5 rounded bg-slate-800 text-emerald-300 font-mono text-xs border border-slate-700/60" {...props}>
                        {children}
                      </code>
                    );
                  }
                  return <code className="font-mono text-xs" {...props}>{children}</code>;
                },
                table: ({ node, ...props }) => (
                  <div className="overflow-x-auto my-6">
                    <table className="min-w-full divide-y divide-slate-800 font-mono text-xs" {...props} />
                  </div>
                ),
                th: ({ node, ...props }) => (
                  <th className="px-3 py-2 text-left font-bold text-white bg-slate-900 border-b border-slate-800" {...props} />
                ),
                td: ({ node, ...props }) => (
                  <td className="px-3 py-2 border-b border-slate-800/80 text-slate-300" {...props} />
                ),
                a: ({ node, href, children, ...props }) => {
                  // Safe URL scheme check
                  const isSafeUrl = href && /^(https?:|\/|mailto:)/i.test(href);
                  return (
                    <a
                      href={isSafeUrl ? href : '#'}
                      className="text-emerald-400 hover:text-emerald-300 underline underline-offset-2 transition-colors font-medium"
                      target={href?.startsWith('http') ? '_blank' : undefined}
                      rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
                      {...props}
                    >
                      {children}
                    </a>
                  );
                },
                img: ({ node, src, alt, ...props }) => (
                  <img
                    src={src}
                    alt={alt || article.title}
                    className="w-full rounded-xl border border-slate-800 my-6 max-h-[500px] object-cover"
                    {...props}
                  />
                ),
              }}
            >
              {article.body}
            </ReactMarkdown>
          </div>

          {/* Tags Footer */}
          {article.tags && article.tags.length > 0 && (
            <div className="mt-12 pt-6 border-t border-slate-800">
              <span className="text-xs font-mono text-slate-500 uppercase tracking-wider block mb-2.5">
                Tagged under:
              </span>
              <div className="flex flex-wrap gap-2">
                {article.tags.map((t) => (
                  <Link
                    key={t}
                    href={`/dev-blog?tag=${encodeURIComponent(t)}`}
                    className="text-xs font-mono px-3 py-1 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-emerald-300 border border-slate-800 hover:border-emerald-500/40 transition-colors"
                  >
                    #{t}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Back link */}
          <div className="mt-10">
            <Link
              href="/dev-blog"
              className="inline-flex items-center gap-2 font-mono text-xs text-slate-400 hover:text-white transition-colors"
            >
              <span>← Back to all dev dispatches</span>
            </Link>
          </div>
        </article>
      </main>

      {/* JSON-LD Structured Data with '<' safe escaping */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
        }}
      />

      {/* Footer */}
      <footer className="w-full border-t border-slate-800/80 bg-slate-950/80 py-8 px-4 sm:px-6 text-center text-xs font-mono text-slate-500 z-10 mt-12">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>© {new Date().getFullYear()} Pitch Aleph · Quantitative Sports Simulation</span>
          <div className="flex items-center gap-4">
            <Link href="/" className="hover:text-slate-300 transition-colors">
              Engine Dashboard
            </Link>
            <Link href="/dev-blog" className="text-emerald-400 hover:text-emerald-300 transition-colors">
              Dev Blog
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
