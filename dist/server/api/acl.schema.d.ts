import { z } from "zod";
export declare const postBodySchema: z.ZodObject<{
    principalType: z.ZodEnum<["user", "role", "group"]>;
    principalId: z.ZodString;
    permissions: z.ZodArray<z.ZodEnum<["READ", "WRITE", "MANAGE_ACL"]>, "many">;
}, "strip", z.ZodTypeAny, {
    principalType: "role" | "user" | "group";
    principalId: string;
    permissions: ("READ" | "WRITE" | "MANAGE_ACL")[];
}, {
    principalType: "role" | "user" | "group";
    principalId: string;
    permissions: ("READ" | "WRITE" | "MANAGE_ACL")[];
}>;
//# sourceMappingURL=acl.schema.d.ts.map