'use client';

import React, { useState } from 'react';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Share2,
  Copy,
  X,
  Check,
} from 'lucide-react';
import { Button } from '../components/Button';
import { PageHeader } from '../components/PageHeader';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { useNote, useNoteMutations } from '../hooks/useNotepad';

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
  const { note, loading, error } = useNote(id);
  const { deleteNote, shareNote, unshareNote, loading: mutating } = useNoteMutations();
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
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
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-[var(--hit-muted)] rounded w-1/3 mb-4" />
          <div className="bg-[var(--hit-surface)] rounded-lg p-6 space-y-4">
            <div className="h-6 bg-[var(--hit-muted)] rounded w-1/2" />
            <div className="h-4 bg-[var(--hit-muted)] rounded w-full" />
            <div className="h-4 bg-[var(--hit-muted)] rounded w-3/4" />
            <div className="h-4 bg-[var(--hit-muted)] rounded w-2/3" />
          </div>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Note Not Found"
          actions={
            <Button variant="outline" icon={ArrowLeft} onClick={() => navigate('/notepad')}>
              Back to Notes
            </Button>
          }
        />
        <div className="p-4 bg-[var(--hit-error-light)] border border-[var(--hit-error)] rounded-lg">
          <p className="text-sm text-[var(--hit-error)]">{error.message}</p>
        </div>
      </div>
    );
  }

  if (!note) {
    return null;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={note.title}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" icon={ArrowLeft} onClick={() => navigate('/notepad')}>
              Back
            </Button>
            <Button variant="primary" icon={Edit} onClick={() => navigate(`/notepad/${note.id}/edit`)}>
              Edit
            </Button>
            {sharingEnabled && (
              <Button
                variant="secondary"
                icon={Share2}
                onClick={handleShare}
                loading={mutating}
              >
                {note.isPublic ? 'Manage Share' : 'Share'}
              </Button>
            )}
            {allowDelete && (
              <Button
                variant="danger"
                icon={Trash2}
                onClick={handleDelete}
                loading={mutating}
              >
                Delete
              </Button>
            )}
          </div>
        }
      />

      {/* Share Status */}
      {sharingEnabled && note.isPublic && (
        <div className="flex items-center gap-2 p-3 bg-[var(--hit-success-light)] border border-[var(--hit-success)] rounded-lg">
          <Share2 className="w-4 h-4 text-[var(--hit-success)]" />
          <span className="text-sm text-[var(--hit-success)]">This note is publicly shared</span>
          <Button
            variant="ghost"
            size="sm"
            className="ml-auto text-[var(--hit-success)]"
            onClick={handleUnshare}
          >
            Stop Sharing
          </Button>
        </div>
      )}

      {/* Note Content */}
      <Card
        footer={
          showTimestamps ? (
            <div className="flex items-center justify-between text-sm text-[var(--hit-muted-foreground)]">
              <span>Created {formatDate(note.createdAt)}</span>
              <span>Updated {formatDate(note.updatedAt)}</span>
            </div>
          ) : undefined
        }
      >
        <div className="prose prose-invert max-w-none">
          <p className="whitespace-pre-wrap text-[var(--hit-foreground)]">{note.content || 'No content'}</p>
        </div>
      </Card>

      {/* Share Modal */}
      {showShareModal && shareUrl && (
        <div className="fixed inset-0 bg-[var(--hit-modal-backdrop)] flex items-center justify-center z-50">
          <div className="bg-[var(--hit-surface)] border border-[var(--hit-border)] rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[var(--hit-foreground)]">Share Link</h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="text-[var(--hit-muted-foreground)] hover:text-[var(--hit-foreground)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-[var(--hit-muted-foreground)] mb-4">
              Anyone with this link can view your note:
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 px-3 py-2 bg-[var(--hit-input-bg)] border border-[var(--hit-border)] rounded-lg text-sm text-[var(--hit-foreground)]"
              />
              <Button
                variant={copied ? 'secondary' : 'primary'}
                icon={copied ? Check : Copy}
                onClick={handleCopy}
              >
                {copied ? 'Copied!' : 'Copy'}
              </Button>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={handleUnshare}>
                Stop Sharing
              </Button>
              <Button variant="secondary" onClick={() => setShowShareModal(false)}>
                Done
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default NoteDetail;
