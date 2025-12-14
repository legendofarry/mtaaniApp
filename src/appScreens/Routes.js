import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import AuthStack from "./navigation/AuthStack";
import MainStack from "./navigation/MainStack";
import SplashScreen from "./navigation/SplashScreen";
import Onboarding from "../auth/Onboarding";

import { useAuth } from "../store/useAuth";

const Stack = createNativeStackNavigator();

export default function Routes() {
  const { token, user, isRestored } = useAuth();

  // Still restoring storage
  if (!isRestored) {
    return <SplashScreen />;
  }

  // Not logged in
  if (!token) {
    return <AuthStack />;
  }

  // Logged in but not onboarded
  if (user && user.onboardingCompleted !== true) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen
          name="Onboarding"
          component={Onboarding}
          options={{ gestureEnabled: false }}
        />
      </Stack.Navigator>
    );
  }

  // Logged in + onboarded
  return <MainStack />;
}
