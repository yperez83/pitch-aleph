import { NextRequest, NextResponse } from 'next/server';
import { getMatchById, updateMatch, deleteMatch } from '@/lib/data-controller';
import { notFound, serverError, parseJsonBody, verifyRequestAuth } from '@/lib/api-helpers';

async function resolveRouteMatch(request: NextRequest, params: Promise<{ id: string }>) {
  const authCheck = verifyRequestAuth(request);
  if (!authCheck.isValid) {
    return { errorResponse: authCheck.errorResponse! };
  }
  const { id } = await params;
  const match = getMatchById(id);
  if (!match) {
    return { errorResponse: notFound(`Match with ID '${id}'`) };
  }
  return { id, match };
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const resolved = await resolveRouteMatch(request, context.params);
    if (resolved.errorResponse) return resolved.errorResponse;
    return NextResponse.json({ success: true, data: resolved.match });
  } catch (err) {
    return serverError(err, 'reading target match');
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const resolved = await resolveRouteMatch(request, context.params);
    if (resolved.errorResponse) return resolved.errorResponse;

    const jsonResult = await parseJsonBody<Record<string, unknown>>(request);
    if (jsonResult.error) return jsonResult.error;

    const payload = jsonResult.data!;
    const updated = updateMatch(resolved.id, {
      title: typeof payload.title === 'string' ? payload.title : undefined,
      status: payload.status === 'PASS' || payload.status === 'FAIL' ? payload.status : undefined,
      ev: typeof payload.ev === 'string' ? payload.ev : undefined,
      minute: typeof payload.minute === 'string' ? payload.minute : undefined,
      date: typeof payload.date === 'string' ? payload.date : undefined,
      story: Array.isArray(payload.story) ? payload.story : undefined
    });

    return NextResponse.json({
      success: true,
      message: 'Match updated successfully.',
      data: updated
    });
  } catch (err) {
    return serverError(err, 'modifying target match');
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const resolved = await resolveRouteMatch(request, context.params);
    if (resolved.errorResponse) return resolved.errorResponse;

    deleteMatch(resolved.id);
    return NextResponse.json({
      success: true,
      message: `Match with ID '${resolved.id}' deleted successfully.`
    });
  } catch (err) {
    return serverError(err, 'removing target match');
  }
}
