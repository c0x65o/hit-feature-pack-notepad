import { z } from "zod";
export declare const postBodySchema: z.ZodObject<{
    title: z.ZodString;
    content: z.ZodDefault<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    title: string;
    content: string;
}, {
    title: string;
    content?: string | undefined;
}>;
//# sourceMappingURL=notepad.schema.d.ts.map