/**
 * Notepad API hooks
 */
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
export declare function useNotes(options?: UseQueryOptions): {
    data: PaginatedResponse<Note> | null;
    loading: boolean;
    error: Error | null;
    refresh: () => Promise<void>;
};
export declare function useNote(id: string | undefined): {
    note: Note | null;
    loading: boolean;
    error: Error | null;
    refresh: () => Promise<void>;
};
export declare function useNoteMutations(): {
    createNote: (data: {
        title: string;
        content: string;
    }) => Promise<Note>;
    updateNote: (id: string, data: {
        title?: string;
        content?: string;
    }) => Promise<Note>;
    deleteNote: (id: string) => Promise<void>;
    shareNote: (id: string) => Promise<{
        shareUrl: string;
    }>;
    unshareNote: (id: string) => Promise<void>;
    loading: boolean;
    error: Error | null;
};
export type { PaginatedResponse, UseQueryOptions };
//# sourceMappingURL=useNotepad.d.ts.map