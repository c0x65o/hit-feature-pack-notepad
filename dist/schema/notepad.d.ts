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
/**
 * Principal Types for ACL
 * Note: Uses same enum name as vault to avoid conflicts when schemas are merged
 */
export declare const notepadPrincipalTypeEnum: import("drizzle-orm/pg-core").PgEnum<["user", "group", "role"]>;
/**
 * Notes table - stores user notes
 *
 * Features:
 * - Per-user or global scope (controlled by userId being null or set)
 * - Optional sharing via public link (isPublic + shareToken)
 * - Timestamps for sorting and display
 */
export declare const notes: import("drizzle-orm/pg-core").PgTableWithColumns<{
    name: "notepad_notes";
    schema: undefined;
    columns: {
        id: import("drizzle-orm/pg-core").PgColumn<{
            name: "id";
            tableName: "notepad_notes";
            dataType: "string";
            columnType: "PgUUID";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: true;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
        title: import("drizzle-orm/pg-core").PgColumn<{
            name: "title";
            tableName: "notepad_notes";
            dataType: "string";
            columnType: "PgVarchar";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, {}, {}>;
        content: import("drizzle-orm/pg-core").PgColumn<{
            name: "content";
            tableName: "notepad_notes";
            dataType: "string";
            columnType: "PgText";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: true;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, {}, {}>;
        userId: import("drizzle-orm/pg-core").PgColumn<{
            name: "user_id";
            tableName: "notepad_notes";
            dataType: "string";
            columnType: "PgVarchar";
            data: string;
            driverParam: string;
            notNull: false;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, {}, {}>;
        isPublic: import("drizzle-orm/pg-core").PgColumn<{
            name: "is_public";
            tableName: "notepad_notes";
            dataType: "boolean";
            columnType: "PgBoolean";
            data: boolean;
            driverParam: boolean;
            notNull: true;
            hasDefault: true;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
        shareToken: import("drizzle-orm/pg-core").PgColumn<{
            name: "share_token";
            tableName: "notepad_notes";
            dataType: "string";
            columnType: "PgVarchar";
            data: string;
            driverParam: string;
            notNull: false;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, {}, {}>;
        createdAt: import("drizzle-orm/pg-core").PgColumn<{
            name: "created_at";
            tableName: "notepad_notes";
            dataType: "date";
            columnType: "PgTimestamp";
            data: Date;
            driverParam: string;
            notNull: true;
            hasDefault: true;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
        updatedAt: import("drizzle-orm/pg-core").PgColumn<{
            name: "updated_at";
            tableName: "notepad_notes";
            dataType: "date";
            columnType: "PgTimestamp";
            data: Date;
            driverParam: string;
            notNull: true;
            hasDefault: true;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
    };
    dialect: "pg";
}>;
/**
 * Notes ACL Table
 * Stores access control entries for notes (users, groups, roles)
 */
export declare const noteAcls: import("drizzle-orm/pg-core").PgTableWithColumns<{
    name: "notepad_acls";
    schema: undefined;
    columns: {
        id: import("drizzle-orm/pg-core").PgColumn<{
            name: "id";
            tableName: "notepad_acls";
            dataType: "string";
            columnType: "PgUUID";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: true;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
        noteId: import("drizzle-orm/pg-core").PgColumn<{
            name: "note_id";
            tableName: "notepad_acls";
            dataType: "string";
            columnType: "PgUUID";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
        principalType: import("drizzle-orm/pg-core").PgColumn<{
            name: "principal_type";
            tableName: "notepad_acls";
            dataType: "string";
            columnType: "PgEnumColumn";
            data: "role" | "user" | "group";
            driverParam: string;
            notNull: true;
            hasDefault: false;
            enumValues: ["user", "group", "role"];
            baseColumn: never;
        }, {}, {}>;
        principalId: import("drizzle-orm/pg-core").PgColumn<{
            name: "principal_id";
            tableName: "notepad_acls";
            dataType: "string";
            columnType: "PgVarchar";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, {}, {}>;
        permissions: import("drizzle-orm/pg-core").PgColumn<{
            name: "permissions";
            tableName: "notepad_acls";
            dataType: "json";
            columnType: "PgJsonb";
            data: string[];
            driverParam: unknown;
            notNull: true;
            hasDefault: false;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
        createdBy: import("drizzle-orm/pg-core").PgColumn<{
            name: "created_by";
            tableName: "notepad_acls";
            dataType: "string";
            columnType: "PgVarchar";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, {}, {}>;
        createdAt: import("drizzle-orm/pg-core").PgColumn<{
            name: "created_at";
            tableName: "notepad_acls";
            dataType: "date";
            columnType: "PgTimestamp";
            data: Date;
            driverParam: string;
            notNull: true;
            hasDefault: true;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
    };
    dialect: "pg";
}>;
export type Note = typeof notes.$inferSelect;
export type InsertNote = typeof notes.$inferInsert;
export type UpdateNote = Partial<Omit<InsertNote, "id" | "createdAt">>;
export type NoteAcl = typeof noteAcls.$inferSelect;
export type InsertNoteAcl = typeof noteAcls.$inferInsert;
/**
 * Permission Constants
 * Simplified permissions for notes:
 * - READ: Can view the note
 * - WRITE: Can edit the note
 * - DELETE: Can delete the note
 * - MANAGE_ACL: Can manage access control lists (grant/revoke permissions)
 */
export declare const NOTE_PERMISSIONS: {
    readonly READ: "READ";
    readonly WRITE: "WRITE";
    readonly DELETE: "DELETE";
    readonly MANAGE_ACL: "MANAGE_ACL";
};
export type NotePermission = (typeof NOTE_PERMISSIONS)[keyof typeof NOTE_PERMISSIONS];
//# sourceMappingURL=notepad.d.ts.map