// ProfileCard.tsx

import {Image, Pressable, ScrollView, StyleSheet, Text, View} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import {Ionicons} from "@expo/vector-icons";
import LottieView from "lottie-react-native";
import {useEffect, useState} from "react";
import {router} from "expo-router";
import {getLatestCapturedImage} from "@/lib/captured_image";
import {analyzeImageApi} from "@/lib/analyze_image_api";
import {
    AnalysisErrorResponseDto,
    AnalysisResponseDto,
    parseAnalysisErrorResponse
} from "@/app/analysis/dto/base_response_dto";

const COLORS = {
    background: "#FAF9F6",
    text: "#151521",
    muted: "#55545B",
    purple: "#5957B6",
    border: "#E9E9E9",
};

export default function AnalysisScreen() {

    const imageUri
        = getLatestCapturedImage()?.uri;


    const [analyzing, setAnalyzing] = useState<boolean>(true);

    const [data, setData] = useState<AnalysisResponseDto>()

    const [errorMessage, setErrorMessage] = useState<string>("")
    const [error, setError] = useState<boolean>(false)

    const analyzeImage = (imageUrl: string) => {
        setAnalyzing(true)

        analyzeImageApi(imageUrl).then((responseDto) => {
            setError(false)
            setData(responseDto)
            setAnalyzing(false)
        }).catch((requestError: unknown) => {
            setError(true);
            const rawMessage = requestError instanceof Error
                ? requestError.message
                : "We couldn't analyse this image. Please try again.";
            const parsedError = parseAnalysisErrorResponse(rawMessage);

            if (typeof parsedError === "object" && parsedError !== null && "error" in parsedError) {
                const errorResponse = parsedError as AnalysisErrorResponseDto;
                setErrorMessage(errorResponse.error.message);
            } else {
                setErrorMessage(String(parsedError));
            }
            setAnalyzing(false)
        })
    }

    useEffect(() => {
        if (!imageUri) return

        const timer = setTimeout(() => analyzeImage(imageUri), 0);
        return () => clearTimeout(timer);

    }, [imageUri])

    const handleRetry = () => {
        if (!imageUri) return;
        setError(false);
        analyzeImage(imageUri);
    };

    const handleBack = () => {
        router.back()
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Pressable onPress={handleBack}>
                    <Ionicons
                        name={"arrow-back"}
                        size={24}
                        color={COLORS.text}
                    />
                </Pressable>
                <Text style={styles.headerTitle}>Analysis</Text>
            </View>

            {
                analyzing ? (
                    <View style={styles.lottieLoaderContainer}>
                        <LottieView
                            source={require("@/assets/analysis_animation.json")}
                            style={styles.loaderAnimation}
                            resizeMode="cover"
                            autoPlay
                            loop>

                        </LottieView>

                        <Text style={styles.loadingText}>Please wait while your document is being scanned...</Text>

                        <View style={{height: 125}}/>
                    </View>
                ) : (error ? (
                        <View style={styles.error}>
                            <LottieView
                                source={require("@/assets/error_animation.json")}
                                style={styles.errorAnimation}
                                resizeMode="cover"
                                autoPlay
                                loop>
                            </LottieView>
                            <Text
                                style={{
                                    paddingTop: 20,
                                    fontWeight: "bold",
                                    fontSize: 24,
                                    color: "#000000"
                                }}
                            >
                                Couldn&apos;t analyze this image
                            </Text>
                            <Text
                                style={{
                                    paddingTop: 20,
                                    fontWeight: "normal",
                                    fontSize: 18,
                                    color: "#000000"
                                }}
                            >
                                {errorMessage}
                            </Text>
                            <Pressable style={styles.retryButton} onPress={handleRetry}>
                                <Text style={styles.retryButtonText}>Try again</Text>
                            </Pressable>
                            <Pressable onPress={handleBack}>
                                <Text style={styles.gobackButtonText}>Go back</Text>
                            </Pressable>
                        </View>
                    ) : (
                        <ScrollView style={styles.detailsContainer}>
                            <Image source={{uri: imageUri}}
                                   style={styles.preview}
                                   resizeMode="contain"/>
                            <View style={{paddingTop: 18}}>
                                <Text style={styles.documentHeader}>DOCUMENT</Text>
                                <Text style={{paddingTop: 12, fontWeight: "bold", fontSize: 24, color: "#000000"}}>Document
                                    Identified</Text>
                                <Text style={{
                                    marginTop: 10,
                                    fontSize: 16,
                                    color: "#000000"
                                }} selectable={true}>{data?.analysis.summary}</Text>

                                <Text style={{
                                    paddingTop: 20,
                                    fontWeight: "bold",
                                    fontSize: 20,
                                    color: "#000000"
                                }}>Details</Text>

                                <View style={styles.detailsCard}>
                                    {data?.analysis.details && Object.entries(data.analysis.details).map(([key, value], index, entries) => (
                                        <View key={key}>
                                            <View style={styles.detailRow}>
                                                <Text style={styles.detailKey} selectable={true}>
                                                    {key.replaceAll("_", " ")}
                                                </Text>
                                                <Text style={styles.detailValue} selectable={true}>
                                                    {typeof value === "object" ? JSON.stringify(value) : String(value)}
                                                </Text>
                                            </View>
                                            {index < entries.length - 1 && <View style={styles.detailDivider}/>}
                                        </View>
                                    ))}
                                </View>


                                <Text style={{paddingTop: 20, fontWeight: "bold", fontSize: 20, color: "#000000"}}>Extracted
                                    Text</Text>
                                <Text style={styles.extractedText} selectable={true}>{data?.analysis.extractedText}</Text>

                            </View>

                            <View style={{
                                flexDirection: "row",
                                padding: 20,
                                alignItems: "center"
                            }}>
                                <View style={{
                                    width: 10,
                                    height: 10,
                                    borderRadius: 5,
                                    backgroundColor: "#f80202",
                                    alignItems: "center"
                                }}/>
                                <Text style={{marginLeft: 10}}>{data?.analysis.confidence && data.analysis.confidence * 100}% Confidence</Text>
                            </View>

                            <View style={{height: 100}}></View>

                        </ScrollView>
                    )
                )
            }

        </SafeAreaView>
    );
}

const styles = StyleSheet.create(
    {
        container: {
            width: "100%",
            height: "100%",
            alignItems: "center"
        },
        header: {
            width: "100%",
            height: 68,
            paddingHorizontal: 20,
            flexDirection: "row",
            alignItems: "center",
            gap: 22,
            backgroundColor: "#F0F3F5",
        },
        headerTitle: {
            fontSize: 20,
            fontWeight: "bold",
            color: COLORS.text,
        },

        lottieLoaderContainer: {
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column"
        },
        loaderAnimation: {
            width: 200,
            height: 200,
        },
        loadingText: {
            width: 250,
            marginTop: 20,
            fontSize: 16,
            color: COLORS.muted,
            textAlign: "center",
            fontWeight: "500"
        },
        detailsContainer: {
            flex: 1,
            paddingHorizontal: 22,
            paddingTop: 22
        },
        preview: {
            width: "100%",
            aspectRatio: 16 / 9,
            borderRadius: 20,
            borderWidth: 0,
            borderColor: "rgb(0 0 0 / 0.47)",
            backgroundColor: "rgb(0 0 0 / 0.47)"
        },
        documentHeader: {
            color: "#264d8c",
            padding: 10,
            borderRadius: 20,
            backgroundColor: "rgb(66 135 245 / 0.51)",
            fontWeight: "bold",
            alignSelf: "flex-start"
        },
        detailsCard: {
            backgroundColor: '#ffffff',
            borderRadius: 16,
            marginTop: 10,
            padding: 10,
            shadowColor: '#000000',
            shadowOffset: {width: 0, height: 10},
            shadowOpacity: 0.15,
            shadowRadius: 12,
            elevation: 10,
        },
        detailRow: {
            flexDirection: "row",
            justifyContent: "space-between",
            gap: 16,
            paddingVertical: 8,
        },
        detailDivider: {
            height: StyleSheet.hairlineWidth,
            backgroundColor: "rgb(0 0 0 / 0.47)",
        },
        detailKey: {
            flex: 1,
            color: "#666666",
            fontWeight: "600",
            textTransform: "capitalize",
        },
        detailValue: {
            flex: 1,
            color: "#111111",
            textAlign: "right",
        },
        extractedText: {
            marginTop: 12,
            padding: 16,
            borderRadius: 12,
            backgroundColor: "rgb(0 0 0 / 0.24)",
            color: "rgb(0 0 0 / 0.7)",
            lineHeight: 24,
        },
        error: {
            width: "100%",
            height: "100%",
            alignItems: "center",
            justifyContent: "center",
            padding: 50
        },
        errorAnimation: {
            width: "25%",
            height: "25%"
        },
        retryButton: {
            marginTop: 20,
            minWidth: 150,
            height: 52,
            paddingHorizontal: 28,
            borderRadius: 26,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#2F80ED",
        },
        retryButtonText: {
            color: "#FFFFFF",
            fontSize: 16,
            fontWeight: "700",
        },
        gobackButtonText: {
            marginTop: 20,
            color: "#2F80ED",
            fontSize: 16,
            fontWeight: "700",
        }
    }
)
