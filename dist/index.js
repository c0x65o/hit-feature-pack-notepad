/**
 * @hit/feature-pack-notepad
 *
 * Notepad feature pack with CRUD, list view, sharing, and per-user/global scope.
 *
 * Components are exported individually for optimal tree-shaking.
 * When used with the route loader system, only the requested component is bundled.
 *
 * @example
 * ```tsx
 * import { NoteList, NoteDetail, NoteEdit } from '@hit/feature-pack-notepad';
 *
 * // Use in your app's routes
 * <Route path="/notepad" element={<NoteList />} />
 * <Route path="/notepad/:id" element={<NoteDetail id={params.id} />} />
 * <Route path="/notepad/:id/edit" element={<NoteEdit id={params.id} />} />
 * ```
 */
// Pages - exported individually for tree-shaking
export { NoteList, default as NoteListPage } from './pages/List';
export { NoteDetail, default as NoteDetailPage } from './pages/Detail';
export { NoteEdit, default as NoteEditPage } from './pages/Edit';
// Components - exported individually for tree-shaking
export { NoteAclModal } from './components/NoteAclModal';
// Hooks - exported individually for tree-shaking
export { useNotes, useNote, useNoteMutations } from './hooks/useNotepad';
// Navigation config
export { navContributions as nav } from './nav';
//# sourceMappingURL=index.js.map