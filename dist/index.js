/**
 * @hit/feature-pack-notepad
 *
 * Notepad feature pack with CRUD, list view, sharing, and per-user/global scope.
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
// Pages
export * from './pages/index';
// Components
export * from './components/index';
// Hooks
export * from './hooks/index';
// Navigation config
export { navContributions as nav } from './nav';
// Schema exports - for projects to import into their schema
export { notes } from './schema/notepad';
//# sourceMappingURL=index.js.map