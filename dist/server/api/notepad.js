// src/server/api/notepad.ts
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { notes, noteAcls } from '@/lib/feature-pack-schemas';
import { eq, desc, asc, like, sql, and, or, inArray } from 'drizzle-orm';
import { getUserId, extractUserFromRequest } from '../auth';
import { resolveUserPrincipals } from '@hit/acl-utils';
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
/**
 * GET /api/notepad
 * List notes (with per-user or global scope based on config)
 */
export async function GET(request) {
    try {
        const db = getDb();
        const { searchParams } = new URL(request.url);
        // Pagination
        const page = parseInt(searchParams.get('page') || '1', 10);
        const pageSize = parseInt(searchParams.get('pageSize') || '25', 10);
        const offset = (page - 1) * pageSize;
        // Sorting
        const sortBy = searchParams.get('sortBy') || 'createdAt';
        const sortOrder = searchParams.get('sortOrder') || 'desc';
        // Search
        const search = searchParams.get('search') || '';
        // Scope parameter (per_user or global)
        const scope = searchParams.get('scope') || 'per_user';
        const user = extractUserFromRequest(request);
        const userId = user?.sub || null;
        if (!userId && scope === 'per_user') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        // Build where conditions
        const conditions = [];
        // Per-user scope: filter by userId OR notes shared via ACL
        if (scope === 'per_user' && userId) {
            const principals = await resolveUserPrincipals({ request, user: user });
            const userEmail = principals.userEmail || '';
            const userRoles = principals.roles || [];
            const userGroups = principals.groupIds || [];
            // Find note IDs that user has READ access to via ACL
            let sharedNoteIds = [];
            if (userId || userEmail || userRoles.length > 0 || userGroups.length > 0) {
                // Build ACL conditions: check user ID/email with principalType='user', roles with principalType='role'
                const aclConditions = [];
                // User principal (check both userId and email)
                if (userId) {
                    aclConditions.push(and(eq(noteAcls.principalType, 'user'), eq(noteAcls.principalId, userId)));
                }
                if (userEmail) {
                    aclConditions.push(and(eq(noteAcls.principalType, 'user'), eq(noteAcls.principalId, userEmail)));
                }
                // Role principals
                for (const role of userRoles) {
                    aclConditions.push(and(eq(noteAcls.principalType, 'role'), eq(noteAcls.principalId, role)));
                }
                // Group principals (includes dynamic groups via auth /me/groups)
                if (userGroups.length > 0) {
                    aclConditions.push(and(eq(noteAcls.principalType, 'group'), inArray(noteAcls.principalId, userGroups)));
                }
                if (aclConditions.length > 0) {
                    const userAcls = await db
                        .select({ noteId: noteAcls.noteId })
                        .from(noteAcls)
                        .where(and(or(...aclConditions), sql `${noteAcls.permissions}::jsonb @> '["READ"]'::jsonb`));
                    sharedNoteIds = [...new Set(userAcls.map((acl) => acl.noteId))];
                }
            }
            // Include notes owned by user OR notes shared via ACL
            if (sharedNoteIds.length > 0) {
                conditions.push(or(eq(notes.userId, userId), inArray(notes.id, sharedNoteIds)));
            }
            else {
                conditions.push(eq(notes.userId, userId));
            }
        }
        // Search in title and content
        if (search) {
            conditions.push(or(like(notes.title, `%${search}%`), like(notes.content, `%${search}%`)));
        }
        // Apply sorting
        const sortColumns = {
            id: notes.id,
            title: notes.title,
            createdAt: notes.createdAt,
            updatedAt: notes.updatedAt,
        };
        const orderCol = sortColumns[sortBy] ?? notes.createdAt;
        const orderDirection = sortOrder === 'asc' ? asc(orderCol) : desc(orderCol);
        // Build where clause
        const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
        // Get total count for pagination
        const countQuery = db.select({ count: sql `count(*)` }).from(notes);
        const countResult = whereClause
            ? await countQuery.where(whereClause)
            : await countQuery;
        const total = Number(countResult[0]?.count || 0);
        // Execute main query
        const baseQuery = db.select().from(notes);
        const items = whereClause
            ? await baseQuery.where(whereClause).orderBy(orderDirection).limit(pageSize).offset(offset)
            : await baseQuery.orderBy(orderDirection).limit(pageSize).offset(offset);
        return NextResponse.json({
            items,
            pagination: {
                page,
                pageSize,
                total,
                totalPages: Math.ceil(total / pageSize),
            },
        });
    }
    catch (error) {
        console.error('[notepad] List notes error:', error);
        return NextResponse.json({ error: 'Failed to fetch notes' }, { status: 500 });
    }
}
/**
 * POST /api/notepad
 * Create a new note
 */
export async function POST(request) {
    try {
        const db = getDb();
        const body = await request.json();
        // Validate required fields
        if (!body.title) {
            return NextResponse.json({ error: 'Title is required' }, { status: 400 });
        }
        const userId = getUserId(request);
        const result = await db.insert(notes).values({
            title: body.title,
            content: (body.content || ''),
            userId: userId || null, // null for global scope
            isPublic: false,
            shareToken: null,
        }).returning();
        return NextResponse.json(result[0], { status: 201 });
    }
    catch (error) {
        console.error('[notepad] Create note error:', error);
        return NextResponse.json({ error: 'Failed to create note' }, { status: 500 });
    }
}
//# sourceMappingURL=notepad.js.map