import {useEffect, useState} from "react";
import {ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View} from "react-native";
import {router} from "expo-router";
import {SafeAreaView} from "react-native-safe-area-context";
import {getLatestCapturedImage} from "../lib/captured_image";
import * as FileSystem from "expo-file-system/legacy";
import LottieView from "lottie-react-native";

const ANALYZE_IMAGE_URL = "https://jmyqvrvrguhfujgombqe.supabase.co/functions/v1/analyze-image";

const analyzeImage = async (imageUri: string) => {
    const base64 = imageUri.replace(/^data:image\/jpeg;base64,/, "");
    const temporaryFileUri = `${FileSystem.cacheDirectory}ocr-${Date.now()}.jpg`;

    try {
        await FileSystem.writeAsStringAsync(temporaryFileUri, base64, {
            encoding: FileSystem.EncodingType.Base64,
        });

        const upload = await FileSystem.uploadAsync(
            ANALYZE_IMAGE_URL,
            temporaryFileUri,
            {
                httpMethod: "POST",
                uploadType: FileSystem.FileSystemUploadType.MULTIPART,
                fieldName: "image",
                mimeType: "image/jpeg",
                headers: {Accept: "application/json"},
            },
        );

        if (upload.status < 200 || upload.status >= 300) {
            throw new Error(`Analysis API ${upload.status}: ${upload.body}`);
        }

        return upload.body;
    } finally {
        await FileSystem.deleteAsync(temporaryFileUri, {idempotent: true});
    }
};

const AnalysisScreen = () => {
    const capturedImage = getLatestCapturedImage();
    const previewUri = capturedImage?.previewUri;
    const [analyzing, setAnalyzing] = useState(Boolean(previewUri));
    const [result, setResult] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const displayError = error ?? (!previewUri ? "No captured image was provided." : null);

    useEffect(() => {
        if (!previewUri) return;
        let cancelled = false;

        analyzeImage(previewUri).then((response) => {
            if (!cancelled) { setResult(response); setAnalyzing(false); }
        }).catch((requestError: unknown) => {
            if (!cancelled) {
                console.error("Image analysis request failed", requestError);
                setError(requestError instanceof Error
                    ? requestError.message
                    : "We couldn't analyse this image. Please try again.");
                setAnalyzing(false);
            }
        });
        return () => { cancelled = true; };

    }, [previewUri]);

    return (
        <SafeAreaView style={styles.screen}>
            <View style={styles.header}>
                <Pressable onPress={() => router.back()}><Text style={styles.back}>Back</Text></Pressable>
                <Text style={styles.title}>ANALYSIS</Text>
                <View style={styles.spacer}/>
            </View>
            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.previewFrame}>{previewUri && <Image
                    source={{uri: previewUri}}
                    style={styles.preview}
                    resizeMode="contain"
                    onError={(event) => console.error("Captured image preview failed", event.nativeEvent.error)}
                />}</View>
                <View style={styles.card}>
                    {analyzing && !displayError ? (
                        <LottieView
                            source={require("../../assets/analysis_animation.json")}
                            style={[StyleSheet.absoluteFill]}
                            resizeMode="cover"
                            autoPlay
                            loop></LottieView>

                    ) : displayError ? (
                        <Text style={styles.error}>{displayError}</Text>
                    ) : (
                        <>
                            <Text style={styles.resultTitle}>Analysis result</Text>
                            <Text style={styles.result}>{result}</Text>
                        </>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default AnalysisScreen;

const styles = StyleSheet.create({
    screen: {flex: 1, backgroundColor: "#F7F7F5"},
    header: {minHeight: 72, paddingHorizontal: 24, flexDirection: "row", alignItems: "center", justifyContent: "space-between"},
    back: {fontSize: 16, fontWeight: "600"},
    title: {fontSize: 20, fontWeight: "800", letterSpacing: 1},
    spacer: {width: 36},
    content: {padding: 24, paddingBottom: 40},
    previewFrame: {height: 330, overflow: "hidden", borderRadius: 28, backgroundColor: "#EAEAE7"},
    preview: {width: "100%", height: "100%"},
    resultImage: {width: "100%", height: 180, marginBottom: 16, borderRadius: 16, backgroundColor: "#F0F0ED"},
    card: {marginTop: 32, padding: 32,},
    loading: {flexDirection: "row", alignItems: "center", gap: 12},
    status: {fontSize: 17, fontWeight: "700"},
    resultTitle: {marginBottom: 12, fontSize: 18, fontWeight: "800"},
    result: {fontSize: 16, lineHeight: 24, color: "#333"},
    error: {fontSize: 16, lineHeight: 24, color: "#A33A3A"},
});
