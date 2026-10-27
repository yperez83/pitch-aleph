export interface BacktestSummary {
  id: 'v1.0' | 'v1.2' | 'v1.2.1';
  label: string;
  isDefault: boolean;
  badge?: string;
  executions: number;
  winRate: string;
  netProfit: string;
  roi: string;
  endingBankroll: string;
  startingBankroll: string;
  architectureCards: {
    title: string;
    description: string;
    highlight?: string;
  }[];
  trancheBreakdown?: {
    tranche: string;
    trades: number;
    winRate: string;
    staked: string;
    pnl: string;
    roi: string;
  }[];
  equityCurve: {
    trade: number;
    bankroll: number;
    pnl: number;
    matchId?: string;
    minute?: number;
    tranche?: string;
  }[];
}

export const BACKTEST_MODELS: Record<string, BacktestSummary> = {
  'v1.2.1': {
    id: 'v1.2.1',
    label: 'v1.2.1 Smart Engine (Active)',
    isDefault: true,
    badge: 'Primary Institutional Benchmark',
    executions: 148,
    winRate: '84.46%',
    netProfit: '+$33,855',
    roi: '+33.36%',
    startingBankroll: '$10,000.00',
    endingBankroll: '$43,855.24',
    architectureCards: [
      {
        title: '1. Dual-Phase Tranche Allocation',
        description:
          'Standard position sizing is compartmentalized into Phase 1 (0–45 min, $500 cap) and Phase 2 (46–90 min, $1,000 cumulative cap), halving limits on sub-25% probabilities to curb premature capital depletion.',
        highlight: 'Phase 1/2 Isolation'
      },
      {
        title: '2. Stagnation Bow-Out & Tail Filters',
        description:
          'Dynamic state tracking monitors score changes and shot differentials. Matches experiencing >=3 minutes of dead play dynamically elevate the edge hurdle from 4.5% to 8.5%, while sub-12% tails are automatically withheld.',
        highlight: 'Adaptive Stagnation Hurdle'
      },
      {
        title: '3. Autonomous $3,000 Slush Fund',
        description:
          'A time-agnostic $3,000 emergency liquidity reserve bypasses standard phase caps during rare bookmaker feed latency gaps (edge >= 25.0%), executing high-conviction strikes up to $1,500 per block.',
        highlight: 'Latency Arbitrage Capture'
      }
    ],
    trancheBreakdown: [
      {
        tranche: 'Phase 1 (0–45 min)',
        trades: 29,
        winRate: '86.21%',
        staked: '$13,232.50',
        pnl: '+$2,533.31',
        roi: '+19.14%'
      },
      {
        tranche: 'Phase 2 (46–90 min)',
        trades: 88,
        winRate: '87.50%',
        staked: '$41,765.05',
        pnl: '+$8,260.31',
        roi: '+19.78%'
      },
      {
        tranche: 'Slush Strike (>25% Edge)',
        trades: 31,
        winRate: '74.19%',
        staked: '$46,493.38',
        pnl: '+$23,061.62',
        roi: '+49.60%'
      }
    ],
    equityCurve: [
      { trade: 0, bankroll: 10000.00, pnl: 0 },
      { trade: 1, bankroll: 10264.28, pnl: 264.28, matchId: '8657', minute: 3, tranche: 'PHASE_1' },
      { trade: 2, bankroll: 11059.28, pnl: 795.00, matchId: '8657', minute: 81, tranche: 'SLUSH_STRIKE' },
      { trade: 3, bankroll: 11764.28, pnl: 705.00, matchId: '9581', minute: 65, tranche: 'SLUSH_STRIKE' },
      { trade: 4, bankroll: 13744.28, pnl: 1980.00, matchId: '9661', minute: 35, tranche: 'SLUSH_STRIKE' },
      { trade: 5, bankroll: 13899.28, pnl: 155.00, matchId: '9837', minute: 27, tranche: 'PHASE_1' },
      { trade: 6, bankroll: 14049.28, pnl: 150.00, matchId: '9860', minute: 88, tranche: 'PHASE_2' },
      { trade: 7, bankroll: 14209.28, pnl: 160.00, matchId: '18245', minute: 52, tranche: 'PHASE_2' },
      { trade: 8, bankroll: 14269.28, pnl: 60.00, matchId: '18245', minute: 82, tranche: 'PHASE_2' },
      { trade: 9, bankroll: 14304.28, pnl: 35.00, matchId: '303377', minute: 38, tranche: 'PHASE_1' },
      { trade: 10, bankroll: 14404.28, pnl: 100.00, matchId: '303377', minute: 67, tranche: 'PHASE_2' },
      { trade: 11, bankroll: 14504.28, pnl: 100.00, matchId: '303377', minute: 73, tranche: 'PHASE_2' },
      { trade: 12, bankroll: 14574.28, pnl: 70.00, matchId: '303422', minute: 58, tranche: 'PHASE_2' },
      { trade: 13, bankroll: 14644.28, pnl: 70.00, matchId: '303422', minute: 60, tranche: 'PHASE_2' },
      { trade: 14, bankroll: 14754.28, pnl: 110.00, matchId: '303432', minute: 52, tranche: 'PHASE_2' },
      { trade: 15, bankroll: 14819.28, pnl: 65.00, matchId: '303432', minute: 64, tranche: 'PHASE_2' },
      { trade: 16, bankroll: 14884.28, pnl: 65.00, matchId: '303473', minute: 60, tranche: 'PHASE_2' },
      { trade: 17, bankroll: 14949.28, pnl: 65.00, matchId: '303473', minute: 63, tranche: 'PHASE_2' },
      { trade: 18, bankroll: 15009.28, pnl: 60.00, matchId: '303504', minute: 65, tranche: 'PHASE_2' },
      { trade: 19, bankroll: 15074.28, pnl: 65.00, matchId: '303504', minute: 70, tranche: 'PHASE_2' },
      { trade: 20, bankroll: 15139.28, pnl: 65.00, matchId: '303517', minute: 69, tranche: 'PHASE_2' },
      { trade: 21, bankroll: 15199.28, pnl: 60.00, matchId: '303517', minute: 77, tranche: 'PHASE_2' },
      { trade: 22, bankroll: 15264.28, pnl: 65.00, matchId: '303524', minute: 81, tranche: 'PHASE_2' },
      { trade: 23, bankroll: 15309.28, pnl: 45.00, matchId: '303524', minute: 85, tranche: 'PHASE_2' },
      { trade: 24, bankroll: 15389.28, pnl: 80.00, matchId: '303532', minute: 56, tranche: 'PHASE_2' },
      { trade: 25, bankroll: 15459.28, pnl: 70.00, matchId: '303532', minute: 60, tranche: 'PHASE_2' },
      { trade: 26, bankroll: 15519.28, pnl: 60.00, matchId: '303548', minute: 76, tranche: 'PHASE_2' },
      { trade: 27, bankroll: 15579.28, pnl: 60.00, matchId: '303548', minute: 79, tranche: 'PHASE_2' },
      { trade: 28, bankroll: 15644.28, pnl: 65.00, matchId: '303598', minute: 67, tranche: 'PHASE_2' },
      { trade: 29, bankroll: 15709.28, pnl: 65.00, matchId: '303598', minute: 70, tranche: 'PHASE_2' },
      { trade: 30, bankroll: 15769.28, pnl: 60.00, matchId: '303615', minute: 68, tranche: 'PHASE_2' },
      { trade: 31, bankroll: 15829.28, pnl: 60.00, matchId: '303615', minute: 71, tranche: 'PHASE_2' },
      { trade: 32, bankroll: 15894.28, pnl: 65.00, matchId: '303664', minute: 64, tranche: 'PHASE_2' },
      { trade: 33, bankroll: 15959.28, pnl: 65.00, matchId: '303664', minute: 67, tranche: 'PHASE_2' },
      { trade: 34, bankroll: 16019.28, pnl: 60.00, matchId: '303682', minute: 77, tranche: 'PHASE_2' },
      { trade: 35, bankroll: 16079.28, pnl: 60.00, matchId: '303682', minute: 80, tranche: 'PHASE_2' },
      { trade: 36, bankroll: 16144.28, pnl: 65.00, matchId: '303700', minute: 61, tranche: 'PHASE_2' },
      { trade: 37, bankroll: 16209.28, pnl: 65.00, matchId: '303700', minute: 64, tranche: 'PHASE_2' },
      { trade: 38, bankroll: 16269.28, pnl: 60.00, matchId: '303715', minute: 72, tranche: 'PHASE_2' },
      { trade: 39, bankroll: 16329.28, pnl: 60.00, matchId: '303715', minute: 75, tranche: 'PHASE_2' },
      { trade: 40, bankroll: 16394.28, pnl: 65.00, matchId: '303731', minute: 60, tranche: 'PHASE_2' },
      { trade: 41, bankroll: 16459.28, pnl: 65.00, matchId: '303731', minute: 63, tranche: 'PHASE_2' },
      { trade: 42, bankroll: 16519.28, pnl: 60.00, matchId: '3753989', minute: 70, tranche: 'PHASE_2' },
      { trade: 43, bankroll: 16579.28, pnl: 60.00, matchId: '3753989', minute: 73, tranche: 'PHASE_2' },
      { trade: 44, bankroll: 16644.28, pnl: 65.00, matchId: '3754009', minute: 64, tranche: 'PHASE_2' },
      { trade: 45, bankroll: 16709.28, pnl: 65.00, matchId: '3754009', minute: 67, tranche: 'PHASE_2' },
      { trade: 46, bankroll: 16769.28, pnl: 60.00, matchId: '3754024', minute: 75, tranche: 'PHASE_2' },
      { trade: 47, bankroll: 16829.28, pnl: 60.00, matchId: '3754024', minute: 78, tranche: 'PHASE_2' },
      { trade: 48, bankroll: 16894.28, pnl: 65.00, matchId: '3754041', minute: 62, tranche: 'PHASE_2' },
      { trade: 49, bankroll: 16959.28, pnl: 65.00, matchId: '3754041', minute: 65, tranche: 'PHASE_2' },
      { trade: 50, bankroll: 17019.28, pnl: 60.00, matchId: '3754058', minute: 71, tranche: 'PHASE_2' },
      { trade: 75, bankroll: 22894.10, pnl: 1470.00, matchId: '3825694', minute: 42, tranche: 'SLUSH_STRIKE' },
      { trade: 100, bankroll: 29410.50, pnl: 1260.00, matchId: '3878544', minute: 68, tranche: 'SLUSH_STRIKE' },
      { trade: 125, bankroll: 38140.24, pnl: 810.00, matchId: '3900628', minute: 55, tranche: 'SLUSH_STRIKE' },
      { trade: 144, bankroll: 45745.24, pnl: 40.00, matchId: '3940878', minute: 73, tranche: 'PHASE_2' },
      { trade: 145, bankroll: 45790.24, pnl: 45.00, matchId: '3940878', minute: 75, tranche: 'PHASE_2' },
      { trade: 146, bankroll: 44290.24, pnl: -1500.00, matchId: '3942228', minute: 34, tranche: 'SLUSH_STRIKE' },
      { trade: 147, bankroll: 43790.24, pnl: -500.00, matchId: '3942228', minute: 89, tranche: 'PHASE_2' },
      { trade: 148, bankroll: 43855.24, pnl: 65.00, matchId: '3942416', minute: 54, tranche: 'PHASE_2' }
    ]
  },
  'v1.2': {
    id: 'v1.2',
    label: 'v1.2 Out-of-Sample',
    isDefault: false,
    executions: 168,
    winRate: '54.17%',
    netProfit: '+$5,588',
    roi: '55.88%',
    startingBankroll: '$10,000.00',
    endingBankroll: '$15,588.00',
    architectureCards: [
      {
        title: '1. Multi-Class Simplex',
        description:
          'PitchAleph 1.2 outputs an explicit 3-class probability simplex [P(Home Win), P(Draw), P(Away Win)] summing strictly to 1.0000, eliminating binary draw distortion across the full 90 minutes.',
        highlight: '3-Way Simplex'
      },
      {
        title: '2. Isotonic Frozen Calibration',
        description:
          'Non-parametric isotonic regression wrapped in FrozenEstimator recalibrates raw boosting probabilities, removing retail favorite bias and reducing Log Loss to 0.7640 on held-out matches.',
        highlight: 'Non-Parametric Calibration'
      },
      {
        title: '3. Causal First-Trigger Execution',
        description:
          'Positions are locked strictly at the moment of earliest positive expectation, enforcing Quarter-Kelly staking ($500 cap) and eliminating survivorship bias with zero lookahead leakage.',
        highlight: 'Zero Lookahead Leakage'
      }
    ],
    equityCurve: [
      { trade: 0, bankroll: 10000, pnl: 0 },
      { trade: 46, bankroll: 11800, pnl: 1800 },
      { trade: 91, bankroll: 12700, pnl: 900 },
      { trade: 136, bankroll: 13400, pnl: 700 },
      { trade: 168, bankroll: 15588, pnl: 2188 }
    ]
  },
  'v1.0': {
    id: 'v1.0',
    label: 'v1.0 Spatial Legacy',
    isDefault: false,
    executions: 201,
    winRate: '0.50%',
    netProfit: '-$9,792',
    roi: '-97.92%',
    startingBankroll: '$10,000.00',
    endingBankroll: '$207.54',
    architectureCards: [
      {
        title: '1. Uncalibrated Raw Boosting',
        description:
          'Legacy gradient-boosted spatial kinematic trees prone to severe probability distortion and retail favorite bias without non-parametric calibration wrapping.',
        highlight: 'Raw Kinematic Trees'
      },
      {
        title: '2. Static Hurdle Thresholding',
        description:
          'Fixed 15% edge requirement on simulated 10.0 (+900) next-goal markets lacking dynamic game-state memory or defensive stagnation awareness.',
        highlight: 'Static Cooldown'
      },
      {
        title: '3. Unbounded Drawdown Exposure',
        description:
          'Uncontrolled risk allocation suffering catastrophic capital erosion during sustained non-scoring passages of play.',
        highlight: '97.92% Max Drawdown'
      }
    ],
    equityCurve: [
      { trade: 0, bankroll: 10000, pnl: 0 },
      { trade: 50, bankroll: 4200, pnl: -5800 },
      { trade: 100, bankroll: 1800, pnl: -2400 },
      { trade: 150, bankroll: 600, pnl: -1200 },
      { trade: 201, bankroll: 207.54, pnl: -392.46 }
    ]
  }
};
