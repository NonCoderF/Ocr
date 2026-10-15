import {StyleSheet, Text, View} from "react-native";
import type {Analysis} from "../../domain/models/Analysis";

export default function AnalysisDetails({analysis}: { analysis: Analysis }) {
    const entries = Object.entries(analysis.details);
    return <>
        {entries.length > 0 && <Text style={styles.heading}>Details</Text>}
        {entries.length > 0 && <View style={styles.card}>{entries.map(([key, value], index) => <View key={key}>
            <View style={styles.row}>
                <Text style={styles.key} selectable>{key.replaceAll("_", " ")}</Text>
                <Text style={styles.value} selectable>{typeof value === "object" ? JSON.stringify(value) : String(value)}</Text></View>
            {index < entries.length - 1 && <View style={styles.divider}/>}
        </View>)}</View>}

        {analysis.extractedText.toString().length > 0 && (
            <Text style={styles.heading}>Extracted Text</Text>
        )}
        {analysis.extractedText.toString().length > 0 && (
            <Text style={styles.extractedText} selectable>{analysis.extractedText}</Text>
        )}

    </>;
}

const styles = StyleSheet.create({
    heading: {paddingTop: 20, fontWeight: "bold", fontSize: 20, color: "#000000"},
    card: {
        backgroundColor: "#ffffff",
        borderRadius: 16,
        marginTop: 10,
        padding: 10,
        shadowColor: "#000000",
        shadowOffset: {width: 0, height: 10},
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 10
    },
    row: {flexDirection: "row", justifyContent: "space-between", gap: 16, paddingVertical: 8},
    divider: {height: StyleSheet.hairlineWidth, backgroundColor: "rgb(0 0 0 / 0.47)"},
    key: {flex: 1, color: "#666666", fontWeight: "600", textTransform: "capitalize"},
    value: {flex: 1, color: "#111111", textAlign: "right"},
    extractedText: {
        marginTop: 12,
        padding: 16,
        borderRadius: 12,
        backgroundColor: "rgb(0 0 0 / 0.24)",
        color: "rgb(0 0 0 / 0.7)",
        lineHeight: 24
    },
});

