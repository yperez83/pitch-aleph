import EQUITY_CURVE_V121 from '../equity_curve_v1.2.1_smart.json';

export interface BacktestSummary {
  id: 'v1.2' | 'v1.2.1';
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
    pnl?: number;
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
    executions: 1884,
    winRate: '67.73%',
    netProfit: '+$135,615',
    roi: '72.02%',
    startingBankroll: '$10,000.00',
    endingBankroll: '$145,614.82',
    architectureCards: [
      {
        title: '1. Dual-Phase Tranche Allocation',
        description:
          'Standard position sizing is compartmentalized into Phase 1 (0–45 min) and Phase 2 (46–90 min), halving limits on lower probabilities to curb premature capital depletion while scaling into late-game certainty.',
        highlight: 'Phase 1/2 Isolation'
      },
      {
        title: '2. Stagnation Bow-Out & Tail Filters',
        description:
          'Dynamic state tracking monitors score changes and shot differentials. Matches experiencing sustained dead play dynamically elevate the edge hurdle, while sub-threshold tails are automatically withheld.',
        highlight: 'Adaptive Stagnation Hurdle'
      },
      {
        title: '3. Autonomous Slush Fund Allocation',
        description:
          'A dynamic liquidity reserve bypasses standard phase caps during bookmaker feed latency gaps (edge ≥ 25.0%), capturing high-conviction strikes across rapid price adjustments.',
        highlight: 'Latency Arbitrage Capture'
      }
    ],
    trancheBreakdown: [
      {
        tranche: 'Phase 1 (0–45 min)',
        trades: 681,
        winRate: '57.71%',
        staked: '$68,075.51',
        pnl: '+$29,489.96',
        roi: '+43.32%'
      },
      {
        tranche: 'Phase 2 (46–90 min)',
        trades: 1203,
        winRate: '73.40%',
        staked: '$120,220.64',
        pnl: '+$106,124.86',
        roi: '+88.28%'
      },
      {
        tranche: 'High-Conviction Strikes (Edge ≥ 25%)',
        trades: 1247,
        winRate: '79.07%',
        staked: '$124,618.55',
        pnl: '+$118,705.08',
        roi: '+95.25%'
      }
    ],
    equityCurve: EQUITY_CURVE_V121
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
  }
};
