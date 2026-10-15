import type {AnalysisRepository} from "../../domain/repositories/AnalysisRepository";
import type {Analysis} from "../../domain/models/Analysis";
import {mapAnalysisResponse} from "../mappers/AnalysisMapper";
import type {AnalysisApi} from "../remote/AnalysisApi";

export class AnalysisRepositoryImpl implements AnalysisRepository {
    public constructor(private readonly api: Pick<AnalysisApi, "uploadImage">) {}

    public async analyzeImage(imageUri: string, signal?: AbortSignal): Promise<Analysis> {
        return mapAnalysisResponse(await this.api.uploadImage(imageUri, signal));
    }
}



