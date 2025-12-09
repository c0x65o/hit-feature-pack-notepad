/**
 * Notes List Page Generator
 *
 * Generates a DataTable-based list view for notes.
 * Uses UISpec DataTableSpec - no custom table implementation.
 */
export async function list(ctx) {
    const opts = ctx.options;
    // API endpoint for notes - uses project's API routes
    // The project generates these routes from the feature pack's schema
    const apiBase = '/api/notepad';
    // Build columns based on options
    const columns = [
        {
            key: 'title',
            label: 'Title',
            type: 'link',
            sortable: true,
        },
    ];
    if (opts.show_timestamps !== false) {
        columns.push({
            key: 'createdAt',
            label: 'Created',
            type: 'datetime',
            sortable: true,
        }, {
            key: 'updatedAt',
            label: 'Updated',
            type: 'datetime',
            sortable: true,
        });
    }
    // Show sharing status if sharing is enabled
    if (opts.sharing_enabled) {
        columns.push({
            key: 'isPublic',
            label: 'Shared',
            type: 'badge',
            badgeColors: {
                true: 'success',
                false: 'default',
            },
        });
    }
    // Build row actions
    const rowActions = [
        {
            type: 'Button',
            label: 'View',
            variant: 'ghost',
            icon: 'eye',
            onClick: {
                type: 'navigate',
                to: '/notepad/{id}',
            },
        },
        {
            type: 'Button',
            label: 'Edit',
            variant: 'ghost',
            icon: 'edit',
            onClick: {
                type: 'navigate',
                to: '/notepad/{id}/edit',
            },
        },
    ];
    // Add share button if sharing is enabled
    if (opts.sharing_enabled) {
        rowActions.push({
            type: 'Button',
            label: 'Share',
            variant: 'ghost',
            icon: 'share',
            onClick: {
                type: 'api',
                method: 'POST',
                endpoint: `${apiBase}/{id}/share`,
                onSuccess: {
                    type: 'openModal',
                    modal: {
                        type: 'Modal',
                        title: 'Share Link',
                        size: 'sm',
                        children: [
                            {
                                type: 'Text',
                                content: 'Share link copied to clipboard!',
                            },
                        ],
                        footer: [
                            {
                                type: 'Button',
                                label: 'Close',
                                variant: 'primary',
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
        rowActions.push({
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
                    type: 'refresh',
                },
            },
        });
    }
    // Page actions (header buttons)
    const pageActions = [
        {
            type: 'Button',
            label: 'New Note',
            variant: 'primary',
            icon: 'plus',
            onClick: {
                type: 'navigate',
                to: '/notepad/new',
            },
        },
    ];
    return {
        type: 'Page',
        title: 'Notes',
        description: opts.scope === 'global' ? 'All notes' : 'Your notes',
        actions: pageActions,
        children: [
            {
                type: 'DataTable',
                endpoint: apiBase,
                columns,
                pagination: true,
                pageSize: 25, // Default, can be overridden by user preferences
                searchable: true,
                sortable: true,
                rowActions,
                emptyMessage: 'No notes yet. Create your first note!',
            },
        ],
    };
}
//# sourceMappingURL=list.js.map