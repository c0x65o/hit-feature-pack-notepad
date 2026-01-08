'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useMemo } from 'react';
import { useUi } from '@hit/ui-kit';
import { AclPicker } from '@hit/ui-kit';
import { createFetchPrincipals } from '@hit/feature-pack-auth-core';
import { NOTE_PERMISSIONS } from '../schema/notepad';
export function NoteAclModal({ noteId, isOpen, onClose, onUpdate }) {
    const { Modal, Alert } = useUi();
    const [acls, setAcls] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        if (isOpen && noteId) {
            loadAcls();
        }
    }, [isOpen, noteId]);
    async function loadAcls() {
        try {
            setLoading(true);
            setError(null);
            const response = await fetch(`/api/notepad/${noteId}/acl`);
            if (!response.ok) {
                throw new Error('Failed to load ACLs');
            }
            const data = await response.json();
            setAcls(Array.isArray(data.items) ? data.items : []);
        }
        catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to load ACLs'));
        }
        finally {
            setLoading(false);
        }
    }
    // Convert NoteAcl to AclEntry
    const aclEntries = useMemo(() => {
        return acls.map(acl => ({
            id: acl.id,
            principalType: acl.principalType,
            principalId: acl.principalId,
            permissions: Array.isArray(acl.permissions) ? acl.permissions : [],
        }));
    }, [acls]);
    const fetchPrincipals = useMemo(() => createFetchPrincipals({ isAdmin: true }), []);
    async function handleAdd(entry) {
        try {
            setError(null);
            const response = await fetch(`/api/notepad/${noteId}/acl`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    principalType: entry.principalType,
                    principalId: entry.principalId,
                    permissions: entry.permissions,
                }),
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: 'Failed to create ACL' }));
                throw new Error(errorData.error || 'Failed to create ACL');
            }
            await loadAcls();
            onUpdate?.();
        }
        catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to create ACL'));
            throw err;
        }
    }
    async function handleRemove(entry) {
        if (!entry.id) {
            throw new Error('Cannot remove entry without ID');
        }
        try {
            const response = await fetch(`/api/notepad/${noteId}/acl/${entry.id}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: 'Failed to remove ACL' }));
                throw new Error(errorData.error || 'Failed to remove ACL');
            }
            await loadAcls();
            onUpdate?.();
        }
        catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to remove ACL'));
            throw err;
        }
    }
    // Notes hierarchical permissions configuration
    const noteAclConfig = useMemo(() => ({
        principals: {
            users: true,
            groups: true,
            roles: true,
        },
        mode: 'hierarchical',
        hierarchicalPermissions: [
            {
                key: 'full',
                label: 'Full Control',
                description: 'Read, write, delete, and manage access',
                priority: 100,
                includes: [NOTE_PERMISSIONS.READ, NOTE_PERMISSIONS.WRITE, NOTE_PERMISSIONS.DELETE, NOTE_PERMISSIONS.MANAGE_ACL],
            },
            {
                key: 'edit',
                label: 'Can Edit',
                description: 'Read and edit the note',
                priority: 50,
                includes: [NOTE_PERMISSIONS.READ, NOTE_PERMISSIONS.WRITE],
            },
            {
                key: 'view',
                label: 'View Only',
                description: 'View the note only',
                priority: 25,
                includes: [NOTE_PERMISSIONS.READ],
            },
        ],
        labels: {
            title: 'Note Sharing',
            addButton: 'Add Access',
            removeButton: 'Remove',
            emptyMessage: 'No access permissions set. Click "Add Access" to grant permissions.',
        },
    }), []);
    return (_jsx(Modal, { open: isOpen, onClose: onClose, title: "Note Sharing", size: "lg", children: _jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: '1rem' }, children: [error && (_jsx(Alert, { variant: "error", title: "Error", children: error.message })), _jsx(AclPicker, { config: noteAclConfig, entries: aclEntries, loading: loading, error: error?.message || null, onAdd: handleAdd, onRemove: handleRemove, fetchPrincipals: fetchPrincipals })] }) }));
}
//# sourceMappingURL=NoteAclModal.js.map