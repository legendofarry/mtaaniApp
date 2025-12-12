// src\appScreens\navigation\AuthStack.js
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Login from "../../auth/Login";
import OTP from "../../auth/OTP";
import Register from "../../auth/Register";
import ForgotPassword from "../../auth/ForgotPassword";
import Onboarding from "../../auth/Onboarding"; // ⭐ ADD THIS LINE

const Stack = createNativeStackNavigator();

export default function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="OTP" component={OTP} />
      <Stack.Screen name="Onboarding" component={Onboarding} />
      {/* ⭐ ADD THIS SCREEN BELOW OTP */}
      <Stack.Screen name="Register" component={Register} />
      <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
    </Stack.Navigator>
  );
}
