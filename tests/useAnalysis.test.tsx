import {renderHook, waitFor, act} from "@testing-library/react-native";
import {useAnalysis} from "@/features/analysis/presentation/hooks/useAnalysis";

const result = {category: "receipt", title: "Receipt", summary: "ok", extractedText: "text", details: {}, confidence: 1};

describe("useAnalysis", () => {
    it("reports success, errors, and retries", async () => {
        const execute = jest.fn().mockRejectedValueOnce(new Error("network down")).mockResolvedValueOnce(result);
        const dependency = {execute};
        const hook = await renderHook(() => useAnalysis("file:///receipt.jpg", dependency));
        await waitFor(() => expect(hook.result.current.errorMessage).toBe("network down"));
        expect(hook.result.current.analyzing).toBe(false);
        await act(async () => {hook.result.current.retry();});
        await waitFor(() => expect(hook.result.current.data).toEqual(result));
        expect(execute).toHaveBeenCalledTimes(2);
    });

    it("ignores stale responses after cancellation", async () => {
        let resolveFirst!: (value: typeof result) => void;
        const first = new Promise<typeof result>((resolve) => {resolveFirst = resolve;});
        const execute = jest.fn().mockReturnValueOnce(first).mockResolvedValueOnce({...result, title: "new"});
        const dependency = {execute};
        const hook = await renderHook(() => useAnalysis("file:///receipt.jpg", dependency));
        await waitFor(() => expect(execute).toHaveBeenCalledTimes(1));
        await act(async () => {hook.result.current.retry();});
        await waitFor(() => expect(hook.result.current.data?.title).toBe("new"));
        act(() => resolveFirst(result));
        expect(hook.result.current.data?.title).toBe("new");
    });
});
