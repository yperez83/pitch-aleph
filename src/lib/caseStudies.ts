export interface MatchCaseStudy {
  slug: string;
  title: string;
  subtitle: string;
  matchId: string;
  oddsApiId?: string;
  competition: string;
  matchday: string;
  venue: string;
  kickoffDate: string; // ISO or human string
  kickoffDisplay: string;
  finalScore: string;
  homeTeam: string;
  awayTeam: string;
  quantArchetype: string;
  summary: string;
  executivePhases: {
    title: string;
    description: string;
  }[];
  metrics: {
    liveIngestCycles: number;
    peakEdgePercent: number;
    drawSimplexPercent: number;
    netPnL: number;
    netRoiPercent: number;
    totalCapitalDeployed: number;
    totalGrossReturn: number;
  };
  chronology: {
    cycle: string;
    min: string;
    scoreShotsPoss: string;
    bestPrice: string;
    simplex: string;
    edge: string;
    action: string;
  }[];
  ledger: {
    leg: string;
    description: string;
    amount: number;
    odds: number;
    outcome: string;
    netPnl: number;
  }[];
  takeaways: {
    title: string;
    text: string;
  }[];
  nextTarget?: {
    match: string;
    time: string;
  };
}

const CASE_STUDIES: MatchCaseStudy[] = [
  {
    slug: 'ipswich-town-vs-nottingham-forest-2026-10-23',
    title: 'Autonomous In-Play Arbitrage: Ipswich Town vs Nottingham Forest',
    subtitle:
      'A 51-cycle live quantitative post-mortem demonstrating sub-minute multi-provider orchestration, Alpha Inflection, and late-game Draw Convergence.',
    matchId: '1557443',
    oddsApiId: 'd02029...',
    competition: 'English Premier League',
    matchday: 'Matchday 9',
    venue: 'Portman Road, Ipswich',
    kickoffDate: '2026-10-23T19:00:00Z',
    kickoffDisplay: 'Friday, October 23, 2026 @ 19:00 UTC / 22:00 IDT',
    finalScore: '1–1',
    homeTeam: 'Ipswich Town',
    awayTeam: 'Nottingham Forest',
    quantArchetype: 'Hybrid Archetype 1 (Alpha Inflection) + Archetype 4 (Draw Convergence)',
    summary:
      'During live in-play monitoring, PitchAleph 1.2 evaluated 51 autonomous state cycles across real-time match streams (API-Sports), live multi-bookmaker pricing (The Odds API), and dynamic club Elo priors (ClubElo). The system captured an initial halftime favorite-overhang edge on Ipswich Town before dynamically pivoting probability mass into late-game Draw Convergence.',
    executivePhases: [
      {
        title: '1. Halftime Underdog Alpha Inflection (45\'–57\')',
        description:
          'Following Julio Enciso’s equalizer to make it 1–1 before the break, bookmakers over-indexed on pre-match favorite Nottingham Forest (pricing Ipswich at 3.75–4.90). PitchAleph identified a +22% to +28% expected value edge on the home side based on 58% possession share and parity in shots (6–6), executing a maximum risk cap entry of $500.00.'
      },
      {
        title: '2. Late-Game Deadlock & Draw Convergence (65\'–88\')',
        description:
          'When Forest mounted a heavy second-half counter-offensive (pushing shots to 6–15) and Issa Diop avoided a red card on VAR review, remaining variance compressed. Time decay shifted probability mass into the Draw (50.86% → 90.48%). As live sportsbooks lagged the clock (pegging Draw odds at 1.85–2.29), PitchAleph captured an explosive late-game convergence hedge (+11% to +36% EV).'
      }
    ],
    metrics: {
      liveIngestCycles: 51,
      peakEdgePercent: 28.21,
      drawSimplexPercent: 90.48,
      netPnL: 369.25,
      netRoiPercent: 24.62,
      totalCapitalDeployed: 1500.0,
      totalGrossReturn: 1915.0
    },
    chronology: [
      {
        cycle: '#1',
        min: "45' HT",
        scoreShotsPoss: '1–1 | 6–6 (57%)',
        bestPrice: 'Ipswich 3.80 (Betfair)',
        simplex: '48.6% / 35.5% / 15.9%',
        edge: '+22.30%',
        action: 'ALLOCATE $500.00 (Max)'
      },
      {
        cycle: '#15',
        min: "52'",
        scoreShotsPoss: '1–1 | 6–6 (58%)',
        bestPrice: 'Ipswich 4.90 (Betfair)',
        simplex: '48.6% / 35.5% / 15.9%',
        edge: '+28.21%',
        action: 'HOLD (Position Open)'
      },
      {
        cycle: '#26',
        min: "63'",
        scoreShotsPoss: '1–1 | 6–9 (55%)',
        bestPrice: 'Draw 2.34 (Betfair)',
        simplex: '35.7% / 47.3% / 17.0%',
        edge: '+4.58%',
        action: 'ALLOCATE $200.07 (Hedge)'
      },
      {
        cycle: '#37',
        min: "74'",
        scoreShotsPoss: '1–1 | 6–11 (55%)',
        bestPrice: 'Draw 1.98 (Betfair)',
        simplex: '28.6% / 62.0% / 9.4%',
        edge: '+11.45%',
        action: 'ALLOCATE $500.00 (Max)'
      },
      {
        cycle: '#41',
        min: "78'",
        scoreShotsPoss: '1–1 | 6–14 (52%)',
        bestPrice: 'Draw 1.85 (MyBookie)',
        simplex: '13.0% / 61.8% / 25.2%',
        edge: '+7.77%',
        action: 'ALLOCATE $422.80 (Scale)'
      },
      {
        cycle: '#51',
        min: "88'",
        scoreShotsPoss: '1–1 | Deadlock',
        bestPrice: 'Draw 1.85 (Pinnacle)',
        simplex: '7.4% / 90.5% / 2.1%',
        edge: '+36.42%',
        action: 'TERMINAL CONVERGENCE'
      }
    ],
    ledger: [
      {
        leg: 'Leg 1: Ipswich ML (45\' HT)',
        description: 'Wagered $500 @ 3.80. Settled 1–1.',
        amount: 500.0,
        odds: 3.8,
        outcome: 'Unrealized (Lost)',
        netPnl: -500.0
      },
      {
        leg: 'Leg 2: Draw Convergence (74\')',
        description: 'Wagered $500 @ 1.98. Won (5% vig deducted).',
        amount: 500.0,
        odds: 1.98,
        outcome: 'Won',
        netPnl: 465.5
      },
      {
        leg: 'Leg 3: Stale Feed Arbitrage (84\'–88\')',
        description: 'Wagered $500 @ 1.85. Won (5% vig deducted).',
        amount: 500.0,
        odds: 1.85,
        outcome: 'Won',
        netPnl: 403.75
      }
    ],
    takeaways: [
      {
        title: 'Simplex Rebalancing',
        text: 'Rather than flipping capital into Nottingham Forest when second-half pressure mounted, probability mass flowed directly into the Draw simplex.'
      },
      {
        title: 'Lagging Bookmaker Feeds',
        text: 'Pinnacle and retail sportsbooks held Draw pricing sticky at 1.85 deep into minute 88 (fair price < 1.15, >87% probability), creating a +36.4% mathematical edge.'
      },
      {
        title: 'Causal Position Protection',
        text: 'Quarter-Kelly safety bounds prevented redundant allocations while dynamic hedging protected principal and locked in a net +24.62% match ROI.'
      }
    ],
    nextTarget: {
      match: 'Arsenal vs Everton',
      time: '14:00 UTC'
    }
  }
];

export function getAllCaseStudies(): MatchCaseStudy[] {
  return [...CASE_STUDIES].sort(
    (a, b) => new Date(b.kickoffDate).getTime() - new Date(a.kickoffDate).getTime()
  );
}

export function getCaseStudyBySlug(slug: string): MatchCaseStudy | undefined {
  return CASE_STUDIES.find((cs) => cs.slug === slug);
}
