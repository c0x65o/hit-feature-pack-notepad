'use client';

import React, { useState } from 'react';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Share2,
  Copy,
  Check,
  StickyNote,
} from 'lucide-react';
import type { BreadcrumbItem } from '@hit/ui-kit';
import { useUi } from '@hit/ui-kit';
import { useNote, useNoteMutations } from '../hooks/useNotepad';
import { NoteAclModal } from '../components/NoteAclModal';
import { Users } from 'lucide-react';

interface NoteDetailProps {
  id?: string;
  onNavigate?: (path: string) => void;
  showTimestamps?: boolean;
  sharingEnabled?: boolean;
  allowDelete?: boolean;
}

export function NoteDetail({
  id,
  onNavigate,
  showTimestamps = true,
  sharingEnabled = false,
  allowDelete = true,
}: NoteDetailProps) {
  const { Page, Card, Button, Alert, Modal, Spinner, Badge } = useUi();
  
  const { note, loading, error } = useNote(id);
  const { deleteNote, shareNote, unshareNote, loading: mutating } = useNoteMutations();
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showAclModal, setShowAclModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const navigate = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else if (typeof window !== 'undefined') {
      window.location.href = path;
    }
  };

  const handleDelete = async () => {
    if (!note) return;
    if (!confirm(`Are you sure you want to delete "${note.title}"? This cannot be undone.`)) {
      return;
    }
    try {
      await deleteNote(note.id);
      navigate('/notepad');
    } catch {
      // Error handled by hook
    }
  };

  const handleShare = async () => {
    if (!note) return;
    try {
      const result = await shareNote(note.id);
      setShareUrl(result.shareUrl);
      setShowShareModal(true);
    } catch {
      // Error handled by hook
    }
  };

  const handleUnshare = async () => {
    if (!note) return;
    try {
      await unshareNote(note.id);
      setShareUrl(null);
      setShowShareModal(false);
    } catch {
      // Error handled by hook
    }
  };

  const handleCopy = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
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

  const formatDate = (dateStr: string) => {
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
    return (
      <Page title="Loading...">
        <Card>
          <div className="flex items-center justify-center py-12">
            <Spinner size="lg" />
          </div>
        </Card>
      </Page>
    );
  }

  // Error State
  if (error) {
    return (
      <Page
        title="Note Not Found"
        actions={
          <Button variant="secondary" onClick={() => navigate('/notepad')}>
            <ArrowLeft size={16} className="mr-2" />
            Back to Notes
          </Button>
        }
      >
        <Alert variant="error" title="Error">
          {error.message}
        </Alert>
      </Page>
    );
  }

  if (!note) {
    return null;
  }

  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Notepad', href: '/notepad', icon: <StickyNote size={14} /> },
    { label: note.title },
  ];

  return (
    <Page
      title={note.title}
      breadcrumbs={breadcrumbs}
      onNavigate={navigate}
      actions={
        <div className="flex items-center gap-3">
          <Button variant="primary" onClick={() => navigate(`/notepad/${note.id}/edit`)}>
            <Edit size={16} className="mr-2" />
            Edit
          </Button>
          <Button variant="secondary" onClick={() => setShowAclModal(true)}>
            <Users size={16} className="mr-2" />
            Share
          </Button>
          {sharingEnabled && (
            <Button variant="secondary" onClick={handleShare} disabled={mutating}>
              <Share2 size={16} className="mr-2" />
              {note.isPublic ? 'Manage Share' : 'Share Link'}
            </Button>
          )}
          {allowDelete && (
            <Button variant="danger" onClick={handleDelete} disabled={mutating}>
              <Trash2 size={16} className="mr-2" />
              Delete
            </Button>
          )}
        </div>
      }
    >
      {/* Share Status */}
      {sharingEnabled && note.isPublic && (
        <Alert variant="success" title="Shared">
          <div className="flex items-center justify-between">
            <span>This note is publicly shared.</span>
            <div className="ml-4">
              <Button variant="ghost" size="sm" onClick={handleUnshare}>
                Stop Sharing
              </Button>
            </div>
          </div>
        </Alert>
      )}

      {/* Note Content */}
      <Card
        footer={
          showTimestamps ? (
            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>Created {formatDate(note.createdAt)}</span>
              <span>Updated {formatDate(note.updatedAt)}</span>
            </div>
          ) : undefined
        }
      >
        <div className="prose dark:prose-invert max-w-none">
          <p className="whitespace-pre-wrap text-gray-900 dark:text-gray-100">{note.content || 'No content'}</p>
        </div>
      </Card>

      {/* Share Modal */}
      <Modal
        open={showShareModal && !!shareUrl}
        onClose={() => setShowShareModal(false)}
        title="Share Link"
        description="Anyone with this link can view your note"
      >
        <div className="space-y-4">
          <div className="flex gap-3">
            <input
              type="text"
              value={shareUrl || ''}
              readOnly
              className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-gray-100"
            />
            <Button
              variant={copied ? 'secondary' : 'primary'}
              onClick={handleCopy}
            >
              {copied ? <Check size={16} className="mr-2" /> : <Copy size={16} className="mr-2" />}
              {copied ? 'Copied!' : 'Copy'}
            </Button>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={handleUnshare}>
              Stop Sharing
            </Button>
            <Button variant="ghost" onClick={() => setShowShareModal(false)}>
              Done
            </Button>
          </div>
        </div>
      </Modal>

      {/* ACL Modal */}
      {showAclModal && (
        <NoteAclModal
          noteId={note.id}
          isOpen={showAclModal}
          onClose={() => setShowAclModal(false)}
          onUpdate={() => {
            // Optionally refresh note data if needed
          }}
        />
      )}
    </Page>
  );
}

export default NoteDetail;
