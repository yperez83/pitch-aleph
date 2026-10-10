'use client';

import React, { useState, useEffect } from 'react';

export interface Fixture {
  id?: string | number;
  home_team: string;
  away_team: string;
  utc_timestamp: string; // ISO 8601 string, e.g. "2026-10-10T19:00:00Z"
  league?: string;
  odds_home?: string;
  odds_draw?: string;
  odds_away?: string;
  ev?: string | null;
}

export interface LiveSportsTickerProps {
  fixtures?: Fixture[];
  className?: string;
}

// Reusable tooltip component matching PitchAleph's aesthetic
const TickerTooltip = ({
  text,
  children
}: {
  text: string;
  children: React.ReactNode;
}) => {
  const [visible, setVisible] = useState(false);

  return (
    <div
      className="relative inline-flex items-center"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {children}
      {visible && text && (
        <div
          role="tooltip"
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 z-50 pointer-events-none whitespace-nowrap bg-slate-900/95 backdrop-blur-md text-slate-300 text-[10px] font-mono font-medium px-2 py-0.5 rounded border border-slate-700/80 shadow-2xl tooltip-bubble"
        >
          {text}
          <span className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-solid border-t-slate-800 border-x-transparent border-b-transparent border-t-4 border-x-4 border-b-0" />
        </div>
      )}
    </div>
  );
};

// Default upcoming fixtures with N/A EV state awaiting model execution
const DEFAULT_TICKER_FIXTURES: Fixture[] = [
  {
    id: 'fix-1',
    home_team: 'Arsenal',
    away_team: 'Manchester City',
    utc_timestamp: '2026-10-10T16:30:00Z',
    league: 'PREMIER LEAGUE',
    ev: null
  },
  {
    id: 'fix-2',
    home_team: 'Real Madrid',
    away_team: 'Barcelona',
    utc_timestamp: '2026-10-10T19:00:00Z',
    league: 'LA LIGA',
    ev: null
  },
  {
    id: 'fix-3',
    home_team: 'Bayern Munich',
    away_team: 'Borussia Dortmund',
    utc_timestamp: '2026-10-11T14:30:00Z',
    league: 'BUNDESLIGA',
    ev: null
  },
  {
    id: 'fix-4',
    home_team: 'Inter Milan',
    away_team: 'Juventus',
    utc_timestamp: '2026-10-11T18:45:00Z',
    league: 'SERIE A',
    ev: null
  },
  {
    id: 'fix-5',
    home_team: 'Paris Saint-Germain',
    away_team: 'Marseille',
    utc_timestamp: '2026-10-11T20:00:00Z',
    league: 'LIGUE 1',
    ev: null
  },
  {
    id: 'fix-6',
    home_team: 'Liverpool',
    away_team: 'Chelsea',
    utc_timestamp: '2026-10-12T15:00:00Z',
    league: 'PREMIER LEAGUE',
    ev: null
  }
];

export default function LiveSportsTicker({
  fixtures = DEFAULT_TICKER_FIXTURES,
  className = ''
}: LiveSportsTickerProps) {
  // Hydration-safe state: formatting strictly computed on the client side
  const [isClient, setIsClient] = useState(false);
  const [localTimeZone, setLocalTimeZone] = useState<string>('UTC');

  useEffect(() => {
    try {
      const detected = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
      setLocalTimeZone(detected);
    } catch {
      setLocalTimeZone('UTC');
    }
    setIsClient(true);
  }, []);

  const isExactUtc = localTimeZone === 'UTC';

  // Format UTC string into time & date
  const formatUtcTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) return { time: '00:00', date: 'UTC' };
      const hours = String(date.getUTCHours()).padStart(2, '0');
      const minutes = String(date.getUTCMinutes()).padStart(2, '0');
      const month = date.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' });
      const day = date.getUTCDate();
      return { time: `${hours}:${minutes}`, date: `${month} ${day}` };
    } catch {
      return { time: '00:00', date: 'UTC' };
    }
  };

  // Format Local string into time & date using detected browser timezone
  const formatLocalTime = (timestamp: string, timeZone: string) => {
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) return { time: '--:--', date: 'LOC' };
      const formatter = new Intl.DateTimeFormat('en-GB', {
        timeZone,
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
      const dateFormatter = new Intl.DateTimeFormat('en-US', {
        timeZone,
        month: 'short',
        day: 'numeric'
      });
      return {
        time: formatter.format(date),
        date: dateFormatter.format(date)
      };
    } catch {
      return { time: '--:--', date: 'LOC' };
    }
  };

  const renderFixtureCard = (fixture: Fixture, uniqueKey: string) => {
    const utcFormatted = formatUtcTime(fixture.utc_timestamp);
    const localFormatted = isClient
      ? formatLocalTime(fixture.utc_timestamp, localTimeZone)
      : null;

    const hasEv = fixture.ev !== null && fixture.ev !== undefined && fixture.ev !== '' && fixture.ev !== 'N/A';

    return (
      <div
        key={uniqueKey}
        className="inline-flex items-center gap-3 px-4 py-2 border-r border-slate-800/80 shrink-0 hover:bg-slate-900/60 transition-colors group cursor-default"
      >
        {/* League & EV status badge */}
        <div className="flex flex-col items-start gap-0.5">
          {fixture.league && (
            <span className="text-[9px] font-mono font-semibold tracking-wider text-slate-500 uppercase">
              {fixture.league}
            </span>
          )}
          {hasEv ? (
            <span className="text-[9px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-1 py-0.2 rounded border border-emerald-500/20">
              {fixture.ev}
            </span>
          ) : (
            <TickerTooltip text="Has not yet been calculated">
              <span className="text-[9px] font-mono font-medium text-slate-400 bg-slate-800/60 px-1 py-0.2 rounded border border-slate-700/60 hover:text-slate-200 transition-colors cursor-help">
                EV: N/A
              </span>
            </TickerTooltip>
          )}
        </div>

        {/* Fixture Matchup */}
        <div className="flex items-center gap-1.5 text-xs font-semibold tracking-tight text-white whitespace-nowrap">
          <span className="text-slate-100 group-hover:text-emerald-400 transition-colors">
            {fixture.home_team}
          </span>
          <span className="text-slate-500 font-normal font-mono text-[10px] px-0.5">
            vs
          </span>
          <span className="text-slate-100 group-hover:text-emerald-400 transition-colors">
            {fixture.away_team}
          </span>
        </div>

        {/* Hydration-safe Clocks */}
        <div className="flex items-center gap-2 pl-1 border-l border-slate-800/60 font-mono text-[11px]">
          {/* Client Local Time (Rendered conditionally when client hydrated and local is not strictly 'UTC') */}
          {isClient && !isExactUtc && localFormatted ? (
            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-900/90 border border-slate-800 text-slate-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-slate-400 font-medium">{localFormatted.date}</span>
              <span className="font-bold text-slate-200">{localFormatted.time}</span>
              <span className="text-[9px] text-slate-500 uppercase ml-0.5" title={localTimeZone}>
                LOC
              </span>
            </div>
          ) : !isClient ? (
            // SSR placeholder to guarantee hydration match
            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-900/50 border border-slate-800/40 text-slate-500">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-600"></span>
              <span>--:--</span>
            </div>
          ) : null}

          {/* UTC Clock (Always present) */}
          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-zinc-900/90 border border-zinc-800/90 text-zinc-400">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400/80"></span>
            <span className="text-zinc-500">{utcFormatted.date}</span>
            <span className="font-bold text-zinc-300">{utcFormatted.time}</span>
            <span className="text-[9px] text-zinc-500 font-semibold uppercase ml-0.5">
              UTC
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      className={`w-full bg-slate-950/95 border-y border-slate-800/80 backdrop-blur-md overflow-hidden select-none relative z-30 shadow-inner ${className}`}
      aria-label="Upcoming Match Fixtures Live Ticker"
    >
      <div className="flex items-center w-full">
        {/* Left Ticker Label Pill */}
        <div className="z-20 shrink-0 bg-slate-900/95 border-r border-slate-800 px-3.5 py-2 flex items-center gap-2 shadow-[4px_0_12px_rgba(0,0,0,0.5)]">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-mono text-[11px] font-bold tracking-widest text-emerald-400 uppercase whitespace-nowrap">
            UPCOMING FIXTURES
          </span>
          {isClient && !isExactUtc && (
            <span
              className="hidden lg:inline-block font-mono text-[9px] text-slate-400 bg-slate-800/80 px-1.5 py-0.5 rounded border border-slate-700/60 max-w-[120px] truncate"
              title={`Detected Timezone: ${localTimeZone}`}
            >
              {localTimeZone.split('/').pop()?.replace(/_/g, ' ')}
            </span>
          )}
        </div>

        {/* Marquee Scroller container with edge gradient fades */}
        <div className="relative overflow-hidden flex-1 group">
          {/* Subtle gradient masks for smooth edge fade */}
          <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-slate-950 to-transparent z-10"></div>
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-slate-950 to-transparent z-10"></div>

          {/* Continuous scrolling container: duplicated list for infinite seamless loop */}
          <div className="animate-marquee-scroll">
            {/* Primary set */}
            {fixtures.map((fixture, idx) =>
              renderFixtureCard(fixture, `primary-${fixture.id || idx}`)
            )}
            {/* Duplicate set for seamless continuous horizontal scroll */}
            {fixtures.map((fixture, idx) =>
              renderFixtureCard(fixture, `duplicate-${fixture.id || idx}`)
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
