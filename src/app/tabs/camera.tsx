import {useRef, useState,} from "react";
import {Pressable, StyleSheet, Text, View,} from "react-native";
import {CameraView, useCameraPermissions,} from "expo-camera";
import {router} from "expo-router";
import {Camera, LoaderCircle} from "lucide-react-native";
import CameraPermissionView from "./camera/camera_permission";
import CameraAnalysisBottomSheet from "./camera/camera_bottom_sheet";
import {setLatestCapturedImage} from "../../lib/captured_image";

const CameraScreen = () => {
    const [permission, requestPermission] =
        useCameraPermissions();

    const cameraRef = useRef<CameraView | null>(null);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [isAnalysisSheetOpen, setIsAnalysisSheetOpen] = useState(false);

    const handleCapture = async () => {
        if (!cameraRef.current) {
            return;
        }

        const picture = await cameraRef.current.takePictureAsync({base64: true});

        if (picture?.uri) {
            const previewUri = picture.base64
                ? `data:image/jpeg;base64,${picture.base64}`
                : picture.uri;
            setLatestCapturedImage({uri: picture.uri, previewUri});
            setCapturedImage(previewUri);
            setIsAnalysisSheetOpen(true);
        }
    };

    const handleAnalyze = () => {
        if (!capturedImage) return;
        setIsAnalysisSheetOpen(false);
        router.push({pathname: "../../analysis"});
    };

    if (!permission) {
        return (
            <View style={styles.loading}>
                <LoaderCircle size={32}/>
            </View>
        );
    }

    if (!permission.granted) {
        return (
            <CameraPermissionView
                onAllow={requestPermission}
            />
        );
    }

    return (
        <View style={styles.container}>

            <Text style={styles.title}>
                CLICK PICTURES
            </Text>

            <Text style={styles.description}>
                Capture anything you want to understand.
                We&apos;ll analyse it for you.
            </Text>

            <View style={styles.cameraContainer}>

                <CameraView
                    ref={cameraRef}
                    style={StyleSheet.absoluteFill}
                    facing="back"
                />

                {/* Bottom-right cutout */}
                <View style={styles.cutout}>

                    <Pressable
                        style={styles.captureButton}
                        onPress={handleCapture}
                    >
                        <Camera size={30} strokeWidth={2.2}/>
                    </Pressable>

                </View>

            </View>

            <CameraAnalysisBottomSheet
                imageUri={capturedImage}
                analyzing={false}
                visible={isAnalysisSheetOpen}
                onAnalyze={handleAnalyze}
            />

        </View>
    );
};

export default CameraScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 32,
    },

    loading: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },

    title: {
        marginTop: 36,
        fontSize: 36,
        fontWeight: "800",
        letterSpacing: -1,
    },

    description: {
        fontSize: 16,
        fontStyle: "italic",
        lineHeight: 23,
        opacity: 0.6,
        marginTop: 8,
        marginBottom: 24,
    },

    cameraContainer: {
        flex: 1,
        position: "relative",
        overflow: "hidden",
        borderRadius: 28,
        marginBottom: 20,
    },

    cutout: {
        position: "absolute",
        right: 0,
        bottom: 0,

        width: 105,
        height: 105,

        borderTopLeftRadius: 36,

        alignItems: "center",
        justifyContent: "center",

        backgroundColor: "white",
    },

    captureButton: {
        width: 72,
        height: 72,
        borderRadius: 36,

        alignItems: "center",
        justifyContent: "center",

        backgroundColor: "white",

        borderWidth: 2,
        borderColor: "#111",
    },
});
