// src/server/api/share.ts
import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { notes } from '@/lib/feature-pack-schemas';
import { eq } from 'drizzle-orm';
import { getUserId } from '../auth';
import { randomBytes } from 'crypto';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function extractId(request: NextRequest): string | null {
  const url = new URL(request.url);
  const parts = url.pathname.split('/');
  // /api/notepad/{id}/share -> id is third from last
  const shareIndex = parts.indexOf('share');
  return shareIndex > 0 ? parts[shareIndex - 1] : null;
}

/**
 * POST /api/notepad/[id]/share
 * Generate a share link for a note
 */
export async function POST(request: NextRequest) {
  try {
    const db = getDb();
    const id = extractId(request);
    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }

    const userId = getUserId(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find existing note
    const [existing] = await db
      .select()
      .from(notes)
      .where(eq(notes.id, id))
      .limit(1);

    if (!existing) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // Check ownership
    if (existing.userId && existing.userId !== userId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // Generate share token if not exists
    const shareToken = existing.shareToken || randomBytes(32).toString('hex');

    const [note] = await db
      .update(notes)
      .set({
        isPublic: true,
        shareToken: shareToken,
        updatedAt: new Date(),
      })
      .where(eq(notes.id, id))
      .returning();

    return NextResponse.json({
      shareToken: note.shareToken,
      shareUrl: `/notepad/share/${note.shareToken}`,
    });
  } catch (error) {
    console.error('[notepad] Share note error:', error);
    return NextResponse.json(
      { error: 'Failed to share note' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/notepad/[id]/share
 * Revoke share link for a note
 */
export async function DELETE(request: NextRequest) {
  try {
    const db = getDb();
    const id = extractId(request);
    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }

    const userId = getUserId(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find existing note
    const [existing] = await db
      .select()
      .from(notes)
      .where(eq(notes.id, id))
      .limit(1);

    if (!existing) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // Check ownership
    if (existing.userId && existing.userId !== userId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    await db
      .update(notes)
      .set({
        isPublic: false,
        shareToken: null,
        updatedAt: new Date(),
      })
      .where(eq(notes.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[notepad] Unshare note error:', error);
    return NextResponse.json(
      { error: 'Failed to unshare note' },
      { status: 500 }
    );
  }
}

