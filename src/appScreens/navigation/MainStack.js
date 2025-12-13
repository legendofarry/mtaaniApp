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
      initialRouteName="SplashAfterLogin"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="SplashAfterLogin" component={SplashAfterLogin} />
      <Stack.Screen name="Tabs" component={BottomTabs} />
      <Stack.Screen name="LogoutSplash" component={LogoutSplash} />
      <Stack.Screen name="AuthStack" component={AuthStack} />
    </Stack.Navigator>
  );
}
