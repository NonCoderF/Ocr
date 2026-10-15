jest.mock("expo-file-system/legacy", () => ({
    FileSystemUploadType: {MULTIPART: "MULTIPART"},
    uploadAsync: jest.fn(),
}));

import * as FileSystem from "expo-file-system/legacy";
import {AnalysisApi, AnalysisApiError} from "@/features/analysis/data/remote/AnalysisApi";

const response = {success: true, analysis: {category: "receipt", title: "Receipt", summary: "A receipt", extractedText: "Total 10", details: {total: 10}, confidence: 0.9}};

describe("AnalysisApi", () => {
    it("uploads multipart image data and parses success", async () => {
        jest.mocked(FileSystem.uploadAsync).mockResolvedValue({status: 200, body: JSON.stringify(response)} as never);
        await expect(new AnalysisApi("https://example.test/analyze").uploadImage("file:///receipt.jpg")).resolves.toEqual(response);
        expect(FileSystem.uploadAsync).toHaveBeenCalledWith("https://example.test/analyze", "file:///receipt.jpg", expect.objectContaining({fieldName: "image", uploadType: "MULTIPART"}));
    });

    it("exposes structured API failures and malformed responses", async () => {
        jest.mocked(FileSystem.uploadAsync).mockResolvedValue({status: 422, body: JSON.stringify({success: false, error: {code: "INVALID", message: "Unreadable image"}})} as never);
        await expect(new AnalysisApi().uploadImage("file:///receipt.jpg")).rejects.toMatchObject<Partial<AnalysisApiError>>({status: 422});
        jest.mocked(FileSystem.uploadAsync).mockResolvedValue({status: 200, body: "not-json"} as never);
        await expect(new AnalysisApi().uploadImage("file:///receipt.jpg")).rejects.toThrow("invalid JSON");
    });

    it("stops before upload when cancelled", async () => {
        jest.mocked(FileSystem.uploadAsync).mockClear();
        const controller = new AbortController();
        controller.abort();
        await expect(new AnalysisApi().uploadImage("file:///receipt.jpg", controller.signal)).rejects.toMatchObject({name: "AbortError"});
        expect(FileSystem.uploadAsync).not.toHaveBeenCalled();
    });
});


