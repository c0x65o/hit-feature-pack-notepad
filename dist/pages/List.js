'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Plus, Eye, Edit, Trash2, Share2, } from 'lucide-react';
import { useUi } from '@hit/ui-kit';
import { useNotes, useNoteMutations } from '../hooks/useNotepad';
export function NoteList({ onNavigate, showTimestamps = true, sharingEnabled = false, allowDelete = true, }) {
    const { Page, Card, Button, DataTable, Badge, EmptyState, Alert, Spinner } = useUi();
    const [page, setPage] = useState(1);
    const { data, loading, error, refresh } = useNotes({
        page,
        pageSize: 25,
        sortBy: 'updatedAt',
        sortOrder: 'desc',
    });
    const { deleteNote, loading: mutating } = useNoteMutations();
    const navigate = (path) => {
        if (onNavigate) {
            onNavigate(path);
        }
        else if (typeof window !== 'undefined') {
            window.location.href = path;
        }
    };
    const handleDelete = async (id, title) => {
        if (!confirm(`Are you sure you want to delete "${title}"? This cannot be undone.`)) {
            return;
        }
        try {
            await deleteNote(id);
            refresh();
        }
        catch {
            // Error handled by hook
        }
    };
    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };
    return (_jsxs(Page, { title: "Notes", description: "Your personal notes", actions: _jsxs(Button, { variant: "primary", onClick: () => navigate('/notepad/new'), children: [_jsx(Plus, { size: 16, className: "mr-2" }), "New Note"] }), children: [error && (_jsx(Alert, { variant: "error", title: "Error loading notes", children: error.message })), _jsx(Card, { children: _jsx(DataTable, { columns: [
                        {
                            key: 'title',
                            label: 'Title',
                            sortable: true,
                            render: (_, row) => (_jsx("button", { onClick: () => navigate(`/notepad/${row.id}`), className: "font-medium hover:text-blue-500 transition-colors text-left", children: row.title })),
                        },
                        ...(showTimestamps
                            ? [
                                {
                                    key: 'updatedAt',
                                    label: 'Updated',
                                    sortable: true,
                                    render: (value) => formatDate(value),
                                },
                                {
                                    key: 'createdAt',
                                    label: 'Created',
                                    sortable: true,
                                    render: (value) => formatDate(value),
                                },
                            ]
                            : []),
                        ...(sharingEnabled
                            ? [
                                {
                                    key: 'isPublic',
                                    label: 'Status',
                                    render: (value) => value ? _jsx(Badge, { variant: "success", children: "Shared" }) : _jsx(Badge, { children: "Private" }),
                                },
                            ]
                            : []),
                        {
                            key: 'actions',
                            label: '',
                            align: 'right',
                            sortable: false,
                            hideable: false,
                            render: (_, row) => (_jsxs("div", { className: "flex items-center justify-end gap-2", children: [_jsx(Button, { variant: "ghost", size: "sm", onClick: () => navigate(`/notepad/${row.id}`), children: _jsx(Eye, { size: 16 }) }), _jsx(Button, { variant: "ghost", size: "sm", onClick: () => navigate(`/notepad/${row.id}/edit`), children: _jsx(Edit, { size: 16 }) }), sharingEnabled && (_jsx(Button, { variant: "ghost", size: "sm", onClick: () => navigate(`/notepad/${row.id}?share=true`), children: _jsx(Share2, { size: 16 }) })), allowDelete && (_jsx(Button, { variant: "ghost", size: "sm", disabled: mutating, onClick: () => handleDelete(row.id, row.title), children: _jsx(Trash2, { size: 16, className: "text-red-500" }) }))] })),
                        },
                    ], data: data?.items.map((note) => ({
                        id: note.id,
                        title: note.title,
                        updatedAt: note.updatedAt,
                        createdAt: note.createdAt,
                        isPublic: note.isPublic,
                    })) || [], emptyMessage: "No notes found", loading: loading, searchable: true, exportable: true, showColumnVisibility: true, pageSize: 25, onRefresh: refresh, refreshing: loading, tableId: "notepad.notes" }) })] }));
}
export default NoteList;
//# sourceMappingURL=List.js.map