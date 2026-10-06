interface MatchStoryStep {
  title: string;
  text: string;
  code: string;
}

export interface MatchVaultItem {
  id: string;
  title: string;
  status: 'PASS' | 'FAIL';
  ev: string;
  minute?: string;
  date: string;
  story?: MatchStoryStep[];
}

export interface BacktestTrade {
  trade: number;
  bankroll: number;
}

export interface SimulationParams {
  stake: number;
  matchId?: string;
  caseKey?: string;
  strategy?: 'kelly_fractional' | 'flat' | 'aggressive';
}

export interface SimulationResult {
  simulationId: string;
  timestamp: string;
  stake: number;
  scenario: string;
  status: 'PASS' | 'FAIL' | 'HEDGE';
  marketOdds: string;
  modelExpectedValue: string;
  modelProbability: string;
  publicOutcome: {
    pnl: number;
    description: string;
  };
  pitchAlephOutcome: {
    pnl: number;
    description: string;
  };
}
