import { z } from "zod";
// Schema-only module for:
// - POST /api/notepad
export const postBodySchema = z.object({
    title: z.string().min(1),
    content: z.string().optional().default(""),
});
//# sourceMappingURL=notepad.schema.js.map