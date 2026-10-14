import {z} from "zod";

export interface Base_error_response_dto<T> {
    success: boolean,
    error: T
}

export interface AnalysisErrorDto {
    code: string,
    message: string
}

export type AnalysisErrorResponseDto = Base_error_response_dto<AnalysisErrorDto>;

export interface Base_response_dto<T> {
    success: boolean;
    analysis: T;
}

export interface AnalysisDto<T = Record<string, unknown>> {
    category: string;
    title: string;
    summary: string;
    extractedText: string;
    details: T;
    confidence: number;
}

export type AnalysisResponseDto =
    Base_response_dto<AnalysisDto>;

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
    error: z.object({
        code: z.string(),
        message: z.string()
    })
})

export default function parseAnalysisResponse(
    json: unknown
): AnalysisResponseDto {
    return AnalysisResponseSchema.parse(json);
}

export function parseAnalysisErrorResponse(
    json: string
): string {
    try {
        return AnalysisErrorResponseSchema.parse(json).error.message;
    } catch {
        return json;
    }
}
