'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, ReferenceArea } from 'recharts';
import VAULT_MATCHES_V10 from './vault_index.json';
import VAULT_CASES_26 from './data_vault_26_cases.json';
import CHART_DATA_V10 from './backtest_chart_data.json';
import CHART_DATA_V12 from './equity_curve_v1.2_oos.json';
import LiveSportsTicker from './components/LiveSportsTicker';

// Legacy v1.0 Vault matches alias
const VAULT_MATCHES = VAULT_MATCHES_V10;

const VAULT_PASS_COUNT_V10 = VAULT_MATCHES_V10.filter(m => m.status === 'PASS').length;
const VAULT_FAIL_COUNT_V10 = VAULT_MATCHES_V10.filter(m => m.status === 'FAIL').length;
const VAULT_PASS_PERCENT_V10 = Math.round((VAULT_PASS_COUNT_V10 / VAULT_MATCHES_V10.length) * 100);
const VAULT_FAIL_PERCENT_V10 = Math.round((VAULT_FAIL_COUNT_V10 / VAULT_MATCHES_V10.length) * 100);

const VAULT_PASS_COUNT_V12 = VAULT_CASES_26.filter(m => m.status === 'PASS').length;
const VAULT_FAIL_COUNT_V12 = VAULT_CASES_26.filter(m => m.status === 'FAIL').length;
const VAULT_PASS_PERCENT_V12 = ((VAULT_PASS_COUNT_V12 / VAULT_CASES_26.length) * 100).toFixed(1);
const VAULT_FAIL_PERCENT_V12 = ((VAULT_FAIL_COUNT_V12 / VAULT_CASES_26.length) * 100).toFixed(1);

// Helper to extract numeric EV percentage for sorting (e.g., "+50.9% EV" -> 50.9, "-5.4% EV" -> -5.4)
const parseEvValue = (evStr) => {
  if (!evStr) return -999;
  const match = String(evStr).match(/([+-]?\d+(?:\.\d+)?)/);
  return match ? parseFloat(match[1]) : -999;
};

// Format 26 cases to match uniform match schema
const FORMATTED_CASES_26 = VAULT_CASES_26.map(c => ({
  id: String(c.match_id),
  case_letter: c.case_letter,
  title: c.fixture || `Match #${c.match_id}`,
  fixture: c.fixture,
  status: c.status,
  ev: c.ev_display,
  minute: c.decision_minute,
  date: c.date,
  archetype: c.archetype,
  zero_stake_ratio: c.zero_stake_ratio
}));

const ALL_VAULT_LOOKUP = [
  ...FORMATTED_CASES_26,
  ...VAULT_MATCHES_V10.filter(m => !FORMATTED_CASES_26.some(c => c.id === String(m.id)))
];

const CODE_SNIPPETS = {
  '2022': {
    1: `-- Step 1: Ingesting Raw Spatial Data
SELECT match_id, team_id, timestamp_minute, event_type, ISNULL(expected_threat, 0) AS xT
FROM Fact_Event WHERE event_type IN ('Pass', 'Shot') AND is_successful = 1;`,
    2: `# Step 2: PitchAleph Gradient Boosting Pipeline
import xgboost as xgb
def train_aleph_model(features_df):
    X = features_df[['home_xG_diff', 'referee_foul_bias', 'coach_aggression']]
    model = xgb.XGBClassifier(n_estimators=500, learning_rate=0.05)
    model.fit(X_train, y_train)
    return model.predict_proba(X_test)`,
    3: `-- Step 3: Predictive Probability Engine
SELECT team_id, timestamp_minute,
SUM(xT) OVER (PARTITION BY match_id ORDER BY match_event_sequence ROWS BETWEEN 14 PRECEDING AND CURRENT ROW) AS rolling_xT
FROM EventStream;`,
    4: `{ "trigger": "HIGH_EDGE_STATE_ACHIEVED", "action": "PLACE_BET", "target": "ARGENTINA", "expected_value": "+25.0%" }`
  },
  '2018': {
    1: `-- Step 1: The Siege (Measuring Pressure)
SELECT team_id, COUNT(*) as final_third_entries 
FROM EventStream WHERE match_minute BETWEEN 60 AND 80 AND location_x > 80;`,
    2: `-- Step 2: The Momentum Avalanche
SELECT SUM(expected_threat) as rolling_xT 
FROM EventStream WHERE team_id = 'Germany' AND match_minute > 75;`,
    3: `{ "trigger": "TRAP_STATE", "action": "PLACE_BET", "target": "GERMANY", "expected_value": "+15.0%", "market_prob": "80%" }`,
    4: `# Step 4: Fractional Kelly Risk Management
def calculate_kelly(win_prob, odds, bankroll):
    f_star = (win_prob * (odds - 1) - (1 - win_prob)) / (odds - 1)
    return bankroll * min(f_star * 0.25, 0.02) # Cap at 2%`
  },
  'ksa': {
    1: `-- Step 1: The Market Anchor
-- Public market overwhelmingly backing Argentina
SELECT market_implied_prob FROM LiveOdds WHERE team = 'Argentina' AND match_minute = 45;
-- Result: 92.3%`,
    2: `-- Step 2: Neutralizing Spatial Threat (The Offside Trap)
SELECT COUNT(*) as offside_traps_sprung, AVG(defensive_line_height) as line_height 
FROM EventStream WHERE team_id = 'KSA' AND match_minute < 45;`,
    3: `# Step 3: Recalculating True Win Probability
def evaluate_underdog_sustainability(trap_success_rate, xT_conceded):
    if trap_success_rate > 0.85 and xT_conceded < 0.5:
        return calculate_new_win_prob(target='KSA')`,
    4: `{ "trigger": "UNDERDOG_ALPHA", "action": "PLACE_BET", "target": "SAUDI ARABIA", "odds": "+1200", "expected_value": "+42.0%" }`
  },
  'ned': {
    1: `-- Step 1: The Baseline State
SELECT team_id, pass_completion_rate, average_pass_length 
FROM EventStream WHERE match_minute < 75 AND team_id = 'Netherlands';`,
    2: `# Step 2: Tactical Rupture Detected
def detect_regime_change(pass_length_variance, aerial_duel_spike):
    if pass_length_variance > THRESHOLD and aerial_duel_spike > THRESHOLD:
        return "HIGH_VOLATILITY_STATE"
    return "STABLE"`,
    3: `# Step 3: Measuring Match Chaos & Volatility
import numpy as np
current_variance = np.var(live_match_data['aerial_duels'])
if current_variance > historical_max:
    trigger_system_override()`,
    4: `{ "trigger": "REGIME_CHANGE", "action": "HEDGE_POSITION", "directive": "CASH OUT", "profit_locked": "+8.5 Units" }`
  }
};


const TEAM_CODES = {
  'Canada': 'CAN',
  'Morocco': 'MAR',
  'England': 'ENG',
  'Iran': 'IRN',
  'Croatia': 'CRO',
  'Belgium': 'BEL',
  'Netherlands': 'NED',
  'Ecuador': 'ECU',
  'Japan': 'JPN',
  'Spain': 'ESP',
  'United States': 'USA',
  'Wales': 'WAL',
  'Tunisia': 'TUN',
  'France': 'FRA',
  'Switzerland': 'SUI',
  'Cameroon': 'CMR',
  'Portugal': 'POR',
  'Ghana': 'GHA',
  'Senegal': 'SEN',
  'Poland': 'POL',
  'Saudi Arabia': 'KSA',
  'Qatar': 'QAT',
  'Denmark': 'DEN',
  'Germany': 'GER',
  'Argentina': 'ARG',
  'South Korea': 'KOR'
};

const toShortTitle = (title) => {
  return title
    .split(' vs ')
    .map(team => TEAM_CODES[team] || team.slice(0, 3).toUpperCase())
    .join(' vs ');
};

const CORE_CALCULATOR_DATA = {
  '2022': {
    title: 'ARG vs FRA (PASS)',
    fullTitle: 'ARG vs FRA (2022 Final — Alpha Generation)',
    category: 'Core',
    marketOdds: '+150 (40% implied)',
    pitchAlephProb: '65.0%',
    ev: '+25.0%',
    publicResult: stake => `Wins $${(stake * 1.5).toLocaleString()} (Lucky bet, negative long-term EV)`,
    pitchAlephResult: stake => `Wins $${(stake * 1.5).toLocaleString()} (Secured massive +EV mathematical edge)`
  },
  'ksa': {
    title: 'KSA vs ARG (PASS)',
    fullTitle: 'KSA vs ARG (2022 Group — Underdog Inefficiency)',
    category: 'Core',
    marketOdds: '+1200 (7.7% implied)',
    pitchAlephProb: '22.0%',
    ev: '+42.0%',
    publicResult: stake => `Loses $${stake.toLocaleString()} (Public heavily backed Argentina at -600)`,
    pitchAlephResult: stake => `Wins $${(stake * 12).toLocaleString()} (Engine correctly bought massive KSA undervaluation)`
  },
  'ned': {
    title: 'NED vs ARG (HEDGE)',
    fullTitle: 'NED vs ARG (2022 QF — Volatility Hedging)',
    category: 'Core',
    marketOdds: 'Argentina to win',
    pitchAlephProb: 'Chaotic State (Unmodelable)',
    ev: 'N/A',
    publicResult: stake => `Loses $${stake.toLocaleString()} (NED tied 2-2 in 90+11')`,
    pitchAlephResult: stake => `Locks in $${(stake * 0.4).toLocaleString()} Profit (Engine automatically hedged/cashed out at 80')`
  },
  '2018': {
    title: 'GER vs KOR (FAIL)',
    fullTitle: 'GER vs KOR (2018 Group — Risk Mitigation)',
    category: 'Core',
    marketOdds: '-400 (80% implied)',
    pitchAlephProb: '92.0%',
    ev: '+15.0%',
    publicResult: stake => `Loses full $${stake.toLocaleString()} (Wiped out by black-swan counter-attack)`,
    pitchAlephResult: stake => `Loses only $${(stake * 0.1).toLocaleString()} (Kelly Criterion automatically capped exposure to tail risk)`
  }
};

// Generate 20 tailored bet simulator cases from the Data Vault sample with 3-letter codes
const VAULT_CALCULATOR_DATA = Object.fromEntries(
  VAULT_MATCHES.map((match, idx) => {
    const isPass = match.status === 'PASS';
    const shortVs = toShortTitle(match.title);
    const cleanEv = match.ev ? match.ev.trim() : '+14.2% EV';
    const evVal = parseFloat(match.ev) || 14.2;
    const minuteLabel = match.minute || "75' Decision";

    let marketOddsStr;
    let pitchAlephProbStr;
    let oddsMultiplier;

    if (isPass) {
      const americanOdds = Math.round(105 + evVal * 2.5);
      oddsMultiplier = americanOdds / 100;
      const impliedProb = Number(((100 / (americanOdds + 100)) * 100).toFixed(1));
      const pitchProb = Number((impliedProb + evVal).toFixed(1));
      marketOddsStr = `+${americanOdds} (${impliedProb.toFixed(1)}% implied)`;
      pitchAlephProbStr = `${pitchProb.toFixed(1)}%`;
    } else {
      const americanOdds = Math.round(160 + evVal * 4);
      oddsMultiplier = Number((100 / americanOdds).toFixed(2));
      const impliedProb = Number(((americanOdds / (americanOdds + 100)) * 100).toFixed(1));
      const pitchProb = Number((impliedProb - evVal).toFixed(1));
      marketOddsStr = `-${americanOdds} (${impliedProb.toFixed(1)}% implied)`;
      pitchAlephProbStr = `${pitchProb.toFixed(1)}%`;
    }

    return [
      'vault_' + match.id,
      {
        title: `${shortVs} (${match.status})`,
        fullTitle: `${match.title} (${match.status}) — ${match.date} (${minuteLabel})`,
        category: isPass ? 'Vault Pass' : 'Vault Fail',
        marketOdds: marketOddsStr,
        pitchAlephProb: pitchAlephProbStr,
        ev: cleanEv.includes('EV') ? cleanEv : `${cleanEv} EV`,
        publicResult: stake => {
          if (!isPass) {
            return `Loses full $${stake.toLocaleString()} (Public forced heavy favorite at ${marketOddsStr.split(' ')[0]} that collapsed to defensive variance)`;
          }
          const scenario = idx % 3;
          if (scenario === 0) {
            return `Loses full $${stake.toLocaleString()} (The Contrarian Scenario: Public backed the heavy favorite instead, losing their full stake while PitchAleph won the underdog payout)`;
          }
          if (scenario === 1) {
            return `Wins $${Math.round(stake * oddsMultiplier).toLocaleString()} (The Dumb Money Scenario: Lucky, Negative-EV bet long-term; public backed the same team but holds negative mathematical expectancy)`;
          }
          return `Wins $${Math.round(stake * oddsMultiplier * 0.6).toLocaleString()} (The Late Money Scenario: Public bet the same team but reacted late, getting crushed closing odds and winning 40% less profit than PitchAleph)`;
        },
        pitchAlephResult: stake => isPass
          ? `Wins $${Math.round(stake * oddsMultiplier).toLocaleString()} (PitchAleph algorithmic buy order at ${minuteLabel} captured ${cleanEv} edge)`
          : `Loses $0 / Hedged (Kelly risk filter blocked position at ${minuteLabel}, preventing catastrophic loss)`
      }
    ];
  })
);

// ─── SCENARIO DISPARITY CALCULATION & ORDERING ─────────────────
// Categorization tiers based on PitchAleph outcome vs Public Bettor:
// 1. Greatest win over Public (Underdogs/Contrarians/Late Money where Engine captures massive profit)
// 2. Mitigated losses (Engine locks profit, Kelly caps risk, or risk filter blocks loss vs Public total wipeout)
// 3. Breaking even or slight edge (Equal outcome / Dumb money lucky hit)
const RAW_ALL_CALCULATOR_DATA = {
  ...CORE_CALCULATOR_DATA,
  ...VAULT_CALCULATOR_DATA
};

const getScenarioDisparityScore = (key, item) => {
  // Use benchmark stake of $1,000 to determine disparity
  const stake = 1000;

  if (key === 'ksa') {
    return { tier: 1, disparity: 12000 - (-1000) }; // +$13,000
  }
  if (key === 'ned') {
    return { tier: 2, disparity: 400 - (-1000) }; // +$1,400
  }
  if (key === '2018') {
    return { tier: 2, disparity: -100 - (-1000) }; // +$900
  }
  if (key === '2022') {
    return { tier: 3, disparity: 0 }; // $0
  }

  // Vault cases
  const isPass = item.category === 'Vault Pass';
  const pubText = item.publicResult(stake);
  const pitchText = item.pitchAlephResult(stake);

  if (!isPass) {
    // Mitigated loss: Public loses $1,000, Pitch loses $0
    return { tier: 2, disparity: 1000 };
  }

  // Pass cases:
  if (pubText.includes('Contrarian')) {
    // Public loses $1,000, Pitch wins full profit
    const match = pitchText.match(/\$([0-9,]+)/);
    const winAmt = match ? parseInt(match[1].replace(/,/g, ''), 10) : 1500;
    return { tier: 1, disparity: winAmt + 1000 };
  }
  if (pubText.includes('Late Money')) {
    // Engine wins 40% more profit than public
    const pitchMatch = pitchText.match(/\$([0-9,]+)/);
    const pubMatch = pubText.match(/\$([0-9,]+)/);
    const pitchWin = pitchMatch ? parseInt(pitchMatch[1].replace(/,/g, ''), 10) : 1500;
    const pubWin = pubMatch ? parseInt(pubMatch[1].replace(/,/g, ''), 10) : 900;
    return { tier: 1, disparity: pitchWin - pubWin };
  }
  // Dumb Money: same win amount
  return { tier: 3, disparity: 0 };
};

const SORTED_CALCULATOR_KEYS = Object.keys(RAW_ALL_CALCULATOR_DATA).sort((a, b) => {
  const scoreA = getScenarioDisparityScore(a, RAW_ALL_CALCULATOR_DATA[a]);
  const scoreB = getScenarioDisparityScore(b, RAW_ALL_CALCULATOR_DATA[b]);
  if (scoreA.tier !== scoreB.tier) {
    return scoreA.tier - scoreB.tier;
  }
  return scoreB.disparity - scoreA.disparity;
});

const CALCULATOR_DATA = Object.fromEntries(
  SORTED_CALCULATOR_KEYS.map(key => [key, RAW_ALL_CALCULATOR_DATA[key]])
);

// ─── CUSTOM SVG ICONS ─────────────────────────────────────────
const IconArrowLeft = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

const IconPlay = ({ className = "w-3.5 h-3.5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" stroke="none" aria-hidden="true">
    <polygon points="6 3 20 12 6 21 6 3" />
  </svg>
);

const IconClose = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const IconReset = ({ className = "w-3.5 h-3.5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21.5 2v6h-6M2.5 22v-6h6" />
    <path d="M21.5 8a10 10 0 0 0-17 3.5M2.5 16a10 10 0 0 0 17-3.5" />
  </svg>
);

const IconZoomIn = ({ className = "w-3.5 h-3.5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
    <line x1="11" y1="8" x2="11" y2="14" />
    <line x1="8" y1="11" x2="14" y2="11" />
  </svg>
);

const IconZoomOut = ({ className = "w-3.5 h-3.5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
    <line x1="8" y1="11" x2="14" y2="11" />
  </svg>
);

const IconWarning = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const IconBolt = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" stroke="none" aria-hidden="true">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

const IconChevronUp = ({ className = "w-3 h-3" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="18 15 12 9 6 15" />
  </svg>
);

const IconChevronDown = ({ className = "w-3 h-3" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const IconGitHub = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

const IconLinkedIn = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.45a1.6 1.6 0 0 0-1.6 1.6 1.6 1.6 0 0 0 1.6 1.6 1.6 1.6 0 0 0 1.6-1.6 1.6 1.6 0 0 0-1.6-1.6z" />
  </svg>
);

const IconMail = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

const IconCode = ({ className = "w-3.5 h-3.5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="16 18 22 12 16 6" />
    <polyline points="8 6 2 12 8 18" />
  </svg>
);

// ─── REUSABLE CUSTOM TOOLTIP COMPONENT ────────────────────────
const Tooltip = ({ text, children, position = "top", className = "" }) => {
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState(null);
  const triggerRef = React.useRef(null);
  const tooltipRef = React.useRef(null);

  const updatePosition = React.useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const padding = 8;
    const arrowOffset = 8;

    let top = 0;
    let left = 0;

    // Get approximate tooltip size or measurement if available
    const tooltipWidth = tooltipRef.current?.offsetWidth || 180;
    const tooltipHeight = tooltipRef.current?.offsetHeight || 32;

    if (position === "top") {
      top = rect.top - tooltipHeight - arrowOffset;
      left = rect.left + rect.width / 2 - tooltipWidth / 2;
    } else if (position === "bottom") {
      top = rect.bottom + arrowOffset;
      left = rect.left + rect.width / 2 - tooltipWidth / 2;
    } else if (position === "left") {
      top = rect.top + rect.height / 2 - tooltipHeight / 2;
      left = rect.left - tooltipWidth - arrowOffset;
    } else if (position === "right") {
      top = rect.top + rect.height / 2 - tooltipHeight / 2;
      left = rect.right + arrowOffset;
    }

    // Keep tooltip within window viewport bounds
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    const clampedLeft = Math.max(padding, Math.min(left, viewportWidth - tooltipWidth - padding));
    const clampedTop = Math.max(padding, Math.min(top, viewportHeight - tooltipHeight - padding));

    // Calculate arrow relative to trigger center
    const triggerCenterX = rect.left + rect.width / 2;
    const arrowX = Math.max(12, Math.min(triggerCenterX - clampedLeft, tooltipWidth - 12));

    setCoords({
      top: clampedTop,
      left: clampedLeft,
      arrowX,
      actualPosition: position
    });
  }, [position]);

  React.useEffect(() => {
    if (visible) {
      updatePosition();
      const handleScrollOrResize = () => updatePosition();
      window.addEventListener("scroll", handleScrollOrResize, true);
      window.addEventListener("resize", handleScrollOrResize);
      return () => {
        window.removeEventListener("scroll", handleScrollOrResize, true);
        window.removeEventListener("resize", handleScrollOrResize);
      };
    }
  }, [visible, updatePosition]);

  return (
    <div
      ref={triggerRef}
      className={`relative inline-flex items-center ${className}`}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {children}
      {visible && text && typeof document !== "undefined" && (
        <div
          ref={tooltipRef}
          role="tooltip"
          style={{
            position: "fixed",
            top: coords ? `${coords.top}px` : "-9999px",
            left: coords ? `${coords.left}px` : "-9999px",
            zIndex: 9999
          }}
          className="pointer-events-none whitespace-nowrap bg-slate-900/98 backdrop-blur-md text-slate-200 text-[11px] font-mono font-medium px-2.5 py-1 rounded-md border border-slate-700/80 shadow-2xl transition-opacity duration-150 tooltip-bubble"
        >
          {text}
          {coords && coords.actualPosition === "top" && (
            <span
              style={{ left: `${coords.arrowX}px` }}
              className="absolute top-full -translate-x-1/2 w-0 h-0 border-solid border-t-slate-800 border-x-transparent border-b-transparent border-t-4 border-x-4 border-b-0"
            />
          )}
          {coords && coords.actualPosition === "bottom" && (
            <span
              style={{ left: `${coords.arrowX}px` }}
              className="absolute bottom-full -translate-x-1/2 w-0 h-0 border-solid border-b-slate-800 border-x-transparent border-t-transparent border-b-4 border-x-4 border-t-0"
            />
          )}
          {coords && coords.actualPosition === "left" && (
            <span className="absolute left-full top-1/2 -translate-y-1/2 w-0 h-0 border-solid border-l-slate-800 border-y-transparent border-r-transparent border-l-4 border-y-4 border-r-0" />
          )}
          {coords && coords.actualPosition === "right" && (
            <span className="absolute right-full top-1/2 -translate-y-1/2 w-0 h-0 border-solid border-r-slate-800 border-y-transparent border-l-transparent border-r-4 border-y-4 border-l-0" />
          )}
        </div>
      )}
    </div>
  );
};

const Step = ({ id, activeStep, title, snippet, children }) => {
  const isActive = activeStep === id;
  return (
    <div data-step={id} className={`step-container min-h-[80vh] md:min-h-[85vh] transition-opacity duration-700 flex flex-col justify-center py-8 md:py-0 ${isActive ? 'opacity-100' : 'opacity-20'}`}>
      <h2 className="text-xl md:text-3xl font-bold text-emerald-400 mb-3 md:mb-4">{title}</h2>
      <div className="text-sm md:text-lg text-slate-300 mb-5 md:mb-8 leading-relaxed">{children}</div>
      <div className="bg-slate-950 p-4 md:p-6 rounded-lg font-mono text-xs md:text-sm border border-slate-800 shadow-2xl">
        <div className="flex gap-2 mb-3 md:mb-4">
          <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-red-500"></div>
          <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-yellow-500"></div>
          <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-green-500"></div>
        </div>
        <pre className="text-emerald-300 whitespace-pre-wrap overflow-x-auto leading-relaxed">{snippet}</pre>
      </div>
    </div>
  );
};

const Footer = () => (
  <footer className="w-full bg-slate-950/80 border-t border-slate-800/80 backdrop-blur-md mt-16 sm:mt-24 py-10 px-4 sm:px-6 md:px-8">
    <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
      {/* Left: Brand & Logo */}
      <div className="flex items-center gap-3">
        <img
          src="/86f51b48a_generated_image.png"
          alt="PitchAleph Logo"
          className="w-8 h-8 rounded-full border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.2)]"
        />
        <div className="flex flex-col">
          <span className="font-bold text-sm tracking-tight text-white flex items-center gap-1.5">
            <span>Pitch Aleph</span>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-1.5 py-0.2 rounded">
              ℵ₀
            </span>
          </span>
          <span className="text-[11px] font-mono text-slate-500">
            Quantitative Sports Market Engine
          </span>
        </div>
      </div>

      {/* Center: Developer CTA */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <span className="text-xs text-slate-400 font-mono">
          Run real-time inference on the 1.2 brain:
        </span>
        <div className="flex flex-wrap items-center gap-2">
          <a
            href="https://huggingface.co/marianopsa/pitch-aleph-1.2"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Inspect PitchAleph 1.2 Open Weights on Hugging Face"
            className="h-8 px-3 inline-flex items-center gap-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 hover:text-amber-300 border border-amber-500/30 hover:border-amber-500/60 font-mono text-xs font-semibold transition-all duration-200 shadow-sm"
          >
            <span>🤗</span>
            <span>Hugging Face</span>
          </a>
          <a
            href="/launchpad"
            aria-label="Deploy PitchAleph 1.2 Autonomous In-Play Monitor"
            className="h-8 px-3 inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 hover:text-emerald-200 border border-emerald-500/40 hover:border-emerald-500/60 font-mono text-xs font-semibold transition-all duration-200 shadow-sm"
          >
            <span>🚀</span>
            <span>Launchpad</span>
          </a>
          <a
            href="/news"
            aria-label="Read PitchAleph Quantitative Live Tests and Telemetry Audits"
            className="h-8 px-3 inline-flex items-center gap-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white border border-slate-700/80 hover:border-slate-600 font-mono text-xs font-semibold transition-all duration-200 shadow-sm"
          >
            <span>📊</span>
            <span>Live Tests</span>
          </a>
          <a
            href="/dev-blog"
            aria-label="Read PitchAleph Quantitative Engineering Dispatches"
            className="h-8 px-3 inline-flex items-center gap-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white border border-slate-700/80 hover:border-slate-600 font-mono text-xs font-semibold transition-all duration-200 shadow-sm"
          >
            <span>📰</span>
            <span>Dev Blog</span>
          </a>
        </div>
      </div>

      {/* Right: Social & Contact Links */}
      <div className="flex items-center gap-3">
        <Tooltip text="Hugging Face Model Hub">
          <a
            href="https://huggingface.co/marianopsa/pitch-aleph-1.2"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="PitchAleph 1.2 on Hugging Face Hub"
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-amber-400 hover:border-amber-500/40 hover:bg-slate-850 transition-all duration-200 text-sm flex items-center justify-center"
          >
            <span className="text-base leading-none">🤗</span>
          </a>
        </Tooltip>

        <Tooltip text="GitHub Repository">
          <a
            href="https://github.com/yperez83/pitch-aleph"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub Repository"
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 hover:bg-slate-850 transition-all duration-200"
          >
            <IconGitHub className="w-4 h-4" />
          </a>
        </Tooltip>

        <Tooltip text="Connect on LinkedIn">
          <a
            href="https://www.linkedin.com/in/yochanan-perez-10681354/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn Profile"
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-blue-400 hover:border-blue-500/40 hover:bg-slate-850 transition-all duration-200"
          >
            <IconLinkedIn className="w-4 h-4" />
          </a>
        </Tooltip>

        <Tooltip text="Email Contact">
          <a
            href="mailto:perezyochanan26@gmail.com"
            aria-label="Send an email to perezyochanan26@gmail.com"
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-emerald-400 hover:border-emerald-500/40 hover:bg-slate-850 transition-all duration-200"
          >
            <IconMail className="w-4 h-4" />
          </a>
        </Tooltip>
      </div>
    </div>

    {/* Bottom sub-bar with copyright & license */}
    <div className="max-w-6xl mx-auto mt-6 pt-4 border-t border-slate-900 text-center flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono text-slate-600 gap-2">
      <span>© {new Date().getFullYear()} Pitch Aleph. Discrete spatial event tracking.</span>
      <span>Open Source under MIT License</span>
    </div>
  </footer>
);

const parseRoute = (hashString) => {
  const clean = (hashString || '').replace(/^#\/?/, '').trim();
  if (!clean) return { activeCase: null, showVaultModal: false, activeVaultMatch: null };
  if (clean === 'vault') return { activeCase: null, showVaultModal: true, activeVaultMatch: null };
  if (clean === '1k_sim' || clean === 'simulation/1k' || clean === '1k') {
    return { activeCase: '1k_sim', showVaultModal: false, activeVaultMatch: null };
  }
  if (clean.startsWith('vault/')) {
    const id = clean.replace('vault/', '');
    const match = ALL_VAULT_LOOKUP.find(m => m.id === id);
    return { activeCase: 'vault_' + id, showVaultModal: false, activeVaultMatch: match || null };
  }
  if (clean.startsWith('case/vault_')) {
    const id = clean.replace('case/vault_', '');
    const match = ALL_VAULT_LOOKUP.find(m => m.id === id);
    return { activeCase: 'vault_' + id, showVaultModal: false, activeVaultMatch: match || null };
  }
  if (clean.startsWith('case/')) {
    const c = clean.replace('case/', '');
    return { activeCase: c, showVaultModal: false, activeVaultMatch: null };
  }
  if (clean.startsWith('match/')) {
    const c = clean.replace('match/', '');
    return { activeCase: c, showVaultModal: false, activeVaultMatch: null };
  }
  if (['2022', '2018', 'ksa', 'ned'].includes(clean)) {
    return { activeCase: clean, showVaultModal: false, activeVaultMatch: null };
  }
  return { activeCase: null, showVaultModal: false, activeVaultMatch: null };
};

export default function App() {
  const initialRoute = parseRoute(typeof window !== 'undefined' ? window.location.hash : '');
  const [activeCase, setActiveCase] = useState(initialRoute.activeCase);
  const [showVaultModal, setShowVaultModal] = useState(initialRoute.showVaultModal);
  const [activeVaultMatch, setActiveVaultMatch] = useState(initialRoute.activeVaultMatch);
  const [activeStep, setActiveStep] = useState(1);
  const [matchData, setMatchData] = useState([]);
  const [matchDataLoading, setMatchDataLoading] = useState(false);
  const [matchDataError, setMatchDataError] = useState(null);
  
  const [calcStake, setCalcStake] = useState(1000);
  const [calcCase, setCalcCase] = useState('ksa');
  const [calcFilter, setCalcFilter] = useState('ALL');
  const [showCanvas, setShowCanvas] = useState(false);
  const [manualMinute, setManualMinute] = useState(null);
  const manualMinuteRef = useRef(null);
  const canvasRef = useRef(null);
  const [glowKey, setGlowKey] = useState(0);
  const glowCoolingRef = useRef(false);
  const [vaultFilter, setVaultFilter] = useState('ALL');
  // Data Vault sort order: 'desc' (Highest to Lowest EV), 'asc' (Lowest to Highest EV), or 'default' (Index/Chronological)
  const [vaultSort, setVaultSort] = useState('desc');
  // Data Vault version toggle: 'v1.2' (26-Case Portfolio Taxonomy) vs 'v1.0' (Legacy 20-Match Sample)
  const [vaultVersion, setVaultVersion] = useState('v1.2');
  // Backtest analytics version toggle: 'v1.2' (Active Production OOS) vs 'v1.0' (Spatial Legacy)
  const [backtestVersion, setBacktestVersion] = useState('v1.2');

  // Interactive zoom state for 1,000-Match Backtest Chart
  const [chartZoomLeft, setChartZoomLeft] = useState('dataMin');
  const [chartZoomRight, setChartZoomRight] = useState('dataMax');
  const [chartRefLeft, setChartRefLeft] = useState('');
  const [chartRefRight, setChartRefRight] = useState('');

  const currentMaxTrades = backtestVersion === 'v1.2' ? 168 : 522;

  const handleChartZoom = useCallback(() => {
    if (chartRefLeft === chartRefRight || chartRefRight === '') {
      setChartRefLeft('');
      setChartRefRight('');
      return;
    }
    let left = chartRefLeft;
    let right = chartRefRight;
    if (typeof left === 'number' && typeof right === 'number') {
      if (left > right) [left, right] = [right, left];
      // Require at least 5 points to zoom
      if (right - left < 5) {
        setChartRefLeft('');
        setChartRefRight('');
        return;
      }
    }
    setChartRefLeft('');
    setChartRefRight('');
    setChartZoomLeft(left);
    setChartZoomRight(right);
  }, [chartRefLeft, chartRefRight]);

  const handleChartZoomReset = useCallback(() => {
    setChartZoomLeft('dataMin');
    setChartZoomRight('dataMax');
    setChartRefLeft('');
    setChartRefRight('');
  }, []);

  const handleChartStepZoom = useCallback((direction) => {
    const curLeft = chartZoomLeft === 'dataMin' ? 1 : chartZoomLeft;
    const curRight = chartZoomRight === 'dataMax' ? currentMaxTrades : chartZoomRight;
    const span = curRight - curLeft;
    const center = curLeft + span / 2;

    if (direction === 'in') {
      const nextSpan = Math.max(20, span * 0.6);
      const nextLeft = Math.max(1, Math.round(center - nextSpan / 2));
      const nextRight = Math.min(currentMaxTrades, Math.round(center + nextSpan / 2));
      setChartZoomLeft(nextLeft);
      setChartZoomRight(nextRight);
    } else {
      const nextSpan = span * 1.5;
      const nextLeft = Math.max(1, Math.round(center - nextSpan / 2));
      const nextRight = Math.min(currentMaxTrades, Math.round(center + nextSpan / 2));
      if (nextLeft <= 1 && nextRight >= currentMaxTrades) {
        handleChartZoomReset();
      } else {
        setChartZoomLeft(nextLeft);
        setChartZoomRight(nextRight);
      }
    }
  }, [chartZoomLeft, chartZoomRight, currentMaxTrades, handleChartZoomReset]);

  const handleChartPresetZoom = useCallback((start, end) => {
    if (start === 'dataMin' && end === 'dataMax') {
      handleChartZoomReset();
    } else {
      setChartZoomLeft(start);
      setChartZoomRight(end);
    }
  }, [handleChartZoomReset]);

  const isChartZoomed = chartZoomLeft !== 'dataMin' || chartZoomRight !== 'dataMax';

  // Apply route object to React state
  const applyRoute = useCallback((route) => {
    setActiveCase(route.activeCase);
    setShowVaultModal(route.showVaultModal);
    setActiveVaultMatch(route.activeVaultMatch);
    setActiveStep(1);
    setShowCanvas(false);
    setManualMinute(null);
    manualMinuteRef.current = null;
    setMatchDataError(null);
    if (route.activeCase && route.activeCase !== '1k_sim' && route.activeCase !== 'vault') {
      setMatchDataLoading(true);
      setMatchData([]);
    } else {
      setMatchDataLoading(false);
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  // Subpage browser navigation helpers
  const navigate = useCallback((targetHash) => {
    const currentHash = window.location.hash || '#/';
    if (currentHash === targetHash) return;
    const currentDepth = window.history.state?.depth ?? 0;
    window.history.pushState({ app: 'pitch-aleph', depth: currentDepth + 1 }, '', targetHash);
    applyRoute(parseRoute(targetHash));
  }, [applyRoute]);

  const navigateBack = useCallback((fallbackHash = '#/') => {
    const currentDepth = window.history.state?.depth ?? 0;
    if (currentDepth > 0) {
      window.history.back();
    } else {
      window.history.replaceState({ app: 'pitch-aleph', depth: 0 }, '', fallbackHash);
      applyRoute(parseRoute(fallbackHash));
    }
  }, [applyRoute]);

  // Listen to popstate and hashchange to enable browser back / forward navigation
  useEffect(() => {
    if (!window.history.state?.app) {
      window.history.replaceState(
        { app: 'pitch-aleph', depth: 0 },
        '',
        window.location.hash || '#/'
      );
    }

    const handleLocationChange = () => {
      applyRoute(parseRoute(window.location.hash));
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, [applyRoute]);

  // Keyboard navigation: Escape key closes modal and navigates back
  useEffect(() => {
    if (!showVaultModal) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        navigateBack('#/');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showVaultModal, navigateBack]);

  useEffect(() => {
    if (!activeCase || activeCase === '1k_sim' || activeCase === 'vault') return;
    // Reset scrubber ref on case switch (state is reset via button onClick handlers)
    manualMinuteRef.current = null;
    const files = {
      '2022': '/match_data.json',
      '2018': '/match_data_2018.json',
      'ksa': '/match_data_ksa.json',
      'ned': '/match_data_ned.json'
    };
    const targetFile = files[activeCase] || `/${activeCase}.json`;
    const controller = new AbortController();

    fetch(targetFile, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error ${res.status}: unable to load ${targetFile}`);
        }
        return res.json();
      })
      .then((data) => {
        setMatchData(data);
        setMatchDataLoading(false);
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          console.error("Data missing.", err);
          setMatchDataError(err.message || 'Spatial event stream currently unavailable.');
          setMatchDataLoading(false);
        }
      });

    return () => controller.abort();
  }, [activeCase]);
  
  useEffect(() => {
    if (!activeCase || activeCase === '1k_sim' || activeCase === 'vault') return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveStep(Number(entry.target.getAttribute('data-step')));
        });
      }, { rootMargin: '-40% 0px -40% 0px' }
    );
    document.querySelectorAll('.step-container').forEach((step) => observer.observe(step));
    return () => observer.disconnect();
  }, [activeCase, matchData]);

  // ── Logo reactive glow ──────────────────────────────────────
  const triggerGlow = useCallback(() => {
    if (glowCoolingRef.current) return;
    glowCoolingRef.current = true;
    setGlowKey(k => k + 1);
    setTimeout(() => { glowCoolingRef.current = false; }, 1500);
  }, []);

  useEffect(() => {
    if (activeCase) return; // only animate on home screen
    window.addEventListener('wheel',        triggerGlow, { passive: true });
    window.addEventListener('touchstart',   triggerGlow, { passive: true });
    window.addEventListener('pointerdown',  triggerGlow, { passive: true });
    return () => {
      window.removeEventListener('wheel',       triggerGlow);
      window.removeEventListener('touchstart',  triggerGlow);
      window.removeEventListener('pointerdown', triggerGlow);
    };
  }, [activeCase, triggerGlow]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || matchData.length === 0) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let time = 0;

    const render = () => {
      const isLastStep = activeCase?.startsWith('vault_')
        ? activeStep === (activeVaultMatch?.story?.length || 3)
        : activeStep === 4;
      const isFrozen = isLastStep;
      // Only auto-advance when not frozen and user hasn't grabbed the scrubber
      if (!isFrozen && manualMinuteRef.current === null) { time += 0.05; }

      const vaultCutoffMinute = activeVaultMatch?.minute ? parseInt(activeVaultMatch.minute, 10) : 75;
      const timeLimit = activeCase === '2018' ? 82 : (activeCase === 'ksa' ? 55 : (activeCase === 'ned' ? 92 : (activeCase?.startsWith('vault_') ? (vaultCutoffMinute || 75) : 100)));
      const matchMinute = manualMinuteRef.current !== null ? manualMinuteRef.current : (time % timeLimit);

      const parent = canvas.parentElement;
      const W = parent ? parent.clientWidth : 300;
      const H = parent ? parent.clientHeight : 200;
      const dpr = typeof window !== 'undefined' ? (window.devicePixelRatio || 1) : 1;

      if (canvas.width !== Math.round(W * dpr) || canvas.height !== Math.round(H * dpr)) {
        canvas.width = Math.round(W * dpr);
        canvas.height = Math.round(H * dpr);
      }

      ctx.save();
      ctx.scale(dpr, dpr);

      // Responsive padding - tighter on mobile
      const pad = W < 500 ? 20 : 40;
      const circleR = W < 500 ? 28 : 50;
      const dotR = W < 500 ? 3 : 4;
      const shotR = W < 500 ? 6 : 8;
      const minuteFontSize = W < 500 ? 12 : 20;
      const overlayFontSize = W < 500 ? 18 : 44;

      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = '#1e293b'; ctx.lineWidth = W < 500 ? 1 : 2;
      ctx.strokeRect(pad, pad, W - pad * 2, H - pad * 2);
      ctx.beginPath(); ctx.moveTo(W / 2, pad); ctx.lineTo(W / 2, H - pad); ctx.stroke();
      ctx.beginPath(); ctx.arc(W / 2, H / 2, circleR, 0, Math.PI * 2); ctx.stroke();

      const scaleX = W / 120;
      const scaleY = H / 80;
      const visibleEvents = matchData.filter((d) => d.time <= matchMinute).slice(-15);

      visibleEvents.forEach((event, i) => {
        const cx = event.x * scaleX;
        const cy = event.y * scaleY;
        let dotColor = '#3b82f6';
        let lineColor = 'rgba(59, 130, 246, 0.4)';

        if (event.type === 'Shot') dotColor = '#ef4444';
        else if (activeCase === '2022' && activeStep >= 3) { dotColor = '#34d399'; lineColor = 'rgba(52, 211, 153, 0.4)'; }
        else if (activeCase === '2018' && activeStep >= 3) { dotColor = '#fbbf24'; lineColor = 'rgba(251, 191, 36, 0.4)'; }
        else if (activeCase === 'ksa' && activeStep >= 3) { dotColor = '#a855f7'; lineColor = 'rgba(168, 85, 247, 0.4)'; }
        else if (activeCase === 'ned' && activeStep >= 3) { dotColor = '#f97316'; lineColor = 'rgba(249, 115, 22, 0.4)'; }
        else if (activeCase?.startsWith('vault_')) {
          const isPass = activeVaultMatch?.status === 'PASS';
          dotColor = isPass ? '#34d399' : '#f87171';
          lineColor = isPass ? 'rgba(52, 211, 153, 0.4)' : 'rgba(248, 113, 113, 0.4)';
        }

        ctx.beginPath();
        ctx.arc(cx, cy, event.type === 'Shot' ? shotR : dotR, 0, Math.PI * 2);
        ctx.fillStyle = dotColor;
        ctx.fill();

        if (i > 0) {
          const prev = visibleEvents[i - 1];
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(prev.x * scaleX, prev.y * scaleY);
          ctx.strokeStyle = lineColor;
          ctx.stroke();
        }
      });

      if (visibleEvents.length > 0) {
        ctx.font = `${minuteFontSize}px monospace`;
        ctx.textAlign = 'left';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText(`Match Minute: ${Math.floor(matchMinute)}'`, pad + 8, pad + (W < 500 ? 14 : 20));
      }

      if (isFrozen) {
        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.fillRect(0, 0, W, H);
        ctx.font = `bold ${overlayFontSize}px monospace`;
        ctx.textAlign = 'center';

        const lines = {
          '2022': { color: '#34d399', bg: 'rgba(16, 185, 129, 0.2)', text: '🚨 OPTIMAL EDGE\nLOCKED 🚨' },
          '2018': { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.2)', text: '🚨 TAIL EVENT\nMATERIALIZED 🚨' },
          'ksa':  { color: '#c084fc', bg: 'rgba(168, 85, 247, 0.2)', text: '🚨 UNDERDOG ALPHA\nLOCKED 🚨' },
          'ned':  { color: '#fb923c', bg: 'rgba(249, 115, 22, 0.2)', text: '🛡️ VOLATILITY HEDGE\nEXECUTED 🛡️' },
        };
        const { color, bg, text } = lines[activeCase] || {
          color: activeVaultMatch?.status === 'PASS' ? '#34d399' : '#ef4444',
          bg: activeVaultMatch?.status === 'PASS' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
          text: activeVaultMatch?.status === 'PASS' ? `🚨 ${vaultCutoffMinute || 75}' ALPHA WINDOW\nTRIGGERED 🚨` : '🛡️ VARIANCE FILTER\nACTIVATED 🛡️'
        };
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = color;
        // Split long text onto two lines on small screens
        if (W < 500) {
          const parts = text.split('\n');
          const lineH = overlayFontSize * 1.3;
          parts.forEach((part, i) => {
            ctx.fillText(part, W / 2, H / 2 - lineH / 2 + i * lineH);
          });
        } else {
          ctx.fillText(text.replace('\n', ' '), W / 2, H / 2);
        }
      }
      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [matchData, activeStep, activeCase, activeVaultMatch]);

  // ─── DEDICATED VIEW: 1,000-MATCH CLOUD SIMULATION ────────────
  if (activeCase === '1k_sim') {
    return (
      <div className="min-h-screen bg-slate-950 font-sans text-white relative p-6 sm:p-8 md:p-16 overflow-y-auto">
        <button
          onClick={() => navigateBack('#/')}
          className="fixed top-6 left-6 z-50 text-slate-400 hover:text-white font-mono text-sm flex items-center gap-2 bg-slate-900/90 px-4 py-2 rounded-full border border-slate-700 transition-all cursor-pointer backdrop-blur-sm"
        >
          <IconArrowLeft className="w-4 h-4" />
          <span>RETURN TO TERMINAL</span>
        </button>

        <div className="max-w-5xl mx-auto mt-12">
          {/* Header */}
          <div className="mb-8 border-b border-slate-800 pb-8">
            <div className="flex items-center gap-2 mb-3">
              <span className={`px-2.5 py-0.5 rounded text-xs font-mono font-bold border ${
                backtestVersion === 'v1.2'
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                  : 'bg-blue-500/20 text-blue-400 border-blue-500/40'
              }`}>
                {backtestVersion === 'v1.2' ? 'PRODUCTION OUT-OF-SAMPLE BENCHMARK' : 'SPATIAL LEGACY RUN'}
              </span>
              <span className="text-slate-400 font-mono text-xs">
                {backtestVersion === 'v1.2' ? 'Held-Out Test Set (1,000 Matches / 91,000 States)' : '3,000,000+ Spatial Events Processed'}
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-white">
              Production Engine: Backtest Analytics
            </h1>
            <p className="text-lg md:text-xl text-slate-400 leading-relaxed max-w-3xl">
              {backtestVersion === 'v1.2'
                ? 'Out-of-sample evaluation of the calibrated PitchAleph 1.2 multi-class booster under strict causal first-trigger execution.'
                : 'Validating historical algorithmic performance across a 3,000,000+ spatial event Data Lake using XGBoost, Platt Scaling, and liquidity constraints.'}
            </p>
          </div>

          {/* ─── VERSION TOGGLE CONTROL ─── */}
          <div className="flex items-center justify-between flex-wrap gap-4 mb-8 bg-slate-900/60 p-3 sm:p-4 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">MODEL VERSION:</span>
              <div className="inline-flex rounded-lg bg-slate-950 p-1 border border-slate-800">
                <button
                  onClick={() => {
                    setBacktestVersion('v1.0');
                    handleChartZoomReset();
                  }}
                  className={`px-3 py-1.5 rounded-md font-mono text-xs font-bold transition-all cursor-pointer ${
                    backtestVersion === 'v1.0'
                      ? 'bg-blue-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  v1.0 Spatial Legacy
                </button>
                <button
                  onClick={() => {
                    setBacktestVersion('v1.2');
                    handleChartZoomReset();
                  }}
                  className={`px-3 py-1.5 rounded-md font-mono text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    backtestVersion === 'v1.2'
                      ? 'bg-emerald-500 text-slate-950 shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>v1.2 Out-of-Sample (Active)</span>
                  <span className={`w-1.5 h-1.5 rounded-full ${backtestVersion === 'v1.2' ? 'bg-slate-950 animate-pulse' : 'bg-emerald-400'}`}></span>
                </button>
              </div>
            </div>

            <div className="text-xs font-mono text-slate-500">
              {backtestVersion === 'v1.2' ? (
                <span className="text-emerald-400/90 flex items-center gap-1">
                  <span>●</span> Primary Institutional Benchmark
                </span>
              ) : (
                <span className="text-blue-400/90 flex items-center gap-1">
                  <span>●</span> Preserved Historical Baseline
                </span>
              )}
            </div>
          </div>

          {/* ─── DYNAMIC METRIC CARDS ─── */}
          {backtestVersion === 'v1.2' ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 md:p-6 shadow-xl">
                <div className="text-xs font-mono text-slate-500 mb-2 uppercase">EXECUTIONS</div>
                <div className="text-3xl md:text-4xl font-extrabold text-white">168</div>
                <div className="text-[11px] font-mono text-slate-500 mt-1">Held-Out Test Set</div>
              </div>
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 md:p-6 shadow-xl">
                <div className="text-xs font-mono text-slate-500 mb-2 uppercase">WIN RATE</div>
                <div className="text-3xl md:text-4xl font-extrabold text-emerald-400">54.17%</div>
                <div className="text-[11px] font-mono text-slate-500 mt-1">Multi-class 3-way calibrated</div>
              </div>
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 md:p-6 shadow-xl">
                <div className="text-xs font-mono text-slate-500 mb-2 uppercase">NET PROFIT</div>
                <div className="text-3xl md:text-4xl font-extrabold text-emerald-400">+$5,588</div>
                <div className="text-[11px] font-mono text-slate-500 mt-1">Net after market friction</div>
              </div>
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 md:p-6 shadow-xl">
                <div className="text-xs font-mono text-slate-500 mb-2 uppercase">TOTAL ROI</div>
                <div className="text-3xl md:text-4xl font-extrabold text-emerald-400">55.88%</div>
                <div className="text-[11px] font-mono text-slate-500 mt-1">Unlevered OOS portfolio yield</div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 md:p-6 shadow-xl">
                <div className="text-xs font-mono text-slate-500 mb-2 uppercase">EXECUTIONS</div>
                <div className="text-3xl md:text-4xl font-extrabold text-white">522</div>
                <div className="text-[11px] font-mono text-slate-500 mt-1">Filtered from 1,000 matches</div>
              </div>
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 md:p-6 shadow-xl">
                <div className="text-xs font-mono text-slate-500 mb-2 uppercase">WIN RATE</div>
                <div className="text-3xl md:text-4xl font-extrabold text-blue-400">38.31%</div>
                <div className="text-[11px] font-mono text-slate-500 mt-1">High-odds underdog edge</div>
              </div>
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 md:p-6 shadow-xl">
                <div className="text-xs font-mono text-slate-500 mb-2 uppercase">NET PROFIT</div>
                <div className="text-3xl md:text-4xl font-extrabold text-emerald-400">+$10,152</div>
                <div className="text-[11px] font-mono text-slate-500 mt-1">Net after 5% market vig</div>
              </div>
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 md:p-6 shadow-xl">
                <div className="text-xs font-mono text-slate-500 mb-2 uppercase">TOTAL ROI</div>
                <div className="text-3xl md:text-4xl font-extrabold text-emerald-400">101.53%</div>
                <div className="text-[11px] font-mono text-slate-500 mt-1">Unlevered portfolio yield</div>
              </div>
            </div>
          )}

          {/* ─── DYNAMIC ARCHITECTURE CARDS & CHART ─── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            <div>
              <h3 className={`text-2xl font-bold mb-6 ${backtestVersion === 'v1.2' ? 'text-emerald-400' : 'text-blue-400'}`}>
                {backtestVersion === 'v1.2' ? 'PitchAleph 1.2 Architecture' : 'Architecture & Constraints'}
              </h3>
              {backtestVersion === 'v1.2' ? (
                <ul className="space-y-6 text-slate-300 leading-relaxed text-sm md:text-base">
                  <li className="bg-slate-900/50 p-4 rounded-lg border border-slate-800/80">
                    <strong className="text-white block text-base mb-1">1. Multi-Class Simplex</strong>
                    PitchAleph 1.2 outputs an explicit 3-class probability simplex [P(Home Win), P(Draw), P(Away Win)] summing strictly to 1.0000, eliminating binary draw distortion across the full 90 minutes.
                  </li>
                  <li className="bg-slate-900/50 p-4 rounded-lg border border-slate-800/80">
                    <strong className="text-white block text-base mb-1">2. Isotonic Frozen Calibration</strong>
                    Non-parametric isotonic regression wrapped in <code className="text-emerald-400 bg-slate-950 px-1 py-0.5 rounded text-xs">FrozenEstimator</code> recalibrates raw boosting probabilities, removing retail favorite bias and reducing Log Loss to 0.7640 on held-out matches.
                  </li>
                  <li className="bg-slate-900/50 p-4 rounded-lg border border-slate-800/80">
                    <strong className="text-white block text-base mb-1">3. Causal First-Trigger Execution</strong>
                    Positions are locked strictly at the moment of earliest positive expectation, enforcing Quarter-Kelly staking ($500 cap) and eliminating survivorship bias with zero lookahead leakage.
                  </li>
                </ul>
              ) : (
                <ul className="space-y-6 text-slate-300 leading-relaxed text-sm md:text-base">
                  <li className="bg-slate-900/50 p-4 rounded-lg border border-slate-800/80">
                    <strong className="text-white block text-base mb-1">1. Spatial Geometry / xT</strong>
                    The engine was trained on a 1,000-match historical dataset, computing rolling Expected Threat (xT) and spatial geometry to map sequences into continuous goal-generation probabilities.
                  </li>
                  <li className="bg-slate-900/50 p-4 rounded-lg border border-slate-800/80">
                    <strong className="text-white block text-base mb-1">2. Platt Scaling Calibration</strong>
                    Raw tree-based models suffer from algorithmic overconfidence. By applying Platt Scaling (Sigmoid curve), the engine throttled false-positive triggers, aggressively dropping its Brier Score to 0.019.
                  </li>
                  <li className="bg-slate-900/50 p-4 rounded-lg border border-slate-800/80">
                    <strong className="text-white block text-base mb-1">3. Market Liquidity Injection</strong>
                    To ensure statistical realism, a $10,000 maximum liquidity cap and a 5% sportsbook "vig" were injected into the simulator, ensuring the 101.53% ROI represents withdrawable, real-world alpha.
                  </li>
                </ul>
              )}
            </div>
            
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 sm:p-6 flex flex-col h-[520px] overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2 shrink-0 min-h-[50px]">
                <div>
                  <h4 className="text-xl font-bold text-white">Cumulative Bankroll (P&L)</h4>
                  <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
                    {backtestVersion === 'v1.2'
                      ? 'Out-of-sample execution curve across 168 held-out trades.'
                      : 'Interactive execution ledger across 522 constrained market conditions.'}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 self-start sm:self-auto shrink-0">
                  <Tooltip text="Zoom in (+)">
                    <button
                      onClick={() => handleChartStepZoom('in')}
                      className="p-1.5 sm:px-2.5 sm:py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded border border-slate-700 font-mono text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                      aria-label="Zoom in"
                    >
                      <IconZoomIn className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Zoom In</span>
                    </button>
                  </Tooltip>
                  <Tooltip text="Zoom out (-)">
                    <button
                      onClick={() => handleChartStepZoom('out')}
                      className="p-1.5 sm:px-2.5 sm:py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded border border-slate-700 font-mono text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                      aria-label="Zoom out"
                    >
                      <IconZoomOut className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Zoom Out</span>
                    </button>
                  </Tooltip>
                  <Tooltip text="Reset view to full range">
                    <button
                      onClick={handleChartZoomReset}
                      disabled={!isChartZoomed}
                      className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded border font-mono text-xs font-bold transition-all flex items-center gap-1.5 ${
                        isChartZoomed
                          ? 'bg-emerald-500/15 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 border-emerald-500/40 cursor-pointer'
                          : 'bg-slate-800/40 text-slate-600 border-slate-800/80 cursor-not-allowed opacity-50'
                      }`}
                      aria-label="Reset chart zoom"
                    >
                      <IconReset className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Reset</span>
                    </button>
                  </Tooltip>
                </div>
              </div>

              {/* Zoom presets & hint bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 py-2 border-b border-slate-800/80 mb-2 text-xs font-mono shrink-0">
                <div className="flex items-center gap-1">
                  <span className="text-slate-500 mr-1 text-[11px]">RANGE:</span>
                  {(backtestVersion === 'v1.2' ? [
                    { label: 'ALL (168)', start: 'dataMin', end: 'dataMax' },
                    { label: 'T1–50', start: 1, end: 50 },
                    { label: 'T50–110', start: 50, end: 110 },
                    { label: 'T110–168', start: 110, end: 168 }
                  ] : [
                    { label: 'ALL (522)', start: 'dataMin', end: 'dataMax' },
                    { label: 'T1–150', start: 1, end: 150 },
                    { label: 'T150–350', start: 150, end: 350 },
                    { label: 'T350–522', start: 350, end: 522 }
                  ]).map(p => {
                    const isActive = chartZoomLeft === p.start && chartZoomRight === p.end;
                    return (
                      <button
                        key={p.label}
                        onClick={() => handleChartPresetZoom(p.start, p.end)}
                        className={`px-2 py-0.5 rounded text-[11px] transition-colors cursor-pointer ${
                          isActive
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold'
                            : 'bg-slate-950/70 text-slate-400 hover:text-slate-200 border border-slate-800'
                        }`}
                      >
                        {p.label}
                      </button>
                    );
                  })}
                </div>
                <div className="text-[11px] text-slate-500 flex items-center gap-1">
                  <span className="text-emerald-400/80 font-semibold">Tip:</span>
                  <span>Drag across chart to inspect drawdowns</span>
                </div>
              </div>
              
              <div className="w-full flex-1 min-h-[300px] select-none">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={backtestVersion === 'v1.2' ? CHART_DATA_V12 : CHART_DATA_V10}
                    margin={{ top: 10, right: 20, bottom: 15, left: 0 }}
                    onMouseDown={(e) => e && e.activeLabel && setChartRefLeft(e.activeLabel)}
                    onMouseMove={(e) => chartRefLeft && e && e.activeLabel && setChartRefRight(e.activeLabel)}
                    onMouseUp={handleChartZoom}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis 
                      dataKey="trade" 
                      stroke="#64748b" 
                      tick={{fill: '#64748b', fontSize: 12}} 
                      tickLine={false}
                      axisLine={false}
                      domain={[chartZoomLeft, chartZoomRight]}
                      type="number"
                      allowDataOverflow={true}
                    />
                    <YAxis 
                      width={54}
                      stroke="#64748b" 
                      tick={{fill: '#64748b', fontSize: 12}} 
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `$${value / 1000}k`}
                      domain={['auto', 'auto']}
                      allowDataOverflow={true}
                    />
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#f8fafc' }}
                      itemStyle={{ color: '#34d399', fontWeight: 'bold' }}
                      formatter={(value) => [`$${value.toLocaleString()}`, 'Bankroll']}
                      labelStyle={{ color: '#64748b', marginBottom: '4px' }}
                      labelFormatter={(label) => `Trade Execution #${label}`}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="bankroll" 
                      stroke={backtestVersion === 'v1.2' ? '#10b981' : '#38bdf8'} 
                      strokeWidth={3}
                      dot={false}
                      activeDot={{ r: 6, fill: backtestVersion === 'v1.2' ? '#10b981' : '#38bdf8', stroke: '#0f172a', strokeWidth: 2 }}
                      isAnimationActive={false}
                    />
                    {chartRefLeft && chartRefRight && (
                      <ReferenceArea
                        x1={chartRefLeft}
                        x2={chartRefRight}
                        strokeOpacity={0.3}
                        fill="#38bdf8"
                        fillOpacity={0.2}
                      />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Global Responsive Footer */}
        <Footer />
      </div>
    );
  }

  // ─── HOME SCREEN ──────────────────────────────────────────────
  if (!activeCase || activeCase === 'vault') {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col font-sans text-white relative overflow-y-auto pb-16">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-900/20 via-slate-950 to-slate-950 fixed pointer-events-none"></div>

        {/* Live Sports Ticker Marquee */}
        <LiveSportsTicker />

        <div className="z-10 flex flex-col items-center w-full max-w-5xl mx-auto text-center px-4 sm:px-6 mt-6 sm:mt-10 md:mt-12">
          {/* Logo + Hero */}
          <div className="relative mb-4 md:mb-6 inline-flex items-center justify-center">
            {/* Reactive glow ring — remounts on each trigger to restart animation */}
            {glowKey > 0 && (
              <div
                key={glowKey}
                className="logo-glow-ring absolute rounded-full pointer-events-none"
                style={{ inset: '-12px' }}
              />
            )}
            <img
              src="/86f51b48a_generated_image.png"
              alt="PitchAleph Logo"
              className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 rounded-full shadow-[0_0_60px_rgba(16,185,129,0.25)] border border-emerald-500/30 relative z-10"
            />
          </div>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-4 md:mb-6 text-white leading-tight">
            The <span className="line-through decoration-red-500 decoration-3 sm:decoration-4 text-slate-400">House</span> <span className="text-emerald-400">Math</span> Always Wins.
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-slate-300 mb-6 md:mb-8 max-w-3xl px-2 leading-relaxed font-normal">
            Level the playing field. Our proprietary model is trained and updated on millions of data points to reveal the hidden edge in every game.<br className="hidden sm:inline" /> Turn unpredictable games into steady growth with a data-powered system built to limit loss and statistically increase profitability.
          </p>
          <div className="mb-6 md:mb-8 flex items-center gap-2">
            <span className="text-xs sm:text-sm font-mono font-bold tracking-wider uppercase text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3.5 py-1.5 rounded-full flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Launch Your Secret Weapon</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            </span>
          </div>

          {/* ─── CLOUD ARCHITECTURE & DATA VAULT SECTION ─── */}
          <div className="w-full border-t border-slate-800/80 pt-8 mb-12">
            <h2 className="text-xs font-mono text-slate-500 tracking-widest mb-4 uppercase text-left">
              Cloud Architecture & Scaled Backtesting
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button 
                onClick={() => navigate('#/1k_sim')} 
                className="px-5 py-4 bg-emerald-950/20 border border-emerald-500/40 hover:border-emerald-400 text-emerald-400 font-mono font-bold rounded-xl text-left flex flex-col transition-all group shadow-[0_0_25px_rgba(16,185,129,0.1)] hover:shadow-[0_0_35px_rgba(16,185,129,0.2)] cursor-pointer"
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="text-xs text-emerald-400 flex items-center gap-1.5">
                    <span>PRODUCTION ENGINE v1.2</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  </span>
                  <span className="text-xs text-emerald-400 font-normal">+$5,588 (55.88% ROI)</span>
                </div>
                <span className="text-base sm:text-lg text-white group-hover:text-emerald-300 transition-colors">
                  Production Engine: Backtest Analytics →
                </span>
                <span className="text-xs font-normal text-slate-400 mt-1">
                  Multi-class simplex booster with isotonic frozen calibration & causal first-trigger execution across 91,000 temporal states
                </span>
              </button>

              <button 
                onClick={() => {
                  setVaultVersion('v1.2');
                  navigate('#/vault');
                }} 
                className="px-5 py-4 bg-slate-900/90 border border-emerald-500/30 hover:border-emerald-400 text-slate-300 font-mono font-bold rounded-xl text-left flex flex-col transition-all group cursor-pointer shadow-lg hover:shadow-emerald-500/10"
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="text-xs text-emerald-400">DATA VAULT</span>
                  <span className="text-xs text-slate-500 font-normal">19 PASS / 7 FAIL</span>
                </div>
                <span className="text-base sm:text-lg text-white group-hover:text-emerald-300 transition-colors">
                  26-Case Portfolio Taxonomy →
                </span>
                <span className="text-xs font-normal text-slate-400 mt-1">
                  Explore algorithmic signal screening and capital preservation across 26 taxonomical match archetypes (Cases A–Z)
                </span>
              </button>

              <a
                href="/dev-blog"
                className="px-5 py-4 bg-slate-900/90 border border-emerald-500/30 hover:border-emerald-400 text-slate-300 font-mono font-bold rounded-xl text-left flex flex-col transition-all group cursor-pointer shadow-lg hover:shadow-emerald-500/10 no-underline"
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="text-xs text-emerald-400 flex items-center gap-1.5">
                    <span>DEV BLOG</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  </span>
                  <span className="text-xs text-emerald-400 font-normal">POSTPARTICLE CMS</span>
                </div>
                <span className="text-base sm:text-lg text-white group-hover:text-emerald-300 transition-colors">
                  Engineering & Research Dispatches →
                </span>
                <span className="text-xs font-normal text-slate-400 mt-1">
                  Read live published research on spatial simulation geometry, isotonic probability curves, and market microstructure
                </span>
              </a>
            </div>
          </div>

          {/* ─── DATA VAULT MODAL ─── */}
          {(showVaultModal || activeCase === 'vault') && (
            <div 
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  navigateBack('#/');
                }
              }}
              className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto"
            >
              <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-5 sm:p-8 text-left my-auto max-h-[90vh] flex flex-col">
                {/* Modal Header */}
                <div className="flex items-start justify-between pb-5 border-b border-slate-800">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        PORTFOLIO DATASET
                      </span>
                      <span className="text-xs font-mono text-slate-400">
                        {vaultVersion === 'v1.2' ? 'Multi-Class Validation Suite' : '2022 FIFA World Cup'}
                      </span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                      {vaultVersion === 'v1.2' ? 'PitchAleph Data Vault (26-Case Taxonomy)' : 'PitchAleph Data Vault (20 Match Sample)'}
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
                      {vaultVersion === 'v1.2'
                        ? 'Simulated algorithmic screening across 26 canonical match archetypes (Cases A through Z). Evaluate in-game variance, alpha inflection, and chaos withholding.'
                        : 'Simulated algorithmic screening across a 20-match portfolio sample. Evaluate live spatial event playback and signal execution on each match.'}
                    </p>
                  </div>
                  <Tooltip text="Close (Esc)" position="left">
                    <button
                      onClick={() => navigateBack('#/')}
                      className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 font-mono text-lg transition-colors cursor-pointer flex items-center justify-center"
                      aria-label="Close modal"
                    >
                      <IconClose className="w-5 h-5" />
                    </button>
                  </Tooltip>
                </div>

                {/* Version Toggle Control Bar */}
                <div className="flex items-center justify-between flex-wrap gap-3 py-3 border-b border-slate-800/80 bg-slate-950/40 px-2 rounded-lg my-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">TAXONOMY:</span>
                    <div className="inline-flex rounded-lg bg-slate-950 p-1 border border-slate-800">
                      <button
                        onClick={() => {
                          setVaultVersion('v1.0');
                          setVaultFilter('ALL');
                        }}
                        className={`px-3 py-1 rounded-md font-mono text-xs font-bold transition-all cursor-pointer ${
                          vaultVersion === 'v1.0'
                            ? 'bg-blue-600 text-white shadow'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        v1.0 Legacy (20)
                      </button>
                      <button
                        onClick={() => {
                          setVaultVersion('v1.2');
                          setVaultFilter('ALL');
                        }}
                        className={`px-3 py-1 rounded-md font-mono text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                          vaultVersion === 'v1.2'
                            ? 'bg-emerald-500 text-slate-950 shadow'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <span>v1.2 Production (26 Cases)</span>
                        <span className={`w-1.5 h-1.5 rounded-full ${vaultVersion === 'v1.2' ? 'bg-slate-950 animate-pulse' : 'bg-emerald-400'}`}></span>
                      </button>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono text-slate-500">
                    {vaultVersion === 'v1.2' ? 'Active Institutional Taxonomy' : 'Preserved v1.0 Historical Sample'}
                  </span>
                </div>

                {/* Portfolio Stats Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3 border-b border-slate-800 text-center font-mono">
                  <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
                    <div className="text-[10px] text-slate-500 uppercase">SAMPLE SIZE</div>
                    <div className="text-lg font-bold text-white">
                      {vaultVersion === 'v1.2' ? '26 Matches' : `${VAULT_MATCHES_V10.length} Matches`}
                    </div>
                  </div>
                  <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
                    <div className="text-[10px] text-slate-500 uppercase">ALPHA SIGNALS</div>
                    <div className="text-lg font-bold text-emerald-400">
                      {vaultVersion === 'v1.2'
                        ? `${VAULT_PASS_COUNT_V12} PASS (${VAULT_PASS_PERCENT_V12}%)`
                        : `${VAULT_PASS_COUNT_V10} PASS (${VAULT_PASS_PERCENT_V10}%)`}
                    </div>
                  </div>
                  <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
                    <div className="text-[10px] text-slate-500 uppercase">RISK FILTERS</div>
                    <div className="text-lg font-bold text-red-400">
                      {vaultVersion === 'v1.2'
                        ? `${VAULT_FAIL_COUNT_V12} FAIL (${VAULT_FAIL_PERCENT_V12}%)`
                        : `${VAULT_FAIL_COUNT_V10} FAIL (${VAULT_FAIL_PERCENT_V10}%)`}
                    </div>
                  </div>
                  <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
                    <div className="text-[10px] text-slate-500 uppercase">PORTFOLIO WIN RATE</div>
                    <div className="text-lg font-bold text-slate-300">
                      {vaultVersion === 'v1.2' ? `${VAULT_PASS_PERCENT_V12}% Edge` : `${VAULT_PASS_PERCENT_V10}% Edge`}
                    </div>
                  </div>
                </div>

                {/* Filter & Sort Controls */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    {['ALL', 'PASS', 'FAIL'].map((filter) => {
                      const count = vaultVersion === 'v1.2'
                        ? (filter === 'ALL' ? VAULT_CASES_26.length : filter === 'PASS' ? VAULT_PASS_COUNT_V12 : VAULT_FAIL_COUNT_V12)
                        : (filter === 'ALL' ? VAULT_MATCHES_V10.length : filter === 'PASS' ? VAULT_PASS_COUNT_V10 : VAULT_FAIL_COUNT_V10);
                      return (
                        <button
                          key={filter}
                          onClick={() => setVaultFilter(filter)}
                          className={`px-3 py-1 text-xs font-mono font-bold rounded-full transition-all cursor-pointer ${
                            vaultFilter === filter 
                              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20' 
                              : 'bg-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          {`${filter} (${count})`}
                        </button>
                      );
                    })}
                  </div>

                  {/* EV Sorting Controls */}
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-slate-500">Sort EV:</span>
                    <div className="inline-flex rounded-lg bg-slate-950/80 p-0.5 border border-slate-800 font-mono text-xs">
                      <button
                        onClick={() => setVaultSort('desc')}
                        title="Sort highest EV to lowest"
                        className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                          vaultSort === 'desc'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <span>Highest First</span>
                        <span>↓</span>
                      </button>
                      <button
                        onClick={() => setVaultSort('asc')}
                        title="Sort lowest EV to highest"
                        className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                          vaultSort === 'asc'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <span>Lowest First</span>
                        <span>↑</span>
                      </button>
                      <button
                        onClick={() => setVaultSort('default')}
                        title={vaultVersion === 'v1.2' ? 'Sort Cases A to Z' : 'Sort Default Order'}
                        className={`px-2 py-1 rounded text-[11px] font-bold transition-all cursor-pointer ${
                          vaultSort === 'default'
                            ? 'bg-slate-800 text-slate-200 border border-slate-700'
                            : 'text-slate-500 hover:text-slate-300'
                        }`}
                      >
                        {vaultVersion === 'v1.2' ? 'A–Z' : 'Default'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Scrollable Matches List */}
                <div className="overflow-y-auto flex-1 pr-1 space-y-2.5 my-2 hide-scrollbar">
                  {vaultVersion === 'v1.2' ? (
                    VAULT_CASES_26
                      .filter(c => vaultFilter === 'ALL' || c.status === vaultFilter)
                      .slice()
                      .sort((a, b) => {
                        if (vaultSort === 'desc') return parseEvValue(b.ev_display) - parseEvValue(a.ev_display);
                        if (vaultSort === 'asc') return parseEvValue(a.ev_display) - parseEvValue(b.ev_display);
                        return a.case_letter.localeCompare(b.case_letter);
                      })
                      .map((c) => (
                        <div
                          key={`case_${c.case_letter}`}
                          className="bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 p-3.5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all hover:bg-slate-800/30"
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold shrink-0 ${
                                c.status === 'PASS' 
                                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' 
                                  : 'bg-red-500/15 text-red-400 border border-red-500/30'
                              }`}
                            >
                              {c.status}
                            </span>
                            <div>
                              <div className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                                <span className="text-emerald-400 font-mono text-xs px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 shrink-0">
                                  Case {c.case_letter}
                                </span>
                                <span>{c.fixture || `Match #${c.match_id}`}</span>
                              </div>
                              <div className="text-xs font-mono text-slate-500 flex items-center gap-1.5 mt-0.5 flex-wrap">
                                <span>{c.date}</span>
                                <span>•</span>
                                <span>Match #{c.match_id}</span>
                                <span>•</span>
                                <span className="text-slate-300 font-medium">{c.archetype}</span>
                                <span>•</span>
                                <span>Zero-Stake Ratio: {(c.zero_stake_ratio * 100).toFixed(1)}%</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                            <div className="font-mono text-xs text-right">
                              <div className={`font-bold ${c.status === 'PASS' ? 'text-emerald-400' : 'text-amber-400'}`}>
                                {c.ev_display}
                              </div>
                              <div className="text-[10px] text-slate-500">{c.decision_minute}</div>
                            </div>
                            <span
                              title="Validated under v1.2 Out-of-Sample Protocol"
                              className="px-3 py-1.5 rounded-lg bg-slate-900/90 text-slate-400 font-mono text-xs font-medium border border-slate-800 select-none flex items-center gap-1.5 cursor-default"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
                              <span>Validated</span>
                            </span>
                          </div>
                        </div>
                      ))
                  ) : (
                    VAULT_MATCHES_V10
                      .filter(m => vaultFilter === 'ALL' || m.status === vaultFilter)
                      .slice()
                      .sort((a, b) => {
                        if (vaultSort === 'desc') return parseEvValue(b.ev) - parseEvValue(a.ev);
                        if (vaultSort === 'asc') return parseEvValue(a.ev) - parseEvValue(b.ev);
                        return 0;
                      })
                      .map((m) => (
                        <div
                          key={m.id}
                          className="bg-slate-950/70 border border-slate-800/80 hover:border-emerald-500/40 p-3.5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all hover:bg-slate-800/40"
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold shrink-0 ${
                                m.status === 'PASS' 
                                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' 
                                  : 'bg-red-500/15 text-red-400 border border-red-500/30'
                              }`}
                            >
                              {m.status}
                            </span>
                            <div>
                              <div className="text-sm sm:text-base font-bold text-white">
                                {m.title}
                              </div>
                              <div className="text-xs font-mono text-slate-500">
                                {m.date} • Match #{m.id}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                            <div className="font-mono text-xs text-right">
                              <div className="text-emerald-400 font-bold">{m.ev ? m.ev.trim() : '+14.2% EV'}</div>
                              <div className="text-[10px] text-slate-500">{m.minute || "75' Decision"}</div>
                            </div>
                            <button
                              onClick={() => navigate('#/vault/' + m.id)}
                              className="px-3.5 py-1.5 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 border border-emerald-500/30 font-mono text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
                            >
                              <span>Simulate</span>
                              <IconPlay className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))
                  )}
                </div>

                {/* Footer info */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-mono text-slate-500">
                  <span>Discrete spatial event streams powered by StatsBomb Open Data</span>
                  <button
                    onClick={() => navigateBack('#/')}
                    className="text-slate-400 hover:text-white cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ─── RESTORED BET SIMULATOR: THE PITCHALEPH EDGE CALCULATOR (24 SCENARIOS) ─── */}
          <div className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-6 md:p-8 text-left shadow-2xl mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white">
                The PitchAleph Edge Calculator (Bet Simulator)
              </h2>
              <span className="font-mono text-xs px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 self-start sm:self-auto">
                24 Historical Simulations Active
              </span>
            </div>
            <p className="text-slate-400 text-sm md:text-base mb-6 md:mb-8">
              See how the engine maximizes profits and minimizes catastrophic losses compared to a standard market bettor across core test cases and the 20-match Data Vault portfolio.
            </p>

            {/* Stack to single col on mobile, 3-col on md+ */}
            <div className="flex flex-col md:grid md:grid-cols-3 gap-6 md:gap-8">
              {/* Controls */}
              <div className="md:col-span-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="base-stake-input" className="text-emerald-400 font-mono text-xs sm:text-sm font-bold">
                    BASE STAKE:
                  </label>
                  <div className="flex items-center gap-1.5">
                    <div className="relative flex items-center">
                      <span className="absolute left-2.5 text-emerald-400 font-mono text-sm pointer-events-none font-bold">$</span>
                      <input
                        id="base-stake-input"
                        type="number"
                        min="1"
                        max="1000000"
                        step="50"
                        value={calcStake}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          if (!isNaN(val) && val >= 0) {
                            setCalcStake(val);
                          }
                        }}
                        className="w-28 bg-slate-950/80 border border-slate-700 focus:border-emerald-500 rounded-lg pl-7 pr-2.5 py-1 text-right text-white font-mono text-sm font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors no-spinner"
                        placeholder="1,000"
                      />
                    </div>
                    <div className="flex flex-col gap-0.5 shrink-0">
                      <Tooltip text="Increase stake (+$50)" position="top">
                        <button
                          type="button"
                          onClick={() => setCalcStake(prev => Math.min(1000000, Math.max(1, (Number(prev) || 0) + 50)))}
                          className="w-6 h-4 bg-slate-800/80 hover:bg-emerald-500/20 text-slate-400 hover:text-emerald-400 border border-slate-700 hover:border-emerald-500/40 rounded flex items-center justify-center transition-colors cursor-pointer"
                          aria-label="Increase stake by $50"
                        >
                          <IconChevronUp className="w-3 h-3" />
                        </button>
                      </Tooltip>
                      <Tooltip text="Decrease stake (-$50)" position="bottom">
                        <button
                          type="button"
                          onClick={() => setCalcStake(prev => Math.min(1000000, Math.max(1, (Number(prev) || 0) - 50)))}
                          className="w-6 h-4 bg-slate-800/80 hover:bg-emerald-500/20 text-slate-400 hover:text-emerald-400 border border-slate-700 hover:border-emerald-500/40 rounded flex items-center justify-center transition-colors cursor-pointer"
                          aria-label="Decrease stake by $50"
                        >
                          <IconChevronDown className="w-3 h-3" />
                        </button>
                      </Tooltip>
                    </div>
                  </div>
                </div>
                <input
                  type="range"
                  min="100"
                  max="10000"
                  step="100"
                  value={Math.min(Math.max(calcStake, 100), 10000)}
                  onChange={(e) => setCalcStake(Number(e.target.value))}
                  className="w-full accent-emerald-500 mb-6 cursor-pointer"
                  aria-label="Base stake range slider"
                />

                {/* Filter tabs for 24 scenarios */}
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-emerald-400 font-mono text-xs sm:text-sm">
                    SELECT SCENARIO:
                  </label>
                  <div className="flex gap-1">
                    {['ALL', 'CORE', 'VAULT'].map(cat => (
                      <button
                        key={cat}
                        onClick={() => {
                          setCalcFilter(cat);
                          const matchingKeys = Object.keys(CALCULATOR_DATA).filter(key => {
                            if (cat === 'CORE') return ['2022', '2018', 'ksa', 'ned'].includes(key);
                            if (cat === 'VAULT') return key.startsWith('vault_');
                            return true;
                          });
                          if (!matchingKeys.includes(calcCase) && matchingKeys.length > 0) {
                            setCalcCase(matchingKeys[0]);
                          }
                        }}
                        className={`text-[10px] font-mono px-2 py-0.5 rounded cursor-pointer transition-all ${
                          calcFilter === cat ? 'bg-slate-700 text-white font-bold' : 'text-slate-500 hover:text-slate-300'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Scrollable scenario selector */}
                <div className="flex flex-row md:flex-col gap-1.5 overflow-x-auto pb-1 md:overflow-y-auto md:max-h-72 pr-1 hide-scrollbar">
                  {Object.keys(CALCULATOR_DATA)
                    .filter(key => {
                      if (calcFilter === 'CORE') return ['2022', '2018', 'ksa', 'ned'].includes(key);
                      if (calcFilter === 'VAULT') return key.startsWith('vault_');
                      return true;
                    })
                    .map(key => {
                      const item = CALCULATOR_DATA[key];
                      const isSelected = calcCase === key;
                      return (
                        <button
                          key={key} 
                          onClick={() => setCalcCase(key)}
                          className={`shrink-0 text-left px-3 py-2 font-mono text-xs rounded transition-all whitespace-nowrap md:whitespace-normal flex items-center justify-between gap-2 cursor-pointer ${
                            isSelected 
                              ? 'bg-emerald-500/20 border border-emerald-500/50 text-white font-bold' 
                              : 'bg-slate-950/60 border border-slate-800/80 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                          }`}
                        >
                          <span className="truncate">{item.title}</span>
                          <span className={`text-[10px] px-1.5 py-0.2 rounded shrink-0 ${
                            item.ev.includes('+') && !item.title.includes('FAIL')
                              ? 'text-emerald-400 bg-emerald-950/60'
                              : 'text-amber-400 bg-amber-950/60'
                          }`}>
                            {item.ev}
                          </span>
                        </button>
                      );
                    })}
                </div>
              </div>

              {/* Results panel */}
              <div className="md:col-span-2 w-full min-w-0 bg-slate-950 border border-slate-800 rounded-xl p-4 sm:p-5 md:p-6 font-mono flex flex-col justify-between overflow-hidden">
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 border-b border-slate-800 pb-3 mb-5">
                    <Tooltip text={CALCULATOR_DATA[calcCase]?.fullTitle || CALCULATOR_DATA[calcCase]?.title || 'Scenario Analysis'} className="min-w-0 flex-1">
                      <span className="text-sm font-bold text-white line-clamp-2 sm:truncate block text-left">
                        {CALCULATOR_DATA[calcCase]?.fullTitle || CALCULATOR_DATA[calcCase]?.title || 'Scenario Analysis'}
                      </span>
                    </Tooltip>
                    <span className="text-xs text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30 self-start sm:self-auto shrink-0 whitespace-nowrap">
                      EV: {CALCULATOR_DATA[calcCase]?.ev}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6">
                    <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800/60 min-w-0">
                      <div className="text-[11px] sm:text-xs text-slate-500 mb-1">MARKET ODDS</div>
                      <div className="text-xs sm:text-sm md:text-lg text-slate-300 font-bold truncate">
                        {CALCULATOR_DATA[calcCase]?.marketOdds}
                      </div>
                    </div>
                    <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800/60 min-w-0">
                      <div className="text-[11px] sm:text-xs text-slate-500 mb-1">PITCHALEPH TRUE PROB</div>
                      <div className="text-xs sm:text-sm md:text-lg text-emerald-400 font-bold truncate">
                        {CALCULATOR_DATA[calcCase]?.pitchAlephProb}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-800 pt-5 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 w-full">
                  <div className="w-full min-w-0 bg-red-950/20 border border-red-500/20 p-3 sm:p-4 rounded-lg flex flex-col h-[140px] sm:h-[150px]">
                    <div className="text-xs text-red-400 font-bold mb-2 flex items-center gap-1.5 shrink-0">
                      <IconWarning className="w-3.5 h-3.5 text-red-400 shrink-0" />
                      <span>PUBLIC BETTOR OUTCOME</span>
                    </div>
                    <div className="flex-1 overflow-y-auto pr-1 text-xs md:text-sm text-red-300 leading-relaxed break-words">
                      {CALCULATOR_DATA[calcCase]?.publicResult(calcStake)}
                    </div>
                  </div>
                  <div className="w-full min-w-0 bg-emerald-950/20 border border-emerald-500/20 p-3 sm:p-4 rounded-lg flex flex-col h-[140px] sm:h-[150px]">
                    <div className="text-xs text-emerald-400 font-bold mb-2 flex items-center gap-1.5 shrink-0">
                      <IconBolt className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>PITCHALEPH ENGINE OUTCOME</span>
                    </div>
                    <div className="flex-1 overflow-y-auto pr-1 text-xs md:text-sm text-emerald-300 leading-relaxed break-words">
                      {CALCULATOR_DATA[calcCase]?.pitchAlephResult(calcStake)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ─── ARCHIVES & CORE STUDIES ─── */}
          <div className="w-full border-t border-slate-800/80 pt-8 mb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <a
                    href="/archives"
                    className="text-xs font-mono text-slate-300 hover:text-emerald-400 font-bold tracking-widest uppercase transition-colors flex items-center gap-1.5"
                  >
                    <span>📁</span>
                    <span>Archives</span>
                    <span className="text-slate-500 font-normal">→</span>
                  </a>
                </div>
                <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                  Foundational stress-tests and validation benchmarks used to calibrate PitchAleph v1.0
                </p>
              </div>

              {/* Nested Action Buttons */}
              <div className="flex items-center gap-2">
                <a
                  href="/archives#core-studies"
                  className="h-8 px-3 inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 hover:text-emerald-300 border border-emerald-500/30 hover:border-emerald-500/60 font-mono text-xs font-semibold transition-all duration-200 shadow-sm"
                >
                  <span>🧪</span>
                  <span>Core Case Studies</span>
                </a>
                <a
                  href="/api/docs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-8 px-3 inline-flex items-center gap-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white border border-slate-700/80 hover:border-slate-600 font-mono text-xs font-semibold transition-all duration-200 shadow-sm"
                >
                  <IconCode className="w-3.5 h-3.5 text-emerald-400" />
                  <span>API Docs</span>
                  <span className="text-[10px] text-slate-500">↗</span>
                </a>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 w-full">
              {/* Test 01 - Big Success (Green) */}
              <button
                onClick={() => navigate('#/case/2022')}
                className="px-5 py-4 bg-emerald-500/10 border border-emerald-500/40 hover:border-emerald-500 text-emerald-400 font-mono font-bold rounded-xl hover:bg-emerald-500/15 text-left flex flex-col transition-all cursor-pointer shadow-sm group"
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="text-xs text-slate-400 font-mono">TEST 01: ALPHA GENERATION</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase font-semibold">
                    Big Success
                  </span>
                </div>
                <span className="text-base sm:text-lg text-emerald-300 group-hover:text-emerald-200">
                  ARG vs FRA (2022)
                </span>
              </button>

              {/* Test 02 - Mitigated Loss (Orange) */}
              <button
                onClick={() => navigate('#/case/2018')}
                className="px-5 py-4 bg-amber-500/10 border border-amber-500/40 hover:border-amber-500 text-amber-400 font-mono font-bold rounded-xl hover:bg-amber-500/15 text-left flex flex-col transition-all cursor-pointer shadow-sm group"
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="text-xs text-slate-400 font-mono">TEST 02: TAIL RISK / VARIANCE</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 uppercase font-semibold">
                    Mitigated Loss
                  </span>
                </div>
                <span className="text-base sm:text-lg text-amber-300 group-hover:text-amber-200">
                  GER vs KOR (2018)
                </span>
              </button>

              {/* Test 03 - Big Success (Green) */}
              <button
                onClick={() => navigate('#/case/ksa')}
                className="px-5 py-4 bg-emerald-500/10 border border-emerald-500/40 hover:border-emerald-500 text-emerald-400 font-mono font-bold rounded-xl hover:bg-emerald-500/15 text-left flex flex-col transition-all cursor-pointer shadow-sm group"
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="text-xs text-slate-400 font-mono">TEST 03: UNDERDOG INEFFICIENCY</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase font-semibold">
                    Big Success
                  </span>
                </div>
                <span className="text-base sm:text-lg text-emerald-300 group-hover:text-emerald-200">
                  KSA vs ARG (2022)
                </span>
              </button>

              {/* Test 04 - Mitigated Loss (Orange) */}
              <button
                onClick={() => navigate('#/case/ned')}
                className="px-5 py-4 bg-amber-500/10 border border-amber-500/40 hover:border-amber-500 text-amber-400 font-mono font-bold rounded-xl hover:bg-amber-500/15 text-left flex flex-col transition-all cursor-pointer shadow-sm group"
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="text-xs text-slate-400 font-mono">TEST 04: DYNAMIC HEDGING</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 uppercase font-semibold">
                    Mitigated Loss
                  </span>
                </div>
                <span className="text-base sm:text-lg text-amber-300 group-hover:text-amber-200">
                  NED vs ARG (2022)
                </span>
              </button>
            </div>
          </div>

        </div>

        {/* Global Responsive Footer */}
        <Footer />
      </div>
    );
  }

  const caseTimeLimit = activeCase === '2018' ? 82 : activeCase === 'ksa' ? 55 : activeCase === 'ned' ? 92 : (activeCase?.startsWith('vault_') ? (activeVaultMatch?.minute ? parseInt(activeVaultMatch.minute, 10) : 75) : 100);

  const handleScrub = (val) => {
    manualMinuteRef.current = val;
    setManualMinute(val);
  };

  const handleAutoResume = () => {
    manualMinuteRef.current = null;
    setManualMinute(null);
  };

  return (
    <div className="bg-slate-900 text-white font-sans min-h-screen flex flex-col md:h-screen md:overflow-hidden relative">

      {/* Top nav bar */}
      <div className="flex items-center justify-between px-4 md:px-6 py-3 border-b border-slate-800 bg-slate-900/95 backdrop-blur-sm z-50 sticky top-0">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigateBack('#/')}
            className="text-slate-400 hover:text-white font-mono text-xs sm:text-sm flex items-center gap-1.5 bg-slate-800 px-3 py-1.5 rounded-full border border-slate-700 transition-all cursor-pointer"
          >
            <IconArrowLeft className="w-3.5 h-3.5" />
            <span>TERMINAL</span>
          </button>
          {activeCase?.startsWith('vault_') && (
            <button
              onClick={() => navigateBack('#/vault')}
              className="text-emerald-400 hover:text-emerald-300 font-mono text-xs sm:text-sm flex items-center gap-1.5 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/30 transition-all cursor-pointer"
            >
              <IconArrowLeft className="w-3.5 h-3.5" />
              <span>DATA VAULT</span>
            </button>
          )}
        </div>

        {/* Mobile canvas toggle */}
        <div className="flex md:hidden gap-2">
          <button
            onClick={() => setShowCanvas(false)}
            className={`font-mono text-xs px-3 py-1.5 rounded-full border transition-all ${!showCanvas ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'border-slate-700 text-slate-500'}`}
          >
            ANALYSIS
          </button>
          <button
            onClick={() => setShowCanvas(true)}
            className={`font-mono text-xs px-3 py-1.5 rounded-full border transition-all ${showCanvas ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'border-slate-700 text-slate-500'}`}
          >
            PITCH ●
          </button>
        </div>

        {/* Desktop engine status label */}
        <div className="hidden md:block text-emerald-400 font-mono text-xs font-bold tracking-widest uppercase">
          ● PITCHALEPH: {activeVaultMatch ? `${activeVaultMatch.title} (${activeVaultMatch.status})` : `${activeCase} RUNNING`}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col md:grid md:grid-cols-2 md:overflow-hidden">

        {/* Story / scroll panel */}
        <div className={`${showCanvas ? 'hidden' : 'flex'} md:flex h-full overflow-y-auto pb-[30vh] md:pb-[40vh] pt-8 md:pt-[20vh] px-4 sm:px-8 md:px-12 hide-scrollbar relative z-10`}>
          <div className="max-w-xl mx-auto w-full">

            {activeCase === '2022' && (
              <>
                <div className="mb-[12vh] md:mb-[20vh]">
                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-3">The 25% Backtest</h1>
                  <p className="text-base md:text-xl text-slate-400">Blinding the model to find the +EV window in the 2022 Final.</p>
                </div>
                <Step id={1} activeStep={activeStep} title="1. Ingesting Live Match Events" snippet={CODE_SNIPPETS['2022'][1]}>Raw pitch data is messy. We stream every discrete on-field action—passes, shots, and tackles—into clean event data. Every coordinate is mapped to feed our real-time tracking pipeline.</Step>
                <Step id={2} activeStep={activeStep} title="2. Feature Engineering" snippet={CODE_SNIPPETS['2022'][2]}>To outsmart the market, we upgrade to Gradient Boosting (XGBoost) and inject the human element. By factoring in Referee Foul-to-Tackle Ratios and Coach Aggression Indices, PitchAleph maps non-linear interactions public sportsbooks ignore.</Step>
                <Step id={3} activeStep={activeStep} title="3. The Predictive Engine" snippet={CODE_SNIPPETS['2022'][3]}>As live event data streams in, PitchAleph calculates real-time win probability. We use dynamic SQL window functions to measure rolling Expected Threat (xT) spikes against the market's lagging live odds.</Step>
                <Step id={4} activeStep={activeStep} title="4. Execution Window" snippet={CODE_SNIPPETS['2022'][4]}>The 25% Test: We blindfolded the model. At exactly 22.5 minutes, PitchAleph detected an extreme territorial imbalance. While Vegas implied a 40% probability, PitchAleph calculated 65%, executing a +EV buy order right before Argentina scored.</Step>
              </>
            )}

            {activeCase === '2018' && (
              <>
                <div className="mb-[12vh] md:mb-[20vh]">
                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-3">Variance & Tail Risk</h1>
                  <p className="text-base md:text-xl text-slate-400">Managing statistical inevitability when the market edge fails.</p>
                </div>
                <Step id={1} activeStep={activeStep} title="1. The Siege" snippet={CODE_SNIPPETS['2018'][1]}>It is the 80th minute. Germany must win to survive the group stage. The live event data shows relentless, suffocating pressure in the final third. They are dominating possession and generating massive Expected Threat (xT).</Step>
                <Step id={2} activeStep={activeStep} title="2. The Momentum Avalanche" snippet={CODE_SNIPPETS['2018'][2]}>PitchAleph's predictive engine tracks a historic spike in attacking momentum. The model proves Germany is breaking through the Korean lines entirely at will.</Step>
                <Step id={3} activeStep={activeStep} title="3. The +EV Trap" snippet={CODE_SNIPPETS['2018'][3]}>The engine calculates a 92% true win probability for Germany based on the momentum. The market implies only 80%. This presents a massive +15% EV edge. PitchAleph takes the position.</Step>
                <Step id={4} activeStep={activeStep} title="4. Risk Management" snippet={CODE_SNIPPETS['2018'][4]}>Quant trading is not about crystal-ball predictions; it is about edge over time. South Korea scores on two low-probability counter-attacks. Germany loses. However, because we use a Fractional Kelly Criterion for bankroll sizing (capping exposure at 2%), the fund easily absorbs the blow. We survived the variance.</Step>
              </>
            )}

            {activeCase === 'ksa' && (
              <>
                <div className="mb-[12vh] md:mb-[20vh]">
                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-3">Underdog Inefficiency</h1>
                  <p className="text-base md:text-xl text-slate-400">Exploiting market anchoring in the biggest upset of 2022.</p>
                </div>
                <Step id={1} activeStep={activeStep} title="1. The Market Anchor" snippet={CODE_SNIPPETS['ksa'][1]}>The public market heavily backed Argentina, assigning them a 92.3% implied win probability. Casual bettors saw Argentina dominating possession and assumed an inevitable blowout.</Step>
                <Step id={2} activeStep={activeStep} title="2. Neutralizing Spatial Threat" snippet={CODE_SNIPPETS['ksa'][2]}>PitchAleph's engine flagged an anomaly: Saudi Arabia was running a perfectly synchronized high defensive line, catching Argentina offside repeatedly. This wasn't luck; it was a highly disciplined tactical system entirely neutralizing Argentina's spatial threat.</Step>
                <Step id={3} activeStep={activeStep} title="3. True Win Probability" snippet={CODE_SNIPPETS['ksa'][3]}>By adjusting for the success rate of the offside traps, PitchAleph recalculated the true match odds. The engine determined Saudi Arabia's defensive block was highly sustainable and that the market was fundamentally mispricing the game.</Step>
                <Step id={4} activeStep={activeStep} title="4. The Underdog Alpha" snippet={CODE_SNIPPETS['ksa'][4]}>At halftime, the market still priced Argentina as heavy -600 favorites. PitchAleph executed a massive +EV buy order on Saudi Arabia at +1200 odds. Just minutes into the second half, KSA scored two rapid-fire goals to win 2-1, cashing a massive underdog ticket.</Step>
              </>
            )}

            {activeCase === 'ned' && (
              <>
                <div className="mb-[12vh] md:mb-[20vh]">
                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-3">Volatility & Hedging</h1>
                  <p className="text-base md:text-xl text-slate-400">Knowing when the predictive models break down.</p>
                </div>
                <Step id={1} activeStep={activeStep} title="1. The Baseline State" snippet={CODE_SNIPPETS['ned'][1]}>For 75 minutes, the Netherlands played a structured, possession-based game. PitchAleph's standard spatial models were accurately predicting match flow and keeping our Argentina position secure.</Step>
                <Step id={2} activeStep={activeStep} title="2. Tactical Rupture" snippet={CODE_SNIPPETS['ned'][2]}>Trailing 2-0, the Netherlands completely abandoned 'Total Football'. They brought on 6-foot-6 striker Wout Weghorst and began launching direct long balls from deep in their own half. The structured game state evaporated.</Step>
                <Step id={3} activeStep={activeStep} title="3. Measuring Match Chaos" snippet={CODE_SNIPPETS['ned'][3]}>PitchAleph flagged a "Regime Change." Pass completion rates plummeted, aerial duels skyrocketed, and variance went off the charts. The game devolved into raw physical chaos, meaning all historical predictive probabilities were completely voided.</Step>
                <Step id={4} activeStep={activeStep} title="4. Dynamic Hedging" snippet={CODE_SNIPPETS['ned'][4]}>A core quant principle: Do not trade in chaotic states you cannot model. Sensing extreme volatility, PitchAleph executed an automated hedge. Instead of risking the original Argentina position in a coin-flip scenario, the engine cashed out to lock in a guaranteed profit. Minutes later, the Netherlands scored a miraculous equalizer. The public lost; PitchAleph profited.</Step>
              </>
            )}

            {activeCase?.startsWith('vault_') && activeVaultMatch && (
              <>
                <div className="mb-[8vh] md:mb-[12vh]">
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`px-2.5 py-0.5 rounded text-xs font-mono font-bold ${activeVaultMatch.status === 'PASS' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-red-500/20 text-red-400 border border-red-500/40'}`}>
                      {activeVaultMatch.status === 'PASS' ? 'ALPHA TRIGGER: PASS' : 'RISK FILTER: FAIL'}
                    </span>
                    <span className="text-slate-400 font-mono text-xs">
                      {activeVaultMatch.date} • FIFA World Cup 2022
                    </span>
                  </div>
                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-3 text-white">
                    {activeVaultMatch.title}
                  </h1>
                  <p className="text-base md:text-xl text-slate-400 leading-relaxed">
                    {activeVaultMatch.status === 'PASS' 
                      ? `PitchAleph generated a high-confidence ${activeVaultMatch.ev ? activeVaultMatch.ev.trim() : '+14.2% EV'} edge at ${activeVaultMatch.minute || "minute 75"} based on continuous spatial threat dominance.`
                      : `PitchAleph identified tail risk volatility at ${activeVaultMatch.minute || "minute 75"}, rejecting market consensus to preserve bankroll.`}
                  </p>

                  {/* Quant Metric Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-6">
                    <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-lg font-mono">
                      <div className="text-[10px] text-slate-500 uppercase">MODEL DECISION</div>
                      <div className={`text-base font-bold ${activeVaultMatch.status === 'PASS' ? 'text-emerald-400' : 'text-red-400'}`}>
                        {activeVaultMatch.status}
                      </div>
                    </div>
                    <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-lg font-mono">
                      <div className="text-[10px] text-slate-500 uppercase">CALCULATED EDGE</div>
                      <div className="text-base font-bold text-emerald-400">
                        {activeVaultMatch.ev ? activeVaultMatch.ev.trim() : '+14.2% EV'}
                      </div>
                    </div>
                    <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-lg font-mono col-span-2 sm:col-span-1">
                      <div className="text-[10px] text-slate-500 uppercase">DECISION WINDOW</div>
                      <div className="text-base font-bold text-slate-200">
                        {activeVaultMatch.minute || "75' Decision"}
                      </div>
                    </div>
                  </div>
                </div>

                {activeVaultMatch.story && activeVaultMatch.story.length > 0 ? (
                  activeVaultMatch.story.map((st, idx) => (
                    <Step 
                      key={idx}
                      id={idx + 1} 
                      activeStep={activeStep} 
                      title={st.title} 
                      snippet={st.code}
                    >
                      {st.text}
                    </Step>
                  ))
                ) : (
                  <>
                    <Step 
                      id={1} 
                      activeStep={activeStep} 
                      title="1. Discrete Event Ingestion" 
                      snippet={`-- Step 1: Querying spatial feed for ${activeVaultMatch.title}
SELECT event_id, minute, second, type_name, location_x, location_y
FROM StatsBomb_Events 
WHERE match_id = '${activeVaultMatch.id}' AND minute <= 75.0;`}
                    >
                      Ingesting the full granular coordinate stream up to the decision minute. All player actions (passes, duels, pressure sequences) are mapped into discrete coordinate frames on the normalized 120x80 pitch grid.
                    </Step>

                    <Step 
                      id={2} 
                      activeStep={activeStep} 
                      title="2. Continuous Threat Transformation" 
                      snippet={`# Step 2: PitchAleph Threat Tensor Mapping
def compute_continuous_threat(event_stream):
    xt_vector = model.evaluate_spatial_pressure(event_stream)
    rolling_momentum = np.convolve(xt_vector, weights, mode='valid')
    return rolling_momentum[-1]`}
                    >
                      Converting count-level pitch occurrences into continuous expected threat vectors ($xT$). PitchAleph detects micro-shifts in territorial control that lag odds-makers by several minutes.
                    </Step>

                    <Step 
                      id={3} 
                      activeStep={activeStep} 
                      title="3. Algorithmic Screening Gate" 
                      snippet={`{
  "match_id": "${activeVaultMatch.id}",
  "decision_minute": "${activeVaultMatch.minute || "75' Decision"}",
  "model_decision": "${activeVaultMatch.status}",
  "alpha_edge": "${activeVaultMatch.ev ? activeVaultMatch.ev.trim() : '+14.2% EV'}",
  "directive": "${activeVaultMatch.status === 'PASS' ? 'EXECUTE_ORDER' : 'ABORT_FILTER'}"
}`}
                    >
                      {activeVaultMatch.status === 'PASS'
                        ? `At the decision minute, the continuous state met the model's threshold for +EV execution (${activeVaultMatch.ev ? activeVaultMatch.ev.trim() : '+14.2% EV'}), triggering an automated buy signal against lagging sportsbook lines.`
                        : `At the decision minute, high volatility markers breached the safe variance envelope. The Kelly sizing engine executed an abort directive, successfully preventing tail-risk liquidation.`}
                    </Step>
                  </>
                )}

                <div className="pt-8 pb-16">
                  <button 
                    onClick={() => navigateBack('#/vault')}
                    className="w-full py-3.5 px-5 bg-slate-800 hover:bg-slate-700 text-emerald-400 font-mono text-xs sm:text-sm font-bold rounded-lg border border-slate-700 hover:border-emerald-500/50 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <IconArrowLeft className="w-4 h-4" />
                    <span>RETURN TO DATA VAULT</span>
                  </button>
                </div>
              </>
            )}

          </div>
        </div>

        {/* Canvas panel */}
        <div className={`${showCanvas ? 'flex' : 'hidden'} md:flex h-[70vw] md:h-full w-full bg-slate-950 relative border-t md:border-t-0 md:border-l border-slate-800`}>
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

          {/* Loading / Error fallback overlays */}
          {matchDataLoading && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-sm font-mono text-xs text-slate-400 gap-2">
              <span className="w-3 h-3 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin"></span>
              <span>STREAMING SPATIAL EVENTS...</span>
            </div>
          )}

          {matchDataError && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/90 backdrop-blur-sm p-6 text-center font-mono">
              <div className="text-red-400 text-sm font-bold mb-2 flex items-center gap-2">
                <IconWarning className="w-4 h-4 text-red-400" />
                <span>SPATIAL STREAM OFFLINE</span>
              </div>
              <p className="text-xs text-slate-400 max-w-sm mb-4">
                {matchDataError}
              </p>
              <button
                onClick={() => navigateBack('#/')}
                className="px-3 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs border border-slate-700 transition-colors cursor-pointer"
              >
                RETURN TO DASHBOARD
              </button>
            </div>
          )}

          {/* Engine status — top right */}
          <div className="absolute top-3 right-3 text-emerald-400 font-mono text-[10px] sm:text-xs font-bold tracking-widest uppercase z-10">
            ● {activeVaultMatch ? activeVaultMatch.title : `${activeCase} RUNNING`}
          </div>

          {/* Mobile step indicator — top left */}
          <div className="absolute top-3 left-3 md:hidden flex gap-1 z-10">
            {[1, 2, 3, 4].map(s => (
              <div key={s} className={`w-1.5 h-1.5 rounded-full transition-all ${activeStep === s ? 'bg-emerald-400 scale-125' : 'bg-slate-600'}`} />
            ))}
          </div>

          {/* ── Scrub slider bar ── */}
          <div className="absolute bottom-0 left-0 right-0 z-20 bg-slate-950/90 backdrop-blur-sm border-t border-slate-800 px-4 py-3 flex flex-col gap-1.5">
            <div className="flex items-center justify-between mb-0.5">
              <span className="font-mono text-[10px] sm:text-xs text-slate-400 tracking-widest uppercase">
                Scrub Match Timeline
              </span>
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs text-emerald-400 font-bold tabular-nums">
                  {manualMinute !== null ? `${Math.floor(manualMinute)}'` : 'AUTO'}
                </span>
                {manualMinute !== null && (
                  <button
                    onClick={handleAutoResume}
                    className="font-mono text-[10px] px-2 py-0.5 rounded border border-emerald-600 text-emerald-400 hover:bg-emerald-500/20 transition-all tracking-widest cursor-pointer flex items-center gap-1"
                  >
                    <IconPlay className="w-2.5 h-2.5" />
                    <span>AUTO</span>
                  </button>
                )}
              </div>
            </div>
            <input
              type="range"
              min={0}
              max={caseTimeLimit}
              step={0.5}
              value={manualMinute !== null ? manualMinute : 0}
              onChange={(e) => handleScrub(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <div className="flex justify-between font-mono text-[9px] sm:text-[10px] text-slate-600 mt-0.5">
              <span>0'</span>
              <span>{Math.floor(caseTimeLimit / 4)}'</span>
              <span>{Math.floor(caseTimeLimit / 2)}'</span>
              <span>{Math.floor(caseTimeLimit * 3 / 4)}'</span>
              <span>{caseTimeLimit}'</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}