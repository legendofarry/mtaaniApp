import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import HomeScreen from "../../modules/home/HomeScreen";
import WaterHome from "../../modules/water/WaterHome";
import ElectricityHome from "../../modules/electricity/ElectricityHome";
import Profile from "../../profile/Profile";

const Tab = createBottomTabNavigator();

export default function BottomTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Water" component={WaterHome} />
      <Tab.Screen name="Electricity" component={ElectricityHome} />
      <Tab.Screen name="Profile" component={Profile} />
    </Tab.Navigator>
  );
}
