export type AnalysisDetails = Record<string, unknown>;

export interface Analysis {
    category: string;
    title: string;
    summary: string;
    extractedText: string;
    details: AnalysisDetails;
    confidence: number;
}



