import "react-native-gesture-handler";
import React, { useEffect, useState, useCallback } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { View, ActivityIndicator } from "react-native";
import * as SplashScreen from "expo-splash-screen";
import {
  useFonts,
  Montserrat_400Regular,
  Montserrat_500Medium,
  Montserrat_600SemiBold,
  Montserrat_700Bold,
} from "@expo-google-fonts/montserrat";

import Routes from "./Routes";
import { ThemeProvider } from "../common/ThemeProvider";
import { UserProvider } from "../context/UserContext";
import { useAuth } from "../store/useAuth";

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function App() {
  const restoreAuth = useAuth((state) => state.restoreAuth);
  const [appIsReady, setAppIsReady] = useState(false);

  // Load Montserrat fonts
  const [fontsLoaded] = useFonts({
    Montserrat_400Regular,
    Montserrat_500Medium,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
  });

  useEffect(() => {
    async function prepare() {
      try {
        // Restore authentication
        await restoreAuth();

        // Artificially delay for smoother experience (optional)
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (e) {
        console.warn("Error preparing app:", e);
      } finally {
        // Tell the application to render
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady && fontsLoaded) {
      // This tells the splash screen to hide immediately
      await SplashScreen.hideAsync();
    }
  }, [appIsReady, fontsLoaded]);

  if (!appIsReady || !fontsLoaded) {
    return null; // Return null while loading (splash screen will show)
  }

  return (
    <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <UserProvider>
        <ThemeProvider>
          <NavigationContainer>
            <Routes />
          </NavigationContainer>
        </ThemeProvider>
      </UserProvider>
    </View>
  );
}
