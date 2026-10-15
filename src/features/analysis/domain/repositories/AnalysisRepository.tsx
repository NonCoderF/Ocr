import type {Analysis} from "../models/Analysis";

export interface AnalysisRepository {
    analyzeImage(imageUri: string, signal?: AbortSignal): Promise<Analysis>;
}



