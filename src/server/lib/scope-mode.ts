import { resolveScopeMode } from '@hit/feature-pack-auth-core/server/lib/scope-mode';

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
export async function resolveNotepadScopeMode(
  request: Request,
  args: { entity?: ScopeEntity; verb: ScopeVerb }
): Promise<ScopeMode> {
  const m = await resolveScopeMode(request as Parameters<typeof resolveScopeMode>[0], {
    pack: 'notepad',
    verb: args.verb,
    entity: args.entity,
    supportedModes: ['none', 'own', 'all'],
    // If nothing is configured, default to least privilege for end-users.
    fallbackMode: 'own',
    logPrefix: 'Notepad',
  });
  return (m === 'all' ? 'all' : m === 'none' ? 'none' : 'own') as ScopeMode;
}
