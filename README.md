# @hit/feature-pack-notepad

Notepad feature pack with CRUD, list view, sharing, and per-user/global scope.

## Features

- **Notes list** - Paginated list with search, sort
- **Note detail view** - Read-only view with metadata
- **Create/edit forms** - Simple text editor
- **Optional sharing** - Generate public links for notes
- **Scope control** - Per-user or global visibility
- **Drizzle schema** - Database integration

## Quick Start

### 1. Add to hit.yaml

```yaml
feature_packs:
  - name: notepad
    version: "2.0"
    options:
      scope: per_user        # or 'global'
      sharing_enabled: true  # optional
```

### 2. Run hit feature add

```bash
hit feature add notepad
```

This will:
- Add `@hit/feature-pack-notepad` to your `package.json`
- Add the feature pack to your `hit.yaml`
- Regenerate routes

### 3. Integrate Schema

Import the notepad schema into your project's schema file:

```typescript
// lib/schema.ts
import { pgTable, varchar, integer, timestamp } from "drizzle-orm/pg-core";

// Your existing schema...
export const myExistingTable = pgTable("my_table", {
  // ...
});

// Import and re-export notepad schema
export { notes, type Note, type InsertNote, type UpdateNote } from "@hit/feature-pack-notepad/schema";
```

### 4. Run migrations

```bash
npm run db:push
# or
npx drizzle-kit push
```

### 5. Create API Routes

Create the API routes in your project's `app/api/` directory.

See the full API route examples in the feature pack's source code.

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `scope` | `'per_user'` \| `'global'` | `'per_user'` | Per-user: each user sees own notes. Global: all users see all notes. |
| `sharing_enabled` | boolean | `false` | Enable note sharing via public links |
| `allow_rich_text` | boolean | `false` | Enable markdown/rich text editing |
| `show_timestamps` | boolean | `true` | Show created/updated timestamps in list |
| `allow_delete` | boolean | `true` | Allow users to delete notes |

## Exports

### Pages (React Components)

```typescript
import { NoteList, NoteDetail, NoteEdit } from '@hit/feature-pack-notepad';
```

### Hooks

```typescript
import { useNotes, useNote, useNoteMutations } from '@hit/feature-pack-notepad';
```

### Schema

```typescript
import { notes, type Note, type InsertNote, type UpdateNote } from '@hit/feature-pack-notepad/schema';
```

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

## Routes

The feature pack registers these routes:

| Path | Component | Description |
|------|-----------|-------------|
| `/notepad` | `NoteList` | List all notes with search and pagination |
| `/notepad/new` | `NoteEdit` | Create a new note |
| `/notepad/[id]` | `NoteDetail` | View a note |
| `/notepad/[id]/edit` | `NoteEdit` | Edit a note |

## API Endpoints Required

Your project needs to implement these API routes:

| Endpoint | Methods | Description |
|----------|---------|-------------|
| `/api/notepad` | GET, POST | List notes / Create note |
| `/api/notepad/[id]` | GET, PUT, DELETE | Get/Update/Delete note |
| `/api/notepad/[id]/share` | POST, DELETE | Create/Revoke share link |
