// src\appScreens\navigation\MainStack.js
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import BottomTabs from "./BottomTabs";
import AuthStack from "./AuthStack";
import SplashAfterLogin from "./SplashAfterLogin";
import LogoutSplash from "./LogoutSplash";

const Stack = createNativeStackNavigator();

export default function MainStack() {
  return (
    <Stack.Navigator
      screenOptions={({ route }) => {
        const transition = route.params?.transition;

        return {
          headerShown: false,
          animation: transition === "fade" ? "fade" : "slide_from_right",
        };
      }}
    >
      <Stack.Screen
        name="SplashAfterLogin"
        component={SplashAfterLogin}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="LogoutSplash"
        component={LogoutSplash}
        options={{ headerShown: false }}
      />

      <Stack.Screen name="Tabs" component={BottomTabs} />

      <Stack.Screen
        name="AuthStack"
        component={AuthStack}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
