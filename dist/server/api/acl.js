// src/server/api/acl.ts
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
// @ts-ignore - noteAcls will be available when schema is imported by project
import { noteAcls, notes } from '@/lib/feature-pack-schemas';
import { eq, and, desc, or, inArray, sql } from 'drizzle-orm';
import { extractUserFromRequest } from '../auth';
import { resolveUserPrincipals } from '@/lib/acl-utils';
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
/**
 * GET /api/notepad/[id]/acl
 * List ACLs for a specific note
 */
export async function GET(request) {
    try {
        const db = getDb();
        const user = extractUserFromRequest(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const url = new URL(request.url);
        const parts = url.pathname.split('/');
        // /api/notepad/{id}/acl -> id is third-to-last part
        const noteId = parts[parts.length - 2] || null;
        if (!noteId) {
            return NextResponse.json({ error: 'Missing note ID' }, { status: 400 });
        }
        // Check if user has MANAGE_ACL permission on the note (required to view ACLs)
        // For now, check if user owns the note (owner has MANAGE_ACL by default)
        const [note] = await db
            .select()
            .from(notes)
            .where(eq(notes.id, noteId))
            .limit(1);
        if (!note) {
            return NextResponse.json({ error: 'Note not found' }, { status: 404 });
        }
        // Check if user is the owner
        if (note.userId && note.userId !== user.sub) {
            const principals = await resolveUserPrincipals({ request, user: user });
            const userId = principals.userId;
            const userEmail = principals.userEmail || '';
            const roles = principals.roles || [];
            const groupIds = principals.groupIds || [];
            const conds = [];
            // user principal (id + email)
            if (userId) {
                conds.push(and(eq(noteAcls.principalType, 'user'), eq(noteAcls.principalId, userId)));
            }
            if (userEmail) {
                conds.push(and(eq(noteAcls.principalType, 'user'), eq(noteAcls.principalId, userEmail)));
            }
            // role principals
            for (const r of roles) {
                conds.push(and(eq(noteAcls.principalType, 'role'), eq(noteAcls.principalId, r)));
            }
            // group principals
            if (groupIds.length > 0) {
                conds.push(and(eq(noteAcls.principalType, 'group'), inArray(noteAcls.principalId, groupIds)));
            }
            const userAcls = conds.length
                ? await db
                    .select()
                    .from(noteAcls)
                    .where(and(eq(noteAcls.noteId, noteId), or(...conds), sql `${noteAcls.permissions}::jsonb @> '["MANAGE_ACL"]'::jsonb`))
                : [];
            const hasManageAcl = userAcls.length > 0;
            if (!hasManageAcl) {
                return NextResponse.json({ error: 'Forbidden: Insufficient permissions to view ACLs' }, { status: 403 });
            }
        }
        // Get all ACLs for this note
        const items = await db
            .select()
            .from(noteAcls)
            .where(eq(noteAcls.noteId, noteId))
            .orderBy(desc(noteAcls.createdAt));
        return NextResponse.json({ items });
    }
    catch (error) {
        console.error('[notepad] List ACL error:', error);
        return NextResponse.json({ error: 'Failed to fetch ACLs' }, { status: 500 });
    }
}
/**
 * POST /api/notepad/[id]/acl
 * Create ACL entry
 */
export async function POST(request) {
    try {
        const db = getDb();
        const body = await request.json();
        const user = extractUserFromRequest(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const url = new URL(request.url);
        const parts = url.pathname.split('/');
        const noteId = parts[parts.length - 2] || null;
        if (!noteId) {
            return NextResponse.json({ error: 'Missing note ID' }, { status: 400 });
        }
        // Validate required fields
        if (!body.principalType || !body.principalId || !body.permissions) {
            return NextResponse.json({
                error: 'Missing required fields: principalType, principalId, permissions',
            }, { status: 400 });
        }
        // Check if note exists
        const [note] = await db
            .select()
            .from(notes)
            .where(eq(notes.id, noteId))
            .limit(1);
        if (!note) {
            return NextResponse.json({ error: 'Note not found' }, { status: 404 });
        }
        // Check if user has MANAGE_ACL permission
        if (note.userId && note.userId !== user.sub) {
            const principals = await resolveUserPrincipals({ request, user: user });
            const userId = principals.userId;
            const userEmail = principals.userEmail || '';
            const roles = principals.roles || [];
            const groupIds = principals.groupIds || [];
            const conds = [];
            if (userId)
                conds.push(and(eq(noteAcls.principalType, 'user'), eq(noteAcls.principalId, userId)));
            if (userEmail)
                conds.push(and(eq(noteAcls.principalType, 'user'), eq(noteAcls.principalId, userEmail)));
            for (const r of roles)
                conds.push(and(eq(noteAcls.principalType, 'role'), eq(noteAcls.principalId, r)));
            if (groupIds.length > 0)
                conds.push(and(eq(noteAcls.principalType, 'group'), inArray(noteAcls.principalId, groupIds)));
            const userAcls = conds.length
                ? await db
                    .select()
                    .from(noteAcls)
                    .where(and(eq(noteAcls.noteId, noteId), or(...conds), sql `${noteAcls.permissions}::jsonb @> '["MANAGE_ACL"]'::jsonb`))
                : [];
            const hasManageAcl = userAcls.length > 0;
            if (!hasManageAcl) {
                return NextResponse.json({
                    error: 'Forbidden: Insufficient permissions to manage ACLs',
                }, { status: 403 });
            }
        }
        const result = await db
            .insert(noteAcls)
            .values({
            noteId,
            principalType: body.principalType,
            principalId: body.principalId,
            permissions: Array.isArray(body.permissions)
                ? body.permissions
                : [],
            createdBy: user.sub,
        })
            .returning();
        return NextResponse.json(result[0], { status: 201 });
    }
    catch (error) {
        console.error('[notepad] Create ACL error:', error);
        return NextResponse.json({ error: 'Failed to create ACL' }, { status: 500 });
    }
}
/**
 * DELETE /api/notepad/[id]/acl/[aclId]
 * Delete ACL entry
 */
export async function DELETE(request) {
    try {
        const db = getDb();
        const user = extractUserFromRequest(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const url = new URL(request.url);
        const parts = url.pathname.split('/');
        // /api/notepad/{noteId}/acl/{aclId} -> noteId is third-to-last, aclId is last
        const noteId = parts[parts.length - 3] || null;
        const aclId = parts[parts.length - 1] || null;
        if (!noteId || !aclId) {
            return NextResponse.json({ error: 'Missing note ID or ACL ID' }, { status: 400 });
        }
        // Check if ACL exists
        const [acl] = await db
            .select()
            .from(noteAcls)
            .where(eq(noteAcls.id, aclId))
            .limit(1);
        if (!acl) {
            return NextResponse.json({ error: 'ACL not found' }, { status: 404 });
        }
        // Verify ACL belongs to the note
        if (acl.noteId !== noteId) {
            return NextResponse.json({ error: 'ACL does not belong to this note' }, { status: 400 });
        }
        // Check if user has MANAGE_ACL permission
        const [note] = await db
            .select()
            .from(notes)
            .where(eq(notes.id, noteId))
            .limit(1);
        if (!note) {
            return NextResponse.json({ error: 'Note not found' }, { status: 404 });
        }
        if (note.userId && note.userId !== user.sub) {
            const principals = await resolveUserPrincipals({ request, user: user });
            const userId = principals.userId;
            const userEmail = principals.userEmail || '';
            const roles = principals.roles || [];
            const groupIds = principals.groupIds || [];
            const conds = [];
            if (userId)
                conds.push(and(eq(noteAcls.principalType, 'user'), eq(noteAcls.principalId, userId)));
            if (userEmail)
                conds.push(and(eq(noteAcls.principalType, 'user'), eq(noteAcls.principalId, userEmail)));
            for (const r of roles)
                conds.push(and(eq(noteAcls.principalType, 'role'), eq(noteAcls.principalId, r)));
            if (groupIds.length > 0)
                conds.push(and(eq(noteAcls.principalType, 'group'), inArray(noteAcls.principalId, groupIds)));
            const userAcls = conds.length
                ? await db
                    .select()
                    .from(noteAcls)
                    .where(and(eq(noteAcls.noteId, noteId), or(...conds), sql `${noteAcls.permissions}::jsonb @> '["MANAGE_ACL"]'::jsonb`))
                : [];
            const hasManageAcl = userAcls.length > 0;
            if (!hasManageAcl) {
                return NextResponse.json({
                    error: 'Forbidden: Insufficient permissions to manage ACLs',
                }, { status: 403 });
            }
        }
        await db.delete(noteAcls).where(eq(noteAcls.id, aclId));
        return NextResponse.json({ success: true });
    }
    catch (error) {
        console.error('[notepad] Delete ACL error:', error);
        return NextResponse.json({ error: 'Failed to delete ACL' }, { status: 500 });
    }
}
//# sourceMappingURL=acl.js.map