// src\appScreens\Routes.js
import React, { useEffect, useState } from "react";
import AuthStack from "./navigation/AuthStack";
import MainStack from "./navigation/MainStack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import SplashScreen from "./navigation/SplashScreen";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Onboarding from "../auth/Onboarding";
import { API_URL, headers } from "../services/api";

const Stack = createNativeStackNavigator();

export default function Routes() {
  const [loading, setLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [userId, setUserId] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    checkAuthAndOnboarding();
  }, []);

  const checkAuthAndOnboarding = async () => {
    try {
      const storedToken = await AsyncStorage.getItem("token");
      const storedUser = await AsyncStorage.getItem("user");

      if (!storedToken) {
        // Not logged in
        setLoggedIn(false);
        setLoading(false);
        return;
      }

      // User is logged in
      setLoggedIn(true);
      setToken(storedToken);

      // Parse user data
      let user = null;
      try {
        user = storedUser ? JSON.parse(storedUser) : null;
      } catch (e) {
        console.log("Error parsing user:", e);
      }

      // Check if we need to fetch fresh user data from backend
      if (!user || !user.id) {
        console.log("No user data in storage, fetching from backend...");
        const freshUser = await fetchUserFromBackend(storedToken);
        if (freshUser) {
          user = freshUser;
          await AsyncStorage.setItem("user", JSON.stringify(freshUser));
        }
      }

      // Check onboarding status
      if (user) {
        setUserId(user.id);
        const onboarded = user.onboardingCompleted === true;

        if (!onboarded) {
          console.log("⚠️ User needs onboarding");
          setNeedsOnboarding(true);
        } else {
          console.log("✅ User onboarding complete");
          setNeedsOnboarding(false);
        }
      }

      setLoading(false);
    } catch (err) {
      console.error("Auth check error:", err);
      setLoggedIn(false);
      setLoading(false);
    }
  };

  const fetchUserFromBackend = async (authToken) => {
    try {
      const res = await fetch(`${API_URL}/users/me`, {
        method: "GET",
        headers: headers(authToken),
      });

      if (res.ok) {
        const data = await res.json();
        return data.user || data;
      }
      return null;
    } catch (err) {
      console.error("Error fetching user:", err);
      return null;
    }
  };

  if (loading) {
    return <SplashScreen />;
  }

  // Not logged in → show auth screens
  if (!loggedIn) {
    return <AuthStack />;
  }

  // Logged in but needs onboarding → force onboarding
  if (needsOnboarding) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen
          name="Onboarding"
          component={Onboarding}
          initialParams={{ userId, token }}
          options={{ gestureEnabled: false }} // Prevent back swipe
        />
      </Stack.Navigator>
    );
  }

  // Fully authenticated and onboarded → show main app
  return <MainStack />;
}
