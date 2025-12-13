import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import BottomTabs from "./BottomTabs";
import SplashAfterLogin from "./SplashAfterLogin";
import { useAuth } from "../../store/useAuth";

const Stack = createNativeStackNavigator();

export default function MainStack() {
  const shouldShowSplash = useAuth((state) => state.shouldShowPostAuthSplash);

  return (
    <Stack.Navigator
      initialRouteName={shouldShowSplash ? "SplashAfterLogin" : "Tabs"}
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="SplashAfterLogin" component={SplashAfterLogin} />
      <Stack.Screen name="Tabs" component={BottomTabs} />
    </Stack.Navigator>
  );
}
