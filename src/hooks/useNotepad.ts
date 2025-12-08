/**
 * Notepad API hooks
 */

import { useState, useEffect, useCallback } from 'react';

export interface Note {
  id: string;
  title: string;
  content: string;
  userId: string | null;
  isPublic: boolean;
  shareToken: string | null;
  createdAt: string;
  updatedAt: string;
}

interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

interface UseQueryOptions {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// API base - uses project's local API routes
const API_BASE = '/api/notepad';

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(error.message || `Request failed: ${res.status}`);
  }

  return res.json();
}

export function useNotes(options: UseQueryOptions = {}) {
  const [data, setData] = useState<PaginatedResponse<Note> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const { page = 1, pageSize = 25, search, sortBy, sortOrder } = options;

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: String(page),
        page_size: String(pageSize),
      });
      if (search) params.set('search', search);
      if (sortBy) params.set('sort_by', sortBy);
      if (sortOrder) params.set('sort_order', sortOrder);

      const result = await fetchApi<PaginatedResponse<Note>>(`?${params}`);
      setData(result);
      setError(null);
    } catch (e) {
      setError(e as Error);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, sortBy, sortOrder]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { data, loading, error, refresh };
}

export function useNote(id: string | undefined) {
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    if (!id || id === 'new') {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const data = await fetchApi<Note>(`/${id}`);
      setNote(data);
      setError(null);
    } catch (e) {
      setError(e as Error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { note, loading, error, refresh };
}

export function useNoteMutations() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createNote = async (data: { title: string; content: string }) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchApi<Note>('', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return result;
    } catch (e) {
      setError(e as Error);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const updateNote = async (id: string, data: { title?: string; content?: string }) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchApi<Note>(`/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      return result;
    } catch (e) {
      setError(e as Error);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const deleteNote = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await fetchApi(`/${id}`, {
        method: 'DELETE',
      });
    } catch (e) {
      setError(e as Error);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const shareNote = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchApi<{ shareUrl: string }>(`/${id}/share`, {
        method: 'POST',
      });
      return result;
    } catch (e) {
      setError(e as Error);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const unshareNote = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await fetchApi(`/${id}/share`, {
        method: 'DELETE',
      });
    } catch (e) {
      setError(e as Error);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return {
    createNote,
    updateNote,
    deleteNote,
    shareNote,
    unshareNote,
    loading,
    error,
  };
}

export type { PaginatedResponse, UseQueryOptions };

