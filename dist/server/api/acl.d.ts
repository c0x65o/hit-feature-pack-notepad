import { NextRequest, NextResponse } from 'next/server';
export declare const dynamic = "force-dynamic";
export declare const runtime = "nodejs";
/**
 * GET /api/notepad/[id]/acl
 * List ACLs for a specific note
 */
export declare function GET(request: NextRequest): Promise<NextResponse<{
    error: string;
}> | NextResponse<{
    items: any;
}>>;
/**
 * POST /api/notepad/[id]/acl
 * Create ACL entry
 */
export declare function POST(request: NextRequest): Promise<NextResponse<any>>;
/**
 * DELETE /api/notepad/[id]/acl/[aclId]
 * Delete ACL entry
 */
export declare function DELETE(request: NextRequest): Promise<NextResponse<{
    error: string;
}> | NextResponse<{
    success: boolean;
}>>;
//# sourceMappingURL=acl.d.ts.map