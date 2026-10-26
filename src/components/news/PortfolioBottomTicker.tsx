'use client';

import React from 'react';
import { getPortfolioSummary, EngineVersion } from '@/lib/newsLedger';

interface PortfolioBottomTickerProps {
  version?: EngineVersion;
  onVersionChange?: (version: EngineVersion) => void;
}

export default function PortfolioBottomTicker({
  version = 'v1.2.1-smart',
  onVersionChange
}: PortfolioBottomTickerProps) {
  const summary = getPortfolioSummary(version);
  const isSmart = version === 'v1.2.1-smart';

  const formattedBankroll = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(summary.currentBankroll);

  const formattedProfit = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(summary.netRealizedProfit);

  const formattedRouted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(summary.totalCapitalRouted);

  return (
    <aside
      aria-label="PitchAleph Live Test Portfolio Ledger"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-5xl pointer-events-auto"
    >
      <div className="bg-slate-950/92 backdrop-blur-md border border-slate-800/90 rounded-2xl shadow-2xl shadow-black/90 px-4 sm:px-6 py-3 transition-all hover:border-slate-700">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Left: Indicator & Bankroll headline */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/30 shrink-0">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>{isSmart ? 'v1.2.1 SMART LEDGER' : 'v1.2 NAIVE LEDGER'}</span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider hidden sm:inline">
                Bankroll:
              </span>
              <span className="font-mono font-black text-white text-base md:text-lg tracking-tight">
                {formattedBankroll}
              </span>
            </div>
          </div>

          {/* Center & Right: Metric pills + Interactive Toggle */}
          <div className="flex items-center flex-wrap gap-2.5 sm:gap-4 font-mono text-xs">
            {/* Net Realized PnL */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 text-[11px]">Net PnL:</span>
              <span className="text-emerald-400 font-bold">+{formattedProfit}</span>
            </div>

            {/* Total Yield Pill */}
            <div className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold text-[11px] shadow-sm shadow-emerald-500/10">
              +{summary.totalYieldPct.toFixed(2)}% Total Yield
            </div>

            {/* Capital Routed */}
            <div className="hidden lg:flex items-center gap-1.5 text-slate-300">
              <span className="text-slate-400 text-[11px]">Routed:</span>
              <span className="font-medium text-slate-200">{formattedRouted}</span>
            </div>

            {/* Version Switcher Pill */}
            {onVersionChange && (
              <div className="flex items-center rounded-lg bg-slate-900 border border-slate-800 p-0.5 text-[11px]">
                <button
                  type="button"
                  onClick={() => onVersionChange('v1.2.1-smart')}
                  className={`px-2 py-0.5 rounded-md font-bold transition-all cursor-pointer ${
                    isSmart
                      ? 'bg-emerald-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  v1.2.1 Smart
                </button>
                <button
                  type="button"
                  onClick={() => onVersionChange('v1.2-naive')}
                  className={`px-2 py-0.5 rounded-md font-bold transition-all cursor-pointer ${
                    !isSmart
                      ? 'bg-slate-700 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  v1.2 Naive
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
