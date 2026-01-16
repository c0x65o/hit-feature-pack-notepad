/**
 * @hit/feature-pack-notepad
 *
 * Notepad feature pack with CRUD, list view, sharing, and per-user/global scope.
 *
 * This pack uses schema-driven UI. All pages (List, Detail, Edit)
 * are generated automatically from schema/entities/notepad.notes.yaml.
 */

// Components - exported individually for tree-shaking
export { NoteAclModal } from './components/NoteAclModal';

// Hooks - exported individually for tree-shaking
export { useNotes, useNote, useNoteMutations } from './hooks/useNotepad';
export type { PaginatedResponse, UseQueryOptions } from './hooks/useNotepad';

// Navigation config
export { navContributions as nav } from './nav';

// Schema exports - MOVED to @hit/feature-pack-notepad/schema to avoid bundling drizzle-orm in client
// Only re-export types (no runtime drizzle dependency)
export type { Note, InsertNote, UpdateNote } from './schema/notepad';
