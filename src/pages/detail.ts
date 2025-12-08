/**
 * Note Detail Page Generator
 *
 * Generates a read-only view of a single note.
 * Shows note content with metadata and action buttons.
 */

import type { UISpec, RequestContext, ButtonSpec } from '@hit/feature-pack-types';

interface NotepadOptions {
  sharing_enabled?: boolean;
  show_timestamps?: boolean;
  allow_delete?: boolean;
  allow_rich_text?: boolean;
}

export async function detail(ctx: RequestContext): Promise<UISpec> {
  const opts = ctx.options as NotepadOptions;

  // API endpoint - the {id} will be replaced by the router
  const apiBase = '/api/notepad';

  // Page actions
  const pageActions: ButtonSpec[] = [
    {
      type: 'Button',
      label: 'Edit',
      variant: 'primary',
      icon: 'edit',
      onClick: {
        type: 'navigate',
        to: '/notepad/{id}/edit',
      },
    },
    {
      type: 'Button',
      label: 'Back to List',
      variant: 'outline',
      icon: 'arrow-left',
      onClick: {
        type: 'navigate',
        to: '/notepad',
      },
    },
  ];

  // Add share button if sharing is enabled
  if (opts.sharing_enabled) {
    pageActions.push({
      type: 'Button',
      label: 'Share',
      variant: 'secondary',
      icon: 'share',
      onClick: {
        type: 'api',
        method: 'POST',
        endpoint: `${apiBase}/{id}/share`,
        onSuccess: {
          type: 'openModal',
          modal: {
            type: 'Modal',
            title: 'Share Link Created',
            size: 'md',
            children: [
              {
                type: 'Text',
                content: 'Anyone with this link can view your note:',
              },
              {
                type: 'TextField',
                name: 'shareUrl',
                readOnly: true,
                // The actual URL would be populated by the API response
              },
            ],
            footer: [
              {
                type: 'Button',
                label: 'Copy Link',
                variant: 'primary',
                icon: 'copy',
                onClick: { type: 'custom', name: 'copyToClipboard', payload: { field: 'shareUrl' } },
              },
              {
                type: 'Button',
                label: 'Close',
                variant: 'outline',
                onClick: { type: 'closeModal' },
              },
            ],
          },
        },
      },
    });
  }

  // Add delete button if allowed
  if (opts.allow_delete !== false) {
    pageActions.push({
      type: 'Button',
      label: 'Delete',
      variant: 'danger',
      icon: 'trash',
      onClick: {
        type: 'api',
        method: 'DELETE',
        endpoint: `${apiBase}/{id}`,
        confirm: 'Are you sure you want to delete this note? This action cannot be undone.',
        onSuccess: {
          type: 'navigate',
          to: '/notepad',
        },
      },
    });
  }

  // Build the detail view
  // This uses Async to fetch the note data and render it
  return {
    type: 'Page',
    title: 'Note',
    actions: pageActions,
    children: [
      {
        type: 'Async',
        endpoint: `${apiBase}/{id}`,
        loading: {
          type: 'Loading',
          text: 'Loading note...',
          variant: 'skeleton',
        },
        error: {
          type: 'Alert',
          variant: 'error',
          title: 'Error',
          message: 'Failed to load note. It may have been deleted.',
        },
      },
      // The Async component will replace this with the actual note content
      // For now, we show a card layout that will be populated
      {
        type: 'Card',
        children: [
          {
            type: 'Text',
            variant: 'h2',
            content: '{title}', // Interpolated from API response
          },
          {
            type: 'Text',
            variant: 'body',
            content: '{content}', // Interpolated from API response
            className: 'whitespace-pre-wrap',
          },
        ],
        footer: opts.show_timestamps !== false
          ? [
              {
                type: 'Row',
                justify: 'between',
                children: [
                  {
                    type: 'Text',
                    variant: 'muted',
                    content: 'Created: {createdAt}',
                  },
                  {
                    type: 'Text',
                    variant: 'muted',
                    content: 'Updated: {updatedAt}',
                  },
                ],
              },
            ]
          : undefined,
      },
    ],
  };
}
