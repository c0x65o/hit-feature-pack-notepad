import { resolveScopeMode } from '@hit/feature-pack-auth-core/server/lib/scope-mode';
/**
 * Resolve effective scope mode using a tree:
 * - entity override: notepad.{entity}.{verb}.scope.{mode}
 * - fallback: (admin -> all) (user -> own)
 *
 * Precedence if multiple are granted: most restrictive wins.
 */
export async function resolveNotepadScopeMode(request, args) {
    const m = await resolveScopeMode(request, {
        pack: 'notepad',
        verb: args.verb,
        entity: args.entity,
        supportedModes: ['none', 'own', 'all'],
        // If nothing is configured, default to least privilege for end-users.
        fallbackMode: 'own',
        logPrefix: 'Notepad',
    });
    return (m === 'all' ? 'all' : m === 'none' ? 'none' : 'own');
}
//# sourceMappingURL=scope-mode.js.map