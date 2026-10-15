import {useCallback, useRef, useState} from "react";
import type {CameraView} from "expo-camera";
import {setLatestCapturedImage} from "@/shared/utils/capturedImage";

export function useCameraCapture() {
    const cameraRef = useRef<CameraView | null>(null);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);

    const capture = useCallback(async () => {
        const camera = cameraRef.current;
        if (!camera) return null;

        const picture = await camera.takePictureAsync({base64: true});
        if (!picture?.uri) return null;

        const previewUri = picture.base64 ? `data:image/jpeg;base64,${picture.base64}` : picture.uri;
        setLatestCapturedImage({uri: picture.uri, previewUri});
        setCapturedImage(previewUri);
        return previewUri;
    }, []);

    return {cameraRef, capturedImage, capture};
}



