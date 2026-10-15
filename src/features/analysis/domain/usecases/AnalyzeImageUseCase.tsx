import type {AnalysisRepository} from "../repositories/AnalysisRepository";
import type {Analysis} from "../models/Analysis";

export class AnalyzeImageUseCase {
    public constructor(private readonly repository: AnalysisRepository) {}

    public execute(imageUri: string, signal?: AbortSignal): Promise<Analysis> {
        if (!imageUri.trim() || imageUri.startsWith("data:")) {
            return Promise.reject(new Error("A local image file is required for upload."));
        }

        if (signal?.aborted) {
            const error = new Error("The analysis was cancelled.");
            error.name = "AbortError";
            return Promise.reject(error);
        }

        return this.repository.analyzeImage(imageUri, signal);
    }
}


