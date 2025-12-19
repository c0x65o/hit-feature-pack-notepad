'use client';

import React, { useState } from 'react';
import {
  Plus,
  Eye,
  Edit,
  Trash2,
  Share2,
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
  const { Page, Card, Button, DataTable, Badge, EmptyState, Alert, Spinner } = useUi();
  
  const [page, setPage] = useState(1);
  
  const { data, loading, error, refresh } = useNotes({
    page,
    pageSize: 25,
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
      {/* Error State */}
      {error && (
        <Alert variant="error" title="Error loading notes">
          {error.message}
        </Alert>
      )}

      {/* Notes Table */}
      <Card>
        <DataTable
          columns={[
            {
              key: 'title',
              label: 'Title',
              sortable: true,
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
                    sortable: true,
                    render: (value: unknown) => formatDate(value as string),
                  },
                  {
                    key: 'createdAt',
                    label: 'Created',
                    sortable: true,
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
              sortable: false,
              hideable: false,
              render: (_, row) => (
                <div className="flex items-center justify-end gap-2">
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
          data={data?.items.map((note) => ({
            id: note.id,
            title: note.title,
            updatedAt: note.updatedAt,
            createdAt: note.createdAt,
            isPublic: note.isPublic,
          })) || []}
          emptyMessage="No notes found"
          loading={loading}
          searchable
          exportable
          showColumnVisibility
          pageSize={25}
          onRefresh={refresh}
          refreshing={loading}
          tableId="notepad.notes"
        />
      </Card>
    </Page>
  );
}

export default NoteList;
