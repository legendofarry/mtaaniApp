import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import BottomTabs from "./BottomTabs";
import SplashAfterLogin from "./SplashAfterLogin";
import { useAuth } from "../../store/useAuth";

import EditProfileWizard from "../../profile/EditProfileWizard";
import EditEmail from "../../profile/EditEmail";
import MyMeters from "../../profile/MyMeters";
import LinkMeter from "../../profile/LinkMeter";
import MeterDetails from "../../profile/MeterDetails";

const Stack = createNativeStackNavigator();

export default function MainStack() {
  const shouldShowSplash = useAuth((state) => state.shouldShowPostAuthSplash);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* Post-auth splash */}
      <Stack.Screen name="SplashAfterLogin" component={SplashAfterLogin} />

      {/* Profile flows */}
      <Stack.Screen name="EditProfileWizard" component={EditProfileWizard} />
      <Stack.Screen name="EditEmail" component={EditEmail} />
      <Stack.Screen name="MyMeters" component={MyMeters} />
      <Stack.Screen name="LinkMeter" component={LinkMeter} />
      <Stack.Screen name="MeterDetails" component={MeterDetails} />

      {/* Main tabs (navigator MUST be inside Screen) */}
      <Stack.Screen name="Tabs" component={BottomTabs} />
    </Stack.Navigator>
  );
}
