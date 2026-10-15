import {Image, Pressable, ScrollView, StyleSheet, Text, View} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import {Ionicons} from "@expo/vector-icons";
import LottieView from "lottie-react-native";
import {router} from "expo-router";
import {getLatestCapturedImage} from "@/shared/utils/capturedImage";
import {useAnalysis} from "../hooks/useAnalysis";
import AnalysisDetails from "../components/AnalysisDetails";

const COLORS = {background: "#FAF9F6", text: "#151521", muted: "#55545B", purple: "#5957B6"};

export default function AnalysisScreen() {
    const imageUri = getLatestCapturedImage()?.uri;
    const {analyzing, data, errorMessage, retry} = useAnalysis(imageUri);
    const handleBack = () => router.back();

    return <SafeAreaView style={styles.container}>
        <View style={styles.header}>
            <Pressable onPress={handleBack}>
                <Ionicons name="arrow-back" size={24} color={COLORS.text}/>
            </Pressable>
            <Text style={styles.headerTitle}>Analysis</Text></View>

        {analyzing ?
            <View style={styles.lottieLoaderContainer}>
                <LottieView source={require("@/assets/analysis_animation.json")}
                            style={styles.loaderAnimation} resizeMode="cover"
                            autoPlay loop/>
                <Text style={styles.loadingText}>Please
                    wait while your document is being scanned...</Text>
                <View style={{height: 125}}/></View>
            : errorMessage ?
                <View style={styles.error}>
                    <LottieView source={require("@/assets/error_animation.json")}
                                style={styles.errorAnimation} resizeMode="cover"
                                autoPlay loop/>
                    <Text
                        style={styles.errorTitle}>Couldn&apos;t analyze this image</Text><Text
                    style={styles.errorMessage}>{errorMessage}</Text><Pressable style={styles.retryButton}
                                                                                onPress={retry}><Text
                    style={styles.retryButtonText}>Try again</Text></Pressable><Pressable onPress={handleBack}><Text
                    style={styles.gobackButtonText}>Go back</Text></Pressable></View>
                : data && imageUri ?
                    <ScrollView style={styles.detailsContainer}>
                        <Image source={{uri: imageUri}} style={styles.preview}
                               resizeMode="contain"/><View
                        style={{paddingTop: 18}}><Text style={styles.documentHeader}>DOCUMENT</Text><Text
                        style={styles.documentTitle}>Document Identified</Text>
                        <Text style={styles.summary}
                              selectable>{data.summary}</Text>
                        <AnalysisDetails analysis={data}/></View>
                        <View style={styles.confidence}>
                            <View style={styles.confidenceDot}/>
                            <Text style={{paddingStart: 10}}>{data.confidence * 100}% Confidence</Text>
                        </View>
                        <View
                            style={{height: 100}}/></ScrollView>
                    : <View style={styles.error}><Text style={styles.errorTitle}>No image to analyze</Text><Pressable
                        onPress={handleBack}><Text style={styles.gobackButtonText}>Go back</Text></Pressable></View>}
    </SafeAreaView>;
}

const styles = StyleSheet.create({
    container: {width: "100%", height: "100%", alignItems: "center", backgroundColor: COLORS.background},
    header: {
        width: "100%",
        height: 68,
        paddingHorizontal: 20,
        flexDirection: "row",
        alignItems: "center",
        gap: 22,
        backgroundColor: "#F0F3F5"
    },
    headerTitle: {fontSize: 20, fontWeight: "bold", color: COLORS.text},
    lottieLoaderContainer: {flex: 1, alignItems: "center", justifyContent: "center", flexDirection: "column"},
    loaderAnimation: {width: 200, height: 200},
    loadingText: {width: 250, marginTop: 20, fontSize: 16, color: COLORS.muted, textAlign: "center", fontWeight: "500"},
    detailsContainer: {flex: 1, paddingHorizontal: 22, paddingTop: 22},
    preview: {width: "100%", aspectRatio: 16 / 9, borderRadius: 20, backgroundColor: "rgb(0 0 0 / 0.47)"},
    documentHeader: {
        color: "#264d8c",
        padding: 10,
        borderRadius: 20,
        backgroundColor: "rgb(66 135 245 / 0.51)",
        fontWeight: "bold",
        alignSelf: "flex-start"
    },
    documentTitle: {paddingTop: 12, fontWeight: "bold", fontSize: 24, color: "#000000"},
    summary: {marginTop: 10, fontSize: 16, color: "#000000"},
    confidence: {flexDirection: "row", paddingTop: 20, alignItems: "center"},
    confidenceDot: {paddingEnd: 10, width: 10, height: 10, borderRadius: 5, backgroundColor: "#f80202"},
    error: {width: "100%", height: "100%", alignItems: "center", justifyContent: "center", padding: 50},
    errorAnimation: {width: "25%", height: "25%"},
    errorTitle: {paddingTop: 20, fontWeight: "bold", fontSize: 24, color: "#000000", textAlign: "center"},
    errorMessage: {paddingTop: 20, fontSize: 18, color: "#000000", textAlign: "center"},
    retryButton: {
        marginTop: 20,
        minWidth: 150,
        height: 52,
        paddingHorizontal: 28,
        borderRadius: 26,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#2F80ED"
    },
    retryButtonText: {color: "#FFFFFF", fontSize: 16, fontWeight: "700"},
    gobackButtonText: {marginTop: 20, color: "#2F80ED", fontSize: 16, fontWeight: "700"},
});

