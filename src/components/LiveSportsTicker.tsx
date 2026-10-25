'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Fixture, generateDailyUpcomingFixtures } from '@/lib/fixtures';

export type { Fixture };

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

// Helper to generate dynamic upcoming fixture timestamps relative to now
const getFutureUtcIso = (hoursFromNow: number) => {
  const date = new Date(Date.now() + hoursFromNow * 3600 * 1000);
  date.setUTCMinutes(0, 0, 0);
  return date.toISOString();
};

// Default dynamic fixtures generated for today
const DEFAULT_TICKER_FIXTURES: Fixture[] = generateDailyUpcomingFixtures();

// Team Elo lookup table matching models/v1.1/elo_ratings.json + major European clubs
const TEAM_ELO_BASELINE: Record<string, number> = {
  Arsenal: 1840.5,
  'Manchester City': 1920.2,
  'Real Madrid': 1910.8,
  Barcelona: 1875.4,
  'Bayern Munich': 1880.0,
  'Borussia Dortmund': 1785.1,
  'Inter Milan': 1830.2,
  Juventus: 1770.6,
  'Paris Saint-Germain': 1850.0,
  Marseille: 1735.4,
  Liverpool: 1865.7,
  Chelsea: 1795.3,
  'Atlético Madrid': 1820.0,
  'Bayer Leverkusen': 1835.0,
  'Aston Villa': 1765.0,
  Tottenham: 1775.0,
  'AC Milan': 1790.0,
  Napoli: 1780.0,
  Newcastle: 1760.0,
  Monaco: 1745.0,
  'Sporting CP': 1755.0,
  Benfica: 1750.0,
  Atalanta: 1765.0,
  'RB Leipzig': 1770.0,
  'Real Sociedad': 1740.0,
  'Athletic Bilbao': 1750.0,
  Roma: 1755.0,
  Lazio: 1745.0,
  PSV: 1730.0,
  Feyenoord: 1720.0,
  'Sparta Prague': 1680.0,
  'AZ Alkmaar': 1690.0,
  'Fenerbahçe': 1715.0,
  'Manchester United': 1785.0,
  'Dynamo Kyiv': 1670.0,
  'Slavia Prague': 1685.0,
  Lille: 1720.0,
  Stuttgart: 1730.0,
  'Eintracht Frankfurt': 1740.0,
  Sevilla: 1725.0,
  Valencia: 1710.0,
  Espanyol: 1680.0,
  'Leicester City': 1695.0,
  'Nottingham Forest': 1705.0
};

// Compute match phase and minutes elapsed relative to kickoff
const getMatchLifecycle = (kickoffIso: string) => {
  const kickoffMs = new Date(kickoffIso).getTime();
  const nowMs = Date.now();
  const elapsedMinutes = (nowMs - kickoffMs) / (60 * 1000);

  if (elapsedMinutes < 0) {
    return { phase: 'PRE_MATCH' as const, elapsedMinutes: 0 };
  } else if (elapsedMinutes <= 105) {
    return { phase: 'IN_PLAY' as const, elapsedMinutes: Math.min(90, Math.max(1, elapsedMinutes)) };
  } else {
    return { phase: 'FINISHED' as const, elapsedMinutes: 90 };
  }
};

export default function LiveSportsTicker({
  fixtures: initialFixtures = DEFAULT_TICKER_FIXTURES,
  className = ''
}: LiveSportsTickerProps) {
  // Hydration-safe state: formatting strictly computed on the client side
  const [isClient, setIsClient] = useState(false);
  const [localTimeZone, setLocalTimeZone] = useState<string>('UTC');
  const [fixtureData, setFixtureData] = useState<Fixture[]>(initialFixtures);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isNavOpen, setIsNavOpen] = useState<boolean>(false);
  const navMenuRef = React.useRef<HTMLDivElement>(null);

  // Close nav dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navMenuRef.current && !navMenuRef.current.contains(event.target as Node)) {
        setIsNavOpen(false);
      }
    };
    if (isNavOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isNavOpen]);

  useEffect(() => {
    try {
      const detected = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
      setLocalTimeZone(detected);
    } catch {
      setLocalTimeZone('UTC');
    }
    setIsClient(true);
  }, []);

  // Automatically refresh fixtures if calendar day rolls over (or on custom initialFixtures change)
  useEffect(() => {
    // If custom fixtures were explicitly passed in, respect them
    if (initialFixtures !== DEFAULT_TICKER_FIXTURES) {
      setFixtureData(initialFixtures);
      return;
    }

    let active = true;
    let currentDayKey = new Date().toISOString().slice(0, 10);

    const checkDailyRollover = () => {
      const todayKey = new Date().toISOString().slice(0, 10);
      if (todayKey !== currentDayKey) {
        currentDayKey = todayKey;
        if (active) {
          setFixtureData(generateDailyUpcomingFixtures(new Date()));
        }
      }
    };

    // Check every minute for midnight date rollover
    const rolloverInterval = setInterval(checkDailyRollover, 60 * 1000);

    return () => {
      active = false;
      clearInterval(rolloverInterval);
    };
  }, [initialFixtures]);

  // Dynamic EV fetcher connected to FastAPI engine
  // Call policy:
  // - Pre-match: 1 initial call on mount (+ gentle 15-min background poll if tab left open)
  // - In-Play (0-105 min): 1 call every 15 minutes (~6 updates across 90 min)
  // - Finished (>105 min): 0 calls (lifecycle ended)
  useEffect(() => {
    let isCancelled = false;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';

    const evaluateFixture = async (fixture: Fixture): Promise<string | null> => {
      const { phase, elapsedMinutes } = getMatchLifecycle(fixture.utc_timestamp);
      if (phase === 'FINISHED') return fixture.ev || null;

      // Extract or compute pre-match Elo differential
      const homeElo = TEAM_ELO_BASELINE[fixture.home_team] || 1700.0;
      const awayElo = TEAM_ELO_BASELINE[fixture.away_team] || 1700.0;
      const eloDiff = Number((homeElo - awayElo).toFixed(2));

      // Build model match state
      const timeRatio = phase === 'IN_PLAY' ? Number((elapsedMinutes / 90).toFixed(3)) : 0.0;
      const goalDiff = 0;
      const possShare = 0.50;
      const shotDiff = 0;

      const payload = {
        match_time_ratio: Math.min(1.0, Math.max(0.0, timeRatio)),
        goal_differential: goalDiff,
        team_A_possession_share: possShare,
        shot_differential: shotDiff,
        prematch_elo_diff: eloDiff,
      };

      try {
        const response = await fetch(`${apiUrl}/calculate-edge?market_odds_decimal=2.10&bankroll=10000`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!response.ok) return fixture.ev || null;
        const result = await response.json();
        if (result && typeof result.expected_value_percent === 'number') {
          const sign = result.expected_value_percent > 0 ? '+' : '';
          return `${sign}${result.expected_value_percent.toFixed(1)}% EV`;
        }
      } catch {
        // Silent network/offline fallback to pre-calibrated EV baseline
      }
      return fixture.ev || null;
    };

    const runEngineUpdates = async () => {
      const updatedList = await Promise.all(
        fixtureData.map(async (f) => {
          const newEv = await evaluateFixture(f);
          return newEv ? { ...f, ev: newEv } : f;
        })
      );
      if (!isCancelled) {
        setFixtureData(updatedList);
      }
    };

    // 1. Initial call on mount
    runEngineUpdates();

    // 2. Moderate interval: 15 minutes (900,000 ms)
    // Produces 6 evaluations across an entire 90-minute live fixture
    const intervalId = setInterval(runEngineUpdates, 15 * 60 * 1000);

    return () => {
      isCancelled = true;
      clearInterval(intervalId);
    };
  }, [fixtureData.length, fixtureData[0]?.id]);

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
      className={`w-full bg-slate-950/95 border-y border-slate-800/80 backdrop-blur-md select-none relative z-30 shadow-inner ${className}`}
      aria-label="Upcoming Match Fixtures Live Ticker"
    >
      <div className="flex items-center w-full">
        {/* Left Ticker Label Pill - Interactive button */}
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="z-20 shrink-0 bg-slate-900/95 hover:bg-slate-850 border-r border-slate-800 px-3.5 py-2 flex items-center gap-2 shadow-[4px_0_12px_rgba(0,0,0,0.5)] cursor-pointer group/label transition-colors text-left"
          title={isExpanded ? 'Collapse list preview' : 'Click to drop down full fixtures preview'}
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-mono text-[11px] font-bold tracking-widest text-emerald-400 group-hover/label:text-emerald-300 uppercase whitespace-nowrap flex items-center gap-1.5">
            <span>UPCOMING FIXTURES</span>
            <span className={`text-[10px] text-slate-400 transition-transform duration-300 ${isExpanded ? 'rotate-180 text-emerald-400' : ''}`}>
              ▼
            </span>
          </span>
          {isClient && !isExactUtc && (
            <span
              className="hidden lg:inline-block font-mono text-[9px] text-slate-400 bg-slate-800/80 px-1.5 py-0.5 rounded border border-slate-700/60 max-w-[120px] truncate"
              title={`Detected Timezone: ${localTimeZone}`}
            >
              {localTimeZone.split('/').pop()?.replace(/_/g, ' ')}
            </span>
          )}
        </button>

        {/* Marquee Scroller container with edge gradient fades - Clickable to toggle */}
        <div
          onClick={() => setIsExpanded(!isExpanded)}
          className="relative overflow-hidden flex-1 group cursor-pointer"
          title={isExpanded ? 'Collapse list' : 'Click to expand fixtures list'}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setIsExpanded(!isExpanded);
            }
          }}
        >
          {/* Subtle gradient masks for smooth edge fade */}
          <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-slate-950 to-transparent z-10"></div>
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-slate-950 to-transparent z-10"></div>

          {/* Continuous scrolling container: duplicated list for infinite seamless loop */}
          <div className="animate-marquee-scroll">
            {/* Primary set */}
            {fixtureData.map((fixture, idx) =>
              renderFixtureCard(fixture, `primary-${fixture.id || idx}`)
            )}
            {/* Duplicate set for seamless continuous horizontal scroll */}
            {fixtureData.map((fixture, idx) =>
              renderFixtureCard(fixture, `duplicate-${fixture.id || idx}`)
            )}
          </div>
        </div>

        {/* Right Action Navigation Dropdown Menu */}
        <div ref={navMenuRef} className="z-30 shrink-0 bg-slate-900/95 border-l border-slate-800 px-3 py-2 flex items-center relative shadow-[-4px_0_12px_rgba(0,0,0,0.5)]">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsNavOpen((prev) => !prev);
            }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 hover:text-emerald-300 border border-emerald-500/30 hover:border-emerald-500/60 font-mono text-xs font-bold transition-all cursor-pointer shadow-sm shadow-emerald-500/10"
            aria-expanded={isNavOpen}
            aria-haspopup="true"
            title="Open Platform Navigation Menu"
          >
            <span>🧭</span>
            <span>EXPLORE</span>
            <span className={`text-[10px] transition-transform duration-200 ${isNavOpen ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </button>

          {/* Nested Dropdown Menu Popover */}
          {isNavOpen && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="absolute right-2 top-full mt-2 w-56 rounded-xl bg-slate-950/98 backdrop-blur-xl border border-slate-800 shadow-2xl shadow-black/90 p-2 z-50 font-mono text-xs animate-in fade-in slide-in-from-top-2 duration-200"
            >
              <div className="px-2.5 py-1.5 text-[10px] text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-800/80 mb-1">
                Platform Navigation
              </div>

              <div className="space-y-1">
                <Link
                  href="/launchpad"
                  onClick={() => setIsNavOpen(false)}
                  className="flex items-center justify-between px-2.5 py-2 rounded-lg text-slate-200 hover:text-emerald-300 hover:bg-emerald-500/10 border border-transparent hover:border-emerald-500/30 transition-all group"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm">🚀</span>
                    <span className="font-bold">Launchpad</span>
                  </div>
                  <span className="text-[10px] text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    Run →
                  </span>
                </Link>

                <Link
                  href="/news"
                  onClick={() => setIsNavOpen(false)}
                  className="flex items-center justify-between px-2.5 py-2 rounded-lg text-slate-200 hover:text-emerald-300 hover:bg-emerald-500/10 border border-transparent hover:border-emerald-500/30 transition-all group"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm">📊</span>
                    <span className="font-bold">Live Tests</span>
                  </div>
                  <span className="text-[10px] text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    Audit →
                  </span>
                </Link>

                <Link
                  href="/fixtures"
                  onClick={() => setIsNavOpen(false)}
                  className="flex items-center justify-between px-2.5 py-2 rounded-lg text-slate-200 hover:text-emerald-300 hover:bg-emerald-500/10 border border-transparent hover:border-emerald-500/30 transition-all group"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm">📅</span>
                    <span className="font-bold">Fixtures</span>
                  </div>
                  <span className="text-[10px] text-slate-500 group-hover:text-emerald-400 transition-colors">
                    Schedule ↗
                  </span>
                </Link>

                <Link
                  href="/archives"
                  onClick={() => setIsNavOpen(false)}
                  className="flex items-center justify-between px-2.5 py-2 rounded-lg text-slate-200 hover:text-emerald-300 hover:bg-emerald-500/10 border border-transparent hover:border-emerald-500/30 transition-all group"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm">📚</span>
                    <span className="font-bold">Archives</span>
                  </div>
                  <span className="text-[10px] text-slate-500 group-hover:text-emerald-400 transition-colors">
                    v1.0 →
                  </span>
                </Link>

                <a
                  href="/dev-blog"
                  onClick={() => setIsNavOpen(false)}
                  className="flex items-center justify-between px-2.5 py-2 rounded-lg text-slate-200 hover:text-emerald-300 hover:bg-emerald-500/10 border border-transparent hover:border-emerald-500/30 transition-all group"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm">📰</span>
                    <span className="font-bold">Dev Blog</span>
                  </div>
                  <span className="text-[10px] text-slate-500 group-hover:text-emerald-400 transition-colors">
                    Read →
                  </span>
                </a>

                <div className="pt-1 mt-1 border-t border-slate-800/80">
                  <a
                    href="/api/docs"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setIsNavOpen(false)}
                    className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-900 transition-all text-[11px]"
                  >
                    <span>⚡ Swagger API Docs</span>
                    <span>↗</span>
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Accordion Dropdown Preview with Staggered Cascading Animation */}
      {isExpanded && (
        <div className="w-full border-t border-slate-800/90 bg-slate-950/98 backdrop-blur-xl px-4 py-5 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="max-w-6xl mx-auto space-y-4">
            {/* Dropdown Header & Quick Action */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/70 font-mono text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span className="font-bold text-white tracking-wide uppercase">
                  Upcoming Match Calendar ({fixtureData.length} Fixtures)
                </span>
                <span className="text-slate-500">|</span>
                <span className="text-slate-400">
                  {isExactUtc ? 'UTC' : localTimeZone.split('/').pop()?.replace(/_/g, ' ')}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsExpanded(false)}
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  ✕ Close
                </button>
                <Link
                  href="/fixtures"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold font-mono text-xs shadow-md shadow-emerald-500/20 transition-all hover:scale-[1.02] cursor-pointer"
                >
                  <span>View Full Page</span>
                  <span>→</span>
                </Link>
              </div>
            </div>

            {/* Bullet Point List with One-by-One Dropdown Animation */}
            <ul className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-800">
              {fixtureData.map((fixture, index) => {
                const utcFormatted = formatUtcTime(fixture.utc_timestamp);
                const localFormatted = isClient
                  ? formatLocalTime(fixture.utc_timestamp, localTimeZone)
                  : null;
                const delayMs = index * 45; // Staggered drop-down animation delay

                return (
                  <li
                    key={fixture.id || index}
                    style={{
                      animationDelay: `${delayMs}ms`,
                      animationFillMode: 'both'
                    }}
                    className="animate-in fade-in slide-in-from-top-2 duration-300 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 rounded-lg bg-slate-900/60 border border-slate-800/80 hover:border-emerald-500/40 hover:bg-slate-900/90 transition-all text-xs"
                  >
                    {/* Left: Traditional bullet accent + league + match */}
                    <div className="flex items-center gap-3">
                      {/* Traditional bullet point symbol */}
                      <span className="w-2 h-2 rounded-full bg-emerald-400/90 flex-shrink-0 shadow-[0_0_8px_rgba(52,211,153,0.5)]"></span>
                      
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700/60">
                          {fixture.league || 'SOCCER'}
                        </span>
                        <span className="font-bold text-slate-100 hover:text-emerald-300 transition-colors">
                          {fixture.home_team}
                        </span>
                        <span className="text-slate-500 font-mono text-[11px]">vs</span>
                        <span className="font-bold text-slate-100 hover:text-emerald-300 transition-colors">
                          {fixture.away_team}
                        </span>
                      </div>
                    </div>

                    {/* Right: Kickoff + EV + Link */}
                    <div className="flex items-center justify-between sm:justify-end gap-3 pl-5 sm:pl-0 font-mono text-[11px]">
                      {/* Kickoff */}
                      <div className="text-slate-400">
                        {isClient && !isExactUtc && localFormatted ? (
                          <span>
                            <strong className="text-slate-200">{localFormatted.date}</strong> {localFormatted.time}
                          </span>
                        ) : (
                          <span>
                            <strong className="text-slate-200">{utcFormatted.date}</strong> {utcFormatted.time} UTC
                          </span>
                        )}
                      </div>

                      {/* EV Badge */}
                      {fixture.ev && (
                        <span className="px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold text-[10px]">
                          {fixture.ev}
                        </span>
                      )}

                      {/* Simulate Shortcut */}
                      <Link
                        href={`/?home=${encodeURIComponent(fixture.home_team)}&away=${encodeURIComponent(fixture.away_team)}`}
                        onClick={() => setIsExpanded(false)}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 text-slate-300 border border-slate-700 text-[10px] font-bold transition-all whitespace-nowrap"
                        title="Simulate in Pitch Aleph Engine"
                      >
                        Simulate →
                      </Link>
                    </div>
                  </li>
                );
              })}
            </ul>

            {/* Bottom Callout banner */}
            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 font-mono text-[11px] text-slate-500">
              <span>Click on any fixture to pre-populate and simulate match scenarios in the Monte Carlo engine.</span>
              <div className="flex items-center gap-4 flex-shrink-0">
                <Link
                  href="/news"
                  className="text-emerald-400 hover:text-emerald-300 underline underline-offset-4"
                >
                  Latest Match Live Tests →
                </Link>
                <Link
                  href="/fixtures"
                  className="text-slate-400 hover:text-white underline underline-offset-4"
                >
                  Full Schedule →
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
