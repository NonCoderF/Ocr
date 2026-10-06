import {Animated, BackHandler, Image, Pressable, StyleSheet, Text, View} from "react-native";
import {useEffect, useRef} from "react";
import LottieView from "lottie-react-native";
import {Color} from "expo-router";

type Props = {
    imageUri: string | null;
    analyzing: boolean;
    visible: boolean;
    onAnalyze: () => void;
    onHide: () => void
};

const CameraAnalysisBottomSheet =
    ({imageUri, analyzing, visible, onAnalyze, onHide}: Props) => {

        if (!visible || !imageUri) return null;

        const translateY = useRef(new Animated.Value(600)).current;

        const fade = useRef(new Animated.Value(0)).current

        useEffect(() => {
            if (visible) {
                Animated.timing(fade, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }).start();
            }

        }, [visible])

        useEffect(() => {
            if (visible) {
                translateY.setValue(600);

                Animated.spring(translateY, {
                    toValue: 0,
                    damping: 24,
                    stiffness: 120,
                    mass: 1.8,
                    useNativeDriver: true,
                }).start();
            }
        }, [visible])

        useEffect(() => {
            const backHandler = BackHandler.addEventListener(
                "hardwareBackPress",
                () => {
                    if (visible) {

                        Animated.parallel(
                            [
                                Animated.spring(translateY, {
                                    toValue: 600,
                                    damping: 24,
                                    stiffness: 120,
                                    mass: 1.8,
                                    useNativeDriver: true,
                                }),
                                Animated.timing(fade, {
                                    toValue: 0,
                                    duration: 1000,
                                    useNativeDriver: true,
                                })
                            ]
                        ).start(() => {
                            onHide()
                        })
                        return true;
                    }

                    return false;
                }
            );

            return () => backHandler.remove();
        }, [visible, onHide]);



        return (
            <View style={styles.overlay}>
                <Animated.View style={[styles.backdrop, {
                    opacity: fade
                }]}>
                    <Pressable style={styles.backdrop} onPress={onHide}/>
                </Animated.View>

                <Animated.View style={[
                    styles.sheet,
                    {
                        transform: [{translateY}]
                    }]
                }>
                    <Text style={styles.statusText}>{"Image ready"}</Text>
                    <View style={styles.previewFrame}>
                        <Image source={{uri: imageUri}} style={styles.preview}
                               resizeMode="contain"/></View>
                    <View style={styles.button}>
                        <Pressable
                            style={[styles.actionButton, analyzing && styles.disabledButton]}
                            onPress={onAnalyze} disabled={analyzing}>

                            <LottieView
                                source={require("../../../../assets/analyze_button.json")}
                                style={[StyleSheet.absoluteFill]}
                                resizeMode="cover"
                                autoPlay
                                loop>

                            </LottieView>

                            <Text style={styles.actionButtonText}>Analyze</Text>

                        </Pressable>
                    </View>
                </Animated.View>
            </View>
        );
    };

export default CameraAnalysisBottomSheet;

const styles = StyleSheet.create({
    statusText: {
        margin: 10,
        fontSize: 24,
        fontWeight: "bold",
    },
    overlay: {...StyleSheet.absoluteFill, justifyContent: "flex-end"},
    backdrop: {...StyleSheet.absoluteFill, backgroundColor: "rgb(17 17 17 / 0.81)"},
    sheet: {
        minHeight: "48%",
        paddingHorizontal: 24,
        paddingTop: 12,
        paddingBottom: 28,
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        backgroundColor: "white",
        shadowColor: "#000",
        shadowOffset: {width: 0, height: -4},
        shadowOpacity: 0.12,
        shadowRadius: 16,
        elevation: 12,
        alignContent: "center",
        alignItems: "center"
    },
    handle: {alignSelf: "center", width: 42, height: 5, marginBottom: 18, borderRadius: 3, backgroundColor: "#D7D7D7"},
    previewFrame: {
        width: "100%",
        flex: 1,
        minHeight: 220,
        overflow: "hidden",
        borderRadius: 20,
        backgroundColor: "#F4F4F4"
    },
    preview: {width: "100%", height: "100%"},
    button: {
        width: "100%",
        marginTop: 16,
        flexDirection: "row",
        alignItems: "center",
    },
    actionButton: {
        width: "100%",
        height: 56,
        borderRadius: 50,
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
    },
    actionButtonText: {
        fontSize: 16,
        fontWeight: "bold",
        color: "white"
    },
    disabledButton: {opacity: 0.45},
});
