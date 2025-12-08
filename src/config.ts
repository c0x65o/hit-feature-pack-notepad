/**
 * Configuration defaults for notepad feature pack
 */

export const configDefaults = {
  scope: 'per_user' as const,
  sharing_enabled: false,
  allow_rich_text: false,
  show_timestamps: true,
  allow_delete: true,
};

export type NotepadConfig = typeof configDefaults;
