'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Plus, Eye, Edit, Trash2, Share2, FileText, ChevronLeft, ChevronRight, } from 'lucide-react';
import { useUi } from '@hit/ui-kit';
import { useNotes, useNoteMutations } from '../hooks/useNotepad';
export function NoteList({ onNavigate, showTimestamps = true, sharingEnabled = false, allowDelete = true, }) {
    const { Page, Card, Button, Input, Table, Badge, EmptyState, Alert, Spinner } = useUi();
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const { data, loading, error, refresh } = useNotes({
        page,
        pageSize: 25,
        search: search || undefined,
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
    const handleSearchChange = (value) => {
        setSearch(value);
        setPage(1);
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
    return (_jsxs(Page, { title: "Notes", description: "Your personal notes", actions: _jsxs(Button, { variant: "primary", onClick: () => navigate('/notepad/new'), children: [_jsx(Plus, { size: 16, className: "mr-2" }), "New Note"] }), children: [_jsx(Card, { children: _jsx("div", { className: "max-w-md", children: _jsx(Input, { label: "Search", value: search, onChange: handleSearchChange, placeholder: "Search notes..." }) }) }), error && (_jsx(Alert, { variant: "error", title: "Error loading notes", children: error.message })), loading && (_jsx(Card, { children: _jsx("div", { className: "flex items-center justify-center py-12", children: _jsx(Spinner, { size: "lg" }) }) })), !loading && !error && data?.items.length === 0 && (_jsx(Card, { children: _jsx(EmptyState, { icon: _jsx(FileText, { size: 48 }), title: "No notes yet", description: "Create your first note to get started", action: _jsxs(Button, { variant: "primary", onClick: () => navigate('/notepad/new'), children: [_jsx(Plus, { size: 16, className: "mr-2" }), "Create Note"] }) }) })), !loading && data && data.items.length > 0 && (_jsxs(Card, { children: [_jsx(Table, { columns: [
                            {
                                key: 'title',
                                label: 'Title',
                                render: (_, row) => (_jsx("button", { onClick: () => navigate(`/notepad/${row.id}`), className: "font-medium hover:text-blue-500 transition-colors text-left", children: row.title })),
                            },
                            ...(showTimestamps
                                ? [
                                    {
                                        key: 'updatedAt',
                                        label: 'Updated',
                                        render: (value) => formatDate(value),
                                    },
                                    {
                                        key: 'createdAt',
                                        label: 'Created',
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
                                render: (_, row) => (_jsxs("div", { className: "flex items-center justify-end gap-2", children: [_jsx(Button, { variant: "ghost", size: "sm", onClick: () => navigate(`/notepad/${row.id}`), children: _jsx(Eye, { size: 16 }) }), _jsx(Button, { variant: "ghost", size: "sm", onClick: () => navigate(`/notepad/${row.id}/edit`), children: _jsx(Edit, { size: 16 }) }), sharingEnabled && (_jsx(Button, { variant: "ghost", size: "sm", onClick: () => navigate(`/notepad/${row.id}?share=true`), children: _jsx(Share2, { size: 16 }) })), allowDelete && (_jsx(Button, { variant: "ghost", size: "sm", disabled: mutating, onClick: () => handleDelete(row.id, row.title), children: _jsx(Trash2, { size: 16, className: "text-red-500" }) }))] })),
                            },
                        ], data: data.items.map((note) => ({
                            id: note.id,
                            title: note.title,
                            updatedAt: note.updatedAt,
                            createdAt: note.createdAt,
                            isPublic: note.isPublic,
                        })), emptyMessage: "No notes found" }), data.total_pages > 1 && (_jsxs("div", { className: "flex items-center justify-between pt-4 mt-4 border-t border-gray-200 dark:border-gray-800", children: [_jsxs("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: ["Page ", data.page, " of ", data.total_pages, " (", data.total, " notes)"] }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsxs(Button, { variant: "secondary", size: "md", disabled: page === 1, onClick: () => setPage(page - 1), children: [_jsx(ChevronLeft, { size: 16, className: "mr-2" }), "Previous"] }), _jsxs(Button, { variant: "secondary", size: "md", disabled: page >= data.total_pages, onClick: () => setPage(page + 1), children: ["Next", _jsx(ChevronRight, { size: 16, className: "ml-2" })] })] })] }))] }))] }));
}
export default NoteList;
//# sourceMappingURL=List.js.map