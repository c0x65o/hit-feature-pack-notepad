/**
 * Navigation contributions for notepad feature pack
 *
 * Adds "Notes" to the sidebar via nav-shell integration.
 */

import type { NavContribution } from '@hit/feature-pack-types';

export const navContributions: NavContribution[] = [
  {
    id: 'notepad.list',
    label: 'Notes',
    path: '/notepad',
    slots: ['sidebar.primary'],
    permissions: [], // No special permissions required - access controlled by scope option
    order: 50, // Middle of the list
    icon: 'file-text',
  },
];
