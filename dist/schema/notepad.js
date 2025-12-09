/**
 * Notepad Schema
 *
 * Drizzle table definitions for the notepad feature pack.
 * This schema gets merged into the project's database.
 *
 * UI Annotations (for future schema-driven CRUD):
 * @ui-list columns: title, createdAt, updatedAt
 * @ui-list sortable: title, createdAt, updatedAt
 * @ui-list searchable: title, content
 * @ui-detail sections: info(title, content), metadata(createdAt, updatedAt, userId)
 * @ui-edit fields: title(text, required), content(textarea)
 */
import { pgTable, varchar, text, timestamp, boolean, uuid } from "drizzle-orm/pg-core";
/**
 * Notes table - stores user notes
 *
 * Features:
 * - Per-user or global scope (controlled by userId being null or set)
 * - Optional sharing via public link (isPublic + shareToken)
 * - Timestamps for sorting and display
 */
export const notes = pgTable("notepad_notes", {
    /** Unique identifier for the note */
    id: uuid("id").primaryKey().defaultRandom(),
    /** Note title - displayed in list view */
    title: varchar("title", { length: 255 }).notNull(),
    /** Note content - main body text */
    content: text("content").notNull().default(""),
    /**
     * Owner user ID
     * - Set to user's ID for per-user scope
     * - Can be null for global scope (all users see all notes)
     */
    userId: varchar("user_id", { length: 255 }),
    /**
     * Whether the note is publicly accessible via share link
     * Only relevant when sharing_enabled feature flag is true
     */
    isPublic: boolean("is_public").notNull().default(false),
    /**
     * Unique token for public sharing
     * Generated when user clicks "Share" button
     * Access note at /notepad/share/[shareToken]
     */
    shareToken: varchar("share_token", { length: 64 }),
    /** When the note was created */
    createdAt: timestamp("created_at").defaultNow().notNull(),
    /** When the note was last updated */
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
//# sourceMappingURL=notepad.js.map