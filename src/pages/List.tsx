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
import { useServerDataTableState } from '@hit/ui-kit';
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
  sharingEnabled: sharingEnabledProp,
  allowDelete = true,
}: NoteListProps) {
  const { Page, Card, Button, DataTable, Badge, EmptyState, Alert, Spinner } = useUi();
  
  // Read sharing_enabled from config if not provided as prop
  const win = typeof window !== 'undefined' ? (window as any) : null;
  const configSharingEnabled = win?.__HIT_CONFIG?.featurePacks?.notepad?.sharing_enabled ?? false;
  const sharingEnabled = sharingEnabledProp ?? configSharingEnabled;
  
  const serverTable = useServerDataTableState({
    tableId: 'notepad.notes',
    pageSize: 25,
    initialSort: { sortBy: 'updatedAt', sortOrder: 'desc' },
    sortWhitelist: ['title', 'createdAt', 'updatedAt'],
  });

  const { data, loading, error, refresh } = useNotes({
    page: serverTable.query.page,
    pageSize: serverTable.query.pageSize,
    search: serverTable.query.search,
    sortBy: serverTable.query.sortBy,
    sortOrder: serverTable.query.sortOrder,
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
              render: (_: unknown, row: Record<string, unknown>) => (
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
                    label: 'Shared',
                    render: (value: unknown) =>
                      value ? (
                        <Share2 size={16} className="text-green-600 dark:text-green-400" />
                      ) : null,
                  },
                ]
              : []),
            {
              key: 'actions',
              label: '',
              align: 'right' as const,
              sortable: false,
              hideable: false,
              render: (_: unknown, row: Record<string, unknown>) => (
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
          total={data?.pagination?.total}
          {...serverTable.dataTable}
          searchDebounceMs={400}
          onRefresh={refresh}
          refreshing={loading}
          tableId="notepad.notes"
        />
      </Card>
    </Page>
  );
}

export default NoteList;
