import { NextRequest, NextResponse } from 'next/server';
import { validateApiKey } from '@/lib/auth';
import { getAllMatches, createMatch } from '@/lib/data-controller';
import { badRequest, serverError, parseJsonBody } from '@/lib/api-helpers';

export async function GET(request: NextRequest) {
  try {
    const auth = validateApiKey(request);
    if (!auth.isValid) return auth.errorResponse!;

    const url = new URL(request.url);
    const matches = getAllMatches({
      status: url.searchParams.get('status') || undefined,
      search: url.searchParams.get('search') || undefined
    });

    return NextResponse.json({
      success: true,
      count: matches.length,
      data: matches
    }, { status: 200 });
  } catch (err) {
    return serverError(err, 'fetching matches');
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = validateApiKey(request);
    if (!auth.isValid) return auth.errorResponse!;

    const parsed = await parseJsonBody<Record<string, unknown>>(request);
    if (parsed.error) return parsed.error;
    const body = parsed.data!;

    if (typeof body.title !== 'string' || !body.title.trim()) {
      return badRequest('Missing or invalid required field: `title` (string).');
    }

    if (body.status !== 'PASS' && body.status !== 'FAIL') {
      return badRequest('Missing or invalid required field: `status` (must be "PASS" or "FAIL").');
    }

    if (typeof body.ev !== 'string' || !body.ev.trim()) {
      return badRequest('Missing or invalid required field: `ev` (e.g. "+15.2% EV").');
    }

    const created = createMatch({
      id: typeof body.id === 'string' ? body.id : undefined,
      title: body.title,
      status: body.status,
      ev: body.ev,
      minute: typeof body.minute === 'string' ? body.minute : undefined,
      date: typeof body.date === 'string' ? body.date : undefined,
      story: Array.isArray(body.story) ? body.story : undefined
    });

    return NextResponse.json({
      success: true,
      message: 'Match created successfully.',
      data: created
    }, { status: 201 });
  } catch (err) {
    return serverError(err, 'creating match');
  }
}
