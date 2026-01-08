import { NextRequest, NextResponse } from 'next/server';
export declare const dynamic = "force-dynamic";
export declare const runtime = "nodejs";
/**
 * POST /api/notepad/[id]/share
 * Generate a share link for a note
 */
export declare function POST(request: NextRequest): Promise<NextResponse<{
    error: string;
}> | NextResponse<{
    shareToken: any;
    shareUrl: string;
}>>;
/**
 * DELETE /api/notepad/[id]/share
 * Revoke share link for a note
 */
export declare function DELETE(request: NextRequest): Promise<NextResponse<{
    error: string;
}> | NextResponse<{
    success: boolean;
}>>;
//# sourceMappingURL=share.d.ts.map