'use client';

import React, { useState } from 'react';
import { MatchedFixture } from './FixtureCard';
import { generateColabScript } from '@/lib/colabScript';

interface DeploymentOptionsProps {
  fixture: MatchedFixture;
  oddsApiKey: string;
  apiFootballKey: string;
}

export default function DeploymentOptions({
  fixture,
  oddsApiKey,
  apiFootballKey
}: DeploymentOptionsProps) {
  const [copied, setCopied] = useState(false);

  const pythonScript = generateColabScript({
    homeTeam: fixture.homeTeam,
    awayTeam: fixture.awayTeam,
    targetOddsId: fixture.oddsId,
    targetSportsId: fixture.sportsId,
    oddsApiKey: oddsApiKey.trim(),
    apiFootballKey: apiFootballKey.trim()
  });

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(pythonScript);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="space-y-6">
      {/* Pinned Target Summary Banner */}
      <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 font-mono text-xs">
        <div className="space-y-1">
          <div className="text-[10px] text-emerald-400 uppercase tracking-wider font-bold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Target Deployment Lock</span>
          </div>
          <div className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <span>{fixture.homeTeam}</span>
            <span className="text-slate-500 font-normal">vs</span>
            <span>{fixture.awayTeam}</span>
            {fixture.score && (
              <span className="px-2 py-0.5 rounded bg-slate-800 text-cyan-400 text-xs font-bold border border-slate-700">
                {fixture.score}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-slate-400 text-[11px] pt-2 md:pt-0 border-t md:border-0 border-slate-800">
          <div>
            Status: <strong className="text-slate-200">{fixture.status}</strong>
          </div>
          <div>
            TheOddsAPI: <strong className="text-slate-200">{fixture.oddsId.slice(0, 10)}...</strong>
          </div>
          <div>
            API-Sports ID: <strong className="text-emerald-400">#{fixture.sportsId}</strong>
          </div>
        </div>
      </div>

      {/* Dual Colab Execution Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* OPTION 1: Hosted GitHub Template */}
        <div className="p-6 md:p-7 rounded-2xl bg-slate-900/60 border border-slate-800/90 flex flex-col justify-between gap-6 hover:border-slate-700 transition-all">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-mono text-[11px] font-bold">
              OPTION 1
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight">
              Interactive Template Notebook
            </h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              Launches our public GitHub notebook featuring native Colab Form inputs (<code className="text-emerald-300 font-mono text-xs">#@param</code>), markdown guidance, and structured pipeline cells.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-800/80">
            <a
              href="https://colab.research.google.com/github/marianopsa/pitchaleph/blob/main/PitchAleph_Live_Runner.ipynb"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-mono text-sm font-bold border border-slate-700 hover:border-slate-600 transition-all shadow-md cursor-pointer"
            >
              <span>Launch Template on Colab</span>
              <span className="text-xs">↗</span>
            </a>
          </div>
        </div>

        {/* OPTION 2: Scratchpad Runner (colab.new) */}
        <div className="p-6 md:p-7 rounded-2xl bg-slate-900/60 border border-emerald-500/30 ring-1 ring-emerald-500/30 flex flex-col justify-between gap-6 hover:border-emerald-500/50 transition-all shadow-xl shadow-emerald-950/20">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-[11px] font-bold">
              OPTION 2 (RECOMMENDED)
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight flex items-center justify-between">
              <span>Scratchpad Runner (colab.new)</span>
            </h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              Copies a self-contained, autonomous 60-second in-play monitoring script pre-filled with your exact API keys and selected match IDs, then launches a blank Colab sandbox.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-800/80 space-y-3">
            {copied && (
              <div className="p-2 rounded bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 font-mono text-xs text-center animate-in fade-in duration-200">
                ✓ Script copied to clipboard! Paste into colab.new
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-800 hover:bg-emerald-500/20 text-emerald-400 hover:text-emerald-300 font-mono text-xs font-bold border border-slate-700 hover:border-emerald-500/50 transition-all cursor-pointer"
              >
                <span>{copied ? '✓ Copied!' : '📋 Copy Configured Script'}</span>
              </button>

              <a
                href="https://colab.new"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono text-xs font-bold transition-all shadow-md shadow-emerald-500/20 hover:scale-[1.02] cursor-pointer"
              >
                <span>Open colab.new</span>
                <span>↗</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
