import { NextRequest, NextResponse } from 'next/server';
import { validateApiKey } from '@/lib/auth';
import { getBacktestLedger } from '@/lib/data-controller';
import { serverError } from '@/lib/api-helpers';

export async function GET(request: NextRequest) {
  try {
    const auth = validateApiKey(request);
    if (!auth.isValid) return auth.errorResponse!;

    const url = new URL(request.url);
    const limitParam = url.searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam, 10) : undefined;

    const data = getBacktestLedger(limit);
    return NextResponse.json({
      success: true,
      count: data.length,
      initialBankroll: 10000,
      currentBankroll: data[data.length - 1]?.bankroll ?? 10000,
      data
    }, { status: 200 });
  } catch (err) {
    return serverError(err, 'fetching backtest ledger');
  }
}
