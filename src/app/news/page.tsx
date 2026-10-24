import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { BlogHeader } from '@/components/BlogNav';
import { getAllCaseStudies } from '@/lib/caseStudies';
import { getLedgerEntryBySlug } from '@/lib/newsLedger';
import PortfolioBottomTicker from '@/components/news/PortfolioBottomTicker';

export const metadata: Metadata = {
  title: 'News & Match Case Studies | Pitch Aleph',
  description:
    'Live in-play quantitative post-mortems, match execution reports, and telemetry case studies from the PitchAleph 1.2 betting engine, organized chronologically.',
  openGraph: {
    title: 'News & Case Studies | Pitch Aleph',
    description: 'Empirical quantitative case studies and real-time telemetry match audits.',
    type: 'website'
  }
};

export default function NewsPage() {
  const caseStudies = getAllCaseStudies();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950 relative">
      <BlogHeader current="news" />

      {/* pb-28 ensures content and footer never collide with the persistent floating bottom ticker */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 md:py-12 pb-28 space-y-10">
        {/* Page Header */}
        <div className="border-b border-slate-800/80 pb-6">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs mb-3">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            LIVE PRODUCTION VERIFICATION AUDITS
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            News & Match Case Studies
          </h1>
          <p className="text-slate-400 text-sm mt-2 max-w-2xl leading-relaxed">
            Real-time field telemetry audits and post-game quantitative breakdowns from PitchAleph 1.2 in-play execution runs. Organized chronologically with newest matches first.
          </p>
        </div>

        {/* Case Studies List */}
        <div className="space-y-6">
          {caseStudies.map((study) => {
            const ledgerEntry = getLedgerEntryBySlug(study.slug);

            return (
              <article
                key={study.slug}
                className="group relative rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-emerald-500/50 p-6 md:p-8 transition-all hover:bg-slate-900/90 hover:shadow-xl hover:shadow-emerald-950/20 flex flex-col justify-between gap-6"
              >
                {/* Header Info */}
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2.5 font-mono text-xs text-slate-400">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold uppercase">
                        {study.competition}
                      </span>
                      <span>•</span>
                      <span>{study.matchday}</span>
                      <span>•</span>
                      <span>{study.kickoffDisplay.split('@')[0]}</span>
                      <span>•</span>
                      <span className="text-cyan-400 font-bold">FT: {study.finalScore}</span>
                    </div>

                    {/* In-Card Compounding Progression Badge */}
                    {ledgerEntry && (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900/80 border border-slate-800 font-mono text-xs text-slate-300">
                        <span className="text-slate-500">Bankroll:</span>
                        <span className="text-slate-300 font-medium">
                          ${ledgerEntry.startingBankroll.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                        <span className="text-emerald-400">➔</span>
                        <span className="text-white font-bold">
                          ${ledgerEntry.endingBankroll.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                        <span className="text-emerald-400 font-semibold text-[11px] bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
                          +{ledgerEntry.compoundingGainPct.toFixed(2)}%
                        </span>
                      </div>
                    )}
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white group-hover:text-emerald-300 transition-colors">
                    <Link href={`/news/${study.slug}`}>{study.title}</Link>
                  </h2>

                  <p className="text-slate-300 text-sm md:text-base leading-relaxed">
                    {study.subtitle}
                  </p>
                </div>

                {/* 4-Card Quick Stat Summary Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
                  <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
                    <div className="text-2xl font-black text-white">{study.metrics.liveIngestCycles}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">Live Ingest Cycles</div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
                    <div className="text-2xl font-black text-emerald-400">+{study.metrics.peakEdgePercent}%</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">Peak Statistical Edge</div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
                    <div className="text-2xl font-black text-cyan-400">{study.metrics.drawSimplexPercent}%</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">Terminal Draw Simplex</div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
                    <div className="text-2xl font-black text-emerald-400">+{study.metrics.netRoiPercent}%</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">Net Match ROI (+${study.metrics.netPnL.toFixed(0)})</div>
                  </div>
                </div>

                {/* Footer Links & CTA */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-800/60 font-mono text-xs">
                  <div className="text-slate-500 text-[11px]">
                    Telemetry Match ID: {study.matchId} (API-Sports)
                  </div>

                  <Link
                    href={`/news/${study.slug}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition-all shadow-md shadow-emerald-500/20 hover:scale-[1.02] cursor-pointer"
                  >
                    <span>Read Full Case Study</span>
                    <span>→</span>
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </main>

      {/* Floating Bottom Ticker pinned to viewport */}
      <PortfolioBottomTicker />
    </div>
  );
}
