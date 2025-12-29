import { z } from "zod";
// Schema-only module for:
// - PUT /api/notepad/[id]
export const putBodySchema = z.object({
    title: z.string().min(1).optional(),
    content: z.string().optional(),
});
//# sourceMappingURL=notepad-id.schema.js.map