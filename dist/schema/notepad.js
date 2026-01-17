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
import { pgTable, varchar, text, timestamp, boolean, uuid, jsonb, index, unique, pgEnum } from "drizzle-orm/pg-core";
/**
 * Principal Types for ACL
 * Shared enum used across all feature packs (forms, vault, notepad, etc.)
 */
export const principalTypeEnum = pgEnum("principal_type", ["user", "group", "role", "location", "division", "department"]);
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
/**
 * Notes ACL Table
 * Stores access control entries for notes (users, groups, roles)
 */
export const noteAcls = pgTable("notepad_acls", {
    id: uuid("id").primaryKey().defaultRandom(),
    noteId: uuid("note_id").notNull(), // ID of the note
    principalType: principalTypeEnum("principal_type").notNull(), // user | group | role
    principalId: varchar("principal_id", { length: 255 }).notNull(), // User email, group ID, or role name
    // Permissions array: READ, WRITE, DELETE, MANAGE_ACL
    permissions: jsonb("permissions").$type().notNull(),
    createdBy: varchar("created_by", { length: 255 }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
    noteIdx: index("notepad_acls_note_idx").on(table.noteId),
    principalIdx: index("notepad_acls_principal_idx").on(table.principalType, table.principalId),
    notePrincipalIdx: unique("notepad_acls_note_principal_unique").on(table.noteId, table.principalType, table.principalId), // One ACL entry per note+principal
}));
/**
 * Permission Constants
 * Simplified permissions for notes:
 * - READ: Can view the note
 * - WRITE: Can edit the note
 * - DELETE: Can delete the note
 * - MANAGE_ACL: Can manage access control lists (grant/revoke permissions)
 */
export const NOTE_PERMISSIONS = {
    READ: "READ",
    WRITE: "WRITE",
    DELETE: "DELETE",
    MANAGE_ACL: "MANAGE_ACL",
};
//# sourceMappingURL=notepad.js.map