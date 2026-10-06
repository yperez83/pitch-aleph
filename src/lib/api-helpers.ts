import { NextRequest, NextResponse } from 'next/server';
import { validateApiKey } from './auth';

export function badRequest(message: string, code = 'BAD_REQUEST') {
  return NextResponse.json({ error: { code, message } }, { status: 400 });
}

export function notFound(resource: string) {
  return NextResponse.json({ error: { code: 'NOT_FOUND', message: `${resource} not found.` } }, { status: 404 });
}

export function serverError(error: unknown, action: string) {
  return NextResponse.json(
    {
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: `An unexpected error occurred while ${action}.`,
        details: error instanceof Error ? error.message : String(error)
      }
    },
    { status: 500 }
  );
}

export async function parseJsonBody<T = Record<string, unknown>>(request: Request): Promise<{ data?: T; error?: NextResponse }> {
  try {
    const data = await request.json();
    return { data };
  } catch {
    return { error: badRequest('Malformed JSON payload in request body.') };
  }
}

export function verifyRequestAuth(req: NextRequest) {
  return validateApiKey(req);
}
