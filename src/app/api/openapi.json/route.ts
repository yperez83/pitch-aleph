import { NextResponse } from 'next/server';
import { OPENAPI_SPEC } from '@/lib/openapi-spec';

export async function GET() {
  return NextResponse.json(OPENAPI_SPEC, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-api-key'
    }
  });
}
