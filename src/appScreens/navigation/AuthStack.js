// src/appScreens/navigation/AuthStack.js

import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import Login from "../../auth/Login";
import Register from "../../auth/Register";
import Onboarding from "../../auth/Onboarding";
import EnablePasskey from "../../auth/EnablePassKey";

const Stack = createNativeStackNavigator();

/**
 * AUTH STACK
 * ------------------------------------------------------
 * Handles:
 * - Login
 * - Registration
 * - Onboarding (extra user info)
 * - Optional biometric passkey enable
 *
 * Final destination after auth flow → MainStack
 */
export default function AuthStack() {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Register" component={Register} />
      <Stack.Screen name="Onboarding" component={Onboarding} />
      <Stack.Screen name="EnablePasskey" component={EnablePasskey} />
    </Stack.Navigator>
  );
}
