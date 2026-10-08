#!/usr/bin/env python3
import json
import re

def main():
    with open('src/App.jsx', 'r', encoding='utf-8') as f:
        app_jsx = f.read()

    with open('src/vault_index.json', 'r', encoding='utf-8') as f:
        vault_matches = json.load(f)

    with open('src/lib/openapi-spec.ts', 'r', encoding='utf-8') as f:
        openapi_code = f.read()

    lines = []

    def section(title):
        lines.append("")
        lines.append("=" * 80)
        lines.append(title.upper())
        lines.append("=" * 80)
        lines.append("")

    def subsection(title):
        lines.append("")
        lines.append("-" * 60)
        lines.append(title)
        lines.append("-" * 60)
        lines.append("")

    # -------------------------------------------------------------
    # DOCUMENT HEADER
    # -------------------------------------------------------------
    lines.append("PITCH ALEPH — COMPLETE WEBSITE TEXT & COPY DIRECTORY")
    lines.append("Website: https://pitchaleph.com (Mirror: https://pitch-aleph.vercel.app)")
    lines.append("Extracted visible text copy across all pages, scenarios, case studies, and API docs.")
    lines.append("Page Title: Pitch Aleph | Betting Engine")
    lines.append("")

    # -------------------------------------------------------------
    # SECTION 1: LANDING PAGE / HOME VIEW
    # -------------------------------------------------------------
    section("1. Landing Page (Home View)")

    subsection("Hero Section")
    lines.append("Badge: 3,000,000+ Spatial Events Processed")
    lines.append("Headline: The [House (crossed out)] Math Always Wins.")
    lines.append("Sub-headline: Level the playing field. Our proprietary model is trained and updated on millions of data points to reveal the hidden edge in every game. Turn unpredictable games into steady growth with a data-powered system built to limit loss and statistically increase profitability.")
    lines.append("Call to Action: Launch Your Secret Weapon")

    subsection("Cloud Architecture & Scaled Backtesting Section")
    lines.append("Section Title: CLOUD ARCHITECTURE & SCALED BACKTESTING")
    lines.append("")
    lines.append("Card 1: PRODUCTION ENGINE (1,000-Match Cloud Simulation)")
    lines.append("Subtitle: +$10,152 (101.5% ROI)")
    lines.append("Description: XGBoost inference across 3M+ spatial events with Platt Scaling and liquidity cap.")
    lines.append("")
    lines.append("Card 2: DATA VAULT (20-Match Indexed Sample)")
    lines.append("Subtitle: 11 PASS / 9 FAIL")
    lines.append("Description: Explore algorithmic signal screening across 20 FIFA World Cup matches.")

    subsection("The PitchAleph Edge Calculator (Bet Simulator)")
    lines.append("Heading: The PitchAleph Edge Calculator (Bet Simulator)")
    lines.append("Status Badge: 24 Historical Simulations Active")
    lines.append("Description: See how the engine maximizes profits and minimizes catastrophic losses compared to a standard market bettor across core test cases and the 20-match Data Vault portfolio.")
    lines.append("Controls:")
    lines.append("  - BASE STAKE: Input field with range slider ($1 to $1,000,000; default $1,000)")
    lines.append("  - SELECT SCENARIO: Category filter buttons (ALL, CORE, VAULT)")
    lines.append("")
    lines.append("All 24 Scenarios Comparison (Calculated at base stake $1,000):")
    lines.append("")

    # Core scenarios in calculator
    core_scenarios = [
        {
            "id": "2022",
            "title": "ARG vs FRA (PASS)",
            "fullTitle": "ARG vs FRA (2022 Final — Alpha Generation)",
            "odds": "+150 (40% implied)",
            "prob": "65.0%",
            "ev": "+25.0%",
            "public": "Wins $1,500 (Lucky bet, negative long-term EV)",
            "aleph": "Wins $1,500 (Secured massive +EV mathematical edge)"
        },
        {
            "id": "ksa",
            "title": "KSA vs ARG (PASS)",
            "fullTitle": "KSA vs ARG (2022 Group — Underdog Inefficiency)",
            "odds": "+1200 (7.7% implied)",
            "prob": "22.0%",
            "ev": "+42.0%",
            "public": "Loses $1,000 (Public heavily backed Argentina at -600)",
            "aleph": "Wins $12,000 (Engine correctly bought massive KSA undervaluation)"
        },
        {
            "id": "ned",
            "title": "NED vs ARG (HEDGE)",
            "fullTitle": "NED vs ARG (2022 QF — Volatility Hedging)",
            "odds": "Argentina to win",
            "prob": "Chaotic State (Unmodelable)",
            "ev": "N/A",
            "public": "Loses $1,000 (NED tied 2-2 in 90+11')",
            "aleph": "Locks in $400 Profit (Engine automatically hedged/cashed out at 80')"
        },
        {
            "id": "2018",
            "title": "GER vs KOR (FAIL)",
            "fullTitle": "GER vs KOR (2018 Group — Risk Mitigation)",
            "odds": "-400 (80% implied)",
            "prob": "92.0%",
            "ev": "+15.0%",
            "public": "Loses full $1,000 (Wiped out by black-swan counter-attack)",
            "aleph": "Loses only $100 (Kelly Criterion automatically capped exposure to tail risk)"
        }
    ]

    for c in core_scenarios:
        lines.append(f"Scenario: {c['fullTitle']}")
        lines.append(f"  Category: Core Test Case")
        lines.append(f"  Market Odds: {c['odds']}")
        lines.append(f"  PitchAleph True Probability: {c['prob']}")
        lines.append(f"  Expected Value (EV): {c['ev']}")
        lines.append(f"  Public Bettor Outcome: {c['public']}")
        lines.append(f"  PitchAleph Engine Outcome: {c['aleph']}")
        lines.append("")

    # 20 Vault scenarios in calculator
    team_codes = {
        'Canada': 'CAN', 'Morocco': 'MAR', 'England': 'ENG', 'Iran': 'IRN',
        'Croatia': 'CRO', 'Belgium': 'BEL', 'Netherlands': 'NED', 'Ecuador': 'ECU',
        'Japan': 'JPN', 'Spain': 'ESP', 'United States': 'USA', 'Wales': 'WAL',
        'Tunisia': 'TUN', 'France': 'FRA', 'Switzerland': 'SUI', 'Cameroon': 'CMR',
        'Portugal': 'POR', 'Ghana': 'GHA', 'Senegal': 'SEN', 'Poland': 'POL',
        'Saudi Arabia': 'KSA', 'Qatar': 'QAT', 'Denmark': 'DEN', 'Germany': 'GER',
        'Argentina': 'ARG', 'South Korea': 'KOR'
    }

    def to_short(title):
        return " vs ".join([team_codes.get(t, t[:3].upper()) for t in title.split(" vs ")])

    stake = 1000
    for idx, m in enumerate(vault_matches):
        is_pass = m['status'] == 'PASS'
        short_vs = to_short(m['title'])
        clean_ev = m.get('ev', '+14.2% EV').strip()
        ev_val_match = re.search(r'[\d\.]+', clean_ev)
        ev_val = float(ev_val_match.group(0)) if ev_val_match else 14.2
        minute_label = m.get('minute', "75' Decision")

        if is_pass:
            american_odds = round(105 + ev_val * 2.5)
            odds_mult = american_odds / 100
            implied_prob = round((100 / (american_odds + 100)) * 100, 1)
            pitch_prob = round(implied_prob + ev_val, 1)
            m_odds = f"+{american_odds} ({implied_prob:.1f}% implied)"
            p_prob = f"{pitch_prob:.1f}%"
        else:
            american_odds = round(160 + ev_val * 4)
            odds_mult = round(100 / american_odds, 2)
            implied_prob = round((american_odds / (american_odds + 100)) * 100, 1)
            pitch_prob = round(implied_prob - ev_val, 1)
            m_odds = f"-{american_odds} ({implied_prob:.1f}% implied)"
            p_prob = f"{pitch_prob:.1f}%"

        if not is_pass:
            pub_out = f"Loses full ${stake:,} (Public forced heavy favorite at {m_odds.split(' ')[0]} that collapsed to defensive variance)"
        else:
            scenario_type = idx % 3
            if scenario_type == 0:
                pub_out = f"Loses full ${stake:,} (The Contrarian Scenario: Public backed the heavy favorite instead, losing their full stake while PitchAleph won the underdog payout)"
            elif scenario_type == 1:
                pub_out = f"Wins ${round(stake * odds_mult):,} (The Dumb Money Scenario: Lucky, Negative-EV bet long-term; public backed the same team but holds negative mathematical expectancy)"
            else:
                pub_out = f"Wins ${round(stake * odds_mult * 0.6):,} (The Late Money Scenario: Public bet the same team but reacted late, getting crushed closing odds and winning 40% less profit than PitchAleph)"

        if is_pass:
            aleph_out = f"Wins ${round(stake * odds_mult):,} (PitchAleph algorithmic buy order at {minute_label} captured {clean_ev} edge)"
        else:
            aleph_out = f"Loses $0 / Hedged (Kelly risk filter blocked position at {minute_label}, preventing catastrophic loss)"

        full_title = f"{m['title']} ({m['status']}) — {m['date']} ({minute_label})"
        lines.append(f"Scenario: {full_title}")
        lines.append(f"  Category: {'Vault Pass' if is_pass else 'Vault Fail'}")
        lines.append(f"  Market Odds: {m_odds}")
        lines.append(f"  PitchAleph True Probability: {p_prob}")
        lines.append(f"  Expected Value (EV): {clean_ev}")
        lines.append(f"  Public Bettor Outcome: {pub_out}")
        lines.append(f"  PitchAleph Engine Outcome: {aleph_out}")
        lines.append("")

    subsection("Core Interactive Case Studies (Bottom of Landing Page)")
    lines.append("Section Title: CORE INTERACTIVE CASE STUDIES")
    lines.append("• TEST 01: ALPHA GENERATION — ARG vs FRA (2022 Final)")
    lines.append("  Summary: Blinding the model to find the +EV window in the 2022 Final.")
    lines.append("• TEST 02: TAIL RISK / VARIANCE — GER vs KOR (2018 Group)")
    lines.append("  Summary: Managing statistical inevitability when the market edge fails.")
    lines.append("• TEST 03: UNDERDOG INEFFICIENCY — KSA vs ARG (2022 Group)")
    lines.append("  Summary: Exploiting market anchoring in the biggest upset of 2022.")
    lines.append("• TEST 04: DYNAMIC HEDGING — NED vs ARG (2022 QF)")
    lines.append("  Summary: Knowing when the predictive models break down.")

    # -------------------------------------------------------------
    # SECTION 2: 1,000-MATCH CLOUD SIMULATION VIEW
    # -------------------------------------------------------------
    section("2. Production Engine: 1,000-Match Backtest View")

    lines.append("Header Badge: CLOUD PRODUCTION RUN • 3,000,000+ Spatial Events Processed")
    lines.append("Page Heading: Production Engine: 1,000-Match Backtest")
    lines.append("Subtitle: Validating algorithmic performance across a 3,000,000+ event Data Lake using XGBoost, Platt Scaling, and strict liquidity constraints.")
    lines.append("")
    lines.append("Key Metric Cards:")
    lines.append("  • EXECUTIONS: 522 (Filtered from 1,000 matches)")
    lines.append("  • WIN RATE: 38.31% (High-odds underdog edge)")
    lines.append("  • NET PROFIT: +$10,152 (Net after 5% market vig)")
    lines.append("  • TOTAL ROI: 101.53% (Unlevered portfolio yield)")
    lines.append("")
    lines.append("Architecture & Constraints:")
    lines.append("  1. The XGBoost Brain:")
    lines.append("     The engine was trained on a 1,000-match historical dataset, computing rolling Expected Threat (xT) and spatial geometry to map sequences into continuous goal-generation probabilities.")
    lines.append("")
    lines.append("  2. Platt Scaling Calibration:")
    lines.append("     Raw tree-based models suffer from algorithmic overconfidence. By applying Platt Scaling (Sigmoid curve), the engine throttled false-positive triggers, aggressively dropping its Brier Score to 0.019.")
    lines.append("")
    lines.append("  3. Market Liquidity Injection:")
    lines.append("     To ensure statistical realism, a $10,000 maximum liquidity cap and a 5% sportsbook 'vig' were injected into the simulator, ensuring the 101.53% ROI represents withdrawable, real-world alpha.")
    lines.append("")
    lines.append("Cumulative Bankroll (P&L) Section:")
    lines.append("  Title: Cumulative Bankroll (P&L)")
    lines.append("  Description: Interactive execution ledger across 522 constrained market conditions.")
    lines.append("  Presets: ALL (522), T1–150, T150–350, T350–522")
    lines.append("  Interactive Features: Zoom In, Zoom Out, Reset View, Click & Drag Custom Region Zoom")

    # -------------------------------------------------------------
    # SECTION 3: DATA VAULT MODAL (20 MATCH SAMPLE)
    # -------------------------------------------------------------
    section("3. Data Vault Portfolio Modal (20 Match Sample)")

    lines.append("Dataset Header: PORTFOLIO DATASET • 2022 FIFA World Cup")
    lines.append("Heading: PitchAleph Data Vault (20 Match Sample)")
    lines.append("Subtitle: Simulated algorithmic screening across a 20-match portfolio sample. Evaluate live spatial event playback and signal execution on each match.")
    lines.append("")
    lines.append("Portfolio Statistics:")
    lines.append("  • SAMPLE SIZE: 20 Matches")
    lines.append("  • ALPHA SIGNALS: 11 PASS (55%)")
    lines.append("  • RISK FILTERS: 9 FAIL (45%)")
    lines.append("  • PORTFOLIO WIN RATE: 55% Edge")
    lines.append("")
    lines.append("Data Source Attribution: Discrete spatial event streams powered by StatsBomb Open Data")
    lines.append("")
    lines.append("Indexed Matches in Vault:")

    for idx, m in enumerate(vault_matches, 1):
        def_min = m.get('minute') or "75' Decision"
        def_ev = m.get('ev') or "+14.2% EV"
        lines.append(f"{idx}. Match ID: {m['id']} — {m['title']}")
        lines.append(f"   Date: {m['date']} | Decision Window: {def_min} | Model Decision: {m['status']} | Calculated Edge: {def_ev}")

    # -------------------------------------------------------------
    # SECTION 4: CORE INTERACTIVE CASE STUDIES
    # -------------------------------------------------------------
    section("4. Core Interactive Case Studies (In-Depth Technical Narratives)")

    # Case 2022
    subsection("Test 01: The 25% Backtest (ARG vs FRA 2022 Final)")
    lines.append("Title: The 25% Backtest")
    lines.append("Subtitle: Blinding the model to find the +EV window in the 2022 Final.")
    lines.append("")
    lines.append("Step 1: 1. Ingesting Live Match Events")
    lines.append("Narrative: Raw pitch data is messy. We stream every discrete on-field action—passes, shots, and tackles—into clean event data. Every coordinate is mapped to feed our real-time tracking pipeline.")
    lines.append("")
    lines.append("Step 2: 2. Feature Engineering")
    lines.append("Narrative: To outsmart the market, we upgrade to Gradient Boosting (XGBoost) and inject the human element. By factoring in Referee Foul-to-Tackle Ratios and Coach Aggression Indices, PitchAleph maps non-linear interactions public sportsbooks ignore.")
    lines.append("")
    lines.append("Step 3: 3. The Predictive Engine")
    lines.append("Narrative: As live event data streams in, PitchAleph calculates real-time win probability. We use dynamic SQL window functions to measure rolling Expected Threat (xT) spikes against the market's lagging live odds.")
    lines.append("")
    lines.append("Step 4: 4. Execution Window")
    lines.append("Narrative: The 25% Test: We blindfolded the model. At exactly 22.5 minutes, PitchAleph detected an extreme territorial imbalance. While Vegas implied a 40% probability, PitchAleph calculated 65%, executing a +EV buy order right before Argentina scored.")

    # Case 2018
    subsection("Test 02: Variance & Tail Risk (GER vs KOR 2018 Group)")
    lines.append("Title: Variance & Tail Risk")
    lines.append("Subtitle: Managing statistical inevitability when the market edge fails.")
    lines.append("")
    lines.append("Step 1: 1. The Siege")
    lines.append("Narrative: It is the 80th minute. Germany must win to survive the group stage. The live event data shows relentless, suffocating pressure in the final third. They are dominating possession and generating massive Expected Threat (xT).")
    lines.append("")
    lines.append("Step 2: 2. The Momentum Avalanche")
    lines.append("Narrative: PitchAleph's predictive engine tracks a historic spike in attacking momentum. The model proves Germany is breaking through the Korean lines entirely at will.")
    lines.append("")
    lines.append("Step 3: 3. The +EV Trap")
    lines.append("Narrative: The engine calculates a 92% true win probability for Germany based on the momentum. The market implies only 80%. This presents a massive +15% EV edge. PitchAleph takes the position.")
    lines.append("")
    lines.append("Step 4: 4. Risk Management")
    lines.append("Narrative: Quant trading is not about crystal-ball predictions; it is about edge over time. South Korea scores on two low-probability counter-attacks. Germany loses. However, because we use a Fractional Kelly Criterion for bankroll sizing (capping exposure at 2%), the fund easily absorbs the blow. We survived the variance.")

    # Case KSA
    subsection("Test 03: Underdog Inefficiency (KSA vs ARG 2022 Group)")
    lines.append("Title: Underdog Inefficiency")
    lines.append("Subtitle: Exploiting market anchoring in the biggest upset of 2022.")
    lines.append("")
    lines.append("Step 1: 1. The Market Anchor")
    lines.append("Narrative: The public market heavily backed Argentina, assigning them a 92.3% implied win probability. Casual bettors saw Argentina dominating possession and assumed an inevitable blowout.")
    lines.append("")
    lines.append("Step 2: 2. Neutralizing Spatial Threat")
    lines.append("Narrative: PitchAleph's engine flagged an anomaly: Saudi Arabia was running a perfectly synchronized high defensive line, catching Argentina offside repeatedly. This wasn't luck; it was a highly disciplined tactical system entirely neutralizing Argentina's spatial threat.")
    lines.append("")
    lines.append("Step 3: 3. True Win Probability")
    lines.append("Narrative: By adjusting for the success rate of the offside traps, PitchAleph recalculated the true match odds. The engine determined Saudi Arabia's defensive block was highly sustainable and that the market was fundamentally mispricing the game.")
    lines.append("")
    lines.append("Step 4: 4. The Underdog Alpha")
    lines.append("Narrative: At halftime, the market still priced Argentina as heavy -600 favorites. PitchAleph executed a massive +EV buy order on Saudi Arabia at +1200 odds. Just minutes into the second half, KSA scored two rapid-fire goals to win 2-1, cashing a massive underdog ticket.")

    # Case NED
    subsection("Test 04: Volatility & Hedging (NED vs ARG 2022 QF)")
    lines.append("Title: Volatility & Hedging")
    lines.append("Subtitle: Knowing when the predictive models break down.")
    lines.append("")
    lines.append("Step 1: 1. The Baseline State")
    lines.append("Narrative: For 75 minutes, the Netherlands played a structured, possession-based game. PitchAleph's standard spatial models were accurately predicting match flow and keeping our Argentina position secure.")
    lines.append("")
    lines.append("Step 2: 2. Tactical Rupture")
    lines.append("Narrative: Trailing 2-0, the Netherlands completely abandoned 'Total Football'. They brought on 6-foot-6 striker Wout Weghorst and began launching direct long balls from deep in their own half. The structured game state evaporated.")
    lines.append("")
    lines.append("Step 3: 3. Measuring Match Chaos")
    lines.append("Narrative: PitchAleph flagged a 'Regime Change.' Pass completion rates plummeted, aerial duels skyrocketed, and variance went off the charts. The game devolved into raw physical chaos, meaning all historical predictive probabilities were completely voided.")
    lines.append("")
    lines.append("Step 4: 4. Dynamic Hedging")
    lines.append("Narrative: A core quant principle: Do not trade in chaotic states you cannot model. Sensing extreme volatility, PitchAleph executed an automated hedge. Instead of risking the original Argentina position in a coin-flip scenario, the engine cashed out to lock in a guaranteed profit. Minutes later, the Netherlands scored a miraculous equalizer. The public lost; PitchAleph profited.")

    # -------------------------------------------------------------
    # SECTION 5: DATA VAULT 20 MATCH CASE STUDIES
    # -------------------------------------------------------------
    section("5. Data Vault Match Case Studies (All 20 Deep-Dive Matches)")

    for idx, m in enumerate(vault_matches, 1):
        is_pass = m['status'] == 'PASS'
        minute_label = m.get('minute', "75' Decision")
        clean_ev = m.get('ev', '+14.2% EV').strip()
        
        subsection(f"Vault Match {idx:02d}: {m['title']} ({m['status']}) — Match #{m['id']}")
        lines.append(f"Match: {m['title']}")
        lines.append(f"Tournament: FIFA World Cup 2022 | Date: {m['date']} | Match ID: {m['id']}")
        lines.append(f"Model Signal: {'ALPHA TRIGGER: PASS' if is_pass else 'RISK FILTER: FAIL'}")
        lines.append(f"Calculated Edge: {clean_ev}")
        lines.append(f"Decision Window: {minute_label}")
        
        overview_text = (
            f"PitchAleph generated a high-confidence {clean_ev} edge at {minute_label} based on continuous spatial threat dominance."
            if is_pass else
            f"PitchAleph identified tail risk volatility at {minute_label}, rejecting market consensus to preserve bankroll."
        )
        lines.append(f"Overview: {overview_text}")
        lines.append("")
        lines.append("Quantitative Breakdown & Story Steps:")

        story = m.get('story', [])
        if story:
            for s_idx, st in enumerate(story, 1):
                lines.append(f"  Step {s_idx}: {st['title']}")
                lines.append(f"  Analysis: {st['text']}")
                lines.append("")
        else:
            lines.append("  Step 1: 1. Discrete Event Ingestion (ℵ₀)")
            lines.append("  Analysis: Ingesting the full granular coordinate stream up to the decision minute. All player actions (passes, duels, pressure sequences) are mapped into discrete coordinate frames on the normalized 120x80 pitch grid.")
            lines.append("")
            lines.append("  Step 2: 2. Continuous Threat Transformation (ℵ₁)")
            lines.append("  Analysis: Converting count-level pitch occurrences into continuous expected threat vectors ($xT$). PitchAleph detects micro-shifts in territorial control that lag odds-makers by several minutes.")
            lines.append("")
            lines.append("  Step 3: 3. Algorithmic Screening Gate")
            if is_pass:
                lines.append(f"  Analysis: At the decision minute, the continuous state met the model's threshold for +EV execution ({clean_ev}), triggering an automated buy signal against lagging sportsbook lines.")
            else:
                lines.append("  Analysis: At the decision minute, high volatility markers breached the safe variance envelope. The Kelly sizing engine executed an abort directive, successfully preventing tail-risk liquidation.")
            lines.append("")

    # -------------------------------------------------------------
    # SECTION 6: API DOCUMENTATION & DEVELOPER PORTAL
    # -------------------------------------------------------------
    section("6. Public RESTful API Reference & Developer Documentation")

    lines.append("API Name: Pitch Aleph Quantitative Betting Engine API")
    lines.append("Version: 1.0.0")
    lines.append("Interactive Documentation URL: /api/docs (Swagger UI)")
    lines.append("OpenAPI 3.0.3 Specification: /api/openapi.json")
    lines.append("Base URL: /api/v1")
    lines.append("Description: Public RESTful API for Pitch Aleph. Exposes programmatic access to the Data Vault matches, 1,000-Match Backtest ledger, and the mathematical Bet Simulator engine. Note: This environment operates as an interactive sandbox/demo; create, update, and delete mutations persist in-memory for the active runtime instance.")
    lines.append("")
    lines.append("Authentication Schemes:")
    lines.append("  • API Key Authentication: Header 'x-api-key: <your_key>' (e.g. aleph_demo_key_2026)")
    lines.append("  • Bearer Token Authentication: Header 'Authorization: Bearer <your_key>'")
    lines.append("")
    lines.append("Standard HTTP Response Codes:")
    lines.append("  • 200 OK — Successful retrieval or calculation")
    lines.append("  • 201 Created — Resource successfully registered")
    lines.append("  • 400 Bad Request — Malformed request syntax or validation error")
    lines.append("  • 401 Unauthorized — Missing or invalid API key")
    lines.append("  • 404 Not Found — Resource ID does not exist")
    lines.append("  • 500 Internal Server Error — Server execution failure")
    lines.append("")
    lines.append("Core Endpoints:")
    lines.append("  1. GET /api/v1/matches")
    lines.append("     Summary: List all Data Vault matches")
    lines.append("     Description: Returns all analyzed match scenarios with optional status (ALL, PASS, FAIL) and text search filtering.")
    lines.append("")
    lines.append("  2. POST /api/v1/matches")
    lines.append("     Summary: Register a new match scenario")
    lines.append("     Description: Creates a new match backtest scenario in the Data Vault.")
    lines.append("")
    lines.append("  3. GET /api/v1/matches/{id}")
    lines.append("     Summary: Get match by ID")
    lines.append("     Description: Returns granular quantitative details and tactical breakdown steps for a specific match.")
    lines.append("")
    lines.append("  4. PUT /api/v1/matches/{id}")
    lines.append("     Summary: Update match scenario")
    lines.append("     Description: Updates properties of an existing match scenario.")
    lines.append("")
    lines.append("  5. DELETE /api/v1/matches/{id}")
    lines.append("     Summary: Delete match scenario")
    lines.append("     Description: Removes a match scenario from the active Data Vault ledger.")
    lines.append("")
    lines.append("  6. GET /api/v1/backtest")
    lines.append("     Summary: Get backtest P&L ledger")
    lines.append("     Description: Returns the trade-by-trade cumulative bankroll performance ledger across 522 executions.")
    lines.append("")
    lines.append("  7. POST /api/v1/simulate")
    lines.append("     Summary: Run mathematical bet simulator")
    lines.append("     Description: Evaluates a user base stake against Pitch Aleph quantitative expectation models and returns comparative expected outcome vs public bettor outcome.")

    # -------------------------------------------------------------
    # SECTION 7: GLOBAL FOOTER & METADATA
    # -------------------------------------------------------------
    section("7. Global Website Footer & Legal Metadata")

    lines.append("Brand: Pitch Aleph ℵ₀")
    lines.append("Tagline: Quantitative Sports Market Engine")
    lines.append("Developer CTA: Integrate live predictive states: Build with our API (links to /api/docs)")
    lines.append("Interactive Developer Links:")
    lines.append("  • GitHub: https://github.com/yochanan-perez/pitch-aleph")
    lines.append("  • LinkedIn: https://www.linkedin.com/in/yochanan-perez-10681354/")
    lines.append("  • Email: mailto:perezyochanan26@gmail.com")
    lines.append("Copyright & Disclaimer:")
    lines.append("  © 2026 Pitch Aleph. All mathematical models, backtests, and continuous spatial algorithms are for analytical and quantitative demonstration purposes. Past simulation performance does not guarantee future results.")

    lines.append("")
    lines.append("=" * 80)
    lines.append("END OF PITCH ALEPH WEBSITE COPY EXTRACT")
    lines.append("=" * 80)

    output_content = "\n".join(lines)

    target_path = "public/pitch_aleph_website_copy.txt"
    with open(target_path, "w", encoding="utf-8") as out:
        out.write(output_content)

    print(f"Successfully wrote {len(output_content)} characters across {len(lines)} lines to {target_path}")

if __name__ == "__main__":
    main()
