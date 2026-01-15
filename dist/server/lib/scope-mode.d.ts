export type ScopeMode = 'none' | 'own' | 'all';
export type ScopeVerb = 'read' | 'write' | 'delete';
export type ScopeEntity = 'notes';
/**
 * Resolve effective scope mode using a tree:
 * - entity override: notepad.{entity}.{verb}.scope.{mode}
 * - fallback: (admin -> all) (user -> own)
 *
 * Precedence if multiple are granted: most restrictive wins.
 */
export declare function resolveNotepadScopeMode(request: Request, args: {
    entity?: ScopeEntity;
    verb: ScopeVerb;
}): Promise<ScopeMode>;
//# sourceMappingURL=scope-mode.d.ts.map