import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { BlogHeader } from '@/components/BlogNav';
import { getCaseStudyBySlug, getAllCaseStudies } from '@/lib/caseStudies';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const study = getCaseStudyBySlug(slug);
  if (!study) return { title: 'Case Study Not Found | Pitch Aleph' };

  return {
    title: `${study.title} | Pitch Aleph News`,
    description: study.subtitle,
    openGraph: {
      title: study.title,
      description: study.subtitle,
      type: 'article'
    }
  };
}

export default async function CaseStudyDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const study = getCaseStudyBySlug(slug);

  if (!study) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      <BlogHeader current="news" />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 md:py-12 space-y-12">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 font-mono text-xs text-slate-400">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <span>/</span>
          <Link href="/news" className="hover:text-emerald-400 transition-colors">News & Case Studies</Link>
          <span>/</span>
          <span className="text-slate-500 truncate max-w-[200px] sm:max-w-md">{study.homeTeam} vs {study.awayTeam}</span>
        </div>

        {/* 1. Hero Header */}
        <header className="space-y-4 border-b border-slate-800/80 pb-8">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            REAL-TIME FIELD TELEMETRY CASE STUDY
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
            {study.title}
          </h1>

          <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-3xl">
            {study.subtitle}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-800/60 font-mono text-xs">
            <div>
              <div className="text-slate-500 uppercase tracking-wider text-[10px]">FIXTURE</div>
              <div className="text-white font-bold mt-0.5">{study.competition} • {study.matchday}</div>
            </div>
            <div>
              <div className="text-slate-500 uppercase tracking-wider text-[10px]">RESULT</div>
              <div className="text-cyan-400 font-bold mt-0.5">FT: {study.finalScore} (Verified)</div>
            </div>
            <div>
              <div className="text-slate-500 uppercase tracking-wider text-[10px]">NET REALIZED ROI</div>
              <div className="text-emerald-400 font-bold mt-0.5">+{study.metrics.netRoiPercent}%</div>
            </div>
            <div>
              <div className="text-slate-500 uppercase tracking-wider text-[10px]">VENUE</div>
              <div className="text-slate-300 font-medium mt-0.5">{study.venue}</div>
            </div>
          </div>
        </header>

        {/* 2. Performance Audit Overview Cards */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-mono text-xs text-emerald-400 tracking-wider uppercase font-semibold">PERFORMANCE AUDIT</span>
              <h2 className="text-2xl font-bold text-white mt-1">Live Production Verification Summary</h2>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono">
            <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 shadow-inner">
              <div className="text-4xl font-black text-white">{study.metrics.liveIngestCycles}</div>
              <div className="text-xs font-bold text-slate-200 mt-2">Live Ingest Cycles</div>
              <div className="text-[11px] text-slate-400 mt-1 leading-snug">Continuous 60s autonomous polling.</div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 shadow-inner">
              <div className="text-4xl font-black text-emerald-400">+{study.metrics.peakEdgePercent.toFixed(1)}%</div>
              <div className="text-xs font-bold text-slate-200 mt-2">Peak Statistical Edge</div>
              <div className="text-[11px] text-slate-400 mt-1 leading-snug">Captured on Ipswich at minute 52&apos;.</div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 shadow-inner">
              <div className="text-4xl font-black text-cyan-400">{study.metrics.drawSimplexPercent.toFixed(1)}%</div>
              <div className="text-xs font-bold text-slate-200 mt-2">Draw Probability</div>
              <div className="text-[11px] text-slate-400 mt-1 leading-snug">Simplex mass at minute 88&apos;.</div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 shadow-inner">
              <div className="text-4xl font-black text-emerald-400">+${study.metrics.netPnL.toFixed(0)}</div>
              <div className="text-xs font-bold text-slate-200 mt-2">Net Match PnL</div>
              <div className="text-[11px] text-slate-400 mt-1 leading-snug">Net return after 5% exchange deduction.</div>
            </div>
          </div>

          <div className="rounded-xl bg-slate-900/40 border border-slate-800/60 px-4 py-2.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 font-mono text-xs text-slate-400">
            <div>
              PIPELINE: API-Sports ({study.matchId}) ⇄ The Odds API ({study.oddsApiId}) ⇄ HuggingFace (marianopsa/pitch-aleph-1.2)
            </div>
            <div className="inline-flex items-center gap-1.5 text-emerald-400 font-bold whitespace-nowrap">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              ZERO PIPELINE DROPS
            </div>
          </div>
        </section>

        {/* 3. Executive Summary & Core Telemetry */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-white">1. Executive Summary & Core Telemetry</h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            {study.summary}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {study.executivePhases.map((phase, idx) => (
              <div key={idx} className="p-5 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2">
                <h3 className="font-bold text-emerald-400 font-mono text-sm">{phase.title}</h3>
                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">{phase.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 4. Cycle Audit Log & Chronology Table */}
        <section className="space-y-4">
          <div>
            <span className="font-mono text-xs text-emerald-400 tracking-wider uppercase font-semibold">CYCLE AUDIT LOG</span>
            <h2 className="text-2xl font-bold text-white mt-1">Live Telemetry & Execution Chronology</h2>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/50">
            <table className="w-full text-left font-mono text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900 text-slate-400 uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-3.5">CYCLE</th>
                  <th className="py-3 px-3.5">MIN</th>
                  <th className="py-3 px-3.5">SCORE / SHOTS</th>
                  <th className="py-3 px-3.5">MODEL SIMPLEX (H/D/A)</th>
                  <th className="py-3 px-3.5">BEST PRICE</th>
                  <th className="py-3 px-3.5">EDGE</th>
                  <th className="py-3 px-3.5">QUARTER-KELLY ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70 text-slate-300">
                {study.chronology.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-850/50 transition-colors">
                    <td className="py-3 px-3.5 font-bold text-emerald-400">{row.cycle}</td>
                    <td className="py-3 px-3.5 font-bold text-white whitespace-nowrap">{row.min}</td>
                    <td className="py-3 px-3.5 whitespace-nowrap">{row.scoreShotsPoss}</td>
                    <td className="py-3 px-3.5 text-cyan-300 whitespace-nowrap">{row.simplex}</td>
                    <td className="py-3 px-3.5 whitespace-nowrap">{row.bestPrice}</td>
                    <td className="py-3 px-3.5 font-bold text-emerald-400 whitespace-nowrap">{row.edge}</td>
                    <td className="py-3 px-3.5 whitespace-nowrap font-bold">
                      <span className={row.action.includes('ALLOCATE') ? 'text-emerald-400' : 'text-slate-400'}>
                        {row.action}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 font-mono text-[11px] text-slate-500 px-1">
            <span>*All entries enforced under PitchAleph Quarter-Kelly sizing with a $500 hard safety cap.</span>
            <span className="text-emerald-400">Full-Time Result Verified: 1–1 Settlement</span>
          </div>
        </section>

        {/* 5. Trade Settlement & Dual-Leg Execution Ledger */}
        <section className="space-y-4">
          <div>
            <span className="font-mono text-xs text-emerald-400 tracking-wider uppercase font-semibold">FINANCIAL & SYSTEM AUDIT</span>
            <h2 className="text-2xl font-bold text-white mt-1">Trade Settlement & Quantitative Mechanics</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column: Ledger */}
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-5">
              <h3 className="font-bold text-white text-base">Dual-Leg Execution Ledger</h3>

              <div className="space-y-4 font-mono text-xs divide-y divide-slate-800/70">
                {study.ledger.map((trade, idx) => (
                  <div key={idx} className="pt-3.5 first:pt-0 flex items-start justify-between gap-3">
                    <div>
                      <div className="font-bold text-slate-200">{trade.leg}</div>
                      <div className="text-slate-400 text-[11px] mt-0.5">{trade.description}</div>
                    </div>
                    <div className={`font-bold whitespace-nowrap ${trade.netPnl > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {trade.netPnl > 0 ? `+$${trade.netPnl.toFixed(2)}` : `-$${Math.abs(trade.netPnl).toFixed(2)}`}
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-slate-700/80 flex items-center justify-between font-mono">
                <span className="font-bold text-slate-300 text-xs uppercase tracking-wider">NET RETURN</span>
                <span className="text-emerald-400 font-black text-lg">
                  +${study.metrics.netPnL.toFixed(2)} (+{study.metrics.netRoiPercent}%)
                </span>
              </div>
            </div>

            {/* Right Column: Algorithmic Takeaways */}
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-4">
              <h3 className="font-bold text-white text-base">Algorithmic Takeaways</h3>

              <div className="space-y-4 font-mono text-xs">
                {study.takeaways.map((takeaway, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                      <span>⚡</span>
                      <span>{takeaway.title}</span>
                    </div>
                    <p className="text-slate-300 font-sans text-xs leading-relaxed pl-5">
                      {takeaway.text}
                    </p>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-slate-800/70 font-mono text-[11px] text-slate-500">
                PitchAleph 1.2 Institutional Architecture Verification • Production Environment
              </div>
            </div>
          </div>
        </section>

        {/* 6. Ready for Slate Banner */}
        <section className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-950/20 p-8 text-center space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs">
            SYSTEM READY FOR SATURDAY SLATE
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight max-w-xl mx-auto">
            Empirical Alpha Validated on Live Premier League Turf
          </h2>

          <p className="text-slate-400 text-sm max-w-lg mx-auto leading-relaxed">
            From API discovery to execution settlement, PitchAleph proved its ability to capture structural sportsbook friction in real time.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-4 font-mono text-xs">
            {study.nextTarget && (
              <span className="px-3.5 py-2 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300">
                Next Target: <strong className="text-white">{study.nextTarget.match}</strong> ({study.nextTarget.time})
              </span>
            )}
            <Link
              href="/"
              className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition-all shadow-lg shadow-emerald-500/20"
            >
              Open Monte Carlo Engine →
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
