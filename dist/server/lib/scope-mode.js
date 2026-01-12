import { checkNotepadAction } from './require-action';
/**
 * Resolve effective scope mode using a tree:
 * - entity override: notepad.{entity}.{verb}.scope.{mode}
 * - notepad default: notepad.{verb}.scope.{mode}
 * - fallback: own
 *
 * Precedence if multiple are granted: most restrictive wins.
 */
export async function resolveNotepadScopeMode(request, args) {
    const { entity, verb } = args;
    const entityPrefix = entity ? `notepad.${entity}.${verb}.scope` : `notepad.${verb}.scope`;
    const globalPrefix = `notepad.${verb}.scope`;
    // Most restrictive wins (first match returned).
    const modes = ['none', 'own', 'ldd', 'any'];
    for (const m of modes) {
        const res = await checkNotepadAction(request, `${entityPrefix}.${m}`);
        if (res.ok)
            return m;
    }
    for (const m of modes) {
        const res = await checkNotepadAction(request, `${globalPrefix}.${m}`);
        if (res.ok)
            return m;
    }
    return 'own';
}
//# sourceMappingURL=scope-mode.js.map