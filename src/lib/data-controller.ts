import vaultIndex from '../vault_index.json';
import backtestChartData from '../backtest_chart_data.json';
import { MatchVaultItem, BacktestTrade, SimulationParams, SimulationResult } from './types';

// In-memory collection of matches initialized from vault_index.json
let matchesData: MatchVaultItem[] = JSON.parse(JSON.stringify(vaultIndex));

export function getAllMatches(filter?: { status?: string; search?: string }): MatchVaultItem[] {
  let list = matchesData;
  if (filter?.status && filter.status !== 'ALL') {
    list = list.filter(m => m.status.toUpperCase() === filter.status?.toUpperCase());
  }
  if (filter?.search) {
    const q = filter.search.toLowerCase();
    list = list.filter(m => m.title.toLowerCase().includes(q) || m.id.includes(q));
  }
  return list;
}

export function getMatchById(id: string): MatchVaultItem | undefined {
  return matchesData.find(m => m.id === id);
}

export function createMatch(newMatch: Omit<MatchVaultItem, 'id'> & { id?: string }): MatchVaultItem {
  const id = newMatch.id || String(Date.now());
  const item: MatchVaultItem = {
    id,
    title: newMatch.title,
    status: newMatch.status,
    ev: newMatch.ev,
    minute: newMatch.minute || "75' Decision",
    date: newMatch.date || new Date().toISOString().split('T')[0],
    story: newMatch.story || [
      {
        title: '1. Quantitative Signal Detection',
        text: `Spatial modeling detected an alpha discrepancy on ${newMatch.title}.`,
        code: `# Feature extraction\nxT_delta = calculate_expected_threat(events)`
      }
    ]
  };
  matchesData.unshift(item);
  return item;
}

export function updateMatch(id: string, updates: Partial<Omit<MatchVaultItem, 'id'>>): MatchVaultItem | null {
  const index = matchesData.findIndex(m => m.id === id);
  if (index === -1) return null;
  matchesData[index] = { ...matchesData[index], ...updates };
  return matchesData[index];
}

export function deleteMatch(id: string): boolean {
  const index = matchesData.findIndex(m => m.id === id);
  if (index === -1) return false;
  matchesData.splice(index, 1);
  return true;
}

export function getBacktestLedger(limit?: number): BacktestTrade[] {
  const data = backtestChartData as BacktestTrade[];
  if (limit && limit > 0) {
    return data.slice(0, limit);
  }
  return data;
}

export function runSimulationEngine(params: SimulationParams): SimulationResult {
  const stake = Number(params.stake) || 100;
  const matchId = params.matchId;
  const caseKey = params.caseKey || (matchId ? `vault_${matchId}` : '2022');

  let matchTitle = 'ARG vs FRA (2022 Final)';
  let status: 'PASS' | 'FAIL' | 'HEDGE' = 'PASS';
  let marketOdds = '+150 (40.0% implied)';
  let modelEv = '+25.0%';
  let modelProb = '65.0%';
  let publicPnl = stake * 1.5;
  let pitchPnl = stake * 1.5;
  let publicDesc = `Wins $${(stake * 1.5).toLocaleString()} (Lucky bet, negative long-term EV)`;
  let pitchDesc = `Wins $${(stake * 1.5).toLocaleString()} (Secured massive +EV mathematical edge)`;

  if (caseKey === '2018' || caseKey.includes('2018')) {
    matchTitle = 'GER vs KOR (2018 Group — Risk Mitigation)';
    status = 'FAIL';
    marketOdds = '-400 (80.0% implied)';
    modelEv = '+15.0%';
    modelProb = '92.0%';
    publicPnl = -stake;
    pitchPnl = -stake * 0.1;
    publicDesc = `Loses full $${stake.toLocaleString()} (Wiped out by black-swan counter-attack)`;
    pitchDesc = `Loses only $${(stake * 0.1).toLocaleString()} (Kelly Criterion automatically capped exposure to tail risk)`;
  } else if (caseKey === 'ksa' || caseKey.includes('ksa')) {
    matchTitle = 'KSA vs ARG (2022 Group — Underdog Inefficiency)';
    status = 'PASS';
    marketOdds = '+1200 (7.7% implied)';
    modelEv = '+42.0%';
    modelProb = '22.0%';
    publicPnl = -stake;
    pitchPnl = stake * 12;
    publicDesc = `Loses $${stake.toLocaleString()} (Public heavily backed Argentina at -600)`;
    pitchDesc = `Wins $${(stake * 12).toLocaleString()} (Engine correctly bought massive KSA undervaluation)`;
  } else if (caseKey === 'ned' || caseKey.includes('ned')) {
    matchTitle = 'NED vs ARG (2022 QF — Volatility Hedging)';
    status = 'HEDGE';
    marketOdds = 'Argentina to win';
    modelEv = 'N/A';
    modelProb = 'Chaotic State (Unmodelable)';
    publicPnl = -stake;
    pitchPnl = stake * 0.4;
    publicDesc = `Loses $${stake.toLocaleString()} (NED tied 2-2 in 90+11')`;
    pitchDesc = `Locks in $${(stake * 0.4).toLocaleString()} Profit (Engine automatically hedged/cashed out at 80')`;
  } else if (matchId) {
    const found = getMatchById(matchId);
    if (found) {
      matchTitle = `${found.title} (${found.status})`;
      status = found.status;
      const isPass = found.status === 'PASS';
      const evVal = parseFloat(found.ev) || 14.2;
      modelEv = found.ev.trim();

      if (isPass) {
        const americanOdds = Math.round(105 + evVal * 2.5);
        const mult = americanOdds / 100;
        const implied = Number(((100 / (americanOdds + 100)) * 100).toFixed(1));
        marketOdds = `+${americanOdds} (${implied}% implied)`;
        modelProb = `${(implied + evVal).toFixed(1)}%`;
        publicPnl = Math.round(stake * mult);
        pitchPnl = Math.round(stake * mult);
        publicDesc = `Wins $${publicPnl.toLocaleString()} (Lucky bet, negative long-term EV)`;
        pitchDesc = `Wins $${pitchPnl.toLocaleString()} (Captured ${modelEv} quantitative edge)`;
      } else {
        const americanOdds = Math.round(160 + evVal * 4);
        const implied = Number(((americanOdds / (americanOdds + 100)) * 100).toFixed(1));
        marketOdds = `-${americanOdds} (${implied}% implied)`;
        modelProb = `${(implied - evVal).toFixed(1)}%`;
        publicPnl = -stake;
        pitchPnl = 0;
        publicDesc = `Loses full $${stake.toLocaleString()} (Public favorite collapsed)`;
        pitchDesc = `Loses $0 / Hedged (Kelly risk filter blocked position)`;
      }
    }
  }

  return {
    simulationId: `sim_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toISOString(),
    stake,
    scenario: matchTitle,
    status,
    marketOdds,
    modelExpectedValue: modelEv,
    modelProbability: modelProb,
    publicOutcome: {
      pnl: publicPnl,
      description: publicDesc
    },
    pitchAlephOutcome: {
      pnl: pitchPnl,
      description: pitchDesc
    }
  };
}
