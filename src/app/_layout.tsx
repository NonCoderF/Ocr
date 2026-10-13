import React from "react";
import AnalysisScreen from "@/app/analysis";
import {router, Stack} from "expo-router";

export default function RootLayout() {
    return (
      <Stack>
         <Stack.Screen name="tabs" options={{ headerShown: false }} />
         <Stack.Screen name="analysis" options={{ headerShown: false }} />
       </Stack>
     );

    // return <AnalysisScreen
    //     imageUri=""
    //     onBack={function (): void {
    //         if (router.canGoBack()){
    //             router.back()
    //         }
    //     }}/>
}
