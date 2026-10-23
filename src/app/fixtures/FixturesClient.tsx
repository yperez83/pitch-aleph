'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Fixture, generateDailyUpcomingFixtures } from '@/lib/fixtures';

export default function FixturesClient() {
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [clientTimezone, setClientTimezone] = useState<string>('UTC');
  const [filterLeague, setFilterLeague] = useState<string>('ALL');

  useEffect(() => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (tz) setClientTimezone(tz);
    } catch {
      // fallback to UTC
    }
    setFixtures(generateDailyUpcomingFixtures());
  }, []);

  const leagues = ['ALL', ...Array.from(new Set(fixtures.map(f => f.league || 'Other')))];

  const filteredFixtures = filterLeague === 'ALL'
    ? fixtures
    : fixtures.filter(f => (f.league || 'Other') === filterLeague);

  const formatKickoff = (utcIso: string) => {
    try {
      const date = new Date(utcIso);
      const localStr = date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
      const dateStr = date.toLocaleDateString([], {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      });
      const utcStr = date.toISOString().slice(11, 16) + ' UTC';
      return { local: `${dateStr} ${localStr}`, utc: utcStr };
    } catch {
      return { local: '--:--', utc: '--:--' };
    }
  };

  return (
    <div className="space-y-8">
      {/* Header section with badge & quick metadata */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs mb-3">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            LIVE DAILY SCHEDULE & EDGE FEED
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            Upcoming Match Fixtures
          </h1>
          <p className="text-slate-400 text-sm mt-2 max-w-2xl leading-relaxed">
            European & domestic football fixtures matched against Pitch Alephℵ₀ Monte Carlo predictive edge models. Kickoff times converted to your local system time.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs text-slate-400 bg-slate-900/80 px-3 py-2 rounded-lg border border-slate-800 self-start md:self-auto">
          <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
          <span>Timezone:</span>
          <span className="text-white font-bold">{clientTimezone}</span>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none font-mono text-xs">
        {leagues.map(league => (
          <button
            key={league}
            onClick={() => setFilterLeague(league)}
            className={`px-3 py-1.5 rounded-lg border transition-all whitespace-nowrap cursor-pointer ${
              filterLeague === league
                ? 'bg-emerald-500 text-slate-950 font-bold border-emerald-400 shadow-md shadow-emerald-500/20'
                : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-white'
            }`}
          >
            {league}
          </button>
        ))}
      </div>

      {/* Staggered Bullet List */}
      <div className="space-y-3">
        {filteredFixtures.map((fixture, idx) => {
          const time = formatKickoff(fixture.utc_timestamp);
          return (
            <div
              key={fixture.id || idx}
              style={{ animationDelay: `${idx * 60}ms` }}
              className="animate-in fade-in slide-in-from-top-3 duration-500 fill-mode-both group relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/70 border border-slate-800/80 hover:border-emerald-500/50 hover:bg-slate-900/90 transition-all hover:shadow-lg hover:shadow-emerald-950/20"
            >
              {/* Left: Bullet dot + League tag + Matchup */}
              <div className="flex items-start sm:items-center gap-3.5">
                {/* Traditional bullet accent with glow */}
                <div className="mt-1 sm:mt-0 flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-slate-800/80 border border-slate-700/80 group-hover:border-emerald-400/80 group-hover:bg-emerald-500/20 transition-all">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-800/90 text-slate-400 border border-slate-700/60">
                      {fixture.league || 'SOCCER'}
                    </span>
                    <span className="text-[11px] font-mono text-slate-500">
                      {time.utc}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-base sm:text-lg font-bold text-white tracking-tight">
                    <span className="hover:text-emerald-400 transition-colors">
                      {fixture.home_team}
                    </span>
                    <span className="text-xs text-slate-500 font-mono font-normal">vs</span>
                    <span className="hover:text-emerald-400 transition-colors">
                      {fixture.away_team}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right: Kickoff Badge + Edge + Action Button */}
              <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t border-slate-800/50 sm:border-0 font-mono">
                {/* Time badge */}
                <div className="text-right">
                  <div className="text-xs font-semibold text-slate-200">
                    {time.local}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Local Kickoff
                  </div>
                </div>

                {/* EV Pill */}
                {fixture.ev && (
                  <div className="px-2.5 py-1 rounded bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 text-xs font-bold whitespace-nowrap">
                    {fixture.ev}
                  </div>
                )}

                {/* Deep link into Monte Carlo Engine simulator */}
                <Link
                  href={`/?home=${encodeURIComponent(fixture.home_team)}&away=${encodeURIComponent(fixture.away_team)}`}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 text-slate-300 border border-slate-700 hover:border-emerald-400 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer whitespace-nowrap"
                  title={`Simulate ${fixture.home_team} vs ${fixture.away_team} in Engine`}
                >
                  <span>Simulate</span>
                  <span className="text-[10px]">→</span>
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Info Banner */}
      <div className="rounded-xl border border-slate-800/60 bg-slate-900/40 p-5 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs text-slate-400">
        <div className="flex items-center gap-3">
          <span className="text-xl">⚡</span>
          <span>
            Odds and EV calculations are updated dynamically against live market pricing and Poisson-Weibull simulations.
          </span>
        </div>
        <Link
          href="/"
          className="text-emerald-400 hover:text-emerald-300 underline underline-offset-4 flex-shrink-0"
        >
          Open Simulator Engine →
        </Link>
      </div>
    </div>
  );
}
