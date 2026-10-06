import React from "react";
import {NativeTabs} from 'expo-router/unstable-native-tabs';
import {Stack} from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
       <Stack.Screen name="tabs" options={{ headerShown: false }} />
       <Stack.Screen name="analysis" options={{ headerShown: false }} />
     </Stack>
   );
 }
