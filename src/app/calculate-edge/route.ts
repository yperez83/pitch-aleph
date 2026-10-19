import { NextRequest, NextResponse } from 'next/server';

// Mathematical sigmoid calibration for win probability estimation
function calculateWinProbability(
  timeRatio: number,
  goalDiff: number,
  possShare: number,
  shotDiff: number,
  eloDiff: number
): number {
  // Linear score combination matching PitchAleph 1.2 inference model weights
  const score =
    goalDiff * 1.35 +
    (possShare - 0.50) * 1.80 +
    shotDiff * 0.08 +
    (eloDiff / 400.0) * 0.85 -
    timeRatio * 0.15;

  const rawProb = 1.0 / (1.0 + Math.exp(-score));
  // Bound probability sensibly between 0.05 and 0.95
  return Math.min(0.95, Math.max(0.05, rawProb));
}

// Quarter-Kelly sizing formula with strict $500 cap
function computeQuarterKelly(
  winProb: number,
  marketDecimalOdds: number,
  bankroll: number
): { edge: number; stake: number; kellyFraction: number } {
  const impliedProb = 1.0 / marketDecimalOdds;
  const edge = winProb - impliedProb;

  if (edge <= 0) {
    return { edge, stake: 0.0, kellyFraction: 0.0 };
  }

  const b = marketDecimalOdds - 1.0;
  if (b <= 0) {
    return { edge, stake: 0.0, kellyFraction: 0.0 };
  }

  const p = winProb;
  const q = 1.0 - p;
  const fullKelly = Math.max(0.0, (b * p - q) / b);
  const quarterKellyFraction = Number((fullKelly * 0.25).toFixed(4));
  const recommendedStake = Math.min(500.0, Math.round(quarterKellyFraction * bankroll * 100) / 100);

  return {
    edge,
    stake: recommendedStake,
    kellyFraction: quarterKellyFraction
  };
}

export async function POST(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const oddsParam = url.searchParams.get('market_odds_decimal');
    const bankrollParam = url.searchParams.get('bankroll');

    const marketOdds = oddsParam ? parseFloat(oddsParam) || 2.10 : 2.10;
    const bankroll = bankrollParam ? parseFloat(bankrollParam) || 10000.0 : 10000.0;

    let body: any = {};
    try {
      body = await req.json();
    } catch {
      // Allow fallback if no body was provided
    }

    const timeRatio = typeof body.match_time_ratio === 'number' ? body.match_time_ratio : 0.0;
    const goalDiff = typeof body.goal_differential === 'number' ? body.goal_differential : 0;
    const possShare = typeof body.team_A_possession_share === 'number' ? body.team_A_possession_share : 0.50;
    const shotDiff = typeof body.shot_differential === 'number' ? body.shot_differential : 0;
    const eloDiff = typeof body.prematch_elo_diff === 'number' ? body.prematch_elo_diff : 0.0;

    const modelWinProb = calculateWinProbability(timeRatio, goalDiff, possShare, shotDiff, eloDiff);
    const marketImpliedProb = Number((1.0 / marketOdds).toFixed(4));
    const evPercent = Number(((modelWinProb - marketImpliedProb) * 100).toFixed(1));
    const isPositiveEv = evPercent > 0;

    const { stake, kellyFraction } = computeQuarterKelly(modelWinProb, marketOdds, bankroll);

    return NextResponse.json(
      {
        model_win_probability: Number(modelWinProb.toFixed(4)),
        market_implied_probability: marketImpliedProb,
        market_odds_decimal: marketOdds,
        expected_value_percent: evPercent,
        is_positive_ev: isPositiveEv,
        quarter_kelly_fraction: kellyFraction,
        recommended_wager_amount: stake,
        bankroll_evaluated: bankroll,
        status: isPositiveEv ? 'ALPHA_DISCREPANCY_DETECTED' : 'FILTER_BLOCK_NEGATIVE_EV'
      },
      {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-api-key'
        }
      }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Error calculating edge'
        }
      },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-api-key'
    }
  });
}
