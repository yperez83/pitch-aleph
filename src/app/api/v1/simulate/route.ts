import { NextRequest, NextResponse } from 'next/server';
import { runSimulationEngine } from '@/lib/data-controller';
import { badRequest, serverError, parseJsonBody, verifyRequestAuth } from '@/lib/api-helpers';

export async function POST(req: NextRequest) {
  try {
    const authStatus = verifyRequestAuth(req);
    if (!authStatus.isValid) return authStatus.errorResponse!;

    const payloadResult = await parseJsonBody<Record<string, unknown>>(req);
    if (payloadResult.error) return payloadResult.error;
    const bodyValues = payloadResult.data!;

    if (bodyValues.stake === undefined || bodyValues.stake === null) {
      return badRequest('Simulation parameter `stake` is required.');
    }

    const numericStake = Number(bodyValues.stake);
    if (isNaN(numericStake) || numericStake <= 0) {
      return badRequest('`stake` must evaluate to a positive numerical value.');
    }

    const simOutput = runSimulationEngine({
      stake: numericStake,
      matchId: typeof bodyValues.matchId === 'string' ? bodyValues.matchId : undefined,
      caseKey: typeof bodyValues.caseKey === 'string' ? bodyValues.caseKey : undefined,
      strategy: typeof bodyValues.strategy === 'string'
        ? (bodyValues.strategy as 'kelly_fractional' | 'flat' | 'aggressive')
        : undefined
    });

    return NextResponse.json({
      success: true,
      data: simOutput
    });
  } catch (ex) {
    return serverError(ex, 'executing simulation algorithm');
  }
}
