import type {Analysis} from "../../domain/models/Analysis";
import type {AnalysisResponseDto} from "../dto/AnalysisDto";

export function mapAnalysisResponse(dto: AnalysisResponseDto): Analysis {
    return {...dto.analysis, details: {...dto.analysis.details}};
}



