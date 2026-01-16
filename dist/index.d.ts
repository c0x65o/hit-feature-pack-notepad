/**
 * @hit/feature-pack-notepad
 *
 * Notepad feature pack with CRUD, list view, sharing, and per-user/global scope.
 *
 * This pack uses schema-driven UI. All pages (List, Detail, Edit)
 * are generated automatically from schema/entities/notepad.notes.yaml.
 */
export { NoteAclModal } from './components/NoteAclModal';
export { useNotes, useNote, useNoteMutations } from './hooks/useNotepad';
export type { PaginatedResponse, UseQueryOptions } from './hooks/useNotepad';
export { navContributions as nav } from './nav';
export type { Note, InsertNote, UpdateNote } from './schema/notepad';
//# sourceMappingURL=index.d.ts.map