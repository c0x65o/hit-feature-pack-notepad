/**
 * @hit/feature-pack-notepad
 *
 * Schema-driven notepad feature pack with list view, sharing, and per-user/global scope.
 * This is the first data-backed feature pack, pioneering the pattern of feature packs
 * that contribute Drizzle schema and API routes.
 *
 * Features:
 * - Notes list with DataTable (pagination, search, sort)
 * - Note detail view
 * - Create/edit forms
 * - Optional sharing via public links
 * - Per-user or global scope
 * - Drizzle schema for database integration
 */

import { list } from './pages/list';
import { detail } from './pages/detail';
import { edit } from './pages/edit';
import { navContributions } from './nav';
import { configSchema, configDefaults } from './config';
import type { FeaturePackModule, FeaturePackMetadata } from '@hit/feature-pack-types';

// Page generators - ui-render calls these
export const pages = {
  list,
  detail,
  edit,
};

// Navigation contributions
export { navContributions };

// Config schema for CAC admin
export { configSchema, configDefaults };

// Schema exports - for projects to import into their schema
export { notes, type Note, type InsertNote, type UpdateNote } from './schema/notepad';

// Feature pack metadata
export const metadata: FeaturePackMetadata = {
  name: 'notepad',
  version: '1.0.0',
  description: 'Simple notepad with list view, sharing, and per-user/global scope',
};

// Export the full module interface
const notepadModule: FeaturePackModule = {
  pages,
  navContributions,
  configSchema,
  configDefaults,
  metadata,
};

export default notepadModule;
