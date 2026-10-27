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
    slug: 'sevilla-vs-osasuna-2026-10-26',
    title: 'Sevilla FC vs Osasuna (2 – 0 FT)',
    subtitle:
      'v1.2.1 Smart Slush Fund execution: 100.00% single-match yield via precision 27\' latency strike and zero-churn capital protection.',
    matchId: '1570431',
    oddsApiId: 'soccer_spain_la_liga',
    competition: 'La Liga EA Sports',
    matchday: 'Matchday 11',
    venue: 'Ramón Sánchez-Pizjuán, Seville',
    kickoffDate: '2026-10-26T20:00:00Z',
    kickoffDisplay: 'Monday, October 26, 2026 @ 20:00 UTC / 21:00 CET',
    finalScore: '2–0',
    homeTeam: 'Sevilla FC',
    awayTeam: 'Osasuna',
    quantArchetype: 'Slush Strike & Dynamic Hurdle Capital Protection',
    summary:
      'Sevilla vs Osasuna illustrates the profound architectural divergence between v1.2 Naive and v1.2.1 Smart. The Naive model functioned as a memoryless accumulator, committing $3,000 across multiple low-edge cycles (down to 1.13 odds). The upgraded v1.2.1 Smart Engine filtered out early noise (<4.5% hurdle), unlocked a $1,500 Slush Strike during the 27th-minute Sky Bet latency window at 2.00 odds (+31.49% real edge), and invoked the Bow-Out protocol for the entire remainder of the match—securing $1,500.00 net profit (100.00% match ROI) while tying up half the capital.',
    executivePhases: [
      {
        title: "1. Phase 1 Edge Hurdle Enforcement (Cycle #1: Minute 3')",
        description:
          "Sevilla held pre-match ELO superiority (+45 ELO). At minute 3' (0–0), model edge stood at +3.82% at 1.95 odds. While Naive fired a premature $500 stake, v1.2.1 Smart enforced its 4.50% base hurdle and bowed out, withholding capital."
      },
      {
        title: "2. 27' Goal & ⚡ Slush Strike Activation (Cycle #5: Minute 27')",
        description:
          "Sevilla broke the deadlock (1–0). Sky Bet lagged significantly behind real-time pitch telemetry, keeping Sevilla quoted at 2.00 against an empirical 65.7% true probability (+31.49% edge). Detecting edge >25%, Smart unlocked its Slush Fund and struck with a consolidated $1,500.00 allocation."
      },
      {
        title: "3. Phase 2 Dynamic Hurdle & Bow-Out (Cycles #11–#24: Minutes 53'–72')",
        description:
          "With Sevilla leading 1–0, live edges compressed between +2.09% and +3.87% on low 1.22–1.27 lines. Naive bled capital by churning $1,000 across 2 cycles. Smart recognized decaying risk-reward and fully protected profits through its Bow-Out protocol."
      },
      {
        title: "4. Stoppage-Time Lead Lock & Tail Filter (Cycles #31–#37: Minutes 83'–90')",
        description:
          "Sevilla sealed victory at 2–0. Smart's probability-weighted tail filter automatically disregarded massive longshot quotes (501.00–751.00) on Osasuna and Draw with sub-2% likelihood, avoiding superfluous execution fees and settling with +$1,500.00 pure profit."
      }
    ],
    metrics: {
      liveIngestCycles: 37,
      peakEdgePercent: 31.49,
      drawSimplexPercent: 12.4,
      netPnL: 1500.0,
      netRoiPercent: 100.0,
      totalCapitalDeployed: 1500.0,
      totalGrossReturn: 3000.0
    },
    chronology: [
      {
        cycle: '#1',
        min: "3'",
        scoreShotsPoss: '0–0 | Early Baseline',
        bestPrice: 'Sevilla 1.95',
        simplex: '53.2% / 28.4% / 18.4%',
        edge: '+3.82%',
        action: 'SMART BOW-OUT (< 4.5% Hurdle)'
      },
      {
        cycle: '#5',
        min: "27'",
        scoreShotsPoss: '1–0 | Sevilla Breakthrough',
        bestPrice: 'Sevilla 2.00 (Sky Bet)',
        simplex: '65.7% / 21.9% / 12.4%',
        edge: '+31.49%',
        action: '⚡ SLUSH STRIKE: $1,500.00 (Won)'
      },
      {
        cycle: '#11–#24',
        min: "53'–72'",
        scoreShotsPoss: '1–0 | Midfield Control',
        bestPrice: 'Sevilla 1.27 → 1.22',
        simplex: '78.5% / 15.2% / 6.3%',
        edge: '+3.87% → +2.09%',
        action: 'SMART BOW-OUT (Capital Protected)'
      },
      {
        cycle: '#31–#37',
        min: "83'–90'",
        scoreShotsPoss: '2–0 | Final Whistle Lead Lock',
        bestPrice: 'Sevilla 1.13',
        simplex: '98.5% / 1.1% / 0.4%',
        edge: '+10.25%',
        action: 'SETTLED: +$1,500.00 (100% ROI)'
      }
    ],
    ledger: [
      {
        leg: '27\' Slush Latency Strike (Sky Bet)',
        description: '$1,500.00 allocation @ 2.00 on +31.49% goal latency edge. Won.',
        amount: 1500.0,
        odds: 2.0,
        outcome: 'Won',
        netPnl: 1500.0
      },
      {
        leg: 'v1.2 Naive Churn Comparison (Informational)',
        description: 'Naive staked $3,000 across cycles 1, 5, 11–24, 31–37 returning +$1,585 (52.8% ROI).',
        amount: 3000.0,
        odds: 1.53,
        outcome: 'Won',
        netPnl: 1585.0
      }
    ],
    takeaways: [
      {
        title: 'Precision Slush Deployment',
        text: 'Waiting for high-conviction latency disconnects (>25% edge) allowed the engine to double its capital on a single clean ticket.'
      },
      {
        title: 'Hurdle-Based Bow-Out Protocol',
        text: 'Enforcing a dynamic edge hurdle eliminated 3 unnecessary cycles of capital lockup on cramped 1.22 odds.'
      },
      {
        title: 'Capital Efficiency Dominance',
        text: 'v1.2.1 Smart generated nearly identical net profit ($1,500 vs $1,585) while risking 50% less capital than the Naive model.'
      }
    ]
  },
  {
    slug: 'barcelona-vs-real-madrid-2026-10-25',
    title: 'FC Barcelona vs Real Madrid (1 – 2 FT)',
    subtitle:
      'Autonomous in-play simplex rebalancing, structural hedging, and stoppage-time latency capture across 42 execution cycles.',
    matchId: '1589240',
    oddsApiId: 'el-clasico-2026-10-25',
    competition: 'La Liga EA Sports',
    matchday: 'Matchday 11',
    venue: 'Estadi Olímpic Lluís Companys, Barcelona',
    kickoffDate: '2026-10-25T20:00:00Z',
    kickoffDisplay: 'Sunday, October 25, 2026 @ 20:00 UTC / 22:00 CEST',
    finalScore: '1–2',
    homeTeam: 'FC Barcelona',
    awayTeam: 'Real Madrid',
    quantArchetype: 'Multi-Regime Simplex Rebalancing & Latency Capture',
    summary:
      'The session for Barcelona vs Real Madrid (1–2 FT) demonstrates multi-regime execution: PitchAleph placed bets across all three match outcomes (Real Madrid, Draw, and Barcelona) dynamically. When goals occurred, the engine attacked lagging bookmaker quotes. During quiet stretches, it constructed a synthetic structural hedge on the Draw. Winning wagers struck at inflated odds (3.82, 4.79, 7.80, and 8.50) completely absorbed hedging losses, generating +$11,206.51 net profit (+75.31% single-match capital yield).',
    executivePhases: [
      {
        title: "1. 0–0 Stagnation & Draw Drift (Cycles #1 to #3: Minutes 28'–40')",
        description:
          "Barcelona maintained possession without clinical finishing. As clock time burned, empirical draw likelihood climbed to ~35% while retail consensus lagged at 5.10, 5.00, and 4.50. The engine committed $894.13 across 3 draw tranches ($207.49 @ 5.10, $258.64 @ 5.00, $428.00 @ 4.50)."
      },
      {
        title: "2. Mbappé 41' Goal & Halftime Latency (Cycles #4 to #8: Minutes 41'–46')",
        description:
          "Mbappé broke through to put Madrid up 0–1. Pinnacle and offshore books lagged in adjusting live screens, quoting Real Madrid at a generous 3.82. The engine hit maximum stake caps on Real Madrid ($1,302.90 accumulated across cycles #4, #7, #8 at 3.82, 2.38, 2.34) while keeping small draw hedges ($1,022.23 committed) in case Barcelona equalized."
      },
      {
        title: "3. 1–1 Equalizer & Deadlock Shield (Cycles #18 to #35: Minutes 61'–87')",
        description:
          "Raphinha leveled the score 1–1. Madrid win probability collapsed and the engine withheld further Madrid wagers ($0.00). With 25 minutes left, a Draw became statistically dominant (~60%–80%). PitchAleph constructed a synthetic shield: $1,000.00 on Barcelona at inflated post-goal odds (4.33, 4.10) and $4,423.35 across Draw lines (3.80 down to 2.41 with seven consecutive $500 max bets)."
      },
      {
        title: "4. Mbappé 87' Late Decider & Cascade (Cycles #36 to #42: Minutes 88'–90'+)",
        description:
          "Mbappé scored his brace at 87' to make it 1–2. With ~87% true win probability, sportsbooks suffered extreme desynchronization: Coolbet offered 8.50 (+75.30% edge), Marathon Bet 7.80 (+74.25% edge), and Pinnacle 4.79 (+66.19% edge). The engine deployed $3,500.00 in max allocations on Real Madrid alongside minor tail insurance."
      }
    ],
    metrics: {
      liveIngestCycles: 42,
      peakEdgePercent: 75.3,
      drawSimplexPercent: 74.2,
      netPnL: 11206.51,
      netRoiPercent: 75.31,
      totalCapitalDeployed: 14881.42,
      totalGrossReturn: 26087.93
    },
    chronology: [
      {
        cycle: '#1–#3',
        min: "28'–40'",
        scoreShotsPoss: '0–0 | Stagnation',
        bestPrice: 'Draw 5.10 / 5.00 / 4.50',
        simplex: '42.0% / 35.0% / 23.0%',
        edge: '+18.40%',
        action: 'ALLOCATE $894.13 (Draw Hedge)'
      },
      {
        cycle: '#4',
        min: "41'",
        scoreShotsPoss: '0–1 | Mbappé Strike',
        bestPrice: 'Real Madrid 3.82 (Pinnacle)',
        simplex: '14.2% / 28.5% / 57.3%',
        edge: '+31.10%',
        action: 'ALLOCATE $500.00 Max (Madrid)'
      },
      {
        cycle: '#7–#8',
        min: "44'–46'",
        scoreShotsPoss: '0–1 | Halftime Squeeze',
        bestPrice: 'Real Madrid 2.38 / 2.34',
        simplex: '12.0% / 26.0% / 62.0%',
        edge: '+19.20%',
        action: 'ALLOCATE $802.90 (Madrid)'
      },
      {
        cycle: '#18–#35',
        min: "61'–87'",
        scoreShotsPoss: '1–1 | Raphinha Equalizer',
        bestPrice: 'Draw 3.80 → 2.41 / Barça 4.33',
        simplex: '24.0% / 68.0% / 8.0%',
        edge: '+26.80%',
        action: 'SHIELD: $5,423.35 (Draw & Barça)'
      },
      {
        cycle: '#36',
        min: "88'",
        scoreShotsPoss: '1–2 | Mbappé Winner',
        bestPrice: 'Real Madrid 8.50 (Coolbet)',
        simplex: '2.5% / 10.2% / 87.3%',
        edge: '+75.30%',
        action: 'ALLOCATE $500.00 Max (Coolbet)'
      },
      {
        cycle: '#37',
        min: "90'",
        scoreShotsPoss: '1–2 | Desync Stoppage',
        bestPrice: 'Real Madrid 7.80 (Marathon Bet)',
        simplex: '1.8% / 8.5% / 89.7%',
        edge: '+74.25%',
        action: 'ALLOCATE $500.00 Max (Marathon)'
      },
      {
        cycle: '#38–#42',
        min: "90'+",
        scoreShotsPoss: '1–2 | Final Stoppage Wave',
        bestPrice: 'Real Madrid 4.79 (Pinnacle)',
        simplex: '0.8% / 5.2% / 94.0%',
        edge: '+66.19%',
        action: 'ALLOCATE $2,500.00 (5x $500 Wave)'
      }
    ],
    ledger: [
      {
        leg: 'Real Madrid Positions (Cycles #4–8, #36–42)',
        description: '$6,802.90 staked across Mbappé goals @ 3.82, 2.38, 2.34, 8.50, 7.80, 4.79. Won.',
        amount: 6802.9,
        odds: 3.83,
        outcome: 'Won',
        netPnl: 19285.03
      },
      {
        leg: 'Draw Stagnation & Deadlock Shield (Cycles #1–3, #4–8, #18–35, late stabs)',
        description: '$6,505.70 staked on Draw across 0–0 and 1–1 phases to insulate capital. Expired.',
        amount: 6505.7,
        odds: 2.85,
        outcome: 'Unrealized (Lost)',
        netPnl: -6505.7
      },
      {
        leg: 'Barcelona In-Play & Turnaround Straddles (Cycles #18–35, #36–42)',
        description: '$1,572.82 staked on Barcelona post-equalizer and late tail stabs. Expired.',
        amount: 1572.82,
        odds: 4.15,
        outcome: 'Unrealized (Lost)',
        netPnl: -1572.82
      }
    ],
    takeaways: [
      {
        title: 'Multi-Regime Simplex Rebalancing',
        text: 'The engine actively routed capital to all three 1X2 outcomes depending on real-time game dynamics rather than rigid one-sided conviction.'
      },
      {
        title: 'Insulation via High-Odds Convexity',
        text: '$8,078.52 was committed to expired hedge positions on Draw and Barcelona. However, winning Madrid tickets struck at average odds of ~3.83 completely absorbed losses and yielded +$11,206.51.'
      },
      {
        title: 'Stoppage-Time Latency Exploitation',
        text: 'Bookmaker desynchronization after the 87th-minute winner permitted 5 consecutive $500 max bets at odds of 8.50, 7.80, and 4.79 against an empirical >87% win probability.'
      }
    ]
  },
  {
    slug: 'chelsea-vs-tottenham-hotspur-2026-10-24',
    title: 'Chelsea FC vs Tottenham Hotspur (0 – 2 FT)',
    subtitle:
      '50-cycle live trace capturing Halftime territorial asymmetry, in-play Simplex draw hedging, and feed latency exploitation.',
    matchId: '1557439',
    oddsApiId: '0382a9...',
    competition: 'English Premier League',
    matchday: 'Matchday 8',
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
    matchday: 'Matchday 8',
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
    ]
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
