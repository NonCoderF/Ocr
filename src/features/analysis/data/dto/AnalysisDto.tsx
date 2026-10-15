import {z} from "zod";

export const AnalysisResponseSchema = z.object({
    success: z.boolean(),
    analysis: z.object({
        category: z.string(),
        title: z.string(),
        summary: z.string(),
        extractedText: z.string(),
        details: z.record(z.string(), z.unknown()),
        confidence: z.number().min(0).max(1),
    }),
});

export const AnalysisErrorResponseSchema = z.object({
    success: z.boolean(),
    error: z.object({code: z.string(), message: z.string()}),
});

export type AnalysisResponseDto = z.infer<typeof AnalysisResponseSchema>;
export type AnalysisErrorResponseDto = z.infer<typeof AnalysisErrorResponseSchema>;

export function parseAnalysisResponse(json: unknown): AnalysisResponseDto {
    return AnalysisResponseSchema.parse(json);
}

export function getAnalysisErrorMessage(json: unknown, fallback: string): string {
    const parsed = AnalysisErrorResponseSchema.safeParse(json);
    return parsed.success ? parsed.data.error.message : fallback;
}



