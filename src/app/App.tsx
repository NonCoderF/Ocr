import CameraScreen from "@/app/camera/camera_screen";
import {SafeAreaView} from "react-native-safe-area-context";

export default function RootLayout() {
    return <SafeAreaView style={{flex: 1}}>
        <CameraScreen/>
    </SafeAreaView>
}
