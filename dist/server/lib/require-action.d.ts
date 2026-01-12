import { NextRequest, NextResponse } from 'next/server';
type ActionCheckResult = {
    ok: boolean;
    source?: string;
};
export declare function checkNotepadAction(request: NextRequest, actionKey: string): Promise<ActionCheckResult>;
export declare function requireNotepadAction(request: NextRequest, actionKey: string): Promise<NextResponse | null>;
export {};
//# sourceMappingURL=require-action.d.ts.map