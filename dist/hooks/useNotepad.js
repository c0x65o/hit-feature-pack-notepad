/**
 * Notepad API hooks
 */
import { useState, useEffect, useCallback } from 'react';
// API base - uses project's local API routes
const API_BASE = '/api/notepad';
function getAuthHeaders() {
    if (typeof window === 'undefined')
        return {};
    const token = localStorage.getItem('hit_token');
    if (token) {
        return { 'Authorization': `Bearer ${token}` };
    }
    return {};
}
async function fetchApi(endpoint, options) {
    const res = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders(),
            ...options?.headers,
        },
    });
    if (!res.ok) {
        const error = await res.json().catch(() => ({ message: res.statusText }));
        throw new Error(error.message || `Request failed: ${res.status}`);
    }
    return res.json();
}
export function useNotes(options = {}) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { page = 1, pageSize = 25, search, sortBy, sortOrder } = options;
    const refresh = useCallback(async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: String(page),
                page_size: String(pageSize),
            });
            if (search)
                params.set('search', search);
            if (sortBy)
                params.set('sort_by', sortBy);
            if (sortOrder)
                params.set('sort_order', sortOrder);
            const result = await fetchApi(`?${params}`);
            setData(result);
            setError(null);
        }
        catch (e) {
            setError(e);
        }
        finally {
            setLoading(false);
        }
    }, [page, pageSize, search, sortBy, sortOrder]);
    useEffect(() => {
        refresh();
    }, [refresh]);
    return { data, loading, error, refresh };
}
export function useNote(id) {
    const [note, setNote] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const refresh = useCallback(async () => {
        if (!id || id === 'new') {
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            const data = await fetchApi(`/${id}`);
            setNote(data);
            setError(null);
        }
        catch (e) {
            setError(e);
        }
        finally {
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
    const [error, setError] = useState(null);
    const createNote = async (data) => {
        setLoading(true);
        setError(null);
        try {
            const result = await fetchApi('', {
                method: 'POST',
                body: JSON.stringify(data),
            });
            return result;
        }
        catch (e) {
            setError(e);
            throw e;
        }
        finally {
            setLoading(false);
        }
    };
    const updateNote = async (id, data) => {
        setLoading(true);
        setError(null);
        try {
            const result = await fetchApi(`/${id}`, {
                method: 'PUT',
                body: JSON.stringify(data),
            });
            return result;
        }
        catch (e) {
            setError(e);
            throw e;
        }
        finally {
            setLoading(false);
        }
    };
    const deleteNote = async (id) => {
        setLoading(true);
        setError(null);
        try {
            await fetchApi(`/${id}`, {
                method: 'DELETE',
            });
        }
        catch (e) {
            setError(e);
            throw e;
        }
        finally {
            setLoading(false);
        }
    };
    const shareNote = async (id) => {
        setLoading(true);
        setError(null);
        try {
            const result = await fetchApi(`/${id}/share`, {
                method: 'POST',
            });
            return result;
        }
        catch (e) {
            setError(e);
            throw e;
        }
        finally {
            setLoading(false);
        }
    };
    const unshareNote = async (id) => {
        setLoading(true);
        setError(null);
        try {
            await fetchApi(`/${id}/share`, {
                method: 'DELETE',
            });
        }
        catch (e) {
            setError(e);
            throw e;
        }
        finally {
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
//# sourceMappingURL=useNotepad.js.map