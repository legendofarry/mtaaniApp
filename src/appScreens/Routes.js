// src\appScreens\Routes.js
import React, { useEffect, useState } from "react";
import AuthStack from "./navigation/AuthStack";
import MainStack from "./navigation/MainStack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import SplashScreen from "./navigation/SplashScreen";

export default function Routes() {
  const [loading, setLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        setLoggedIn(!!token);
      } catch (err) {
        setLoggedIn(false);
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  if (loading) {
    return <SplashScreen />;
  }

  return loggedIn ? <MainStack /> : <AuthStack />;
}
