/**
 * Note Edit/Create Page Generator
 *
 * Generates a form for creating or editing notes.
 * Uses UISpec FormSpec with TextArea for content.
 */
export async function edit(ctx) {
    const opts = ctx.options;
    // Determine if this is a new note or editing existing
    // The {id} parameter will be 'new' for creation or a UUID for editing
    const isNew = !ctx.options?.noteId; // This would be set by the router
    const apiBase = '/api/notepad';
    // Build form fields
    const fields = [
        {
            type: 'TextField',
            name: 'title',
            label: 'Title',
            placeholder: 'Enter note title...',
            required: true,
            validation: [
                { type: 'required', message: 'Title is required' },
                { type: 'max', value: 255, message: 'Title must be 255 characters or less' },
            ],
        },
        {
            type: 'TextArea',
            name: 'content',
            label: 'Content',
            placeholder: opts.allow_rich_text
                ? 'Write your note... (Markdown supported)'
                : 'Write your note...',
            rows: 15,
            helpText: opts.allow_rich_text
                ? 'Markdown formatting is supported'
                : undefined,
        },
    ];
    return {
        type: 'Page',
        title: isNew ? 'New Note' : 'Edit Note',
        actions: [
            {
                type: 'Button',
                label: 'Cancel',
                variant: 'outline',
                onClick: {
                    type: 'navigate',
                    to: isNew ? '/notepad' : '/notepad/{id}',
                },
            },
        ],
        children: [
            {
                type: 'Card',
                children: [
                    {
                        type: 'Form',
                        id: 'note-form',
                        endpoint: isNew ? apiBase : `${apiBase}/{id}`,
                        method: isNew ? 'POST' : 'PUT',
                        fields,
                        submitText: isNew ? 'Create Note' : 'Save Changes',
                        onSuccess: {
                            type: 'navigate',
                            to: isNew ? '/notepad' : '/notepad/{id}',
                        },
                        // For edit mode, initial values would be populated from API
                        // The ui-render would fetch the note data and populate the form
                    },
                ],
            },
        ],
    };
}
//# sourceMappingURL=edit.js.map