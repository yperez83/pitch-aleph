export type EngineVersion = 'v1.2.1-smart' | 'v1.2-naive';

interface TriStateComparison {
  preGame: {
    profit: number;
    text: string;
  };
  naive: {
    profit: number;
    text: string;
  };
  smart: {
    profit: number;
    text: string;
  };
}

interface TimelineEvent {
  timeLabel: string;
  smartText: string;
  naiveText: string;
  badgeType?: 'default' | 'goal' | 'slush-fund';
}

export interface CaseStudyLedgerEntry {
  id: string;
  slug: string;
  match: string;
  date: string;
  matchday: number;
  score: string;
  // Naive (v1.2)
  startingBankrollNaive: number;
  deployedCapitalNaive: number;
  realizedProfitNaive: number;
  endingBankrollNaive: number;
  matchRoiPctNaive: number;
  compoundingGainPctNaive: number;
  // Smart (v1.2.1 with memory state & capped defense)
  startingBankrollSmart: number;
  deployedCapitalSmart: number;
  realizedProfitSmart: number;
  endingBankrollSmart: number;
  matchRoiPctSmart: number;
  compoundingGainPctSmart: number;
  // Comparison & Timeline breakdown
  comparison: TriStateComparison;
  timeline?: TimelineEvent[];
  isDeepDive?: boolean;
}

export const CASE_STUDY_LEDGER: CaseStudyLedgerEntry[] = [
  {
    id: 'ipswich-forest-2026-10-23',
    slug: 'ipswich-town-vs-nottingham-forest-2026-10-23',
    match: 'Ipswich Town vs Nottingham Forest',
    date: '2026-10-23',
    matchday: 8,
    score: '1–1 FT',
    startingBankrollNaive: 10000.0,
    deployedCapitalNaive: 1500.0,
    realizedProfitNaive: 369.25,
    endingBankrollNaive: 10369.25,
    matchRoiPctNaive: 24.62,
    compoundingGainPctNaive: 3.69,
    startingBankrollSmart: 10000.0,
    deployedCapitalSmart: 500.0,
    realizedProfitSmart: 350.0,
    endingBankrollSmart: 10350.0,
    matchRoiPctSmart: 70.0,
    compoundingGainPctSmart: 3.5,
    comparison: {
      preGame: {
        profit: -500.0,
        text: 'Flat allocation failed.'
      },
      naive: {
        profit: 369.25,
        text: 'High churn. Tied up thousands.'
      },
      smart: {
        profit: 350.0,
        text: 'Bowed out early. Capital protected.'
      }
    }
  },
  {
    id: 'chelsea-spurs-2026-10-24',
    slug: 'chelsea-vs-tottenham-hotspur-2026-10-24',
    match: 'Chelsea FC vs Tottenham Hotspur',
    date: '2026-10-24',
    matchday: 8,
    score: '0–2 FT',
    startingBankrollNaive: 10369.25,
    deployedCapitalNaive: 1000.0,
    realizedProfitNaive: 901.25,
    endingBankrollNaive: 11270.5,
    matchRoiPctNaive: 90.13,
    compoundingGainPctNaive: 8.69,
    startingBankrollSmart: 10350.0,
    deployedCapitalSmart: 800.0,
    realizedProfitSmart: 1450.0,
    endingBankrollSmart: 11800.0,
    matchRoiPctSmart: 181.25,
    compoundingGainPctSmart: 14.01,
    comparison: {
      preGame: {
        profit: 1250.0,
        text: 'Toxic favorite flagged pre-match.'
      },
      naive: {
        profit: 901.25,
        text: 'Late game bleed on Chelsea.'
      },
      smart: {
        profit: 1450.0,
        text: 'Probability cap locked wallet. Preserved win.'
      }
    }
  },
  {
    id: 'barcelona-real-madrid-2026-10-25',
    slug: 'barcelona-vs-real-madrid-2026-10-25',
    match: 'FC Barcelona vs Real Madrid',
    date: '2026-10-25',
    matchday: 11,
    score: '1–2 FT',
    startingBankrollNaive: 11270.5,
    deployedCapitalNaive: 14881.42,
    realizedProfitNaive: 11206.51,
    endingBankrollNaive: 22477.01,
    matchRoiPctNaive: 75.31,
    compoundingGainPctNaive: 99.43,
    startingBankrollSmart: 11800.0,
    deployedCapitalSmart: 3500.0,
    realizedProfitSmart: 16500.0,
    endingBankrollSmart: 28300.0,
    matchRoiPctSmart: 471.43,
    compoundingGainPctSmart: 139.83,
    isDeepDive: true,
    comparison: {
      preGame: {
        profit: -500.0,
        text: 'Failed.'
      },
      naive: {
        profit: 11206.51,
        text: 'Machine gun execution.'
      },
      smart: {
        profit: 16500.0,
        text: 'Capped defense + Slush Fund.'
      }
    },
    timeline: [
      {
        timeLabel: "0' - 40' (0-0)",
        naiveText: "Churns -$894 on Draw positions.",
        smartText: "Withholds ($0). Phase 1 edge < hurdle.",
        badgeType: 'default'
      },
      {
        timeLabel: "41' (0-1 Mbappé)",
        naiveText: "Fires $500 @ 3.82",
        smartText: "Fires $500 Phase 1 cap @ 3.82.",
        badgeType: 'goal'
      },
      {
        timeLabel: "61' - 87' (1-1 Raphinha)",
        naiveText: "Fires $500 every 90 seconds, burning $6,500 on Draw hedges.",
        smartText: "Builds strict $1,000 Draw hedge (Phase 2 cap) and bows out.",
        badgeType: 'default'
      },
      {
        timeLabel: "87' - 90'+ (1-2 Mbappé)",
        naiveText: "Blindly fires $500 chunks due to latency lag, accidentally accumulating $3,500.",
        smartText: "Detects >30% latency edge, overrides standard caps, unlocks the Slush Fund, and executes a consolidated $2,000 precision strike at 8.50 and 7.80 odds.",
        badgeType: 'slush-fund'
      }
    ]
  },
  {
    id: 'sevilla-osasuna-2026-10-26',
    slug: 'sevilla-vs-osasuna-2026-10-26',
    match: 'Sevilla FC vs Osasuna',
    date: '2026-10-26',
    matchday: 11,
    score: '2–0 FT',
    startingBankrollNaive: 22477.01,
    deployedCapitalNaive: 3000.0,
    realizedProfitNaive: 1585.0,
    endingBankrollNaive: 24062.01,
    matchRoiPctNaive: 52.83,
    compoundingGainPctNaive: 7.05,
    startingBankrollSmart: 28300.0,
    deployedCapitalSmart: 1500.0,
    realizedProfitSmart: 1500.0,
    endingBankrollSmart: 29800.0,
    matchRoiPctSmart: 100.0,
    compoundingGainPctSmart: 5.3,
    comparison: {
      preGame: {
        profit: 475.0,
        text: 'Pre-match Sevilla @ 1.95 on +45 ELO delta.'
      },
      naive: {
        profit: 1585.0,
        text: 'Tied up $3,000 across 4 cycles. Low-edge churn.'
      },
      smart: {
        profit: 1500.0,
        text: 'Flawless 27\' Slush Strike ($1,500 @ 2.00). Bowed out.'
      }
    },
    timeline: [
      {
        timeLabel: "3' (0-0)",
        naiveText: "Allocates $500.00 @ 1.95 odds on +3.82% edge.",
        smartText: "Bows out. +3.82% edge falls below the 4.50% Smart Base Hurdle.",
        badgeType: 'default'
      },
      {
        timeLabel: "27' (1-0 Sevilla Goal)",
        naiveText: "Allocates $500.00 @ 2.00 on +31.49% latency edge.",
        smartText: "SLUSH FUND UNLOCKED (>25% Edge). Deploys $1,500 Slush Strike on Sky Bet latency @ 2.00 odds.",
        badgeType: 'slush-fund'
      },
      {
        timeLabel: "53' - 72' (1-0 Stagnation)",
        naiveText: "Churns $1,000 across 2 cycles on low +3.87% to +2.09% edges (1.27 to 1.22 odds).",
        smartText: "Bows out. Phase 2 capital protection rejects edges failing dynamic hurdle.",
        badgeType: 'default'
      },
      {
        timeLabel: "83' - 90' (2-0 Lead Lock)",
        naiveText: "Allocates $1,000 across 2 cycles on 1.22 to 1.13 odds.",
        smartText: "Bows out. Filters out sub-2% Osasuna/Draw stoppage longshots (501.00-751.00 odds).",
        badgeType: 'default'
      }
    ]
  }
];

export interface PortfolioSummary {
  startingBaseBankroll: number;
  currentBankroll: number;
  netRealizedProfit: number;
  totalYieldPct: number;
  totalCapitalRouted: number;
  profitableMatches: number;
  totalMatches: number;
  strikeRatePct: number;
}

export function getPortfolioSummary(version: EngineVersion = 'v1.2.1-smart'): PortfolioSummary {
  const isSmart = version === 'v1.2.1-smart';
  const startingBaseBankroll = isSmart
    ? CASE_STUDY_LEDGER[0]?.startingBankrollSmart ?? 10000.0
    : CASE_STUDY_LEDGER[0]?.startingBankrollNaive ?? 10000.0;

  const lastEntry = CASE_STUDY_LEDGER[CASE_STUDY_LEDGER.length - 1];
  const currentBankroll = isSmart
    ? (lastEntry?.endingBankrollSmart ?? 28300.0)
    : (lastEntry?.endingBankrollNaive ?? 22477.01);

  const netRealizedProfit = currentBankroll - startingBaseBankroll;
  const totalYieldPct = (netRealizedProfit / startingBaseBankroll) * 100;
  
  const totalCapitalRouted = CASE_STUDY_LEDGER.reduce((acc, item) => {
    return acc + (isSmart ? item.deployedCapitalSmart : item.deployedCapitalNaive);
  }, 0);

  const profitableMatches = CASE_STUDY_LEDGER.filter((item) => {
    return (isSmart ? item.realizedProfitSmart : item.realizedProfitNaive) > 0;
  }).length;

  const totalMatches = CASE_STUDY_LEDGER.length;
  const strikeRatePct = totalMatches > 0 ? (profitableMatches / totalMatches) * 100 : 0;

  return {
    startingBaseBankroll,
    currentBankroll,
    netRealizedProfit,
    totalYieldPct,
    totalCapitalRouted,
    profitableMatches,
    totalMatches,
    strikeRatePct
  };
}

export function getLedgerEntryBySlug(slug: string): CaseStudyLedgerEntry | undefined {
  return CASE_STUDY_LEDGER.find((entry) => entry.slug === slug);
}
