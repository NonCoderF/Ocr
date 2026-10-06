import {Image, Pressable, StyleSheet, Text, useWindowDimensions, View} from "react-native";

type Props = { imageUri: string | null; analyzing: boolean; visible: boolean; onAnalyze: () => void };

const CameraAnalysisBottomSheet =
    ({imageUri, analyzing, visible, onAnalyze}: Props) => {

        if (!visible || !imageUri) return null;

        return (
            <View style={styles.overlay}>
                <Pressable style={styles.backdrop}/>
                <View style={styles.sheet}>
                    <Text style={styles.statusText}>{"Image ready"}</Text>
                    <View style={styles.previewFrame}>
                        <Image source={{uri: imageUri}} style={styles.preview}
                               resizeMode="contain"/></View>
                    <View style={styles.button}>
                        <Pressable style={styles.actionButton}><Text
                            style={styles.actionButtonText}>Save</Text></Pressable>
                        <Pressable style={[styles.actionButton, analyzing && styles.disabledButton]} onPress={onAnalyze}
                                   disabled={analyzing}><Text style={styles.actionButtonText}>Analyze</Text></Pressable>
                    </View>
                </View>
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
    backdrop: {...StyleSheet.absoluteFill, backgroundColor: "rgba(17, 17, 17, 0.18)"},
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
    previewFrame: {flex: 1, minHeight: 220, overflow: "hidden", borderRadius: 20, backgroundColor: "#F4F4F4"},
    preview: {width: "100%", height: "100%"},
    button: {
        width: "100%",
        marginTop: 16,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 12
    },
    actionButton: {
        flex: 1,
        borderRadius: 50,
        padding: 12,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 2,
        borderColor: "rgb(83 83 83 / 0.81)"
    },
    actionButtonText: {fontSize: 16, fontWeight: "600"},
    disabledButton: {opacity: 0.45},
});
