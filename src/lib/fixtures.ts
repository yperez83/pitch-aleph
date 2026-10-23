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

interface ScheduleTemplateItem {
  home: string;
  away: string;
  league: string;
  offsetHours: number;
  ev: string;
}

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
