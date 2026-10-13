// ProfileCard.tsx

import {Pressable, StyleSheet, Text, View} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import {Ionicons} from "@expo/vector-icons";
import LottieView from "lottie-react-native";
import {useEffect, useState} from "react";
import {router} from "expo-router";
import * as FileSystem from "expo-file-system/legacy";
import {getLatestCapturedImage} from "@/lib/captured_image";
import {parseAnalysisResponse} from "@/app/tabs/dto/BaseResponseDto";

const ANALYZE_IMAGE_URL = "https://jmyqvrvrguhfujgombqe.supabase.co/functions/v1/analyze-image";

const COLORS = {
    background: "#FAF9F6",
    text: "#151521",
    muted: "#55545B",
    purple: "#5957B6",
    border: "#E9E9E9",
};

const analyzeImage = async (imageUri: string) => {
    const upload = await FileSystem.uploadAsync(
        ANALYZE_IMAGE_URL,
        imageUri,
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
};
export default function AnalysisScreen() {

    const imageUri
        = getLatestCapturedImage()?.uri;


    const [analyzing, setAnalyzing] = useState<boolean>(true);

    useEffect(() => {
        if (!imageUri) return

        analyzeImage(imageUri).then((response : string) => {

            const responseDto
                = parseAnalysisResponse(
                JSON.parse(response.toString())
            )


            console.log("Document is : " + responseDto.analysis.extractedText)
            Object.entries(responseDto.analysis.details).forEach(([key, value]) => {
                console.log(`${key}: ${value}`);
            });

            setAnalyzing(false)
        }).catch((requestError : any) => {
            if (requestError instanceof Error){
                console.log(requestError.message)
            }

            setAnalyzing(false)
        })
    }, [imageUri])

    const handleBack = () => {
        router.back()
    }

    // useEffect(() => {
    //
    //     setTimeout(() => {
    //         setAnalyzing(false)
    //     }, 5000)
    // })

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
                ) : (
                    <View></View>
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
        }
    }
)
