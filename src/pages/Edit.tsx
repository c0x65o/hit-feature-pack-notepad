'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { Button } from '../components/Button';
import { PageHeader } from '../components/PageHeader';
import { Card } from '../components/Card';
import { FormInput, FormTextArea } from '../components/FormInput';
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
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-[var(--hit-muted)] rounded w-1/3 mb-4" />
          <div className="bg-[var(--hit-surface)] rounded-lg p-6 space-y-4">
            <div className="h-10 bg-[var(--hit-muted)] rounded w-full" />
            <div className="h-32 bg-[var(--hit-muted)] rounded w-full" />
          </div>
        </div>
      </div>
    );
  }

  // Error loading note
  if (!isNew && loadError) {
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
          <p className="text-sm text-[var(--hit-error)]">{loadError.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={isNew ? 'New Note' : 'Edit Note'}
        actions={
          <Button variant="outline" icon={ArrowLeft} onClick={handleCancel}>
            Cancel
          </Button>
        }
      />

      {/* Save Error */}
      {saveError && (
        <div className="p-4 bg-[var(--hit-error-light)] border border-[var(--hit-error)] rounded-lg">
          <p className="text-sm text-[var(--hit-error)]">{saveError.message}</p>
        </div>
      )}

      <Card>
        <form onSubmit={handleSubmit}>
          <FormInput
            label="Title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter note title..."
            required
            error={fieldErrors.title}
            autoFocus
          />

          <FormTextArea
            label="Content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={
              allowRichText
                ? 'Write your note... (Markdown supported)'
                : 'Write your note...'
            }
            rows={15}
            helpText={allowRichText ? 'Markdown formatting is supported' : undefined}
          />

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--hit-border)]">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" icon={Save} loading={saving}>
              {isNew ? 'Create Note' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

export default NoteEdit;
