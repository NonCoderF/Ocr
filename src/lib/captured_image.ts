export type CapturedImage = {
    uri: string;
    previewUri: string;
};

let latestCapturedImage: CapturedImage | null = null;

export const setLatestCapturedImage = (image: CapturedImage) => {
    latestCapturedImage = image;
};

export const getLatestCapturedImage = () => latestCapturedImage;
