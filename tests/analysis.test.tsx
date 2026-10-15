import {AnalyzeImageUseCase} from "@/features/analysis/domain/usecases/AnalyzeImageUseCase";
import {AnalysisRepositoryImpl} from "@/features/analysis/data/repositories/AnalysisRepositoryImpl";
import {mapAnalysisResponse} from "@/features/analysis/data/mappers/AnalysisMapper";
import {AnalysisResponseSchema, parseAnalysisResponse} from "@/features/analysis/data/dto/AnalysisDto";

const dto = {success: true, analysis: {category: "receipt", title: "Receipt", summary: "A receipt", extractedText: "Total 10", details: {total: 10, merchant: "Shop"}, confidence: 0.9}};

describe("AnalyzeImageUseCase", () => {
    it("rejects data URIs and delegates local files", async () => {
        const repository = {analyzeImage: jest.fn().mockResolvedValue(mapAnalysisResponse(dto))};
        const useCase = new AnalyzeImageUseCase(repository);
        await expect(useCase.execute("data:image/jpeg;base64,secret")).rejects.toThrow("local image");
        await expect(useCase.execute("file:///receipt.jpg")).resolves.toEqual(mapAnalysisResponse(dto));
        expect(repository.analyzeImage).toHaveBeenCalledWith("file:///receipt.jpg", undefined);
    });

    it("honors cancellation before starting work", async () => {
        const controller = new AbortController();
        controller.abort();
        const repository = {analyzeImage: jest.fn()};
        await expect(new AnalyzeImageUseCase(repository).execute("file:///receipt.jpg", controller.signal)).rejects.toMatchObject({name: "AbortError"});
        expect(repository.analyzeImage).not.toHaveBeenCalled();
    });
});

describe("analysis DTO and repository", () => {
    it("validates and maps dynamic details", () => {
        expect(parseAnalysisResponse(dto).analysis.details.merchant).toBe("Shop");
        expect(mapAnalysisResponse(dto).details).toEqual({total: 10, merchant: "Shop"});
        expect(AnalysisResponseSchema.safeParse({...dto, analysis: {...dto.analysis, confidence: 2}}).success).toBe(false);
    });

    it("maps a successful repository response", async () => {
        const api = {uploadImage: jest.fn().mockResolvedValue(dto)};
        await expect(new AnalysisRepositoryImpl(api).analyzeImage("file:///receipt.jpg")).resolves.toEqual(mapAnalysisResponse(dto));
        expect(api.uploadImage).toHaveBeenCalledWith("file:///receipt.jpg", undefined);
    });
});



