import { checkActionPermission, requireActionPermission, } from '@hit/feature-pack-auth-core/server/lib/action-check';
export async function checkNotepadAction(request, actionKey) {
    return checkActionPermission(request, actionKey, {
        logPrefix: 'Notepad',
    });
}
export async function requireNotepadAction(request, actionKey) {
    return requireActionPermission(request, actionKey, { logPrefix: 'Notepad' });
}
//# sourceMappingURL=require-action.js.map