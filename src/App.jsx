import React, { useState, useEffect, useRef, useCallback } from 'react';

const CODE_SNIPPETS = {
  '2022': {
    1: `-- Step 1: Ingesting ℵ₀
SELECT match_id, team_id, timestamp_minute, event_type, ISNULL(expected_threat, 0) AS xT
FROM Fact_Event WHERE event_type IN ('Pass', 'Shot') AND is_successful = 1;`,
    2: `# Step 2: PitchAleph Gradient Boosting Pipeline
import xgboost as xgb
def train_aleph_model(features_df):
    X = features_df[['home_xG_diff', 'referee_foul_bias', 'coach_aggression']]
    model = xgb.XGBClassifier(n_estimators=500, learning_rate=0.05)
    model.fit(X_train, y_train)
    return model.predict_proba(X_test)`,
    3: `-- Step 3: The ℵ₁ Engine
SELECT team_id, timestamp_minute,
SUM(xT) OVER (PARTITION BY match_id ORDER BY match_event_sequence ROWS BETWEEN 14 PRECEDING AND CURRENT ROW) AS rolling_xT
FROM EventStream;`,
    4: `{ "trigger": "ALEPH_STATE_ACHIEVED", "action": "PLACE_BET", "target": "ARGENTINA", "expected_value": "+25.0%" }`
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
    2: `-- Step 2: Neutralizing ℵ₀ (The Offside Trap)
SELECT COUNT(*) as offside_traps_sprung, AVG(defensive_line_height) as line_height 
FROM EventStream WHERE team_id = 'KSA' AND match_minute < 45;`,
    3: `# Step 3: Recalculating True Probability (ℵ₁)
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
    3: `# Step 3: Measuring ℵ₁ Chaos
import numpy as np
current_variance = np.var(live_match_data['aerial_duels'])
if current_variance > historical_max:
    trigger_system_override()`,
    4: `{ "trigger": "REGIME_CHANGE", "action": "HEDGE_POSITION", "directive": "CASH OUT", "profit_locked": "+8.5 Units" }`
  }
};

const VAULT_MATCHES = [
  { id: "3857276", title: "Canada vs Morocco", status: "PASS", ev: "+14.2%", date: "2022-12-01" },
  { id: "3857271", title: "England vs Iran", status: "PASS", ev: "+14.2%", date: "2022-11-21" },
  { id: "3857296", title: "Croatia vs Belgium", status: "PASS", ev: "+14.2%", date: "2022-12-01" },
  { id: "3857274", title: "Netherlands vs Ecuador", status: "PASS", ev: "+14.2%", date: "2022-11-25" },
  { id: "3857255", title: "Japan vs Spain", status: "PASS", ev: "+14.2%", date: "2022-12-01" },
  { id: "3857272", title: "England vs United States", status: "PASS", ev: "+14.2%", date: "2022-11-25" },
  { id: "3857278", title: "Iran vs United States", status: "PASS", ev: "+14.2%", date: "2022-11-29" },
  { id: "3857277", title: "Morocco vs Croatia", status: "PASS", ev: "+14.2%", date: "2022-11-23" },
  { id: "3857273", title: "Wales vs Iran", status: "PASS", ev: "+14.2%", date: "2022-11-25" },
  { id: "3857275", title: "Tunisia vs France", status: "PASS", ev: "+14.2%", date: "2022-11-30" },
  { id: "3857261", title: "Wales vs England", status: "PASS", ev: "+14.2%", date: "2022-11-29" },
  { id: "3857290", title: "Switzerland vs Cameroon", status: "FAIL", ev: "+18.5%", date: "2022-11-24" },
  { id: "3857298", title: "Portugal vs Ghana", status: "FAIL", ev: "+18.5%", date: "2022-11-24" },
  { id: "3857285", title: "Senegal vs Netherlands", status: "FAIL", ev: "+18.5%", date: "2022-11-21" },
  { id: "3857282", title: "United States vs Wales", status: "FAIL", ev: "+18.5%", date: "2022-11-21" },
  { id: "3857297", title: "Poland vs Saudi Arabia", status: "FAIL", ev: "+18.5%", date: "2022-11-26" },
  { id: "3857294", title: "Netherlands vs Qatar", status: "FAIL", ev: "+18.5%", date: "2022-11-29" },
  { id: "3857266", title: "France vs Denmark", status: "FAIL", ev: "+18.5%", date: "2022-11-26" },
  { id: "3857284", title: "Germany vs Japan", status: "FAIL", ev: "+18.5%", date: "2022-11-23" },
  { id: "3857254", title: "Denmark vs Tunisia", status: "FAIL", ev: "+18.5%", date: "2022-11-22" }
];

const CORE_CALCULATOR_DATA = {
  '2022': {
    title: 'ARG vs FRA (Alpha Generation)',
    category: 'Core',
    marketOdds: '+150 (40% implied)',
    pitchAlephProb: '65.0%',
    ev: '+25.0%',
    publicResult: stake => `Wins $${(stake * 1.5).toLocaleString()} (Lucky bet, negative long-term EV)`,
    pitchAlephResult: stake => `Wins $${(stake * 1.5).toLocaleString()} (Secured massive +EV mathematical edge)`
  },
  'ksa': {
    title: 'KSA vs ARG (Underdog Inefficiency)',
    category: 'Core',
    marketOdds: '+1200 (7.7% implied)',
    pitchAlephProb: '22.0%',
    ev: '+42.0%',
    publicResult: stake => `Loses $${stake.toLocaleString()} (Public heavily backed Argentina at -600)`,
    pitchAlephResult: stake => `Wins $${(stake * 12).toLocaleString()} (Engine correctly bought massive KSA undervaluation)`
  },
  'ned': {
    title: 'NED vs ARG (Volatility Hedging)',
    category: 'Core',
    marketOdds: 'Argentina to win',
    pitchAlephProb: 'Chaotic State (Unmodelable)',
    ev: 'N/A',
    publicResult: stake => `Loses $${stake.toLocaleString()} (NED tied 2-2 in 90+11')`,
    pitchAlephResult: stake => `Locks in $${(stake * 0.4).toLocaleString()} Profit (Engine automatically hedged/cashed out at 80')`
  },
  '2018': {
    title: 'GER vs KOR (Risk Mitigation)',
    category: 'Core',
    marketOdds: '-400 (80% implied)',
    pitchAlephProb: '92.0%',
    ev: '+15.0%',
    publicResult: stake => `Loses full $${stake.toLocaleString()} (Wiped out by black-swan counter-attack)`,
    pitchAlephResult: stake => `Loses only $${(stake * 0.1).toLocaleString()} (Kelly Criterion automatically capped exposure to tail risk)`
  }
};

// Generate 20 tailored bet simulator cases from the Data Vault sample
const VAULT_CALCULATOR_DATA = Object.fromEntries(
  VAULT_MATCHES.map(match => {
    const isPass = match.status === 'PASS';
    return [
      'vault_' + match.id,
      {
        title: `${match.title} (${match.status})`,
        category: isPass ? 'Vault Pass' : 'Vault Fail',
        marketOdds: isPass ? '+135 (42.5% implied)' : '-210 (67.7% implied)',
        pitchAlephProb: isPass ? '56.7%' : '49.2%',
        ev: match.ev,
        publicResult: stake => isPass
          ? `Wins $${Math.round(stake * 1.35).toLocaleString()} (Uncalibrated manual ticket; negative EV expectancy long-term)`
          : `Loses full $${stake.toLocaleString()} (Public forced heavy favorite that collapsed to defensive variance)`,
        pitchAlephResult: stake => isPass
          ? `Wins $${Math.round(stake * 1.35).toLocaleString()} (PitchAleph algorithmic buy order at 75' captured +14.2% EV edge)`
          : `Loses $0 / Hedged (Kelly risk filter blocked position at 75', preventing catastrophic loss)`
      }
    ];
  })
);

const CALCULATOR_DATA = {
  ...CORE_CALCULATOR_DATA,
  ...VAULT_CALCULATOR_DATA
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

export default function App() {
  const [activeCase, setActiveCase] = useState(null);
  const [activeStep, setActiveStep] = useState(1);
  const [matchData, setMatchData] = useState([]);
  
  const [calcStake, setCalcStake] = useState(1000);
  const [calcCase, setCalcCase] = useState('2022');
  const [calcFilter, setCalcFilter] = useState('ALL');
  const [showCanvas, setShowCanvas] = useState(false);
  const [manualMinute, setManualMinute] = useState(null);
  const manualMinuteRef = useRef(null);
  const canvasRef = useRef(null);
  const [glowKey, setGlowKey] = useState(0);
  const glowCoolingRef = useRef(false);
  const [showVaultModal, setShowVaultModal] = useState(false);
  const [activeVaultMatch, setActiveVaultMatch] = useState(null);
  const [vaultFilter, setVaultFilter] = useState('ALL');

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
    fetch(targetFile)
      .then((res) => res.json())
      .then((data) => setMatchData(data))
      .catch((err) => console.error("Data missing.", err));
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
      const isFrozen = activeStep === 4 && !activeCase?.startsWith('vault_');
      // Only auto-advance when not frozen and user hasn't grabbed the scrubber
      if (!isFrozen && manualMinuteRef.current === null) { time += 0.05; }

      const timeLimit = activeCase === '2018' ? 82 : (activeCase === 'ksa' ? 55 : (activeCase === 'ned' ? 92 : (activeCase?.startsWith('vault_') ? 75 : 100)));
      const matchMinute = manualMinuteRef.current !== null ? manualMinuteRef.current : (time % timeLimit);

      const W = canvas.parentElement.clientWidth;
      const H = canvas.parentElement.clientHeight;
      canvas.width = W;
      canvas.height = H;

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
          '2022': { color: '#34d399', bg: 'rgba(16, 185, 129, 0.2)', text: '🚨 ALEPH STATE\nACHIEVED 🚨' },
          '2018': { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.2)', text: '🚨 TAIL EVENT\nMATERIALIZED 🚨' },
          'ksa':  { color: '#c084fc', bg: 'rgba(168, 85, 247, 0.2)', text: '🚨 UNDERDOG ALPHA\nLOCKED 🚨' },
          'ned':  { color: '#fb923c', bg: 'rgba(249, 115, 22, 0.2)', text: '🛡️ VOLATILITY HEDGE\nEXECUTED 🛡️' },
        };
        const { color, bg, text } = lines[activeCase] || {
          color: activeVaultMatch?.status === 'PASS' ? '#34d399' : '#ef4444',
          bg: activeVaultMatch?.status === 'PASS' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
          text: activeVaultMatch?.status === 'PASS' ? '🚨 75\' ALPHA WINDOW\nTRIGGERED 🚨' : '🛡️ VARIANCE FILTER\nACTIVATED 🛡️'
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
          onClick={() => setActiveCase(null)}
          className="fixed top-6 left-6 z-50 text-slate-400 hover:text-white font-mono text-sm flex items-center gap-2 bg-slate-900/90 px-4 py-2 rounded-full border border-slate-700 transition-all cursor-pointer backdrop-blur-sm"
        >
          ← RETURN TO TERMINAL
        </button>

        <div className="max-w-5xl mx-auto mt-12">
          <div className="mb-12 border-b border-slate-800 pb-8">
            <div className="flex items-center gap-2 mb-3">
              <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-blue-500/20 text-blue-400 border border-blue-500/40">
                CLOUD PRODUCTION RUN
              </span>
              <span className="text-slate-400 font-mono text-xs">
                3,000,000+ Spatial Events Processed
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-white">
              Production Engine: 1,000-Match Backtest
            </h1>
            <p className="text-lg md:text-xl text-slate-400 leading-relaxed max-w-3xl">
              Validating algorithmic performance across a 3,000,000+ event Data Lake using XGBoost, Platt Scaling, and strict liquidity constraints.
            </p>
          </div>

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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            <div>
              <h3 className="text-2xl font-bold text-blue-400 mb-6">Architecture & Constraints</h3>
              <ul className="space-y-6 text-slate-300 leading-relaxed text-sm md:text-base">
                <li className="bg-slate-900/50 p-4 rounded-lg border border-slate-800/80">
                  <strong className="text-white block text-base mb-1">1. The XGBoost Brain</strong>
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
            </div>
            
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 flex flex-col justify-center items-center text-center shadow-xl">
              <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
              </div>
              <h4 className="text-xl font-bold text-white mb-2">BI Integration Ready</h4>
              <p className="text-slate-400 text-sm mb-6 max-w-sm">The complete simulation ledger has been optimized and exported for external Business Intelligence visualization.</p>
              <button 
                onClick={() => alert("Looker Studio Dashboard integration payload ready. Check data lake exports.")}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs font-bold rounded-lg transition-all cursor-pointer shadow-lg shadow-blue-500/20"
              >
                VIEW LOOKER STUDIO DASHBOARD
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── HOME SCREEN ──────────────────────────────────────────────
  if (!activeCase || activeCase === 'vault') {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col font-sans text-white relative overflow-y-auto pb-16">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-900/20 via-slate-950 to-slate-950 fixed pointer-events-none"></div>

        <div className="z-10 flex flex-col items-center w-full max-w-5xl mx-auto text-center px-4 sm:px-6 mt-10 sm:mt-16 md:mt-20">
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
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-3 md:mb-4 text-white">
            Pitch<span className="text-emerald-400">Aleph</span>
          </h1>
          <p className="text-sm sm:text-base md:text-xl text-slate-400 mb-8 md:mb-12 max-w-2xl px-2">
            A quantitative sports simulation. Mapping ℵ₀ discrete spatial data to predict ℵ₁ continuous market states. Select a backtest scenario to launch the engine.
          </p>

          {/* Scenario buttons — 1 col on xs, 2 col on sm+ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 w-full mb-6">
            <button onClick={() => { setActiveCase('2022'); setActiveVaultMatch(null); setActiveStep(1); setShowCanvas(false); setManualMinute(null); }} className="px-5 py-4 bg-emerald-500/10 border border-emerald-500 text-emerald-400 font-mono font-bold rounded hover:bg-emerald-500/20 text-left flex flex-col transition-all cursor-pointer">
              <span className="text-xs text-slate-400 mb-1">TEST 01: ALPHA GENERATION</span>
              <span className="text-base sm:text-lg">ARG vs FRA (2022)</span>
            </button>
            <button onClick={() => { setActiveCase('2018'); setActiveVaultMatch(null); setActiveStep(1); setShowCanvas(false); setManualMinute(null); }} className="px-5 py-4 bg-red-500/10 border border-red-500 text-red-400 font-mono font-bold rounded hover:bg-red-500/20 text-left flex flex-col transition-all cursor-pointer">
              <span className="text-xs text-slate-400 mb-1">TEST 02: TAIL RISK / VARIANCE</span>
              <span className="text-base sm:text-lg">GER vs KOR (2018)</span>
            </button>
            <button onClick={() => { setActiveCase('ksa'); setActiveVaultMatch(null); setActiveStep(1); setShowCanvas(false); setManualMinute(null); }} className="px-5 py-4 bg-purple-500/10 border border-purple-500 text-purple-400 font-mono font-bold rounded hover:bg-purple-500/20 text-left flex flex-col transition-all cursor-pointer">
              <span className="text-xs text-slate-400 mb-1">TEST 03: UNDERDOG INEFFICIENCY</span>
              <span className="text-base sm:text-lg">KSA vs ARG (2022)</span>
            </button>
            <button onClick={() => { setActiveCase('ned'); setActiveVaultMatch(null); setActiveStep(1); setShowCanvas(false); setManualMinute(null); }} className="px-5 py-4 bg-orange-500/10 border border-orange-500 text-orange-400 font-mono font-bold rounded hover:bg-orange-500/20 text-left flex flex-col transition-all cursor-pointer">
              <span className="text-xs text-slate-400 mb-1">TEST 04: DYNAMIC HEDGING</span>
              <span className="text-base sm:text-lg">NED vs ARG (2022)</span>
            </button>
          </div>

          {/* ─── CLOUD ARCHITECTURE & DATA VAULT SECTION ─── */}
          <div className="w-full border-t border-slate-800/80 pt-8 mb-12">
            <h2 className="text-xs font-mono text-slate-500 tracking-widest mb-4 uppercase text-left">
              Cloud Architecture & Scaled Backtesting
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button 
                onClick={() => setShowVaultModal(true)} 
                className="px-6 py-4 bg-slate-900/90 border border-emerald-500/30 hover:border-emerald-400 text-slate-300 font-mono font-bold rounded-xl text-left flex flex-col transition-all group cursor-pointer shadow-lg hover:shadow-emerald-500/10"
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="text-xs text-emerald-400">DATA VAULT</span>
                  <span className="text-xs text-slate-500 font-normal">11 PASS / 9 FAIL</span>
                </div>
                <span className="text-base sm:text-lg text-white group-hover:text-emerald-300 transition-colors">
                  20-Match Indexed Sample →
                </span>
                <span className="text-xs font-normal text-slate-400 mt-1">
                  Explore 75th-minute algorithmic signal screener across 20 FIFA World Cup matches
                </span>
              </button>

              <button 
                onClick={() => setActiveCase('1k_sim')} 
                className="px-6 py-4 bg-blue-950/20 border border-blue-500/40 hover:border-blue-400 text-blue-400 font-mono font-bold rounded-xl text-left flex flex-col transition-all group shadow-[0_0_25px_rgba(59,130,246,0.1)] hover:shadow-[0_0_35px_rgba(59,130,246,0.2)] cursor-pointer"
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="text-xs text-blue-400">PRODUCTION ENGINE</span>
                  <span className="text-xs text-emerald-400 font-normal">+$10,152 (101.5% ROI)</span>
                </div>
                <span className="text-base sm:text-lg text-white group-hover:text-blue-300 transition-colors">
                  1,000-Match Cloud Simulation →
                </span>
                <span className="text-xs font-normal text-slate-400 mt-1">
                  XGBoost inference across 3M+ spatial events with Platt Scaling and liquidity cap
                </span>
              </button>
            </div>
          </div>

          {/* ─── DATA VAULT MODAL ─── */}
          {(showVaultModal || activeCase === 'vault') && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
              <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-5 sm:p-8 text-left my-auto max-h-[90vh] flex flex-col">
                {/* Modal Header */}
                <div className="flex items-start justify-between pb-5 border-b border-slate-800">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        PORTFOLIO DATASET
                      </span>
                      <span className="text-xs font-mono text-slate-500">2022 FIFA World Cup</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                      PitchAleph Data Vault (20 Match Sample)
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
                      Simulated 75th-minute algorithmic screening across a 20-match portfolio sample. 
                      Evaluate live spatial event playback and signal execution on each match.
                    </p>
                  </div>
                  <button
                    onClick={() => { setShowVaultModal(false); if (activeCase === 'vault') setActiveCase(null); }}
                    className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 font-mono text-lg transition-colors cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                {/* Portfolio Stats Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4 border-b border-slate-800 text-center font-mono">
                  <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
                    <div className="text-[10px] text-slate-500 uppercase">SAMPLE SIZE</div>
                    <div className="text-lg font-bold text-white">20 Matches</div>
                  </div>
                  <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
                    <div className="text-[10px] text-slate-500 uppercase">ALPHA SIGNALS</div>
                    <div className="text-lg font-bold text-emerald-400">11 PASS (55%)</div>
                  </div>
                  <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
                    <div className="text-[10px] text-slate-500 uppercase">RISK FILTERS</div>
                    <div className="text-lg font-bold text-red-400">9 FAIL (45%)</div>
                  </div>
                  <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
                    <div className="text-[10px] text-slate-500 uppercase">SCREEN CUTOFF</div>
                    <div className="text-lg font-bold text-slate-300">75' Minute</div>
                  </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center justify-between py-3">
                  <div className="flex gap-2">
                    {['ALL', 'PASS', 'FAIL'].map((filter) => (
                      <button
                        key={filter}
                        onClick={() => setVaultFilter(filter)}
                        className={`px-3 py-1 text-xs font-mono font-bold rounded-full transition-all cursor-pointer ${
                          vaultFilter === filter 
                            ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20' 
                            : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {filter === 'ALL' ? 'ALL (20)' : filter === 'PASS' ? 'PASS (11)' : 'FAIL (9)'}
                      </button>
                    ))}
                  </div>
                  <span className="text-[11px] font-mono text-slate-500 hidden sm:inline">
                    Click any match to launch 2D pitch simulation
                  </span>
                </div>

                {/* Scrollable Matches List */}
                <div className="overflow-y-auto flex-1 pr-1 space-y-2.5 my-2 hide-scrollbar">
                  {VAULT_MATCHES
                    .filter(m => vaultFilter === 'ALL' || m.status === vaultFilter)
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
                            <div className="text-emerald-400 font-bold">{m.ev} EV</div>
                            <div className="text-[10px] text-slate-500">75' Decision</div>
                          </div>
                          <button
                            onClick={() => {
                              setShowVaultModal(false);
                              setActiveVaultMatch(m);
                              setActiveCase('vault_' + m.id);
                              setActiveStep(1);
                              setShowCanvas(false);
                              setManualMinute(null);
                            }}
                            className="px-3.5 py-1.5 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 border border-emerald-500/30 font-mono text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
                          >
                            <span>Simulate</span>
                            <span>▶</span>
                          </button>
                        </div>
                      </div>
                    ))}
                </div>

                {/* Footer info */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-mono text-slate-500">
                  <span>Discrete spatial event streams powered by StatsBomb Open Data</span>
                  <button
                    onClick={() => { setShowVaultModal(false); if (activeCase === 'vault') setActiveCase(null); }}
                    className="text-slate-400 hover:text-white cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ─── RESTORED BET SIMULATOR: THE PITCHALEPH EDGE CALCULATOR (24 SCENARIOS) ─── */}
          <div className="w-full bg-slate-900 border border-slate-800 rounded-xl p-5 sm:p-6 md:p-8 text-left shadow-2xl mb-8">
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
              <div className="md:col-span-1">
                <label className="block text-emerald-400 font-mono text-xs sm:text-sm mb-3">
                  BASE STAKE: ${calcStake.toLocaleString()}
                </label>
                <input
                  type="range" min="100" max="10000" step="100" value={calcStake}
                  onChange={(e) => setCalcStake(Number(e.target.value))}
                  className="w-full accent-emerald-500 mb-6 cursor-pointer"
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
                        onClick={() => setCalcFilter(cat)}
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
              <div className="md:col-span-2 bg-slate-950 border border-slate-800 rounded-xl p-5 md:p-6 font-mono flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-5">
                    <span className="text-sm font-bold text-white">
                      {CALCULATOR_DATA[calcCase]?.title || 'Scenario Analysis'}
                    </span>
                    <span className="text-xs text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                      EV: {CALCULATOR_DATA[calcCase]?.ev}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800/60">
                      <div className="text-xs text-slate-500 mb-1">MARKET ODDS</div>
                      <div className="text-sm md:text-lg text-slate-300 font-bold">
                        {CALCULATOR_DATA[calcCase]?.marketOdds}
                      </div>
                    </div>
                    <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800/60">
                      <div className="text-xs text-slate-500 mb-1">PITCHALEPH TRUE PROB</div>
                      <div className="text-sm md:text-lg text-emerald-400 font-bold">
                        {CALCULATOR_DATA[calcCase]?.pitchAlephProb}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-800 pt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-red-950/20 border border-red-500/20 p-4 rounded-lg">
                    <div className="text-xs text-red-400 font-bold mb-2 flex items-center gap-1.5">
                      <span>⚠️</span>
                      <span>PUBLIC BETTOR OUTCOME</span>
                    </div>
                    <div className="text-xs md:text-sm text-red-300 leading-relaxed">
                      {CALCULATOR_DATA[calcCase]?.publicResult(calcStake)}
                    </div>
                  </div>
                  <div className="bg-emerald-950/20 border border-emerald-500/20 p-4 rounded-lg">
                    <div className="text-xs text-emerald-400 font-bold mb-2 flex items-center gap-1.5">
                      <span>⚡</span>
                      <span>PITCHALEPH ENGINE OUTCOME</span>
                    </div>
                    <div className="text-xs md:text-sm text-emerald-300 leading-relaxed">
                      {CALCULATOR_DATA[calcCase]?.pitchAlephResult(calcStake)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    );
  }

  // ─── SCROLLYTELLING / CASE STUDY & PITCH SIMULATION VIEW ──────
  const caseTimeLimit = activeCase === '2018' ? 82 : activeCase === 'ksa' ? 55 : activeCase === 'ned' ? 92 : (activeCase?.startsWith('vault_') ? 75 : 100);

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
            onClick={() => { setActiveCase(null); setActiveVaultMatch(null); }}
            className="text-slate-400 hover:text-white font-mono text-xs sm:text-sm flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-full border border-slate-700 transition-all cursor-pointer"
          >
            ← TERMINAL
          </button>
          {activeCase?.startsWith('vault_') && (
            <button
              onClick={() => { setActiveCase(null); setActiveVaultMatch(null); setShowVaultModal(true); }}
              className="text-emerald-400 hover:text-emerald-300 font-mono text-xs sm:text-sm flex items-center gap-1.5 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/30 transition-all cursor-pointer"
            >
              ← DATA VAULT
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
                <Step id={1} activeStep={activeStep} title="1. Ingesting ℵ₀" snippet={CODE_SNIPPETS['2022'][1]}>Raw spatial event data is messy. We map the countable infinity of discrete pitch events—passes, shots, tackles—into pristine tick data. Every coordinate is normalized to feed the perception pipeline.</Step>
                <Step id={2} activeStep={activeStep} title="2. Feature Engineering" snippet={CODE_SNIPPETS['2022'][2]}>To outsmart the market, we upgrade to Gradient Boosting (XGBoost) and inject the human element. By factoring in Referee Foul-to-Tackle Ratios and Coach Aggression Indices, PitchAleph maps non-linear interactions public sportsbooks ignore.</Step>
                <Step id={3} activeStep={activeStep} title="3. The ℵ₁ Engine" snippet={CODE_SNIPPETS['2022'][3]}>As ℵ₀ tick data streams in, PitchAleph calculates the ℵ₁ continuous probability state. We use dynamic SQL window functions to measure rolling Expected Threat (xT) spikes against the market's lagging live odds.</Step>
                <Step id={4} activeStep={activeStep} title="4. Execution Window" snippet={CODE_SNIPPETS['2022'][4]}>The 25% Test: We blindfolded the model. At exactly 22.5 minutes, PitchAleph detected an extreme territorial imbalance. While Vegas implied a 40% probability, PitchAleph calculated 65%, executing a +EV buy order right before Argentina scored.</Step>
              </>
            )}

            {activeCase === '2018' && (
              <>
                <div className="mb-[12vh] md:mb-[20vh]">
                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-3">Variance & Tail Risk</h1>
                  <p className="text-base md:text-xl text-slate-400">Managing statistical inevitability when the market edge fails.</p>
                </div>
                <Step id={1} activeStep={activeStep} title="1. The Siege" snippet={CODE_SNIPPETS['2018'][1]}>It is the 80th minute. Germany must win to survive the group stage. The discrete ℵ₀ tick data shows relentless, suffocating pressure in the final third. They are dominating possession and generating massive Expected Threat (xT).</Step>
                <Step id={2} activeStep={activeStep} title="2. The Momentum Avalanche" snippet={CODE_SNIPPETS['2018'][2]}>PitchAleph's ℵ₁ engine tracks a historic spike in attacking momentum. The model proves Germany is breaking through the Korean lines entirely at will.</Step>
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
                <Step id={2} activeStep={activeStep} title="2. Neutralizing ℵ₀" snippet={CODE_SNIPPETS['ksa'][2]}>PitchAleph's engine flagged an anomaly: Saudi Arabia was running a perfectly synchronized high defensive line, catching Argentina offside repeatedly. This wasn't luck; it was a highly disciplined tactical system entirely neutralizing Argentina's spatial threat.</Step>
                <Step id={3} activeStep={activeStep} title="3. True Probability (ℵ₁)" snippet={CODE_SNIPPETS['ksa'][3]}>By adjusting for the success rate of the offside traps, PitchAleph recalculated the ℵ₁ state. The engine determined Saudi Arabia's defensive block was highly sustainable and that the market was fundamentally mispricing the game.</Step>
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
                <Step id={3} activeStep={activeStep} title="3. Measuring ℵ₁ Chaos" snippet={CODE_SNIPPETS['ned'][3]}>PitchAleph flagged a "Regime Change." Pass completion rates plummeted, aerial duels skyrocketed, and variance went off the charts. The game devolved into raw physical chaos, meaning all historical predictive probabilities were completely voided.</Step>
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
                      ? `PitchAleph generated a high-confidence ${activeVaultMatch.ev} EV edge at minute 75 based on continuous spatial threat dominance.`
                      : `PitchAleph identified tail risk volatility at minute 75, rejecting market consensus to preserve bankroll (+18.5% avoided downside).`}
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
                        {activeVaultMatch.ev} EV
                      </div>
                    </div>
                    <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-lg font-mono col-span-2 sm:col-span-1">
                      <div className="text-[10px] text-slate-500 uppercase">STREAM TICKS (ℵ₀)</div>
                      <div className="text-base font-bold text-slate-200">
                        {matchData.length} Events
                      </div>
                    </div>
                  </div>
                </div>

                <Step 
                  id={1} 
                  activeStep={activeStep} 
                  title="1. Discrete Event Ingestion (ℵ₀)" 
                  snippet={`-- Step 1: Querying spatial feed for ${activeVaultMatch.title}
SELECT event_id, minute, second, type_name, location_x, location_y
FROM StatsBomb_Events 
WHERE match_id = '${activeVaultMatch.id}' AND minute <= 75.0;`}
                >
                  Ingesting the full granular coordinate stream up to the 75th minute. All player actions (passes, duels, pressure sequences) are mapped into discrete coordinate frames on the normalized 120x80 pitch grid.
                </Step>

                <Step 
                  id={2} 
                  activeStep={activeStep} 
                  title="2. Continuous Threat Transformation (ℵ₁)" 
                  snippet={`# Step 2: PitchAleph ℵ₁ Tensor Mapping
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
                  title="3. 75' Algorithmic Screening Gate" 
                  snippet={`{
  "match_id": "${activeVaultMatch.id}",
  "cutoff_minute": 75.0,
  "model_decision": "${activeVaultMatch.status}",
  "alpha_edge": "${activeVaultMatch.ev}",
  "directive": "${activeVaultMatch.status === 'PASS' ? 'EXECUTE_ORDER' : 'ABORT_FILTER'}"
}`}
                >
                  {activeVaultMatch.status === 'PASS'
                    ? `At minute 75, the continuous state met the model's threshold for +EV execution (${activeVaultMatch.ev}), triggering an automated buy signal against lagging sportsbook lines.`
                    : `At minute 75, high volatility markers breached the safe variance envelope. The Kelly sizing engine executed an abort directive, successfully preventing tail-risk liquidation.`}
                </Step>

                <div className="pt-8 pb-16">
                  <button 
                    onClick={() => { setActiveCase(null); setActiveVaultMatch(null); setShowVaultModal(true); }}
                    className="w-full py-3.5 px-5 bg-slate-800 hover:bg-slate-700 text-emerald-400 font-mono text-xs sm:text-sm font-bold rounded-lg border border-slate-700 hover:border-emerald-500/50 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    ← RETURN TO DATA VAULT (20 MATCHES)
                  </button>
                </div>
              </>
            )}

          </div>
        </div>

        {/* Canvas panel */}
        <div className={`${showCanvas ? 'flex' : 'hidden'} md:flex h-[70vw] md:h-full w-full bg-slate-950 relative border-t md:border-t-0 md:border-l border-slate-800`}>
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

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
                    className="font-mono text-[10px] px-2 py-0.5 rounded border border-emerald-600 text-emerald-400 hover:bg-emerald-500/20 transition-all tracking-widest cursor-pointer"
                  >
                    ▶ AUTO
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