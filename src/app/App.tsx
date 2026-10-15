import CameraScreen from "@/features/camera/presentation/screens/CameraScreen";
import {SafeAreaView} from "react-native-safe-area-context";
import {StatusBar} from "react-native";

export default function RootLayout() {
    return <SafeAreaView style={{flex: 1}}>
        <StatusBar
            barStyle="dark-content"
            backgroundColor="#ffffff"
            translucent={false}
        />
        <CameraScreen/>
    </SafeAreaView>
}
