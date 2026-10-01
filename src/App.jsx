import React, { useState, useEffect, useRef } from 'react';

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

const CALCULATOR_DATA = {
  '2022': {
    title: 'ARG vs FRA (Alpha Generation)',
    marketOdds: '+150 (40% implied)',
    pitchAlephProb: '65.0%',
    ev: '+25.0%',
    publicResult: stake => `Wins $${(stake * 1.5).toLocaleString()} (Lucky bet, negative long-term EV)`,
    pitchAlephResult: stake => `Wins $${(stake * 1.5).toLocaleString()} (Secured massive +EV mathematical edge)`
  },
  'ksa': {
    title: 'KSA vs ARG (Underdog Inefficiency)',
    marketOdds: '+1200 (7.7% implied)',
    pitchAlephProb: '22.0%',
    ev: '+42.0%',
    publicResult: stake => `Loses $${stake.toLocaleString()} (Public heavily backed Argentina at -600)`,
    pitchAlephResult: stake => `Wins $${(stake * 12).toLocaleString()} (Engine correctly bought massive KSA undervaluation)`
  },
  'ned': {
    title: 'NED vs ARG (Volatility Hedging)',
    marketOdds: 'Argentina to win',
    pitchAlephProb: 'Chaotic State (Unmodelable)',
    ev: 'N/A',
    publicResult: stake => `Loses $${stake.toLocaleString()} (NED tied 2-2 in 90+11')`,
    pitchAlephResult: stake => `Locks in $${(stake * 0.4).toLocaleString()} Profit (Engine automatically hedged/cashed out at 80')`
  },
  '2018': {
    title: 'GER vs KOR (Risk Mitigation)',
    marketOdds: '-400 (80% implied)',
    pitchAlephProb: '92.0%',
    ev: '+15.0%',
    publicResult: stake => `Loses full $${stake.toLocaleString()} (Wiped out by black-swan counter-attack)`,
    pitchAlephResult: stake => `Loses only $${(stake * 0.1).toLocaleString()} (Kelly Criterion automatically capped exposure to tail risk)`
  }
};

const Step = ({ id, activeStep, title, snippet, children }) => {
  const isActive = activeStep === id;
  return (
    <div data-step={id} className={`step-container min-h-[85vh] transition-opacity duration-700 flex flex-col justify-center ${isActive ? 'opacity-100' : 'opacity-20'}`}>
      <h2 className="text-3xl font-bold text-emerald-400 mb-4">{title}</h2>
      <div className="text-lg text-slate-300 mb-8 leading-relaxed">{children}</div>
      <div className="bg-slate-950 p-6 rounded-lg font-mono text-sm border border-slate-800 shadow-2xl">
        <div className="flex gap-2 mb-4">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
        </div>
        <pre className="text-emerald-300 whitespace-pre-wrap overflow-x-auto">{snippet}</pre>
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
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!activeCase) return;
    const files = {
      '2022': '/match_data.json',
      '2018': '/match_data_2018.json',
      'ksa': '/match_data_ksa.json',
      'ned': '/match_data_ned.json'
    };
    fetch(files[activeCase])
      .then((res) => res.json())
      .then((data) => setMatchData(data))
      .catch((err) => console.error("Data missing.", err));
  }, [activeCase]);
  
  useEffect(() => {
    if (!activeCase) return;
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

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || matchData.length === 0) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let time = 0; 

    const render = () => {
      // Uniformly freeze on step 4 for all cases
      const isFrozen = activeStep === 4;

      if (!isFrozen) {
        time += 0.05; 
      }
      
      const timeLimit = activeCase === '2018' ? 82 : (activeCase === 'ksa' ? 55 : (activeCase === 'ned' ? 92 : 100));
      const matchMinute = time % timeLimit; 
      
      canvas.width = canvas.parentElement.clientWidth; canvas.height = canvas.parentElement.clientHeight;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = '#1e293b'; ctx.lineWidth = 2;
      ctx.strokeRect(40, 40, canvas.width - 80, canvas.height - 80);
      ctx.beginPath(); ctx.moveTo(canvas.width / 2, 40); ctx.lineTo(canvas.width / 2, canvas.height - 40); ctx.stroke();
      ctx.beginPath(); ctx.arc(canvas.width / 2, canvas.height / 2, 50, 0, Math.PI * 2); ctx.stroke();
      
      const scaleX = canvas.width / 120; const scaleY = canvas.height / 80;
      const visibleEvents = matchData.filter((d) => d.time <= matchMinute).slice(-15);

      visibleEvents.forEach((event, i) => {
        const cx = event.x * scaleX; const cy = event.y * scaleY;
        let dotColor = '#3b82f6'; let lineColor = 'rgba(59, 130, 246, 0.4)';
        
        if (event.type === 'Shot') dotColor = '#ef4444';
        else if (activeCase === '2022' && activeStep >= 3) { dotColor = '#34d399'; lineColor = 'rgba(52, 211, 153, 0.4)'; }
        else if (activeCase === '2018' && activeStep >= 3) { dotColor = '#fbbf24'; lineColor = 'rgba(251, 191, 36, 0.4)'; }
        else if (activeCase === 'ksa' && activeStep >= 3) { dotColor = '#a855f7'; lineColor = 'rgba(168, 85, 247, 0.4)'; }
        else if (activeCase === 'ned' && activeStep >= 3) { dotColor = '#f97316'; lineColor = 'rgba(249, 115, 22, 0.4)'; }

        ctx.beginPath(); ctx.arc(cx, cy, event.type === 'Shot' ? 8 : 4, 0, Math.PI * 2); ctx.fillStyle = dotColor; ctx.fill();
        if (i > 0) {
            const prev = visibleEvents[i - 1];
            ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(prev.x * scaleX, prev.y * scaleY);
            ctx.strokeStyle = lineColor; ctx.stroke();
        }
      });

      if (visibleEvents.length > 0) {
        ctx.font = '20px monospace'; ctx.textAlign = 'left'; ctx.fillStyle = '#94a3b8';
        ctx.fillText(`Match Minute: ${Math.floor(matchMinute)}'`, 60, 50);
      }

      if (isFrozen) {
        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)'; ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.font = 'bold 44px monospace'; ctx.textAlign = 'center';
        
        if (activeCase === '2022') {
          ctx.fillStyle = 'rgba(16, 185, 129, 0.2)'; ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle = '#34d399'; ctx.fillText('🚨 ALEPH STATE ACHIEVED 🚨', canvas.width / 2, canvas.height / 2);
        } else if (activeCase === '2018') {
          ctx.fillStyle = 'rgba(239, 68, 68, 0.2)'; ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle = '#ef4444'; ctx.fillText('🚨 TAIL EVENT MATERIALIZED 🚨', canvas.width / 2, canvas.height / 2);
        } else if (activeCase === 'ksa') {
          ctx.fillStyle = 'rgba(168, 85, 247, 0.2)'; ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle = '#c084fc'; ctx.fillText('🚨 UNDERDOG ALPHA LOCKED 🚨', canvas.width / 2, canvas.height / 2);
        } else if (activeCase === 'ned') {
          ctx.fillStyle = 'rgba(249, 115, 22, 0.2)'; ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle = '#fb923c'; ctx.fillText('🛡️ VOLATILITY HEDGE EXECUTED 🛡️', canvas.width / 2, canvas.height / 2);
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [matchData, activeStep, activeCase]);

  if (!activeCase) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col font-sans text-white relative overflow-y-auto pb-20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-900/20 via-slate-950 to-slate-950 fixed pointer-events-none"></div>
        
        <div className="z-10 flex flex-col items-center max-w-5xl mx-auto text-center mt-20">
          <img src="/3f196c0a3_generated_image.png" alt="PitchAleph Logo" className="w-40 h-40 mb-6 rounded-full shadow-[0_0_60px_rgba(16,185,129,0.3)] border border-emerald-500/30" />
          <h1 className="text-6xl font-extrabold tracking-tight mb-4 text-white">Pitch<span className="text-emerald-400">Aleph</span></h1>
          <p className="text-xl text-slate-400 mb-12 max-w-2xl">A quantitative sports simulation. Mapping ℵ₀ discrete spatial data to predict ℵ₁ continuous market states. Select a backtest scenario to launch the engine.</p>
          
          <div className="grid grid-cols-2 gap-4 w-full justify-center mb-16">
            <button onClick={() => { setActiveCase('2022'); setActiveStep(1); }} className="px-6 py-4 bg-emerald-500/10 border border-emerald-500 text-emerald-400 font-mono font-bold rounded hover:bg-emerald-500/20 text-left flex flex-col transition-all">
              <span className="text-xs text-slate-400 mb-1">TEST 01: ALPHA GENERATION</span>
              <span className="text-lg">ARG vs FRA (2022)</span>
            </button>
            <button onClick={() => { setActiveCase('2018'); setActiveStep(1); }} className="px-6 py-4 bg-red-500/10 border border-red-500 text-red-400 font-mono font-bold rounded hover:bg-red-500/20 text-left flex flex-col transition-all">
              <span className="text-xs text-slate-400 mb-1">TEST 02: TAIL RISK / VARIANCE</span>
              <span className="text-lg">GER vs KOR (2018)</span>
            </button>
            <button onClick={() => { setActiveCase('ksa'); setActiveStep(1); }} className="px-6 py-4 bg-purple-500/10 border border-purple-500 text-purple-400 font-mono font-bold rounded hover:bg-purple-500/20 text-left flex flex-col transition-all">
              <span className="text-xs text-slate-400 mb-1">TEST 03: UNDERDOG INEFFICIENCY</span>
              <span className="text-lg">KSA vs ARG (2022)</span>
            </button>
            <button onClick={() => { setActiveCase('ned'); setActiveStep(1); }} className="px-6 py-4 bg-orange-500/10 border border-orange-500 text-orange-400 font-mono font-bold rounded hover:bg-orange-500/20 text-left flex flex-col transition-all">
              <span className="text-xs text-slate-400 mb-1">TEST 04: DYNAMIC HEDGING</span>
              <span className="text-lg">NED vs ARG (2022)</span>
            </button>
          </div>

          <div className="w-full bg-slate-900 border border-slate-800 rounded-xl p-8 text-left shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-2">The PitchAleph Edge Calculator</h2>
            <p className="text-slate-400 mb-8">See how the engine maximizes profits and minimizes catastrophic losses compared to a standard market bettor.</p>
            
            <div className="grid grid-cols-3 gap-8">
              <div className="col-span-1">
                <label className="block text-emerald-400 font-mono text-sm mb-4">BASE STAKE: ${calcStake.toLocaleString()}</label>
                <input 
                  type="range" min="100" max="10000" step="100" value={calcStake} 
                  onChange={(e) => setCalcStake(Number(e.target.value))}
                  className="w-full accent-emerald-500 mb-8"
                />
                <label className="block text-emerald-400 font-mono text-sm mb-4">SELECT SCENARIO:</label>
                <div className="flex flex-col gap-2">
                  {Object.keys(CALCULATOR_DATA).map(key => (
                    <button 
                      key={key} onClick={() => setCalcCase(key)}
                      className={`text-left px-4 py-2 font-mono text-xs rounded transition-all ${calcCase === key ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                      {CALCULATOR_DATA[key].title}
                    </button>
                  ))}
                </div>
              </div>

              <div className="col-span-2 bg-slate-950 border border-slate-800 rounded p-6 font-mono">
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div>
                    <div className="text-xs text-slate-500 mb-1">MARKET ODDS</div>
                    <div className="text-lg text-slate-300">{CALCULATOR_DATA[calcCase].marketOdds}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 mb-1">PITCHALEPH TRUE PROBABILITY</div>
                    <div className="text-lg text-emerald-400">{CALCULATOR_DATA[calcCase].pitchAlephProb}</div>
                  </div>
                </div>

                <div className="border-t border-slate-800 pt-6 grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-slate-500 mb-2">PUBLIC BETTOR OUTCOME</div>
                    <div className="text-sm text-red-400 leading-relaxed">{CALCULATOR_DATA[calcCase].publicResult(calcStake)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 mb-2">PITCHALEPH ENGINE OUTCOME</div>
                    <div className="text-sm text-emerald-400 leading-relaxed">{CALCULATOR_DATA[calcCase].pitchAlephResult(calcStake)}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-slate-900 text-white overflow-hidden grid grid-cols-2 font-sans relative">
      <button onClick={() => setActiveCase(null)} className="absolute top-6 left-6 z-50 text-slate-400 hover:text-white font-mono text-sm flex items-center gap-2 bg-slate-900/80 px-4 py-2 rounded-full border border-slate-700 transition-all">← RETURN TO TERMINAL</button>
      <div className="h-full overflow-y-auto pb-[40vh] pt-[20vh] px-12 hide-scrollbar relative z-10">
        <div className="max-w-xl mx-auto">
          
          {activeCase === '2022' && (
            <>
              <div className="mb-[20vh]"><h1 className="text-5xl font-extrabold mb-4">The 25% Backtest</h1><p className="text-xl text-slate-400">Blinding the model to find the +EV window in the 2022 Final.</p></div>
              <Step id={1} activeStep={activeStep} title="1. Ingesting ℵ₀" snippet={CODE_SNIPPETS['2022'][1]}>Raw spatial event data is messy. We map the countable infinity of discrete pitch events—passes, shots, tackles—into pristine tick data. Every coordinate is normalized to feed the perception pipeline.</Step>
              <Step id={2} activeStep={activeStep} title="2. Feature Engineering" snippet={CODE_SNIPPETS['2022'][2]}>To outsmart the market, we upgrade to Gradient Boosting (XGBoost) and inject the human element. By factoring in Referee Foul-to-Tackle Ratios and Coach Aggression Indices, PitchAleph maps non-linear interactions public sportsbooks ignore.</Step>
              <Step id={3} activeStep={activeStep} title="3. The ℵ₁ Engine" snippet={CODE_SNIPPETS['2022'][3]}>As ℵ₀ tick data streams in, PitchAleph calculates the ℵ₁ continuous probability state. We use dynamic SQL window functions to measure rolling Expected Threat (xT) spikes against the market's lagging live odds.</Step>
              <Step id={4} activeStep={activeStep} title="4. Execution Window" snippet={CODE_SNIPPETS['2022'][4]}>The 25% Test: We blindfolded the model. At exactly 22.5 minutes, PitchAleph detected an extreme territorial imbalance. While Vegas implied a 40% probability, PitchAleph calculated 65%, executing a +EV buy order right before Argentina scored.</Step>
            </>
          )}

          {activeCase === '2018' && (
            <>
              <div className="mb-[20vh]"><h1 className="text-5xl font-extrabold mb-4">Variance & Tail Risk</h1><p className="text-xl text-slate-400">Managing statistical inevitability when the market edge fails.</p></div>
              <Step id={1} activeStep={activeStep} title="1. The Siege" snippet={CODE_SNIPPETS['2018'][1]}>It is the 80th minute. Germany must win to survive the group stage. The discrete ℵ₀ tick data shows relentless, suffocating pressure in the final third. They are dominating possession and generating massive Expected Threat (xT).</Step>
              <Step id={2} activeStep={activeStep} title="2. The Momentum Avalanche" snippet={CODE_SNIPPETS['2018'][2]}>PitchAleph's ℵ₁ engine tracks a historic spike in attacking momentum. The model proves Germany is breaking through the Korean lines entirely at will. </Step>
              <Step id={3} activeStep={activeStep} title="3. The +EV Trap" snippet={CODE_SNIPPETS['2018'][3]}>The engine calculates a 92% true win probability for Germany based on the momentum. The market implies only 80%. This presents a massive +15% EV edge. PitchAleph takes the position.</Step>
              <Step id={4} activeStep={activeStep} title="4. Risk Management" snippet={CODE_SNIPPETS['2018'][4]}>Quant trading is not about crystal-ball predictions; it is about edge over time. South Korea scores on two low-probability counter-attacks. Germany loses. However, because we use a Fractional Kelly Criterion for bankroll sizing (capping exposure at 2%), the fund easily absorbs the blow. We survived the variance.</Step>
            </>
          )}

          {activeCase === 'ksa' && (
            <>
              <div className="mb-[20vh]"><h1 className="text-5xl font-extrabold mb-4">Underdog Inefficiency</h1><p className="text-xl text-slate-400">Exploiting market anchoring in the biggest upset of 2022.</p></div>
              <Step id={1} activeStep={activeStep} title="1. The Market Anchor" snippet={CODE_SNIPPETS['ksa'][1]}>The public market heavily backed Argentina, assigning them a 92.3% implied win probability. Casual bettors saw Argentina dominating possession and assumed an inevitable blowout.</Step>
              <Step id={2} activeStep={activeStep} title="2. Neutralizing ℵ₀" snippet={CODE_SNIPPETS['ksa'][2]}>PitchAleph's engine flagged an anomaly: Saudi Arabia was running a perfectly synchronized high defensive line, catching Argentina offside repeatedly. This wasn't luck; it was a highly disciplined tactical system entirely neutralizing Argentina's spatial threat.</Step>
              <Step id={3} activeStep={activeStep} title="3. True Probability (ℵ₁)" snippet={CODE_SNIPPETS['ksa'][3]}>By adjusting for the success rate of the offside traps, PitchAleph recalculated the ℵ₁ state. The engine determined Saudi Arabia's defensive block was highly sustainable and that the market was fundamentally mispricing the game.</Step>
              <Step id={4} activeStep={activeStep} title="4. The Underdog Alpha" snippet={CODE_SNIPPETS['ksa'][4]}>At halftime, the market still priced Argentina as heavy -600 favorites. PitchAleph executed a massive +EV buy order on Saudi Arabia at +1200 odds. Just minutes into the second half, KSA scored two rapid-fire goals to win 2-1, cashing a massive underdog ticket.</Step>
            </>
          )}

          {activeCase === 'ned' && (
            <>
              <div className="mb-[20vh]"><h1 className="text-5xl font-extrabold mb-4">Volatility & Hedging</h1><p className="text-xl text-slate-400">Knowing when the predictive models break down.</p></div>
              <Step id={1} activeStep={activeStep} title="1. The Baseline State" snippet={CODE_SNIPPETS['ned'][1]}>For 75 minutes, the Netherlands played a structured, possession-based game. PitchAleph's standard spatial models were accurately predicting match flow and keeping our Argentina position secure.</Step>
              <Step id={2} activeStep={activeStep} title="2. Tactical Rupture" snippet={CODE_SNIPPETS['ned'][2]}>Trailing 2-0, the Netherlands completely abandoned 'Total Football'. They brought on 6-foot-6 striker Wout Weghorst and began launching direct long balls from deep in their own half. The structured game state evaporated.</Step>
              <Step id={3} activeStep={activeStep} title="3. Measuring ℵ₁ Chaos" snippet={CODE_SNIPPETS['ned'][3]}>PitchAleph flagged a "Regime Change." Pass completion rates plummeted, aerial duels skyrocketed, and variance went off the charts. The game devolved into raw physical chaos, meaning all historical predictive probabilities were completely voided.</Step>
              <Step id={4} activeStep={activeStep} title="4. Dynamic Hedging" snippet={CODE_SNIPPETS['ned'][4]}>A core quant principle: Do not trade in chaotic states you cannot model. Sensing extreme volatility, PitchAleph executed an automated hedge. Instead of risking the original Argentina position in a coin-flip scenario, the engine cashed out to lock in a guaranteed profit. Minutes later, the Netherlands scored a miraculous equalizer. The public lost; PitchAleph profited.</Step>
            </>
          )}

        </div>
      </div>
      <div className="h-full w-full bg-slate-950 relative border-l border-slate-800">
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
        <div className="absolute bottom-6 right-6 text-emerald-400 font-mono text-xs font-bold tracking-widest uppercase z-10">● PITCHALEPH ENGINE: {activeCase} BACKTEST RUNNING</div>
      </div>
    </div>
  );
}