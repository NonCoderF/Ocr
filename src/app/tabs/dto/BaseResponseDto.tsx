import { z } from "zod";

export interface BaseResponseDto<T> {
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
  BaseResponseDto<AnalysisDto>;

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

export function parseAnalysisResponse(
  json: unknown
): AnalysisResponseDto {
  return AnalysisResponseSchema.parse(json);
}