export type CapturedImage = {uri: string; previewUri: string};

let latestCapturedImage: CapturedImage | null = null;

export function setLatestCapturedImage(image: CapturedImage): void {
    latestCapturedImage = image;
}

export function getLatestCapturedImage(): CapturedImage | null {
    return latestCapturedImage;
}



