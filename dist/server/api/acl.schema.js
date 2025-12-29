import { z } from "zod";
// Schema-only module for:
// - POST /api/notepad/[id]/acl
export const postBodySchema = z.object({
    principalType: z.enum(["user", "role", "group"]),
    principalId: z.string().min(1),
    permissions: z.array(z.enum(["READ", "WRITE", "MANAGE_ACL"])).min(1),
});
//# sourceMappingURL=acl.schema.js.map