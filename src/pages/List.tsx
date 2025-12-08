'use client';

import React, { useState } from 'react';
import {
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  Share2,
  FileText,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Button } from '../components/Button';
import { PageHeader } from '../components/PageHeader';
import { Badge } from '../components/Badge';
import { useNotes, useNoteMutations } from '../hooks/useNotepad';

interface NoteListProps {
  onNavigate?: (path: string) => void;
  showTimestamps?: boolean;
  sharingEnabled?: boolean;
  allowDelete?: boolean;
}

export function NoteList({
  onNavigate,
  showTimestamps = true,
  sharingEnabled = false,
  allowDelete = true,
}: NoteListProps) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  
  const { data, loading, error, refresh } = useNotes({
    page,
    pageSize: 25,
    search: search || undefined,
    sortBy: 'updatedAt',
    sortOrder: 'desc',
  });
  
  const { deleteNote, loading: mutating } = useNoteMutations();

  const navigate = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else if (typeof window !== 'undefined') {
      window.location.href = path;
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"? This cannot be undone.`)) {
      return;
    }
    try {
      await deleteNote(id);
      refresh();
    } catch {
      // Error handled by hook
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notes"
        description="Your personal notes"
        actions={
          <Button icon={Plus} onClick={() => navigate('/notepad/new')}>
            New Note
          </Button>
        }
      />

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--hit-muted-foreground)]" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search notes..."
            className="w-full pl-10 pr-4 py-2 bg-[var(--hit-input-bg)] border border-[var(--hit-border)] rounded-lg text-[var(--hit-foreground)] placeholder-[var(--hit-input-placeholder)] focus:outline-none focus:ring-2 focus:ring-[var(--hit-primary)]"
          />
        </div>
        <Button type="submit" variant="secondary">
          Search
        </Button>
      </form>

      {/* Error State */}
      {error && (
        <div className="p-4 bg-[var(--hit-error-light)] border border-[var(--hit-error)] rounded-lg">
          <p className="text-sm text-[var(--hit-error)]">{error.message}</p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse bg-[var(--hit-surface)] rounded-lg p-4">
              <div className="h-5 bg-[var(--hit-muted)] rounded w-1/3 mb-2" />
              <div className="h-4 bg-[var(--hit-muted)] rounded w-1/4" />
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && data?.items.length === 0 && (
        <div className="text-center py-12 bg-[var(--hit-surface)] rounded-lg border border-[var(--hit-border)]">
          <FileText className="w-12 h-12 mx-auto mb-4 text-[var(--hit-muted-foreground)]" />
          <h3 className="text-lg font-medium text-[var(--hit-foreground)] mb-2">No notes yet</h3>
          <p className="text-[var(--hit-muted-foreground)] mb-4">Create your first note to get started</p>
          <Button icon={Plus} onClick={() => navigate('/notepad/new')}>
            Create Note
          </Button>
        </div>
      )}

      {/* Notes List */}
      {!loading && data && data.items.length > 0 && (
        <div className="space-y-2">
          {data.items.map((note) => (
            <div
              key={note.id}
              className="bg-[var(--hit-surface)] border border-[var(--hit-border)] rounded-lg p-4 hover:bg-[var(--hit-surface-hover)] transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <button
                    onClick={() => navigate(`/notepad/${note.id}`)}
                    className="text-left"
                  >
                    <h3 className="text-lg font-medium text-[var(--hit-foreground)] hover:text-[var(--hit-primary)] transition-colors truncate">
                      {note.title}
                    </h3>
                  </button>
                  <div className="flex items-center gap-3 mt-1 text-sm text-[var(--hit-muted-foreground)]">
                    {showTimestamps && (
                      <>
                        <span>Updated {formatDate(note.updatedAt)}</span>
                        <span>•</span>
                        <span>Created {formatDate(note.createdAt)}</span>
                      </>
                    )}
                    {sharingEnabled && note.isPublic && (
                      <Badge variant="success">Shared</Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={Eye}
                    onClick={() => navigate(`/notepad/${note.id}`)}
                  >
                    <span className="sr-only">View</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={Edit}
                    onClick={() => navigate(`/notepad/${note.id}/edit`)}
                  >
                    <span className="sr-only">Edit</span>
                  </Button>
                  {sharingEnabled && (
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={Share2}
                      onClick={() => navigate(`/notepad/${note.id}?share=true`)}
                    >
                      <span className="sr-only">Share</span>
                    </Button>
                  )}
                  {allowDelete && (
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={Trash2}
                      disabled={mutating}
                      onClick={() => handleDelete(note.id, note.title)}
                      className="text-[var(--hit-error)] hover:text-[var(--hit-error-dark)] hover:bg-[var(--hit-error-light)]"
                    >
                      <span className="sr-only">Delete</span>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {data && data.total_pages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-[var(--hit-border)]">
          <p className="text-sm text-[var(--hit-muted-foreground)]">
            Page {data.page} of {data.total_pages} ({data.total} notes)
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={ChevronLeft}
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              iconRight={ChevronRight}
              disabled={page >= data.total_pages}
              onClick={() => setPage(page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default NoteList;
