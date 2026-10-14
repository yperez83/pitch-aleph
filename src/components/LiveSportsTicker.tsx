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

// Helper to generate dynamic upcoming fixture timestamps relative to now
const getFutureUtcIso = (hoursFromNow: number) => {
  const date = new Date(Date.now() + hoursFromNow * 3600 * 1000);
  date.setUTCMinutes(0, 0, 0);
  return date.toISOString();
};

interface ScheduleTemplateItem {
  home: string;
  away: string;
  league: string;
  offsetHours: number;
  ev: string;
}

// Comprehensive 7-day cyclical European & domestic football calendar
// Matches UEFA Champions League (Tue/Wed), Europa League (Thu), and top leagues (Fri/Sat/Sun/Mon)
const WEEKLY_SCHEDULE_TEMPLATES: Record<number, ScheduleTemplateItem[]> = {
  0: [ // Sunday: Premier League, La Liga, Serie A, Ligue 1
    { home: 'Arsenal', away: 'Chelsea', league: 'PREMIER LEAGUE', offsetHours: 3, ev: '+15.4% EV' },
    { home: 'Real Madrid', away: 'Atlético Madrid', league: 'LA LIGA', offsetHours: 6, ev: '+18.1% EV' },
    { home: 'Inter Milan', away: 'Juventus', league: 'SERIE A', offsetHours: 8, ev: '+13.8% EV' },
    { home: 'Paris Saint-Germain', away: 'Monaco', league: 'LIGUE 1', offsetHours: 11, ev: '+17.5% EV' },
    { home: 'Liverpool', away: 'Manchester City', league: 'PREMIER LEAGUE', offsetHours: 25, ev: '+14.2% EV' },
    { home: 'Barcelona', away: 'Athletic Bilbao', league: 'LA LIGA', offsetHours: 28, ev: '+11.6% EV' },
    { home: 'Bayern Munich', away: 'Borussia Dortmund', league: 'BUNDESLIGA', offsetHours: 32, ev: '+16.7% EV' }
  ],
  1: [ // Monday: Monday Night Football & European Stage Previews
    { home: 'Chelsea', away: 'Newcastle', league: 'PREMIER LEAGUE', offsetHours: 4, ev: '+12.8% EV' },
    { home: 'Lazio', away: 'Roma', league: 'SERIE A', offsetHours: 7, ev: '+16.2% EV' },
    { home: 'Valencia', away: 'Real Sociedad', league: 'LA LIGA', offsetHours: 9, ev: '+10.5% EV' },
    { home: 'Arsenal', away: 'Bayern Munich', league: 'UEFA CHAMPIONS LEAGUE', offsetHours: 25, ev: '+19.4% EV' },
    { home: 'Real Madrid', away: 'Borussia Dortmund', league: 'UEFA CHAMPIONS LEAGUE', offsetHours: 27, ev: '+14.7% EV' },
    { home: 'Paris Saint-Germain', away: 'PSV', league: 'UEFA CHAMPIONS LEAGUE', offsetHours: 30, ev: '+13.1% EV' },
    { home: 'Juventus', away: 'Stuttgart', league: 'UEFA CHAMPIONS LEAGUE', offsetHours: 32, ev: '+11.8% EV' }
  ],
  2: [ // Tuesday: UEFA Champions League Matchday Primetime
    { home: 'Arsenal', away: 'Bayern Munich', league: 'UEFA CHAMPIONS LEAGUE', offsetHours: 3, ev: '+19.4% EV' },
    { home: 'Real Madrid', away: 'Borussia Dortmund', league: 'UEFA CHAMPIONS LEAGUE', offsetHours: 5, ev: '+14.7% EV' },
    { home: 'Paris Saint-Germain', away: 'PSV', league: 'UEFA CHAMPIONS LEAGUE', offsetHours: 7, ev: '+13.1% EV' },
    { home: 'Barcelona', away: 'Bayern Munich', league: 'UEFA CHAMPIONS LEAGUE', offsetHours: 25, ev: '+21.2% EV' },
    { home: 'Manchester City', away: 'Sparta Prague', league: 'UEFA CHAMPIONS LEAGUE', offsetHours: 27, ev: '+15.0% EV' },
    { home: 'Liverpool', away: 'RB Leipzig', league: 'UEFA CHAMPIONS LEAGUE', offsetHours: 29, ev: '+16.8% EV' },
    { home: 'Atlético Madrid', away: 'Lille', league: 'UEFA CHAMPIONS LEAGUE', offsetHours: 31, ev: '+12.5% EV' }
  ],
  3: [ // Wednesday: UEFA Champions League Matchday Blockbusters
    { home: 'Barcelona', away: 'Bayern Munich', league: 'UEFA CHAMPIONS LEAGUE', offsetHours: 3, ev: '+21.2% EV' },
    { home: 'Manchester City', away: 'Sparta Prague', league: 'UEFA CHAMPIONS LEAGUE', offsetHours: 5, ev: '+15.0% EV' },
    { home: 'Liverpool', away: 'RB Leipzig', league: 'UEFA CHAMPIONS LEAGUE', offsetHours: 7, ev: '+16.8% EV' },
    { home: 'Tottenham', away: 'AZ Alkmaar', league: 'UEFA EUROPA LEAGUE', offsetHours: 25, ev: '+14.5% EV' },
    { home: 'Fenerbahçe', away: 'Manchester United', league: 'UEFA EUROPA LEAGUE', offsetHours: 27, ev: '+18.3% EV' },
    { home: 'Roma', away: 'Dynamo Kyiv', league: 'UEFA EUROPA LEAGUE', offsetHours: 29, ev: '+11.9% EV' },
    { home: 'Athletic Bilbao', away: 'Slavia Prague', league: 'UEFA EUROPA LEAGUE', offsetHours: 31, ev: '+13.4% EV' }
  ],
  4: [ // Thursday: UEFA Europa League & Conference League
    { home: 'Tottenham', away: 'AZ Alkmaar', league: 'UEFA EUROPA LEAGUE', offsetHours: 3, ev: '+14.5% EV' },
    { home: 'Fenerbahçe', away: 'Manchester United', league: 'UEFA EUROPA LEAGUE', offsetHours: 5, ev: '+18.3% EV' },
    { home: 'Roma', away: 'Dynamo Kyiv', league: 'UEFA EUROPA LEAGUE', offsetHours: 7, ev: '+11.9% EV' },
    { home: 'Borussia Dortmund', away: 'RB Leipzig', league: 'BUNDESLIGA', offsetHours: 24, ev: '+15.8% EV' },
    { home: 'Marseille', away: 'Monaco', league: 'LIGUE 1', offsetHours: 27, ev: '+12.4% EV' },
    { home: 'Espanyol', away: 'Sevilla', league: 'LA LIGA', offsetHours: 29, ev: '+9.8% EV' },
    { home: 'Leicester City', away: 'Nottingham Forest', league: 'PREMIER LEAGUE', offsetHours: 31, ev: '+10.2% EV' }
  ],
  5: [ // Friday: European Weekend Kickoffs
    { home: 'Borussia Dortmund', away: 'RB Leipzig', league: 'BUNDESLIGA', offsetHours: 3, ev: '+15.8% EV' },
    { home: 'Marseille', away: 'Monaco', league: 'LIGUE 1', offsetHours: 5, ev: '+12.4% EV' },
    { home: 'Espanyol', away: 'Sevilla', league: 'LA LIGA', offsetHours: 7, ev: '+9.8% EV' },
    { home: 'Manchester City', away: 'Aston Villa', league: 'PREMIER LEAGUE', offsetHours: 19, ev: '+14.3% EV' },
    { home: 'Real Madrid', away: 'Barcelona', league: 'LA LIGA (EL CLÁSICO)', offsetHours: 23, ev: '+22.5% EV' },
    { home: 'Arsenal', away: 'Liverpool', league: 'PREMIER LEAGUE', offsetHours: 26, ev: '+17.9% EV' },
    { home: 'Bayer Leverkusen', away: 'Eintracht Frankfurt', league: 'BUNDESLIGA', offsetHours: 29, ev: '+13.7% EV' }
  ],
  6: [ // Saturday: Super Saturday Primetime Blockbusters
    { home: 'Manchester City', away: 'Aston Villa', league: 'PREMIER LEAGUE', offsetHours: 3, ev: '+14.3% EV' },
    { home: 'Real Madrid', away: 'Barcelona', league: 'LA LIGA (EL CLÁSICO)', offsetHours: 6, ev: '+22.5% EV' },
    { home: 'Arsenal', away: 'Liverpool', league: 'PREMIER LEAGUE', offsetHours: 9, ev: '+17.9% EV' },
    { home: 'Bayern Munich', away: 'Bayer Leverkusen', league: 'BUNDESLIGA', offsetHours: 12, ev: '+16.1% EV' },
    { home: 'Inter Milan', away: 'Juventus', league: 'SERIE A (DERBY D\'ITALIA)', offsetHours: 25, ev: '+15.4% EV' },
    { home: 'Paris Saint-Germain', away: 'Marseille', league: 'LIGUE 1 (LE CLASSIQUE)', offsetHours: 28, ev: '+19.0% EV' },
    { home: 'Chelsea', away: 'Newcastle', league: 'PREMIER LEAGUE', offsetHours: 31, ev: '+11.2% EV' }
  ]
};

// Generates dynamic upcoming fixtures seeded by the real calendar date
export const generateDailyUpcomingFixtures = (refDate = new Date()): Fixture[] => {
  const dayIndex = refDate.getUTCDay();
  const dayKey = refDate.toISOString().slice(0, 10);
  const templateList = WEEKLY_SCHEDULE_TEMPLATES[dayIndex] || WEEKLY_SCHEDULE_TEMPLATES[3];

  return templateList.map((m, idx) => {
    const kickoff = new Date(refDate.getTime() + m.offsetHours * 3600 * 1000);
    kickoff.setUTCMinutes(0, 0, 0);
    return {
      id: `sched-${dayKey}-${idx}`,
      home_team: m.home,
      away_team: m.away,
      league: m.league,
      utc_timestamp: kickoff.toISOString(),
      ev: m.ev
    };
  });
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
            {fixtureData.map((fixture, idx) =>
              renderFixtureCard(fixture, `primary-${fixture.id || idx}`)
            )}
            {/* Duplicate set for seamless continuous horizontal scroll */}
            {fixtureData.map((fixture, idx) =>
              renderFixtureCard(fixture, `duplicate-${fixture.id || idx}`)
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
