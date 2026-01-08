import { z } from "zod";
export declare const postBodySchema: z.ZodObject<{
    title: z.ZodString;
    content: z.ZodDefault<z.ZodOptional<z.ZodString>>;
}, z.core.$strip>;
//# sourceMappingURL=notepad.schema.d.ts.map