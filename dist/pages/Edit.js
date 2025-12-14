'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { ArrowLeft, Save, StickyNote } from 'lucide-react';
import { useUi } from '@hit/ui-kit';
import { useNote, useNoteMutations } from '../hooks/useNotepad';
export function NoteEdit({ id, onNavigate, allowRichText = false, }) {
    const { Page, Card, Button, Input, TextArea, Alert, Spinner } = useUi();
    const isNew = !id || id === 'new';
    const { note, loading: loadingNote, error: loadError } = useNote(isNew ? undefined : id);
    const { createNote, updateNote, loading: saving, error: saveError } = useNoteMutations();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});
    // Populate form when note loads
    useEffect(() => {
        if (note) {
            setTitle(note.title);
            setContent(note.content);
        }
    }, [note]);
    const navigate = (path) => {
        if (onNavigate) {
            onNavigate(path);
        }
        else if (typeof window !== 'undefined') {
            window.location.href = path;
        }
    };
    const validateForm = () => {
        const errors = {};
        if (!title.trim()) {
            errors.title = 'Title is required';
        }
        else if (title.length > 255) {
            errors.title = 'Title must be 255 characters or less';
        }
        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm())
            return;
        try {
            if (isNew) {
                const newNote = await createNote({ title, content });
                navigate(`/notepad/${newNote.id}`);
            }
            else if (id) {
                await updateNote(id, { title, content });
                navigate(`/notepad/${id}`);
            }
        }
        catch {
            // Error handled by hook
        }
    };
    const handleCancel = () => {
        if (isNew) {
            navigate('/notepad');
        }
        else {
            navigate(`/notepad/${id}`);
        }
    };
    // Loading state for edit mode
    if (!isNew && loadingNote) {
        return (_jsx(Page, { title: "Loading...", children: _jsx(Card, { children: _jsx("div", { className: "flex items-center justify-center py-12", children: _jsx(Spinner, { size: "lg" }) }) }) }));
    }
    // Error loading note
    if (!isNew && loadError) {
        return (_jsx(Page, { title: "Note Not Found", actions: _jsxs(Button, { variant: "secondary", onClick: () => navigate('/notepad'), children: [_jsx(ArrowLeft, { size: 16, className: "mr-2" }), "Back to Notes"] }), children: _jsx(Alert, { variant: "error", title: "Error", children: loadError.message }) }));
    }
    const breadcrumbs = [
        { label: 'Notepad', href: '/notepad', icon: _jsx(StickyNote, { size: 14 }) },
        ...(!isNew && note ? [{ label: note.title, href: `/notepad/${id}` }] : []),
        { label: isNew ? 'New' : 'Edit' },
    ];
    return (_jsxs(Page, { title: isNew ? 'New Note' : 'Edit Note', breadcrumbs: breadcrumbs, onNavigate: navigate, actions: _jsxs(Button, { variant: "secondary", onClick: handleCancel, children: [_jsx(ArrowLeft, { size: 16, className: "mr-2" }), "Cancel"] }), children: [saveError && (_jsx(Alert, { variant: "error", title: "Error saving note", children: saveError.message })), _jsx(Card, { children: _jsxs("form", { onSubmit: handleSubmit, className: "space-y-6", children: [_jsx(Input, { label: "Title", value: title, onChange: setTitle, placeholder: "Enter note title...", required: true, error: fieldErrors.title }), _jsx(TextArea, { label: "Content", value: content, onChange: setContent, placeholder: allowRichText
                                ? 'Write your note... (Markdown supported)'
                                : 'Write your note...', rows: 15 }), _jsxs("div", { className: "flex items-center justify-end gap-3 pt-4 mt-4 border-t border-gray-800", children: [_jsx(Button, { type: "button", variant: "secondary", onClick: handleCancel, children: "Cancel" }), _jsxs(Button, { type: "submit", variant: "primary", loading: saving, children: [_jsx(Save, { size: 16, className: "mr-2" }), isNew ? 'Create Note' : 'Save Changes'] })] })] }) })] }));
}
export default NoteEdit;
//# sourceMappingURL=Edit.js.map