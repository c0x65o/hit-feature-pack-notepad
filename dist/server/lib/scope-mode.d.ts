import type { NextRequest } from 'next/server';
export type ScopeMode = 'none' | 'own' | 'ldd' | 'any';
export type ScopeVerb = 'read' | 'write' | 'delete';
export type ScopeEntity = 'notes';
/**
 * Resolve effective scope mode using a tree:
 * - entity override: notepad.{entity}.{verb}.scope.{mode}
 * - notepad default: notepad.{verb}.scope.{mode}
 * - fallback: own
 *
 * Precedence if multiple are granted: most restrictive wins.
 */
export declare function resolveNotepadScopeMode(request: NextRequest, args: {
    entity?: ScopeEntity;
    verb: ScopeVerb;
}): Promise<ScopeMode>;
//# sourceMappingURL=scope-mode.d.ts.map