'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { BlogHeader } from '@/components/BlogNav';
import { getAllCaseStudies } from '@/lib/caseStudies';
import {
  CASE_STUDY_LEDGER,
  getPortfolioSummary,
  EngineVersion,
  CaseStudyLedgerEntry
} from '@/lib/newsLedger';
import PortfolioBottomTicker from '@/components/news/PortfolioBottomTicker';

export default function NewsClientPage() {
  const [version, setVersion] = useState<EngineVersion>('v1.2.1-smart');
  // All games nested/collapsed by default
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});

  const isSmart = version === 'v1.2.1-smart';
  const summary = getPortfolioSummary(version);
  const caseStudies = getAllCaseStudies();

  const toggleItem = (slug: string) => {
    setOpenItems((prev) => ({
      ...prev,
      [slug]: !prev[slug]
    }));
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#ededed] flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950 relative">
      <BlogHeader current="news" />

      {/* pb-56 / md:pb-64 ensures content and cards never get occluded by the fixed floating ticker */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 md:py-12 pb-56 md:pb-64 space-y-10">
        
        {/* Page Top Header with Version Switcher */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#222] pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs mb-3">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              {isSmart ? 'v1.2.1 SMART ENGINE • CAUSAL MEMORY STATE' : 'v1.2 NAIVE ENGINE • STATELESS EXECUTION'}
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white flex items-center gap-3">
              <span>News Ledger</span>
              <span className="text-xs font-mono font-normal text-slate-500 px-2 py-0.5 rounded border border-slate-800">
                {isSmart ? 'v1.2.1' : 'v1.2'}
              </span>
            </h1>
            <p className="text-slate-400 text-sm mt-2 max-w-2xl leading-relaxed">
              Empirical quantitative live tests comparing the legacy <strong>v1.2 Naive</strong> model with the upgraded <strong>v1.2.1 Smart Engine</strong>, featuring causal memory states, probability caps, and autonomous slush fund allocation.
            </p>
          </div>

          {/* Interactive Toggle Switch */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 shrink-0">
            <span className="text-xs font-mono text-slate-400">Execution Mode:</span>
            <div className="inline-flex rounded-xl bg-[#0f0f0f] border border-[#222] p-1 font-mono text-xs">
              <button
                type="button"
                onClick={() => setVersion('v1.2.1-smart')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSmart
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>⚡</span>
                <span>v1.2.1 Smart</span>
              </button>
              <button
                type="button"
                onClick={() => setVersion('v1.2-naive')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                  !isSmart
                    ? 'bg-slate-800 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>v1.2 Naive</span>
              </button>
            </div>
          </div>
        </div>

        {/* Global Portfolio Summary Card */}
        <section className="space-y-3">
          <div className="flex items-center justify-between text-xs font-mono uppercase tracking-widest text-slate-500">
            <span>Global Portfolio Summary ({isSmart ? 'v1.2.1 Smart' : 'v1.2 Naive'})</span>
            <span className="text-emerald-400">{summary.totalMatches} Matches Settled</span>
          </div>

          <div className="rounded-2xl p-6 md:p-8 bg-[#0f0f0f]/80 backdrop-blur-md border border-[#222] border-t-2 border-t-emerald-500/50 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex-1 w-full">
              <p className="text-slate-400 text-xs font-mono mb-1 uppercase tracking-wider">Starting Bankroll</p>
              <p className="font-mono text-2xl font-bold text-white">
                ${summary.startingBaseBankroll.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>

            <div className="hidden md:block w-px h-12 bg-[#222]"></div>

            <div className="flex-1 w-full text-left md:text-center">
              <p className="text-slate-400 text-xs font-mono mb-1 uppercase tracking-wider">Net Realized Profit</p>
              <div className="flex items-center justify-start md:justify-center gap-2.5">
                <p className="font-mono text-3xl md:text-4xl font-extrabold text-emerald-400">
                  +${summary.netRealizedProfit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <span className="text-xs font-mono bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20 font-bold">
                  +{summary.totalYieldPct.toFixed(2)}%
                </span>
              </div>
            </div>

            <div className="hidden md:block w-px h-12 bg-[#222]"></div>

            <div className="flex-1 w-full text-left md:text-right">
              <p className="text-slate-400 text-xs font-mono mb-1 uppercase tracking-wider">Compounded Bankroll</p>
              <p className="font-mono text-3xl font-extrabold text-white">
                ${summary.currentBankroll.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </section>

        {/* Live Test Deployments List */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs uppercase tracking-widest text-slate-500 font-mono font-semibold">
              Live Test Deployments ({isSmart ? 'Optimized for Memory State' : 'Stateless Ledger'})
            </h2>
            <span className="text-xs text-slate-500 font-mono">Click card to expand timeline</span>
          </div>

          <div className="space-y-4">
            {caseStudies.map((study) => {
              const ledger = CASE_STUDY_LEDGER.find((e) => e.slug === study.slug);
              if (!ledger) return null;

              const isOpen = !!openItems[study.slug];
              const smartReturn = ledger.realizedProfitSmart;
              const naiveReturn = ledger.realizedProfitNaive;
              const currentReturn = isSmart ? smartReturn : naiveReturn;
              const currentBankroll = isSmart ? ledger.endingBankrollSmart : ledger.endingBankrollNaive;

              return (
                <div
                  key={study.slug}
                  className={`rounded-xl border transition-all duration-200 overflow-hidden ${
                    isOpen
                      ? 'bg-[#0f0f0f] border-emerald-500/40 shadow-lg shadow-black/60'
                      : 'bg-[#0f0f0f]/80 border-[#222] hover:border-slate-700'
                  }`}
                >
                  {/* Header / Clickable Summary */}
                  <div
                    onClick={() => toggleItem(study.slug)}
                    className="p-5 flex items-center justify-between hover:bg-white/[0.02] cursor-pointer select-none transition-colors"
                  >
                    <div className="flex items-center gap-4 w-full">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border ${
                        ledger.isDeepDive
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                          : 'bg-[#181818] border-[#2a2a2a] text-slate-400'
                      }`}>
                        {ledger.isDeepDive ? (
                          <span className="text-lg">⚡</span>
                        ) : (
                          <span className="text-lg">⚔️</span>
                        )}
                      </div>

                      <div className="flex-1 min-w-0 pr-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-bold text-base sm:text-lg text-white truncate">
                            {study.homeTeam} vs {study.awayTeam}
                          </h3>
                          {ledger.isDeepDive && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                              Deep Dive
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 font-mono mt-0.5 truncate">
                          FT: {study.finalScore} • {isSmart ? 'v1.2.1 Smart Bankroll' : 'v1.2 Bankroll'}: ${currentBankroll.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </p>
                      </div>

                      <div className="text-right hidden sm:block mr-4 shrink-0">
                        <p className="text-[11px] text-slate-500 font-mono mb-0.5">
                          {isSmart ? 'v1.2.1 Smart Return' : 'v1.2 Naive Return'}
                        </p>
                        <p className="font-mono font-bold text-emerald-400 text-base sm:text-lg">
                          +${currentReturn.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </p>
                      </div>

                      <div className="shrink-0 text-slate-500 transition-transform duration-200">
                        <span className={`inline-block text-xs transition-transform ${isOpen ? 'rotate-180' : 'rotate-0'}`}>
                          ▼
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Content Area */}
                  {isOpen && (
                    <div className="p-5 pt-0 border-t border-[#222]/80 mt-1 space-y-6">
                      
                      {/* Tri-State Model Comparison Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-4">
                        {/* 1. Pre-Game Bet */}
                        <div className="bg-black/40 p-4 rounded-xl border border-[#222]">
                          <p className="text-[11px] text-slate-500 font-mono uppercase tracking-wider mb-1">
                            Pre-Game Bet
                          </p>
                          <p className={`font-mono text-base font-bold ${
                            ledger.comparison.preGame.profit >= 0 ? 'text-emerald-400' : 'text-rose-400'
                          }`}>
                            {ledger.comparison.preGame.profit >= 0 ? '+' : ''}${ledger.comparison.preGame.profit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </p>
                          <p className="text-xs text-slate-400 mt-1">
                            {ledger.comparison.preGame.text}
                          </p>
                        </div>

                        {/* 2. v1.2 Naive */}
                        <div className={`p-4 rounded-xl border transition-all ${
                          !isSmart
                            ? 'bg-slate-900/60 border-slate-700 shadow-sm'
                            : 'bg-black/40 border-[#222]'
                        }`}>
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-[11px] text-slate-400 font-mono uppercase tracking-wider">
                              v1.2 Naive
                            </p>
                            {!isSmart && (
                              <span className="text-[10px] font-mono px-1.5 py-0.2 bg-slate-800 text-slate-300 rounded">
                                ACTIVE
                              </span>
                            )}
                          </div>
                          <p className="font-mono text-base font-bold text-emerald-400">
                            +${ledger.comparison.naive.profit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </p>
                          <p className="text-xs text-slate-400 mt-1">
                            {ledger.comparison.naive.text}
                          </p>
                        </div>

                        {/* 3. v1.2.1 Smart */}
                        <div className={`p-4 rounded-xl border transition-all ${
                          isSmart
                            ? 'bg-emerald-500/10 border-emerald-500/40 shadow-[inset_0_0_20px_rgba(16,185,129,0.1)]'
                            : 'bg-black/40 border-[#222]'
                        }`}>
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-[11px] text-emerald-400 font-mono uppercase tracking-wider font-bold">
                              v1.2.1 Smart
                            </p>
                            {isSmart && (
                              <span className="text-[10px] font-mono px-1.5 py-0.2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded font-bold">
                                ACTIVE
                              </span>
                            )}
                          </div>
                          <p className="font-mono text-base font-extrabold text-emerald-300">
                            +${ledger.comparison.smart.profit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </p>
                          <p className="text-xs text-emerald-400/90 mt-1 font-medium">
                            {ledger.comparison.smart.text}
                          </p>
                        </div>
                      </div>

                      {/* Timeline Comparison (if present for deep dive) */}
                      {ledger.timeline && ledger.timeline.length > 0 && (
                        <div className="pt-2">
                          <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-6 flex items-center gap-2">
                            <span>⏱</span>
                            <span>Execution Timeline: Naive vs Smart Causal Memory</span>
                          </h4>

                          <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-2 sm:before:left-3 before:top-2 before:bottom-2 before:w-px before:bg-[#222]">
                            {ledger.timeline.map((event, idx) => (
                              <div key={idx} className="relative group">
                                {/* Dot indicator on line */}
                                <div className={`absolute -left-6 sm:-left-8 top-1 w-2.5 h-2.5 rounded-full border-2 border-[#0f0f0f] ${
                                  event.badgeType === 'slush-fund'
                                    ? 'bg-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.8)] scale-125'
                                    : event.badgeType === 'goal'
                                    ? 'bg-white shadow-[0_0_8px_rgba(255,255,255,0.6)]'
                                    : 'bg-slate-600'
                                }`}></div>

                                <div className="space-y-2">
                                  <div className="inline-block bg-[#1a1a1a] text-slate-300 font-mono text-[11px] px-2 py-0.5 rounded border border-[#2a2a2a] font-semibold">
                                    {event.timeLabel}
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                                    {/* Naive column */}
                                    <div className="bg-black/30 rounded-lg p-3 border border-[#222]">
                                      <span className="text-[10px] font-mono text-slate-500 uppercase block mb-0.5">v1.2 Naive</span>
                                      <p className="text-slate-400">{event.naiveText}</p>
                                    </div>

                                    {/* Smart column */}
                                    <div className="bg-emerald-500/5 rounded-lg p-3 border border-emerald-500/20">
                                      <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold block mb-0.5">v1.2.1 Smart</span>
                                      <p className="text-slate-200">{event.smartText}</p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Footer Actions: Link to Dedicated Post-Mortem */}
                      <div className="pt-3 border-t border-[#222] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <span className="text-xs font-mono text-slate-500">
                          Match Audit • Verified telemetry across {study.metrics.liveIngestCycles} execution cycles
                        </span>

                        <Link
                          href={`/news/${study.slug}`}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 hover:text-emerald-300 border border-emerald-500/30 hover:border-emerald-500/50 font-mono text-xs font-bold transition-all shadow-sm shadow-emerald-500/10 cursor-pointer"
                        >
                          <span>Full Live Test Audit ({study.homeTeam} vs {study.awayTeam})</span>
                          <span>→</span>
                        </Link>
                      </div>

                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

      </main>

      {/* Persistent Floating Bottom Ticker (controlled strictly by top Execution Mode) */}
      <PortfolioBottomTicker version={version} />
    </div>
  );
}
