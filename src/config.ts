/**
 * Configuration schema and defaults for notepad feature pack
 *
 * These are admin-configurable options that control feature pack behavior.
 * Note: User preferences (like notes_per_page) are NOT here - they belong
 * in a separate user settings system.
 */

import type { ConfigSchema, ConfigDefaults } from '@hit/feature-pack-types';

export const configDefaults: ConfigDefaults = {
  // ─────────────────────────────────────────────────────────────
  // ACCESS & SCOPE
  // ─────────────────────────────────────────────────────────────
  scope: 'per_user', // 'per_user' or 'global'

  // ─────────────────────────────────────────────────────────────
  // SHARING
  // ─────────────────────────────────────────────────────────────
  sharing_enabled: false, // Allow sharing notes via public link

  // ─────────────────────────────────────────────────────────────
  // EDITOR
  // ─────────────────────────────────────────────────────────────
  allow_rich_text: false, // Enable markdown/rich text editing

  // ─────────────────────────────────────────────────────────────
  // DISPLAY
  // ─────────────────────────────────────────────────────────────
  show_timestamps: true, // Show created/updated timestamps in list

  // ─────────────────────────────────────────────────────────────
  // ACTIONS
  // ─────────────────────────────────────────────────────────────
  allow_delete: true, // Allow users to delete notes
};

export const configSchema: ConfigSchema = {
  type: 'object',
  properties: {
    // ─────────────────────────────────────────────────────────────
    // ACCESS & SCOPE
    // ─────────────────────────────────────────────────────────────
    scope: {
      type: 'string',
      enum: ['per_user', 'global'],
      description:
        'per_user: each user sees only their own notes. global: all users see all notes.',
      default: 'per_user',
    },

    // ─────────────────────────────────────────────────────────────
    // SHARING
    // ─────────────────────────────────────────────────────────────
    sharing_enabled: {
      type: 'boolean',
      description: 'Enable note sharing via public links. When enabled, users can generate shareable URLs for individual notes.',
      default: false,
    },

    // ─────────────────────────────────────────────────────────────
    // EDITOR
    // ─────────────────────────────────────────────────────────────
    allow_rich_text: {
      type: 'boolean',
      description: 'Enable markdown/rich text editing. When enabled, note content supports markdown formatting.',
      default: false,
    },

    // ─────────────────────────────────────────────────────────────
    // DISPLAY
    // ─────────────────────────────────────────────────────────────
    show_timestamps: {
      type: 'boolean',
      description: 'Show created and updated timestamps in the notes list view.',
      default: true,
    },

    // ─────────────────────────────────────────────────────────────
    // ACTIONS
    // ─────────────────────────────────────────────────────────────
    allow_delete: {
      type: 'boolean',
      description: 'Allow users to delete their notes. When disabled, notes can only be edited.',
      default: true,
    },
  },
};
