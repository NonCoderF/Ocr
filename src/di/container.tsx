import {AnalysisApi} from "@/features/analysis/data/remote/AnalysisApi";
import {AnalysisRepositoryImpl} from "@/features/analysis/data/repositories/AnalysisRepositoryImpl";
import {AnalyzeImageUseCase} from "@/features/analysis/domain/usecases/AnalyzeImageUseCase";

const analysisApi = new AnalysisApi();
const analysisRepository = new AnalysisRepositoryImpl(analysisApi);

export const analyzeImageUseCase = new AnalyzeImageUseCase(analysisRepository);


