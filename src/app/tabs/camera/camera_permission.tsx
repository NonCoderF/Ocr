import { Camera, ShieldCheck } from "lucide-react-native";
import {
    View,
    Text,
    Pressable,
    StyleSheet,
} from "react-native";

type Props = {
    onAllow: () => void;
};

export default function CameraPermissionView({ onAllow }: Props) {
    return (
        <View style={styles.container}>

            <View style={styles.iconContainer}>
                <Camera size={48} strokeWidth={1.8} />
            </View>

            <Text style={styles.title}>
                Camera access needed
            </Text>

            <Text style={styles.description}>
                Scan documents, receipts and cards directly
                with your camera.
            </Text>

            <View style={styles.privacyRow}>
                <ShieldCheck size={18} />

                <Text style={styles.privacyText}>
                    Camera is only used when you scan
                </Text>
            </View>

            <Pressable
                style={styles.button}
                onPress={onAllow}
            >
                <Camera size={20} />

                <Text style={styles.buttonText}>
                    Enable Camera
                </Text>
            </Pressable>

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 28,
        justifyContent: "center",
        alignItems: "center",
    },

    iconContainer: {
        width: 110,
        height: 110,
        borderRadius: 32,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 32,
    },

    title: {
        fontSize: 28,
        fontWeight: "700",
        textAlign: "center",
    },

    description: {
        fontSize: 16,
        textAlign: "center",
        lineHeight: 24,
        marginTop: 12,
        opacity: 0.65,
    },

    privacyRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginTop: 24,
    },

    privacyText: {
        fontSize: 14,
        opacity: 0.65,
    },

    button: {
        width: "100%",
        height: 58,
        borderRadius: 18,
        marginTop: 32,

        flexDirection: "row",
        gap: 10,
        alignItems: "center",
        justifyContent: "center",
    },

    buttonText: {
        fontSize: 17,
        fontWeight: "600",
    },
});