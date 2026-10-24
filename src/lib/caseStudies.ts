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
    slug: 'chelsea-vs-tottenham-hotspur-2026-10-24',
    title: 'Chelsea FC vs Tottenham Hotspur (0 – 2 FT)',
    subtitle:
      '50-cycle live trace capturing Halftime territorial asymmetry, in-play Simplex draw hedging, and feed latency exploitation.',
    matchId: '1557439',
    oddsApiId: '0382a9...',
    competition: 'English Premier League',
    matchday: 'Matchday 9',
    venue: 'Stamford Bridge, London',
    kickoffDate: '2026-10-24T16:30:00Z',
    kickoffDisplay: 'Saturday, October 24, 2026 @ 16:30 UTC / 19:30 IDT',
    finalScore: '0–2',
    homeTeam: 'Chelsea FC',
    awayTeam: 'Tottenham Hotspur',
    quantArchetype: 'Alpha Inflection → Lead Lock',
    summary:
      'Real-time alpha extraction across 50 live cycles. PitchAleph captured extreme Halftime territorial asymmetry (70% possession & shot superiority for Tottenham) priced by consensus at 3.95, locking in a $500 max cap entry. The position was dynamically hedged via in-play Draw convergence before Tottenham broke through, resulting in +$901.25 net profit (+90.13% match ROI).',
    executivePhases: [
      {
        title: '1. Halftime Territorial Asymmetry (45\' HT)',
        description:
          'Retail consensus priced Chelsea at 2.52 based on home bias. PitchAleph evaluated 70% territorial control + away shot superiority (4–7), outputting 53.03% Tottenham win probability vs 25.3% implied (odds 3.95). Triggered full $500.00 Quarter-Kelly allocation (+27.71% EV).'
      },
      {
        title: '2. Deadlock Stalemate & Draw Convergence Hedging (63\'–69\')',
        description:
          'As match crossed the 60\' decay threshold (t/90 > 0.67), remaining variance flattened and probability mass migrated into the Draw (55.27%). Pinnacle maintained stale odds at 2.42 (+13.94% edge). Engine locked in a $500 Draw hedge to mathematically insure capital recovery.'
      },
      {
        title: '3. Breakthrough Goal & Feed Latency Disparity (78\'–89\' FT)',
        description:
          'Tottenham scored to break the deadlock at 78\', driving win probability to 81.01%. Sportsbook feeds lagged behind by over 90 seconds, still quoting 5.00 (+61.01% latency edge). Cole Palmer red card (82\') and Mathys Tel dagger (89\') finalized a 0–2 victory.'
      }
    ],
    metrics: {
      liveIngestCycles: 50,
      peakEdgePercent: 61.01,
      drawSimplexPercent: 55.27,
      netPnL: 901.25,
      netRoiPercent: 90.13,
      totalCapitalDeployed: 1000.0,
      totalGrossReturn: 1975.0
    },
    chronology: [
      {
        cycle: '#1',
        min: "45' HT",
        scoreShotsPoss: '0–0 | 4–7 (70% Spurs)',
        bestPrice: 'Spurs 3.95 (Betfair)',
        simplex: '12.9% / 34.1% / 53.0%',
        edge: '+27.71%',
        action: 'ALLOCATE $500.00 (Leg 1)'
      },
      {
        cycle: '#31',
        min: "63'",
        scoreShotsPoss: '0–0 | 6–8 (Chelsea +2)',
        bestPrice: 'Draw 2.42 (Pinnacle)',
        simplex: '16.7% / 51.0% / 32.3%',
        edge: '+9.64%',
        action: 'ALLOCATE $410.51 (Hedge)'
      },
      {
        cycle: '#36',
        min: "69'",
        scoreShotsPoss: '0–0 | 6–9 (70% Spurs)',
        bestPrice: 'Draw 2.42 (Pinnacle)',
        simplex: '15.3% / 55.3% / 29.5%',
        edge: '+13.94%',
        action: 'LOCK $500.00 (Leg 2)'
      },
      {
        cycle: '#45',
        min: "78'",
        scoreShotsPoss: '0–1 | Breakthrough Goal',
        bestPrice: 'Spurs 5.00 (Coolbet)',
        simplex: '4.4% / 14.6% / 81.0%',
        edge: '+61.01%',
        action: 'LEG 1 DEEP IN-THE-MONEY'
      },
      {
        cycle: '#49',
        min: "89' FT",
        scoreShotsPoss: '0–2 | Red Card + Dagger',
        bestPrice: 'Spurs 1.01 (Exchange)',
        simplex: '0.1% / 0.5% / 99.4%',
        edge: 'Converged',
        action: 'SETTLED: +$901.25 PROFIT'
      }
    ],
    ledger: [
      {
        leg: 'Leg 1: Tottenham ML (45\' HT)',
        description: '$500 @ 3.95 Betfair ($1,975 gross - $500 - 5% fee).',
        amount: 500.0,
        odds: 3.95,
        outcome: 'Won',
        netPnl: 1401.25
      },
      {
        leg: 'Leg 2: Draw Convergence (69\')',
        description: '$500 @ 2.42 Pinnacle. Unrealized hedge expense.',
        amount: 500.0,
        odds: 2.42,
        outcome: 'Unrealized (Hedge)',
        netPnl: -500.0
      }
    ],
    takeaways: [
      {
        title: 'Causal First-Trigger Invariance',
        text: 'Locked a single $500 cap at 45\' HT based on overwhelming 70% territorial control, preventing redundant capital re-betting during subsequent polling cycles.'
      },
      {
        title: 'Non-Linear Decay Geometry',
        text: 'As t/90 passed 0.67 at 63\', probability mass shifted from wings to Draw (50.96% → 55.27%), enabling the 2.42 Pinnacle hedge.'
      },
      {
        title: 'Feed Latency Disparity',
        text: 'Post-goal bookmakers lagged over 90 seconds, quoting 4.47–5.00 (+61% edge) against an 81.01% model certainty.'
      }
    ],
    nextTarget: {
      match: 'Arsenal vs Everton',
      time: '14:00 UTC'
    }
  },
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
