// src/appScreens/navigation/AuthStack.js
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Login from "../../auth/Login";
import Register from "../../auth/Register";
import Verification from "../../auth/Verification"; // ⭐ NEW
import ForgotPassword from "../../auth/ForgotPassword";
import Onboarding from "../../auth/Onboarding";

const Stack = createNativeStackNavigator();

export default function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Register" component={Register} />
      <Stack.Screen name="Verification" component={Verification} />
      {/* ⭐ REPLACED OTP */}
      <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
      <Stack.Screen name="Onboarding" component={Onboarding} />
    </Stack.Navigator>
  );
}
