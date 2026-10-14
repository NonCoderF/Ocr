import parseAnalysisResponse, {
    type AnalysisResponseDto,
} from "@/app/analysis/dto/base_response_dto";
import * as FileSystem from "expo-file-system/legacy";

const ANALYZE_IMAGE_URL =
    "https://jmyqvrvrguhfujgombqe.supabase.co/functions/v1/analyze-image";

export async function analyzeImageApi(imageUri: string): Promise<AnalysisResponseDto> {
    if (!imageUri || imageUri.startsWith("data:")) {
        throw new Error("A local image file is required for upload.");
    }

    const upload = await FileSystem.uploadAsync(ANALYZE_IMAGE_URL, imageUri, {
        httpMethod: "POST",
        uploadType: FileSystem.FileSystemUploadType.MULTIPART,
        fieldName: "image",
        mimeType: "image/jpeg",
        headers: {Accept: "application/json"},
    });

    const responseText = upload.body;
    let responseJson: unknown;

    try {
        responseJson = JSON.parse(responseText);
    } catch {
        throw new Error(`Analysis API returned invalid JSON (${upload.status}).`);
    }

    if (upload.status < 200 || upload.status >= 300) {
        throw new Error(`Analysis API ${upload.status}: ${responseText}`);
    }

    return parseAnalysisResponse(responseJson);
}
