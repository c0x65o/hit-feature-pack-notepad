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
export { NoteList, NoteListPage, NoteDetail, NoteDetailPage, NoteEdit, NoteEditPage, } from './pages/index';
// Components - exported individually for tree-shaking
export * from './components/index';
// Hooks - exported individually for tree-shaking
export * from './hooks/index';
// Navigation config
export { navContributions as nav } from './nav';
//# sourceMappingURL=index.js.map