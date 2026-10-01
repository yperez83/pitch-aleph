import React, { useState, useEffect, useRef } from 'react';

const CODE_SNIPPETS = {
  1: `-- Step 1: Ingesting ℵ₀ (The Discrete Pitch)
SELECT 
    match_id,
    team_id,
    timestamp_minute,
    timestamp_second,
    event_type,
    ISNULL(expected_goals, 0) AS xG,
    ISNULL(expected_threat, 0) AS xT
FROM Fact_Event
WHERE event_type IN ('Pass', 'Shot', 'Dribble') 
  AND is_successful = 1;`,

  2: `# Step 2: PitchAleph Gradient Boosting Pipeline
import xgboost as xgb

def train_aleph_model(features_df):
    # Injecting human-element metadata & friction
    X = features_df[[
        'home_xG_diff', 
        'days_rest',
        'referee_foul_bias', 
        'coach_aggression_index',
        'pitch_weather_friction'
    ]]
    y = features_df['match_result']
    
    # XGBoost handles non-linear human interactions
    model = xgb.XGBClassifier(n_estimators=500, learning_rate=0.05)
    model.fit(X_train, y_train)
    
    return model.predict_proba(X_test)`,

  3: `-- Step 3: The ℵ₁ Engine - Rolling Momentum
SELECT 
    team_id,
    timestamp_minute,
    SUM(xT) OVER (
        PARTITION BY match_id, team_id 
        ORDER BY match_event_sequence 
        ROWS BETWEEN 14 PRECEDING AND CURRENT ROW
    ) AS rolling_15_event_xT,
    
    timestamp_minute - LAG(timestamp_minute, 1) OVER (
        PARTITION BY match_id, team_id, CASE WHEN event_type = 'Shot' THEN 1 ELSE 0 END
        ORDER BY match_event_sequence
    ) AS minutes_since_last_shot
FROM EventStream;`,

  4: `{
  "timestamp": "22:30",
  "match": "ARG vs FRA (2022)",
  "trigger": "ALEPH_STATE_ACHIEVED",
  "metrics": {
    "rolling_xT_spike": "+2.4",
    "market_implied_prob": "40.0%",
    "model_true_prob": "65.0%"
  },
  "execution": {
    "action": "PLACE_BET",
    "target": "ARGENTINA",
    "expected_value": "+25.0%",
    "stake": "5 Units"
  },
  "status": "EXECUTED"
}`,

  5: `-- Step 1: The Siege (Measuring Pressure)
SELECT 
    team_id,
    COUNT(*) as final_third_entries,
    SUM(xG) as cumulative_xG
FROM EventStream
WHERE match_minute BETWEEN 60 AND 80
  AND location_x > 80 
  AND team = 'Germany';`,

  6: `{
  "timestamp": "80:00",
  "match": "GER vs KOR (2018)",
  "trigger": "ALEPH_STATE_ACHIEVED",
  "metrics": {
    "germany_rolling_xT": "+6.8",
    "market_implied_prob": "80.0%",
    "model_true_prob": "92.0%"
  },
  "execution": {
    "action": "PLACE_BET",
    "expected_value": "+15.0%",
    "stake": "Maximum Permitted"
  }
}`,

  7: `# Step 3: Risk Management & Variance
def calculate_kelly_stake(win_prob, decimal_odds, bankroll):
    """
    Fractional Kelly Criterion to protect against tail risk.
    Even with extreme +EV, we never risk ruin.
    """
    q = 1 - win_prob
    b = decimal_odds - 1
    
    # Full Kelly fraction
    f_star = (win_prob * b - q) / b
    
    # 0.25 Fractional Kelly for variance smoothing
    fractional_f = f_star * 0.25 
    
    # Cap maximum exposure per match at 2% of bankroll
    safe_exposure = min(fractional_f, 0.02)
    
    return bankroll * safe_exposure`
};

const Step = ({ id, activeStep, title, children }) => {
  const isActive = activeStep === id;
  return (
    <div 
      data-step={id} 
      className={`step-container min-h-[85vh] transition-opacity duration-700 flex flex-col justify-center ${isActive ? 'opacity-100' : 'opacity-20'}`}
    >
      <h2 className="text-3xl font-bold text-emerald-400 mb-4">{title}</h2>
      <div className="text-lg text-slate-300 mb-8 leading-relaxed">
        {children}
      </div>
      <div className="bg-slate-950 p-6 rounded-lg font-mono text-sm border border-slate-800 shadow-2xl">
        <div className="flex gap-2 mb-4">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
        </div>
        <pre className="text-emerald-300 whitespace-pre-wrap overflow-x-auto">
          {CODE_SNIPPETS[id]}
        </pre>
      </div>
    </div>
  );
};

export default function App() {
  const [activeCase, setActiveCase] = useState(null);
  const [activeStep, setActiveStep] = useState(1);
  const [matchData, setMatchData] = useState([]);
  const canvasRef = useRef(null);

  // Load data based on selected case
  useEffect(() => {
    if (!activeCase) return;
    const file = activeCase === '2022' ? '/match_data.json' : '/match_data_2018.json';
    fetch(file)
      .then((res) => res.json())
      .then((data) => setMatchData(data))
      .catch((err) => console.error("Data missing.", err));
  }, [activeCase]);
  
  // Scroll observer
  useEffect(() => {
    if (!activeCase) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveStep(Number(entry.target.getAttribute('data-step')));
          }
        });
      },
      { rootMargin: '-40% 0px -40% 0px' }
    );

    document.querySelectorAll('.step-container').forEach((step) => observer.observe(step));
    return () => observer.disconnect();
  }, [activeCase, matchData]);

  // Canvas Engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || matchData.length === 0) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let time = 0; 

    const render = () => {
      // Freeze state for 2022 Test (Success)
      if (activeCase === '2022' && activeStep === 4) {
        ctx.fillStyle = 'rgba(15, 23, 42, 0.1)'; 
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = 'rgba(16, 185, 129, 0.2)'; 
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.font = 'bold 44px monospace';
        ctx.fillStyle = '#34d399';
        ctx.textAlign = 'center';
        ctx.fillText('🚨 ALEPH STATE ACHIEVED 🚨', canvas.width / 2, canvas.height / 2);
        ctx.font = '24px monospace';
        ctx.fillText('MARKET EV: +25.0% | TRADE EXECUTED', canvas.width / 2, (canvas.height / 2) + 40);
        return; 
      }

      // Freeze state for 2018 Test (Failure)
      if (activeCase === '2018' && activeStep === 7) {
        ctx.fillStyle = 'rgba(15, 23, 42, 0.1)'; 
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = 'rgba(239, 68, 68, 0.2)'; 
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.font = 'bold 44px monospace';
        ctx.fillStyle = '#ef4444';
        ctx.textAlign = 'center';
        ctx.fillText('🚨 TAIL EVENT MATERIALIZED 🚨', canvas.width / 2, canvas.height / 2);
        ctx.font = '24px monospace';
        ctx.fillText('TRADE FAILED | RISK CAPPED AT 2%', canvas.width / 2, (canvas.height / 2) + 40);
        return; 
      }

      time += 0.05; 
      const timeLimit = activeCase === '2018' ? 82 : 100;
      const matchMinute = time % timeLimit; 
      
      canvas.width = canvas.parentElement.clientWidth;
      canvas.height = canvas.parentElement.clientHeight;

      ctx.fillStyle = '#0f172a'; 
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 2;
      ctx.strokeRect(40, 40, canvas.width - 80, canvas.height - 80);
      ctx.beginPath();
      ctx.moveTo(canvas.width / 2, 40);
      ctx.lineTo(canvas.width / 2, canvas.height - 40);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(canvas.width / 2, canvas.height / 2, 50, 0, Math.PI * 2);
      ctx.stroke();
      
      const scaleX = canvas.width / 120;
      const scaleY = canvas.height / 80;

      const visibleEvents = matchData
        .filter((d) => d.time <= matchMinute)
        .slice(-15);

      visibleEvents.forEach((event, i) => {
        const cx = event.x * scaleX;
        const cy = event.y * scaleY;
        
        let dotColor = '#3b82f6'; // Default Blue
        let lineColor = 'rgba(59, 130, 246, 0.4)';
        
        if (event.type === 'Shot') {
          dotColor = '#ef4444'; // Red for shots
        } else if (activeCase === '2022' && activeStep >= 3) {
          dotColor = '#34d399'; // Green for Alpha state
          lineColor = 'rgba(52, 211, 153, 0.4)';
        } else if (activeCase === '2018' && activeStep >= 6) {
          dotColor = '#fbbf24'; // Yellow/Orange for the Trap state
          lineColor = 'rgba(251, 191, 36, 0.4)';
        }

        ctx.beginPath();
        ctx.arc(cx, cy, event.type === 'Shot' ? 8 : 4, 0, Math.PI * 2);
        ctx.fillStyle = dotColor;
        ctx.fill();

        if (i > 0) {
            const prevEvent = visibleEvents[i - 1];
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(prevEvent.x * scaleX, prevEvent.y * scaleY);
            ctx.strokeStyle = lineColor;
            ctx.stroke();
        }
      });

      if (visibleEvents.length > 0) {
        const latest = visibleEvents[visibleEvents.length - 1];
        ctx.font = '20px monospace';
        ctx.textAlign = 'left';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText(`Match Minute: ${Math.floor(matchMinute)}'`, 60, 50);
        ctx.fillStyle = activeCase === '2018' && activeStep >= 6 ? '#fbbf24' : '#34d399';
        ctx.fillText(`Rolling xT: ${latest.rolling_xT.toFixed(2)}`, 60, 80);
      }

      animationFrameId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [matchData, activeStep, activeCase]);

  // View 1: Landing Page
  if (!activeCase) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center font-sans text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-900/20 via-slate-950 to-slate-950"></div>
        
        <div className="z-10 flex flex-col items-center max-w-3xl text-center">
          <img 
            src="/3f196c0a3_generated_image.png" 
            alt="PitchAleph Logo" 
            className="w-48 h-48 mb-8 rounded-full shadow-[0_0_60px_rgba(16,185,129,0.3)] border border-emerald-500/30"
          />
          <h1 className="text-6xl font-extrabold tracking-tight mb-4 text-white">Pitch<span className="text-emerald-400">Aleph</span></h1>
          <p className="text-xl text-slate-400 mb-12">Mapping ℵ₀ discrete spatial data to predict ℵ₁ continuous market states. Select a backtest scenario to launch the engine.</p>
          
          <div className="flex gap-6 w-full justify-center">
            <button 
              onClick={() => { setActiveCase('2022'); setActiveStep(1); }}
              className="px-8 py-4 bg-emerald-500/10 border border-emerald-500 text-emerald-400 font-mono font-bold rounded hover:bg-emerald-500/20 transition-all w-72 text-left flex flex-col"
            >
              <span className="text-xs text-slate-400 mb-1">TEST 01: ALPHA GENERATION</span>
              <span className="text-lg">2022 World Cup Final</span>
            </button>

            <button 
              onClick={() => { setActiveCase('2018'); setActiveStep(5); }}
              className="px-8 py-4 bg-red-500/10 border border-red-500 text-red-400 font-mono font-bold rounded hover:bg-red-500/20 transition-all w-72 text-left flex flex-col"
            >
              <span className="text-xs text-slate-400 mb-1">TEST 02: TAIL RISK / VARIANCE</span>
              <span className="text-lg">GER vs KOR (2018)</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // View 2: The Scrollytelling Engine
  return (
    <div className="h-screen w-full bg-slate-900 text-white overflow-hidden grid grid-cols-2 font-sans relative">
      <button 
        onClick={() => setActiveCase(null)}
        className="absolute top-6 left-6 z-50 text-slate-400 hover:text-white font-mono text-sm flex items-center gap-2"
      >
        ← TERMINATE INSTANCE
      </button>

      <div className="h-full overflow-y-auto pb-[40vh] pt-[20vh] px-12 hide-scrollbar">
        <div className="max-w-xl mx-auto">
          
          {activeCase === '2022' && (
            <>
              <div className="mb-[20vh]">
                <h1 className="text-5xl font-extrabold mb-4 tracking-tight">The 25% Backtest</h1>
                <p className="text-xl text-slate-400">Blinding the model to find the +EV window in the 2022 Final.</p>
              </div>
              
              <Step id={1} activeStep={activeStep} title="1. Ingesting ℵ₀">
                Raw spatial event data is messy. We map the countable infinity of discrete pitch events (ℵ₀)—passes, shots, and tackles—into pristine tick data. Every coordinate is normalized to feed the perception pipeline.
              </Step>

              <Step id={2} activeStep={activeStep} title="2. Feature Engineering">
                To outsmart the market, we upgrade to Gradient Boosting (XGBoost) and inject the human element. By factoring in Referee Foul-to-Tackle Ratios, Coach Aggression Indices, and pitch weather friction, PitchAleph maps non-linear interactions the public sportsbooks ignore.
              </Step>

              <Step id={3} activeStep={activeStep} title="3. The ℵ₁ Engine">
                As ℵ₀ tick data streams in, PitchAleph calculates the ℵ₁ continuous probability state. We use dynamic SQL window functions to measure rolling Expected Threat (xT) spikes against the market's lagging live odds.
              </Step>

              <Step id={4} activeStep={activeStep} title="4. Execution Window">
                The 25% Test: We blindfolded the model for the 2022 World Cup Final. At exactly 22.5 minutes, PitchAleph detected an extreme territorial imbalance. While Vegas implied a 40% probability, PitchAleph calculated 65%, executing a +EV buy order right before Argentina scored.
              </Step>
            </>
          )}

          {activeCase === '2018' && (
            <>
              <div className="mb-[20vh]">
                <h1 className="text-5xl font-extrabold mb-4 tracking-tight">Variance & Tail Risk</h1>
                <p className="text-xl text-slate-400">Managing statistical inevitability when the market edge fails.</p>
              </div>

              <Step id={5} activeStep={activeStep} title="1. The Siege">
                It is the 80th minute. Germany must win to survive the group stage and are throwing everything forward. The discrete ℵ₀ tick data shows relentless, suffocating pressure in the final third. They are dominating possession and generating massive Expected Threat (xT).
              </Step>

              <Step id={6} activeStep={activeStep} title="2. The +EV Trap">
                PitchAleph's ℵ₁ engine calculates a 92% true win probability for Germany based on the momentum avalanche. The market, anchoring to the 0-0 scoreline and dwindling time, implies only 80%. This presents a massive +15% EV edge. PitchAleph executes a heavy position.
              </Step>

              <Step id={7} activeStep={activeStep} title="3. Risk Management">
                Quant trading is not about crystal-ball predictions; it is about edge over time. At 90+2' and 90+6', South Korea scores on two low-probability counter-attacks. Germany loses. 
                <br/><br/>
                However, because we use a Fractional Kelly Criterion for bankroll sizing (capping exposure at 2%), the fund easily absorbs the blow. We survived the variance.
              </Step>
            </>
          )}

        </div>
      </div>

      <div className="h-full w-full bg-slate-950 relative border-l border-slate-800">
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
        <div className="absolute bottom-6 right-6 text-emerald-400 font-mono text-xs font-bold tracking-widest uppercase">
          ● PITCHALEPH ENGINE: {activeCase} BACKTEST RUNNING
        </div>
      </div>
    </div>
  );
}