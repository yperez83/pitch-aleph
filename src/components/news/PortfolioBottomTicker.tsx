'use client';

import React from 'react';
import { getPortfolioSummary, EngineVersion } from '@/lib/newsLedger';

interface PortfolioBottomTickerProps {
  version?: EngineVersion;
}

export default function PortfolioBottomTicker({
  version = 'v1.2.1-smart'
}: PortfolioBottomTickerProps) {
  const summary = getPortfolioSummary(version);
  const isSmart = version === 'v1.2.1-smart';

  const formattedBankroll = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(summary.currentBankroll);

  const formattedProfit = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(summary.netRealizedProfit);

  const formattedRouted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(summary.totalCapitalRouted);

  return (
    <aside
      aria-label="PitchAleph Live Test Portfolio Ledger"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[94%] max-w-4xl pointer-events-auto"
    >
      <div className="bg-[#080808]/95 backdrop-blur-md border border-[#222] rounded-xl shadow-2xl shadow-black/90 px-3.5 sm:px-5 py-2.5 transition-all">
        <div className="flex items-center justify-between gap-3 text-xs font-mono">
          
          {/* Left: Badge + Bankroll */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>{isSmart ? 'v1.2.1' : 'v1.2'}</span>
            </div>

            <div className="flex items-baseline gap-1.5">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider hidden sm:inline">
                Bankroll:
              </span>
              <span className="font-extrabold text-white text-sm sm:text-base tracking-tight">
                {formattedBankroll}
              </span>
            </div>
          </div>

          {/* Right: Metrics Summarized & Tight */}
          <div className="flex items-center gap-2.5 sm:gap-4 text-[11px] shrink-0">
            {/* Net Realized PnL */}
            <div className="flex items-center gap-1">
              <span className="text-slate-500 text-[10px] hidden sm:inline">PnL:</span>
              <span className="text-emerald-400 font-bold">+{formattedProfit}</span>
            </div>

            {/* Yield Badge */}
            <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold text-[10px]">
              +{summary.totalYieldPct.toFixed(1)}%
            </span>

            {/* Capital Routed */}
            <div className="hidden md:flex items-center gap-1 text-slate-400">
              <span className="text-slate-500 text-[10px]">Vol:</span>
              <span className="text-slate-300 font-medium">{formattedRouted}</span>
            </div>

            {/* Record */}
            <div className="flex items-center gap-1 text-cyan-400 font-bold pl-2 border-l border-[#222]">
              <span>{summary.profitableMatches}W-0L</span>
            </div>
          </div>

        </div>
      </div>
    </aside>
  );
}
