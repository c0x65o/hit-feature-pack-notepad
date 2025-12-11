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
export { NoteList, NoteListPage, NoteDetail, NoteDetailPage, NoteEdit, NoteEditPage, } from './pages/index';
export * from './components/index';
export * from './hooks/index';
export { navContributions as nav } from './nav';
export { notes, type Note, type InsertNote, type UpdateNote } from './schema/notepad';
//# sourceMappingURL=index.d.ts.map