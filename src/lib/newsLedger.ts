export interface CaseStudyLedgerEntry {
  id: string;
  slug: string;
  match: string;
  date: string;
  matchday: number;
  score: string;
  startingBankroll: number;
  deployedCapital: number;
  realizedProfit: number;
  endingBankroll: number;
  matchRoiPct: number;
  compoundingGainPct: number;
}

const CASE_STUDY_LEDGER: CaseStudyLedgerEntry[] = [
  {
    id: 'ipswich-forest-2026-10-23',
    slug: 'ipswich-town-vs-nottingham-forest-2026-10-23',
    match: 'Ipswich Town vs Nottingham Forest',
    date: '2026-10-23',
    matchday: 8,
    score: '1–1 FT',
    startingBankroll: 10000.0,
    deployedCapital: 1500.0,
    realizedProfit: 369.25,
    endingBankroll: 10369.25,
    matchRoiPct: 24.62,
    compoundingGainPct: 3.69
  },
  {
    id: 'chelsea-spurs-2026-10-24',
    slug: 'chelsea-vs-tottenham-hotspur-2026-10-24',
    match: 'Chelsea FC vs Tottenham Hotspur',
    date: '2026-10-24',
    matchday: 8,
    score: '0–2 FT',
    startingBankroll: 10369.25,
    deployedCapital: 1000.0,
    realizedProfit: 901.25,
    endingBankroll: 11270.5,
    matchRoiPct: 90.13,
    compoundingGainPct: 8.69
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

export function getPortfolioSummary(): PortfolioSummary {
  const startingBaseBankroll = CASE_STUDY_LEDGER[0]?.startingBankroll ?? 10000.0;
  const currentBankroll =
    CASE_STUDY_LEDGER[CASE_STUDY_LEDGER.length - 1]?.endingBankroll ?? startingBaseBankroll;
  const netRealizedProfit = currentBankroll - startingBaseBankroll;
  const totalYieldPct = (netRealizedProfit / startingBaseBankroll) * 100;
  const totalCapitalRouted = CASE_STUDY_LEDGER.reduce(
    (acc, item) => acc + item.deployedCapital,
    0
  );
  const profitableMatches = CASE_STUDY_LEDGER.filter(
    (item) => item.realizedProfit > 0
  ).length;
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
