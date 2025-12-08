# @hit/feature-pack-notepad

Schema-driven notepad feature pack with list view, sharing, and per-user/global scope.

**This is the first data-backed feature pack**, pioneering the pattern of feature packs that contribute Drizzle schema and API routes to projects.

## Features

- **Notes list** - DataTable with pagination, search, sort
- **Note detail view** - Read-only view with metadata
- **Create/edit forms** - Simple text editor
- **Optional sharing** - Generate public links for notes
- **Scope control** - Per-user or global visibility
- **Drizzle schema** - Database integration without a separate module

## Quick Start

### 1. Add to hit.yaml

```yaml
feature_packs:
  - name: notepad
    version: 1.0
    options:
      scope: per_user        # or 'global'
      sharing_enabled: true  # optional
```

### 2. Integrate Schema (Manual - until CLI tooling is built)

Since this feature pack contributes database schema, you need to manually integrate it into your project:

#### Step 1: Install the package

```bash
npm install @hit/feature-pack-notepad
```

#### Step 2: Import schema into your project

Edit your project's `lib/schema.ts`:

```typescript
// lib/schema.ts
import { pgTable, varchar, integer, timestamp } from "drizzle-orm/pg-core";

// Your existing schema...
export const myExistingTable = pgTable("my_table", {
  // ...
});

// Import and re-export notepad schema
export { notes, type Note, type InsertNote, type UpdateNote } from "@hit/feature-pack-notepad";
```

#### Step 3: Run migrations

```bash
npm run db:push
# or
npx drizzle-kit push
```

### 3. Create API Routes

Create the API routes in your project's `app/api/` directory:

#### `app/api/notepad/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { notes } from "@/lib/schema";
import { eq, desc } from "drizzle-orm";

// GET /api/notepad - List notes
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = req.headers.get("x-user-id"); // From auth middleware
  
  // TODO: Filter by userId if scope is per_user
  const allNotes = await db
    .select()
    .from(notes)
    .orderBy(desc(notes.createdAt));

  return NextResponse.json(allNotes);
}

// POST /api/notepad - Create note
export async function POST(req: NextRequest) {
  const userId = req.headers.get("x-user-id");
  const body = await req.json();

  const [newNote] = await db
    .insert(notes)
    .values({
      title: body.title,
      content: body.content || "",
      userId: userId,
    })
    .returning();

  return NextResponse.json(newNote, { status: 201 });
}
```

#### `app/api/notepad/[id]/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { notes } from "@/lib/schema";
import { eq } from "drizzle-orm";

// GET /api/notepad/[id] - Get single note
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const [note] = await db
    .select()
    .from(notes)
    .where(eq(notes.id, params.id));

  if (!note) {
    return NextResponse.json({ error: "Note not found" }, { status: 404 });
  }

  return NextResponse.json(note);
}

// PUT /api/notepad/[id] - Update note
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await req.json();

  const [updated] = await db
    .update(notes)
    .set({
      title: body.title,
      content: body.content,
      updatedAt: new Date(),
    })
    .where(eq(notes.id, params.id))
    .returning();

  if (!updated) {
    return NextResponse.json({ error: "Note not found" }, { status: 404 });
  }

  return NextResponse.json(updated);
}

// DELETE /api/notepad/[id] - Delete note
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const [deleted] = await db
    .delete(notes)
    .where(eq(notes.id, params.id))
    .returning();

  if (!deleted) {
    return NextResponse.json({ error: "Note not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `scope` | `'per_user'` \| `'global'` | `'per_user'` | Per-user: each user sees own notes. Global: all users see all notes. |
| `sharing_enabled` | boolean | `false` | Enable note sharing via public links |
| `allow_rich_text` | boolean | `false` | Enable markdown/rich text editing |
| `show_timestamps` | boolean | `true` | Show created/updated timestamps in list |
| `allow_delete` | boolean | `true` | Allow users to delete notes |

## Schema

The feature pack provides a `notepad_notes` table:

```typescript
export const notes = pgTable("notepad_notes", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull().default(""),
  userId: varchar("user_id", { length: 255 }),
  isPublic: boolean("is_public").notNull().default(false),
  shareToken: varchar("share_token", { length: 64 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
```

## Future: Zero-Code Integration

The goal is for this to work with zero code changes:

```yaml
# hit.yaml - This should be ALL you need
feature_packs:
  - name: notepad
    options:
      scope: per_user
      sharing_enabled: true
```

Future CLI tooling will:
1. Auto-merge schema into project's `lib/schema.ts`
2. Auto-generate API routes from schema annotations
3. Run migrations as part of `hit provision`
4. Register nav contributions automatically

## Architecture

This feature pack demonstrates the new pattern of **data-backed feature packs**:

```
Feature Pack                        Project (auto-generated)
┌─────────────────────┐            ┌─────────────────────────┐
│ schema/notepad.ts   │  ───────►  │ lib/schema.ts           │
│ (Drizzle tables)    │            │ (imports & re-exports)  │
├─────────────────────┤            ├─────────────────────────┤
│ pages/*.ts          │  ───────►  │ ui-render serves pages  │
│ (UISpec generators) │            │ (no code in project)    │
├─────────────────────┤            ├─────────────────────────┤
│ nav.ts              │  ───────►  │ nav-shell merges        │
│ (sidebar items)     │            │ (automatic)             │
├─────────────────────┤            ├─────────────────────────┤
│ feature-pack.yaml   │  ───────►  │ app/api/notepad/*       │
│ (API route specs)   │            │ (generated routes)      │
└─────────────────────┘            └─────────────────────────┘
```

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Watch mode
npm run dev
```
