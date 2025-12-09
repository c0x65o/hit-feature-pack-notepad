'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import { useUi } from '@hit/ui-kit';
import { useNote, useNoteMutations } from '../hooks/useNotepad';

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
  const { createNote, updateNote, loading: saving, error: saveError } = useNoteMutations();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

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

    try {
      if (isNew) {
        const newNote = await createNote({ title, content });
        navigate(`/notepad/${newNote.id}`);
      } else if (id) {
        await updateNote(id, { title, content });
        navigate(`/notepad/${id}`);
      }
    } catch {
      // Error handled by hook
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

  return (
    <Page
      title={isNew ? 'New Note' : 'Edit Note'}
      actions={
        <Button variant="secondary" onClick={handleCancel}>
          <ArrowLeft size={16} className="mr-2" />
          Cancel
        </Button>
      }
    >
      {/* Save Error */}
      {saveError && (
        <Alert variant="error" title="Error saving note">
          {saveError.message}
        </Alert>
      )}

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          <Input
            label="Title"
            value={title}
            onChange={setTitle}
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

          <div className="flex items-center justify-end gap-3 pt-6 mt-6 border-t border-gray-800">
            <Button type="button" variant="secondary" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={saving}>
              <Save size={16} className="mr-2" />
              {isNew ? 'Create Note' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Card>
    </Page>
  );
}

export default NoteEdit;
