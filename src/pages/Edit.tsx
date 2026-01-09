'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, StickyNote, Users } from 'lucide-react';
import type { BreadcrumbItem } from '@hit/ui-kit';
import { useUi } from '@hit/ui-kit';
import { useFormSubmit } from '@hit/ui-kit/hooks/useFormSubmit';
import { useNote, useNoteMutations } from '../hooks/useNotepad';
import { NoteAclModal } from '../components/NoteAclModal';

interface NoteEditProps {
  id?: string;
  onNavigate?: (path: string) => void;
  allowRichText?: boolean;
}

export function NoteEdit({
  id,
  onNavigate,
  allowRichText = false,
}: NoteEditProps) {
  const { Page, Card, Button, Input, TextArea, Alert, Spinner } = useUi();
  
  const isNew = !id || id === 'new';
  const { note, loading: loadingNote, error: loadError } = useNote(isNew ? undefined : id);
  const { createNote, updateNote } = useNoteMutations();
  const { submitting, error, fieldErrors, submit, clearError, setFieldErrors, clearFieldError } = useFormSubmit<{ id: string }>();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [showAclModal, setShowAclModal] = useState(false);

  // Populate form when note loads
  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
    }
  }, [note]);

  const navigate = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else if (typeof window !== 'undefined') {
      window.location.href = path;
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!title.trim()) {
      errors.title = 'Title is required';
    } else if (title.length > 255) {
      errors.title = 'Title must be 255 characters or less';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const result = await submit(async () => {
      if (isNew) {
        const newNote = await createNote({ title, content });
        return { id: newNote.id };
      } else if (id) {
        await updateNote(id, { title, content });
        return { id };
      }
      throw new Error('Invalid state');
    });

    if (result) {
      navigate(`/notepad/${result.id}`);
    }
  };

  const handleCancel = () => {
    if (isNew) {
      navigate('/notepad');
    } else {
      navigate(`/notepad/${id}`);
    }
  };

  // Loading state for edit mode
  if (!isNew && loadingNote) {
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

  // Error loading note
  if (!isNew && loadError) {
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
          {loadError.message}
        </Alert>
      </Page>
    );
  }

  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Notepad', href: '/notepad', icon: <StickyNote size={14} /> },
    ...(!isNew && note ? [{ label: note.title, href: `/notepad/${id}` }] : []),
    { label: isNew ? 'New' : 'Edit' },
  ];

  return (
    <Page
      title={isNew ? 'New Note' : 'Edit Note'}
      breadcrumbs={breadcrumbs}
      onNavigate={navigate}
      actions={
        <div className="flex items-center gap-3">
          {!isNew && id && (
            <Button variant="secondary" onClick={() => setShowAclModal(true)}>
              <Users size={16} className="mr-2" />
              Share
            </Button>
          )}
          <Button variant="secondary" onClick={handleCancel}>
            <ArrowLeft size={16} className="mr-2" />
            Cancel
          </Button>
        </div>
      }
    >
      {/* Save Error */}
      {error && (
        <Alert variant="error" title="Error saving note" onClose={clearError}>
          {error.message}
        </Alert>
      )}

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Title"
            value={title}
            onChange={(v: string) => { setTitle(v); clearFieldError('title'); }}
            placeholder="Enter note title..."
            required
            error={fieldErrors.title}
          />

          <TextArea
            label="Content"
            value={content}
            onChange={setContent}
            placeholder={
              allowRichText
                ? 'Write your note... (Markdown supported)'
                : 'Write your note...'
            }
            rows={15}
          />

          <div className="flex items-center justify-end gap-3 pt-4 mt-4 border-t border-gray-800">
            <Button type="button" variant="secondary" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={submitting} disabled={submitting}>
              <Save size={16} className="mr-2" />
              {submitting ? 'Saving...' : (isNew ? 'Create Note' : 'Save Changes')}
            </Button>
          </div>
        </form>
      </Card>

      {/* ACL Modal */}
      {!isNew && id && showAclModal && (
        <NoteAclModal
          noteId={id}
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

export default NoteEdit;
