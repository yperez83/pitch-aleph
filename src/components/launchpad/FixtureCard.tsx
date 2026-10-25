import React from 'react';

export interface MatchedFixture {
  homeTeam: string;
  awayTeam: string;
  status: string; // e.g. "LIVE 45'", "HT", "UPCOMING", "19:00 UTC"
  isLive: boolean;
  score?: string;
  oddsId: string;
  sportsId: number | string;
  prices: {
    home: number | string;
    draw: number | string;
    away: number | string;
  };
}

interface FixtureCardProps {
  fixture: MatchedFixture;
  isSelected: boolean;
  onSelect: () => void;
}

export default function FixtureCard({
  fixture,
  isSelected,
  onSelect
}: FixtureCardProps) {
  return (
    <div
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect();
        }
      }}
      className={`p-4 md:p-5 rounded-xl border text-left transition-all cursor-pointer select-none flex flex-col justify-between gap-4 ${
        isSelected
          ? 'bg-emerald-500/10 border-emerald-500 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500'
          : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/90'
      }`}
    >
      {/* Top Bar: Status + Score */}
      <div className="flex items-center justify-between gap-2 font-mono text-xs">
        <div className="flex items-center gap-1.5">
          {fixture.isLive ? (
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-red-500/15 border border-red-500/30 text-red-400 font-bold animate-pulse text-[10px]">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
              <span>{fixture.status}</span>
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700/60 text-[10px]">
              {fixture.status}
            </span>
          )}
        </div>

        {fixture.score && (
          <span className="font-bold text-white text-sm tracking-widest bg-slate-950/80 px-2 py-0.5 rounded border border-slate-800">
            {fixture.score}
          </span>
        )}
      </div>

      {/* Matchup Teams */}
      <div className="space-y-1">
        <div className="text-base md:text-lg font-bold text-white tracking-tight flex items-center justify-between">
          <span className={isSelected ? 'text-emerald-300' : 'text-slate-100'}>
            {fixture.homeTeam}
          </span>
        </div>
        <div className="text-[11px] font-mono text-slate-500">vs</div>
        <div className="text-base md:text-lg font-bold text-white tracking-tight flex items-center justify-between">
          <span className={isSelected ? 'text-emerald-300' : 'text-slate-100'}>
            {fixture.awayTeam}
          </span>
        </div>
      </div>

      {/* Consensus 1X2 Prices */}
      <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-800/80 font-mono text-xs text-center">
        <div className="bg-slate-950/80 p-1.5 rounded border border-slate-800/60">
          <div className="text-[10px] text-slate-500 uppercase">1 (Home)</div>
          <div className="text-slate-200 font-bold mt-0.5">
            {typeof fixture.prices.home === 'number' ? fixture.prices.home.toFixed(2) : fixture.prices.home}
          </div>
        </div>
        <div className="bg-slate-950/80 p-1.5 rounded border border-slate-800/60">
          <div className="text-[10px] text-slate-500 uppercase">X (Draw)</div>
          <div className="text-slate-200 font-bold mt-0.5">
            {typeof fixture.prices.draw === 'number' ? fixture.prices.draw.toFixed(2) : fixture.prices.draw}
          </div>
        </div>
        <div className="bg-slate-950/80 p-1.5 rounded border border-slate-800/60">
          <div className="text-[10px] text-slate-500 uppercase">2 (Away)</div>
          <div className="text-slate-200 font-bold mt-0.5">
            {typeof fixture.prices.away === 'number' ? fixture.prices.away.toFixed(2) : fixture.prices.away}
          </div>
        </div>
      </div>

      {/* Matched IDs Bar */}
      <div className="pt-1 flex items-center justify-between font-mono text-[10px] text-slate-400 border-t border-slate-800/40">
        <span className="truncate max-w-[140px]" title={`Odds API ID: ${fixture.oddsId}`}>
          Odds: <strong className="text-slate-300">{fixture.oddsId.slice(0, 8)}...</strong>
        </span>
        <span title={`API-Sports ID: ${fixture.sportsId}`}>
          Sports: <strong className="text-emerald-400">#{fixture.sportsId}</strong>
        </span>
      </div>
    </div>
  );
}
