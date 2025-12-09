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
import { useUi } from '@hit/ui-kit';
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
  const { Page, Card, Button, Input, Table, Badge, EmptyState, Alert, Spinner } = useUi();
  
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
    <Page
      title="Notes"
      description="Your personal notes"
      actions={
        <Button variant="primary" onClick={() => navigate('/notepad/new')}>
          <Plus size={16} className="mr-2" />
          New Note
        </Button>
      }
    >
      {/* Search */}
      <Card>
        <form onSubmit={handleSearch} className="flex gap-3 items-end">
          <div className="flex-1 max-w-md">
            <Input
              label="Search"
              value={searchInput}
              onChange={setSearchInput}
              placeholder="Search notes..."
            />
          </div>
          <Button type="submit" variant="secondary">
            <Search size={16} className="mr-2" />
            Search
          </Button>
        </form>
      </Card>

      {/* Error State */}
      {error && (
        <Alert variant="error" title="Error loading notes">
          {error.message}
        </Alert>
      )}

      {/* Loading State */}
      {loading && (
        <Card>
          <div className="flex items-center justify-center py-12">
            <Spinner size="lg" />
          </div>
        </Card>
      )}

      {/* Empty State */}
      {!loading && !error && data?.items.length === 0 && (
        <Card>
          <EmptyState
            icon={<FileText size={48} />}
            title="No notes yet"
            description="Create your first note to get started"
            action={
              <Button variant="primary" onClick={() => navigate('/notepad/new')}>
                <Plus size={16} className="mr-2" />
                Create Note
              </Button>
            }
          />
        </Card>
      )}

      {/* Notes Table */}
      {!loading && data && data.items.length > 0 && (
        <Card>
          <Table
            columns={[
              {
                key: 'title',
                label: 'Title',
                render: (_, row) => (
                  <button
                    onClick={() => navigate(`/notepad/${row.id}`)}
                    className="font-medium hover:text-blue-500 transition-colors text-left"
                  >
                    {row.title as string}
                  </button>
                ),
              },
              ...(showTimestamps
                ? [
                    {
                      key: 'updatedAt',
                      label: 'Updated',
                      render: (value: unknown) => formatDate(value as string),
                    },
                    {
                      key: 'createdAt',
                      label: 'Created',
                      render: (value: unknown) => formatDate(value as string),
                    },
                  ]
                : []),
              ...(sharingEnabled
                ? [
                    {
                      key: 'isPublic',
                      label: 'Status',
                      render: (value: unknown) =>
                        value ? <Badge variant="success">Shared</Badge> : <Badge>Private</Badge>,
                    },
                  ]
                : []),
              {
                key: 'actions',
                label: '',
                align: 'right' as const,
                render: (_, row) => (
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="sm" onClick={() => navigate(`/notepad/${row.id}`)}>
                      <Eye size={16} />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => navigate(`/notepad/${row.id}/edit`)}>
                      <Edit size={16} />
                    </Button>
                    {sharingEnabled && (
                      <Button variant="ghost" size="sm" onClick={() => navigate(`/notepad/${row.id}?share=true`)}>
                        <Share2 size={16} />
                      </Button>
                    )}
                    {allowDelete && (
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={mutating}
                        onClick={() => handleDelete(row.id as string, row.title as string)}
                      >
                        <Trash2 size={16} className="text-red-500" />
                      </Button>
                    )}
                  </div>
                ),
              },
            ]}
            data={data.items.map((note) => ({
              id: note.id,
              title: note.title,
              updatedAt: note.updatedAt,
              createdAt: note.createdAt,
              isPublic: note.isPublic,
            }))}
            emptyMessage="No notes found"
          />

          {/* Pagination */}
          {data.total_pages > 1 && (
            <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-800">
              <p className="text-sm text-gray-400">
                Page {data.page} of {data.total_pages} ({data.total} notes)
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                >
                  <ChevronLeft size={16} className="mr-1" />
                  Previous
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page >= data.total_pages}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                  <ChevronRight size={16} className="ml-1" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}
    </Page>
  );
}

export default NoteList;
