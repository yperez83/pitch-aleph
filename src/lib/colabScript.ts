export function generateColabScript({
  homeTeam,
  awayTeam,
  targetOddsId,
  targetSportsId,
  oddsApiKey,
  apiFootballKey
}: {
  homeTeam: string;
  awayTeam: string;
  targetOddsId: string;
  targetSportsId: number | string;
  oddsApiKey: string;
  apiFootballKey: string;
}): string {
  const sportsIdNum = Number(targetSportsId) || 0;

  return `# ==============================================================
# PitchAleph 1.2 — Autonomous Live Match Monitor
# Target: ${homeTeam} vs ${awayTeam}
# Dynamic Odds ID: ${targetOddsId}
# API-Sports ID:  ${targetSportsId}
# ==============================================================
!pip install -q requests pandas huggingface_hub joblib scikit-learn xgboost

import io
import time
import requests
import pandas as pd
import joblib
from huggingface_hub import hf_hub_download
from sklearn.frozen import FrozenEstimator

THE_ODDS_API_KEY = "${oddsApiKey}"
API_FOOTBALL_KEY = "${apiFootballKey}"
SPORT_KEY = "soccer_epl"
TARGET_ODDS_ID = "${targetOddsId}"
TARGET_SPORTS_ID = ${sportsIdNum}

POLL_INTERVAL_SEC = 60
BANKROLL = 10000.0
MAX_STAKE_CAP = 500.0
EDGE_HURDLE = 0.02

FEATURE_COLUMNS = [
    'match_time_ratio', 'shot_differential', 'team_A_possession_share',
    'goal_differential', 'team_A_prematch_elo', 'team_B_prematch_elo',
    'prematch_elo_diff', 'event_seconds', 'event_duel', 'event_foul',
    'event_pass', 'event_save', 'event_set_piece', 'event_shot',
    'event_stoppage', 'event_touch'
]

print("📥 Loading PitchAleph 1.2 brain from Hugging Face Hub...")
model_path = hf_hub_download(repo_id="marianopsa/pitch-aleph-1.2", filename="model.joblib")
model = joblib.load(model_path)
print("✅ PitchAleph 1.2 ready.\\n")

def get_club_elo_snapshot():
    today_str = pd.Timestamp.now().strftime("%Y-%m-%d")
    try:
        resp = requests.get(f"http://api.clubelo.com/{today_str}", timeout=10)
        resp.raise_for_status()
        elo_df = pd.read_csv(io.StringIO(resp.text))
        return dict(zip(elo_df['Club'].str.lower(), elo_df['Elo']))
    except Exception:
        return {}

def resolve_elo(team_name, elo_dict, default_elo=1750.0):
    clean = team_name.lower().replace("fc", "").replace("afc", "").strip()
    for club_key, rating in elo_dict.items():
        if clean in club_key or club_key in clean:
            return float(rating)
    return default_elo

elo_cache = get_club_elo_snapshot()

def fetch_live_telemetry(fixture_id):
    headers = {"x-apisports-key": API_FOOTBALL_KEY}
    fix_res = requests.get(f"https://v3.football.api-sports.io/fixtures?id={fixture_id}", headers=headers).json()
    if not fix_res.get('response'):
        return None
    fix_data = fix_res['response'][0]
    minute = fix_data['fixture']['status'].get('elapsed', 0) or 0
    status = fix_data['fixture']['status']['short']
    hg = fix_data['goals'].get('home', 0) or 0
    ag = fix_data['goals'].get('away', 0) or 0
    h_name = fix_data['teams']['home']['name']
    a_name = fix_data['teams']['away']['name']

    stats_res = requests.get(f"https://v3.football.api-sports.io/fixtures/statistics?fixture={fixture_id}", headers=headers).json()
    hs, as_shots = 0, 0
    poss = 0.50
    if stats_res.get('response') and len(stats_res['response']) >= 2:
        h_s = {s['type']: s['value'] for s in stats_res['response'][0]['statistics']}
        a_s = {s['type']: s['value'] for s in stats_res['response'][1]['statistics']}
        hs = h_s.get('Total Shots') or 0
        as_shots = a_s.get('Total Shots') or 0
        raw_p = h_s.get('Ball Possession', '50%')
        if isinstance(raw_p, str):
            poss = float(raw_p.replace('%', '')) / 100.0

    return {
        "home_name": h_name, "away_name": a_name, "status": status,
        "minute": minute, "home_goals": hg, "away_goals": ag,
        "shot_diff": hs - as_shots, "home_possession": poss,
        "raw_shots": f"{hs} - {as_shots}"
    }

def fetch_live_odds(odds_id):
    url = f"https://api.the-odds-api.com/v4/sports/{SPORT_KEY}/events/{odds_id}/odds"
    params = {"apiKey": THE_ODDS_API_KEY, "regions": "eu", "markets": "h2h", "oddsFormat": "decimal"}
    resp = requests.get(url, params=params).json()
    return resp if isinstance(resp, dict) and 'bookmakers' in resp else None

print("=" * 80)
print("🚀 PITCHALEPH 1.2 AUTONOMOUS MONITOR ENGAGED")
print("=" * 80)

cycle = 1
while True:
    try:
        t_now = pd.Timestamp.now().strftime('%H:%M:%S')
        telemetry = fetch_live_telemetry(TARGET_SPORTS_ID)
        odds_data = fetch_live_odds(TARGET_ODDS_ID)
        
        if not telemetry:
            print(f"[{t_now}] Waiting for telemetry feed...")
            time.sleep(POLL_INTERVAL_SEC)
            continue

        h_name = telemetry['home_name']
        a_name = telemetry['away_name']
        home_elo = resolve_elo(h_name, elo_cache, 1750.0)
        away_elo = resolve_elo(a_name, elo_cache, 1750.0)
        status = telemetry['status']
        min_elapsed = telemetry['minute']
        hg = telemetry['home_goals']
        ag = telemetry['away_goals']
        shot_diff = telemetry['shot_diff']
        poss = telemetry['home_possession']

        if status in ['FT', 'AET', 'PEN']:
            print(f"\\n🏁 MATCH CONCLUDED (FT {hg}-{ag}). In-play monitoring finished.")
            break

        print(f"\\n[CYCLE #{cycle} @ {t_now}] {h_name} {hg}-{ag} {a_name} | {status} ({min_elapsed}') | SHOTS: {telemetry['raw_shots']} | POSS: {poss*100:.0f}%")
        
        best_odds = {h_name: (0.0, "None"), 'Draw': (0.0, "None"), a_name: (0.0, "None")}
        if odds_data and odds_data.get('bookmakers'):
            for b in odds_data['bookmakers']:
                b_title = b['title']
                for m in b.get('markets', []):
                    if m['key'] == 'h2h':
                        for o in m.get('outcomes', []):
                            price = o['price']
                            if o['name'].lower() == h_name.lower() and price > best_odds[h_name][0]:
                                best_odds[h_name] = (price, b_title)
                            elif o['name'].lower() == a_name.lower() and price > best_odds[a_name][0]:
                                best_odds[a_name] = (price, b_title)
                            elif o['name'].lower() == 'draw' and price > best_odds['Draw'][0]:
                                best_odds['Draw'] = (price, b_title)

        state_vec = {
            'match_time_ratio': min(1.0, min_elapsed / 90.0),
            'shot_differential': shot_diff,
            'team_A_possession_share': poss,
            'goal_differential': hg - ag,
            'team_A_prematch_elo': home_elo,
            'team_B_prematch_elo': away_elo,
            'prematch_elo_diff': home_elo - away_elo,
            'event_seconds': min_elapsed * 60.0,
            'event_duel': 0, 'event_foul': 0, 'event_pass': 0,
            'event_save': 0, 'event_set_piece': 0, 'event_shot': 0,
            'event_stoppage': 0, 'event_touch': 1
        }
        
        df_row = pd.DataFrame([state_vec])[FEATURE_COLUMNS]
        probs = model.predict_proba(df_row)[0]
        p_home, p_draw, p_away = probs[0], probs[1], probs[2]

        print(f"{'OUTCOME':<14} | {'MODEL PROB':<10} | {'BEST BOOKIE':<14} | {'ODDS':<6} | {'EDGE':<8} | {'EXECUTION'}")
        print("-" * 80)
        for name, prob, (price, bookie) in [
            (h_name, p_home, best_odds[h_name]),
            ("Draw", p_draw, best_odds['Draw']),
            (a_name, p_away, best_odds[a_name])
        ]:
            if price > 1.0:
                implied = 1.0 / price
                edge = prob - implied
                stake = 0.0
                if edge >= EDGE_HURDLE:
                    b = price - 1.0
                    f_star = max(0.0, (b * prob - (1.0 - prob)) / b)
                    stake = min(MAX_STAKE_CAP, round(0.25 * f_star * BANKROLL, 2))
                action = f"🚨 ALLOCATE \${stake:.2f}" if stake > 0 else "WITHHOLD (\$0.00)"
                print(f"{name[:14]:<14} | {prob*100:>8.2f}% | {str(bookie)[:14]:<14} | {price:<6.2f} | {edge*100:>+6.2f}% | {action}")
            else:
                print(f"{name[:14]:<14} | {prob*100:>8.2f}% | Suspended      | ---    | ---     | ODDS SUSPENDED")

    except Exception as e:
        print(f"⚠️ Loop error: {e}")
    cycle += 1
    time.sleep(POLL_INTERVAL_SEC)
`;
}
