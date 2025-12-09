'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { ArrowLeft, Edit, Trash2, Share2, Copy, Check, } from 'lucide-react';
import { useUi } from '@hit/ui-kit';
import { useNote, useNoteMutations } from '../hooks/useNotepad';
export function NoteDetail({ id, onNavigate, showTimestamps = true, sharingEnabled = false, allowDelete = true, }) {
    const { Page, Card, Button, Alert, Modal, Spinner, Badge } = useUi();
    const { note, loading, error } = useNote(id);
    const { deleteNote, shareNote, unshareNote, loading: mutating } = useNoteMutations();
    const [shareUrl, setShareUrl] = useState(null);
    const [showShareModal, setShowShareModal] = useState(false);
    const [copied, setCopied] = useState(false);
    const navigate = (path) => {
        if (onNavigate) {
            onNavigate(path);
        }
        else if (typeof window !== 'undefined') {
            window.location.href = path;
        }
    };
    const handleDelete = async () => {
        if (!note)
            return;
        if (!confirm(`Are you sure you want to delete "${note.title}"? This cannot be undone.`)) {
            return;
        }
        try {
            await deleteNote(note.id);
            navigate('/notepad');
        }
        catch {
            // Error handled by hook
        }
    };
    const handleShare = async () => {
        if (!note)
            return;
        try {
            const result = await shareNote(note.id);
            setShareUrl(result.shareUrl);
            setShowShareModal(true);
        }
        catch {
            // Error handled by hook
        }
    };
    const handleUnshare = async () => {
        if (!note)
            return;
        try {
            await unshareNote(note.id);
            setShareUrl(null);
            setShowShareModal(false);
        }
        catch {
            // Error handled by hook
        }
    };
    const handleCopy = async () => {
        if (!shareUrl)
            return;
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
        catch {
            // Fallback for older browsers
            const input = document.createElement('input');
            input.value = shareUrl;
            document.body.appendChild(input);
            input.select();
            document.execCommand('copy');
            document.body.removeChild(input);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };
    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString(undefined, {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
        });
    };
    // Loading State
    if (loading) {
        return (_jsx(Page, { title: "Loading...", children: _jsx(Card, { children: _jsx("div", { className: "flex items-center justify-center py-12", children: _jsx(Spinner, { size: "lg" }) }) }) }));
    }
    // Error State
    if (error) {
        return (_jsx(Page, { title: "Note Not Found", actions: _jsxs(Button, { variant: "secondary", onClick: () => navigate('/notepad'), children: [_jsx(ArrowLeft, { size: 16, className: "mr-2" }), "Back to Notes"] }), children: _jsx(Alert, { variant: "error", title: "Error", children: error.message }) }));
    }
    if (!note) {
        return null;
    }
    return (_jsxs(Page, { title: note.title, actions: _jsxs("div", { className: "flex items-center gap-3", children: [_jsxs(Button, { variant: "secondary", onClick: () => navigate('/notepad'), children: [_jsx(ArrowLeft, { size: 16, className: "mr-2" }), "Back"] }), _jsxs(Button, { variant: "primary", onClick: () => navigate(`/notepad/${note.id}/edit`), children: [_jsx(Edit, { size: 16, className: "mr-2" }), "Edit"] }), sharingEnabled && (_jsxs(Button, { variant: "secondary", onClick: handleShare, disabled: mutating, children: [_jsx(Share2, { size: 16, className: "mr-2" }), note.isPublic ? 'Manage Share' : 'Share'] })), allowDelete && (_jsxs(Button, { variant: "danger", onClick: handleDelete, disabled: mutating, children: [_jsx(Trash2, { size: 16, className: "mr-2" }), "Delete1"] }))] }), children: [sharingEnabled && note.isPublic && (_jsx(Alert, { variant: "success", title: "Shared", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { children: "This note is publicly shared." }), _jsx("div", { className: "ml-4", children: _jsx(Button, { variant: "ghost", size: "sm", onClick: handleUnshare, children: "Stop Sharing" }) })] }) })), _jsx(Card, { footer: showTimestamps ? (_jsxs("div", { className: "flex items-center justify-between text-sm text-gray-400", children: [_jsxs("span", { children: ["Created ", formatDate(note.createdAt)] }), _jsxs("span", { children: ["Updated ", formatDate(note.updatedAt)] })] })) : undefined, children: _jsx("div", { className: "prose prose-invert max-w-none", children: _jsx("p", { className: "whitespace-pre-wrap text-gray-100", children: note.content || 'No content' }) }) }), _jsx(Modal, { open: showShareModal && !!shareUrl, onClose: () => setShowShareModal(false), title: "Share Link", description: "Anyone with this link can view your note", children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex gap-3", children: [_jsx("input", { type: "text", value: shareUrl || '', readOnly: true, className: "flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-100" }), _jsxs(Button, { variant: copied ? 'secondary' : 'primary', onClick: handleCopy, children: [copied ? _jsx(Check, { size: 16, className: "mr-2" }) : _jsx(Copy, { size: 16, className: "mr-2" }), copied ? 'Copied!' : 'Copy'] })] }), _jsxs("div", { className: "flex justify-end gap-3 pt-2", children: [_jsx(Button, { variant: "secondary", onClick: handleUnshare, children: "Stop Sharing" }), _jsx(Button, { variant: "ghost", onClick: () => setShowShareModal(false), children: "Done" })] })] }) })] }));
}
export default NoteDetail;
//# sourceMappingURL=Detail.js.map