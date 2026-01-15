import { NextRequest, NextResponse } from 'next/server';
export declare const dynamic = "force-dynamic";
export declare const runtime = "nodejs";
/**
 * GET /api/notepad
 * List notes (with scope-based filtering)
 */
export declare function GET(request: NextRequest): Promise<NextResponse<{
    error: string;
}> | NextResponse<{
    items: any;
    pagination: {
        page: number;
        pageSize: number;
        total: number;
        totalPages: number;
    };
}>>;
/**
 * POST /api/notepad
 * Create a new note
 */
export declare function POST(request: NextRequest): Promise<Response>;
//# sourceMappingURL=notepad.d.ts.map