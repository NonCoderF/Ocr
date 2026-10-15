import {useCallback, useEffect, useRef, useState} from "react";
import type {Analysis} from "../../domain/models/Analysis";
import {getAnalysisErrorMessage} from "../../data/dto/AnalysisDto";
import {analyzeImageUseCase} from "@/di/container";
import type {AnalyzeImageUseCase} from "../../domain/usecases/AnalyzeImageUseCase";

export type AnalysisState = {
    analyzing: boolean;
    data: Analysis | null;
    errorMessage: string | null;
};

export function useAnalysis(
    imageUri: string | undefined,
    useCase: Pick<AnalyzeImageUseCase, "execute"> = analyzeImageUseCase): AnalysisState & {
    retry: () => void;
    cancel: () => void
} {
    const [state, setState] = useState<AnalysisState>({analyzing: Boolean(imageUri), data: null, errorMessage: null});
    const requestId = useRef(0);
    const controller = useRef<AbortController | null>(null);

    const cancel = useCallback(() => {
        controller.current?.abort();
        controller.current = null;
    }, []);

    const analyze = useCallback(() => {
        if (!imageUri) {
            setState({analyzing: false, data: null, errorMessage: "No captured image is available."});
            return;
        }

        const currentRequest = ++requestId.current;
        controller.current?.abort();
        const nextController = new AbortController();
        controller.current = nextController;
        setState((previous) => ({...previous, analyzing: true, errorMessage: null}));

        useCase.execute(imageUri, nextController.signal).then((data) => {
            if (currentRequest === requestId.current && !nextController.signal.aborted) {
                setState({analyzing: false, data, errorMessage: null});
            }
        }).catch((error: unknown) => {
            if (currentRequest !== requestId.current || nextController.signal.aborted) return;
            const fallback = error instanceof Error ? error.message : "We couldn't analyse this image. Please try again.";
            const payload = typeof error === "object" && error !== null && "payload" in error ? error.payload : error;
            setState({analyzing: false, data: null, errorMessage: getAnalysisErrorMessage(payload, fallback)});
        });
    }, [imageUri, useCase]);

    useEffect(() => {
        const timer = setTimeout(analyze, 0);
        return () => {
            clearTimeout(timer);
            cancel();
            requestId.current += 1;
        };
    }, [analyze, cancel]);

    return {...state, retry: analyze, cancel};
}
