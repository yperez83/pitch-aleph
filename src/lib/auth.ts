import { NextRequest, NextResponse } from 'next/server';

const VALID_API_KEYS = new Set<string>([
  process.env.PITCH_ALEPH_API_KEY || 'aleph_live_sec_9942a1b9e830f14c',
  'aleph_demo_key_2026'
]);

export function validateApiKey(request: NextRequest): { isValid: boolean; errorResponse?: NextResponse } {
  const authHeader = request.headers.get('authorization');
  const xApiKey = request.headers.get('x-api-key');

  let token: string | null = null;

  if (xApiKey) {
    token = xApiKey.trim();
  } else if (authHeader) {
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7).trim();
    } else {
      token = authHeader.trim();
    }
  }

  if (!token) {
    return {
      isValid: false,
      errorResponse: NextResponse.json(
        {
          error: {
            code: 'UNAUTHORIZED',
            message: 'API Key is missing. Pass via `x-api-key` header or `Authorization: Bearer <key>`.'
          }
        },
        { status: 401 }
      )
    };
  }

  if (!VALID_API_KEYS.has(token)) {
    return {
      isValid: false,
      errorResponse: NextResponse.json(
        {
          error: {
            code: 'INVALID_API_KEY',
            message: 'Provided API key is invalid or expired.'
          }
        },
        { status: 401 }
      )
    };
  }

  return { isValid: true };
}
