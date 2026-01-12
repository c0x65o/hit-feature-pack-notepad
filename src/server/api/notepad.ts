// src/server/api/notepad.ts
import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { notes, noteAcls } from '@/lib/feature-pack-schemas';
import { eq, desc, asc, like, sql, and, or, inArray, type AnyColumn } from 'drizzle-orm';
import { getUserId, extractUserFromRequest } from '../auth';
import { resolveUserPrincipals } from '@hit/feature-pack-auth-core/server/lib/acl-utils';
import { resolveNotepadScopeMode } from '../lib/scope-mode';
import { requireNotepadAction } from '../lib/require-action';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/notepad
 * List notes (with scope-based filtering)
 */
export async function GET(request: NextRequest) {
  try {
    const db = getDb();
    const { searchParams } = new URL(request.url);
    const user = extractUserFromRequest(request);
    const userId = user?.sub || null;

    // Check read permission and resolve scope mode
    const mode = await resolveNotepadScopeMode(request, { entity: 'notes', verb: 'read' });

    if (mode === 'none') {
      // Explicit deny: return empty results (fail-closed but non-breaking for list UI)
      return NextResponse.json({
        items: [],
        pagination: {
          page: 1,
          pageSize: 0,
          total: 0,
          totalPages: 0,
        },
      });
    }

    // Pagination
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '25', 10);
    const offset = (page - 1) * pageSize;

    // Sorting
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Search
    const search = searchParams.get('search') || '';

    // Build where conditions
    const conditions: any[] = [];

    // Apply scope-based filtering (explicit branching on none/own/ldd/any)
    if (mode === 'own') {
      // Only show notes owned by the current user
      if (!userId) {
        // No user ID means no access in 'own' mode
        return NextResponse.json({
          items: [],
          pagination: {
            page: 1,
            pageSize: 0,
            total: 0,
            totalPages: 0,
          },
        });
      }
      conditions.push(eq(notes.userId, userId));
    } else if (mode === 'ldd') {
      // Notes don't have LDD fields, so ldd mode is same as any (allow all)
      // No filtering needed
    } else if (mode === 'any') {
      // Allow all notes, no filtering needed
    }
    // mode === 'none' already handled above

    // Also include notes shared via ACL
    if (userId) {
      const principals = await resolveUserPrincipals({ request, user: user as any });
      const userEmail = principals.userEmail || '';
      const userRoles = principals.roles || [];
      const userGroups = principals.groupIds || [];

      // Find note IDs that user has READ access to via ACL
      let sharedNoteIds: string[] = [];
      if (userId || userEmail || userRoles.length > 0 || userGroups.length > 0) {
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
            .select({ noteId: noteAcls.noteId })
            .from(noteAcls)
            .where(
              and(
                or(...aclConditions),
                sql`${noteAcls.permissions}::jsonb @> '["READ"]'::jsonb`
              )
            );

          sharedNoteIds = [...new Set(userAcls.map((acl: { noteId: string }) => acl.noteId))] as string[];
        }
      }

      // If we have shared note IDs, include them in the query
      if (sharedNoteIds.length > 0) {
        if (mode === 'own') {
          // For 'own' mode, include own notes OR shared notes
          conditions.push(
            or(
              eq(notes.userId, userId),
              inArray(notes.id, sharedNoteIds)
            )!
          );
        } else {
          // For 'ldd' or 'any', include shared notes (already allowing all, but ACLs add more)
          // This is a bit redundant but keeps ACL support consistent
          if (conditions.length === 0) {
            conditions.push(inArray(notes.id, sharedNoteIds));
          } else {
            // Merge with existing conditions
            const existingCondition = conditions.pop();
            conditions.push(
              or(
                existingCondition,
                inArray(notes.id, sharedNoteIds)
              )!
            );
          }
        }
      }
    }

    // Search in title and content
    if (search) {
      conditions.push(
        or(
          like(notes.title, `%${search}%`),
          like(notes.content, `%${search}%`)
        )!
      );
    }

    // Apply sorting
    const sortColumns: Record<string, AnyColumn> = {
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
    const countQuery = db.select({ count: sql<number>`count(*)` }).from(notes);
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
  } catch (error) {
    console.error('[notepad] List notes error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notes' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/notepad
 * Create a new note
 */
export async function POST(request: NextRequest) {
  try {
    // Check create permission
    const createCheck = await requireNotepadAction(request, 'notepad.notes.create');
    if (createCheck) return createCheck;

    // Check write permission
    const mode = await resolveNotepadScopeMode(request, { entity: 'notes', verb: 'write' });
    if (mode === 'none') {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    const db = getDb();
    const body = await request.json();

    // Validate required fields
    if (!body.title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    const userId = getUserId(request);

    const result = await db.insert(notes).values({
      title: body.title as string,
      content: (body.content || '') as string,
      userId: userId || null, // null for global scope
      isPublic: false,
      shareToken: null,
    }).returning();

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error('[notepad] Create note error:', error);
    return NextResponse.json(
      { error: 'Failed to create note' },
      { status: 500 }
    );
  }
}

