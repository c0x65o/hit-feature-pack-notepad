// src/server/api/notepad-id.ts
import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { notes, noteAcls } from '@/lib/feature-pack-schemas';
import { eq, and, or, sql, inArray } from 'drizzle-orm';
import { getUserId, extractUserFromRequest } from '../auth';
import { resolveUserPrincipals } from '@hit/feature-pack-auth-core/server/lib/acl-utils';
import { resolveNotepadScopeMode } from '../lib/scope-mode';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function extractId(request: NextRequest): string | null {
  const url = new URL(request.url);
  const parts = url.pathname.split('/');
  // /api/notepad/{id} -> id is last part
  return parts[parts.length - 1] || null;
}

/**
 * GET /api/notepad/[id]
 */
export async function GET(request: NextRequest) {
  try {
    const db = getDb();
    const id = extractId(request);
    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }

    const user = extractUserFromRequest(request);
    const userId = user?.sub || null;

    const [note] = await db
      .select()
      .from(notes)
      .where(eq(notes.id, id))
      .limit(1);

    if (!note) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // Check read permission and resolve scope mode
    const mode = await resolveNotepadScopeMode(request, { entity: 'notes', verb: 'read' });

    // Explicit branching on none/own/ldd/any
    if (mode === 'none') {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    } else if (mode === 'own') {
      // Only allow if user owns the note
      if (!userId || note.userId !== userId) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
      }
    } else if (mode === 'ldd') {
      // Notes don't have LDD fields, so ldd mode is same as any (allow all)
      // But still check ACLs below
    } else if (mode === 'any') {
      // Allow all, but still check ACLs below
    }

    // Also check ACLs for shared notes
    if (userId) {
      // Check if user has READ access via ACL
      const principals = await resolveUserPrincipals({ request, user: user as any });
      const userEmail = principals.userEmail || '';
      const userRoles = principals.roles || [];
      const userGroups = principals.groupIds || [];

      const aclConditions = [];

      // User principal (check both userId and email)
      if (userId) {
        aclConditions.push(
          and(
            eq(noteAcls.principalType, 'user'),
            eq(noteAcls.principalId, userId)
          )
        );
      }
      if (userEmail) {
        aclConditions.push(
          and(
            eq(noteAcls.principalType, 'user'),
            eq(noteAcls.principalId, userEmail)
          )
        );
      }

      // Role principals
      for (const role of userRoles) {
        aclConditions.push(
          and(
            eq(noteAcls.principalType, 'role'),
            eq(noteAcls.principalId, role)
          )
        );
      }

      // Group principals
      if (userGroups.length > 0) {
        aclConditions.push(
          and(
            eq(noteAcls.principalType, 'group'),
            inArray(noteAcls.principalId, userGroups)
          )
        );
      }

      if (aclConditions.length > 0) {
        const userAcls = await db
          .select()
          .from(noteAcls)
          .where(
            and(
              eq(noteAcls.noteId, id),
              or(...aclConditions),
              sql`${noteAcls.permissions}::jsonb @> '["READ"]'::jsonb`
            )
          )
          .limit(1);

        // If user has ACL access, allow it (for 'ldd' and 'any' modes)
        if (userAcls.length > 0) {
          return NextResponse.json(note);
        }
      }
    }

    // For 'own' mode, we already checked ownership above, so return the note
    // For 'ldd' and 'any' modes, if no ACL match, still allow if we got here (global notes or public)
    if (mode === 'own') {
      return NextResponse.json(note);
    } else if (mode === 'ldd' || mode === 'any') {
      // Allow access for global notes (userId is null) or public notes
      if (!note.userId || note.isPublic) {
        return NextResponse.json(note);
      }
      // Otherwise, if user doesn't own it and no ACL match, deny
      if (userId && note.userId !== userId) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
      }
      return NextResponse.json(note);
    }

    return NextResponse.json(note);
  } catch (error) {
    console.error('[notepad] Get note error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch note' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/notepad/[id]
 */
export async function PUT(request: NextRequest) {
  try {
    const db = getDb();
    const id = extractId(request);
    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }

    const userId = getUserId(request);
    const body = await request.json();

    // Find existing note
    const [existing] = await db
      .select()
      .from(notes)
      .where(eq(notes.id, id))
      .limit(1);

    if (!existing) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // Check write permission and resolve scope mode
    const mode = await resolveNotepadScopeMode(request, { entity: 'notes', verb: 'write' });

    // Explicit branching on none/own/ldd/any
    if (mode === 'none') {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    } else if (mode === 'own') {
      // Only allow if user owns the note
      if (!userId || existing.userId !== userId) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
      }
    } else if (mode === 'ldd') {
      // Notes don't have LDD fields, so ldd mode is same as any (allow all)
      // No additional check needed
    } else if (mode === 'any') {
      // Allow all, no check needed
    }

    // Build update data
    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (body.title !== undefined) updateData.title = body.title;
    if (body.content !== undefined) updateData.content = body.content;

    const [note] = await db
      .update(notes)
      .set(updateData)
      .where(eq(notes.id, id))
      .returning();

    return NextResponse.json(note);
  } catch (error) {
    console.error('[notepad] Update note error:', error);
    return NextResponse.json(
      { error: 'Failed to update note' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/notepad/[id]
 */
export async function DELETE(request: NextRequest) {
  try {
    const db = getDb();
    const id = extractId(request);
    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }

    const userId = getUserId(request);

    // Find existing note
    const [existing] = await db
      .select()
      .from(notes)
      .where(eq(notes.id, id))
      .limit(1);

    if (!existing) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // Check delete permission and resolve scope mode
    const mode = await resolveNotepadScopeMode(request, { entity: 'notes', verb: 'delete' });

    // Explicit branching on none/own/ldd/any
    if (mode === 'none') {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    } else if (mode === 'own') {
      // Only allow if user owns the note
      if (!userId || existing.userId !== userId) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
      }
    } else if (mode === 'ldd') {
      // Notes don't have LDD fields, so ldd mode is same as any (allow all)
      // No additional check needed
    } else if (mode === 'any') {
      // Allow all, no check needed
    }

    await db.delete(notes).where(eq(notes.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[notepad] Delete note error:', error);
    return NextResponse.json(
      { error: 'Failed to delete note' },
      { status: 500 }
    );
  }
}

