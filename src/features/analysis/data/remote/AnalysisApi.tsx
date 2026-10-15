import * as FileSystem from "expo-file-system/legacy";
import {parseAnalysisResponse} from "../dto/AnalysisDto";

export const ANALYZE_IMAGE_URL =
    "https://jmyqvrvrguhfujgombqe.supabase.co/functions/v1/analyze-image";

export class AnalysisApiError extends Error {
    public constructor(public readonly status: number, public readonly payload: unknown) {
        super(`Analysis API ${status}`);
        this.name = "AnalysisApiError";
    }
}

export class AnalysisApi {
    public constructor(private readonly endpoint = ANALYZE_IMAGE_URL) {}

    public async uploadImage(imageUri: string, signal?: AbortSignal) {
        if (signal?.aborted) throw createAbortError();

        const upload = await FileSystem.uploadAsync(this.endpoint, imageUri, {
            httpMethod: "POST",
            uploadType: FileSystem.FileSystemUploadType.MULTIPART,
            fieldName: "image",
            mimeType: "image/jpeg",
            headers: {Accept: "application/json"},
        });

        if (signal?.aborted) throw createAbortError();

        let responseJson: unknown;
        try {
            responseJson = JSON.parse(upload.body);
        } catch {
            throw new Error(`Analysis API returned invalid JSON (${upload.status}).`);
        }

        if (upload.status < 200 || upload.status >= 300) {
            throw new AnalysisApiError(upload.status, responseJson);
        }

        return parseAnalysisResponse(responseJson);
    }
}

function createAbortError(): Error {
    const error = new Error("The analysis was cancelled.");
    error.name = "AbortError";
    return error;
}


