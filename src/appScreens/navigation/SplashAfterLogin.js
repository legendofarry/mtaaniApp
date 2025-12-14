import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated } from "react-native";
import LottieView from "lottie-react-native";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../../store/useAuth";

export default function SplashAfterLogin() {
  const navigation = useNavigation();
  const clearPostAuthSplash = useAuth((state) => state.clearPostAuthSplash);

  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fade, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    const timer = setTimeout(() => {
      clearPostAuthSplash(); // ⭐ IMPORTANT
      navigation.reset({
        index: 0,
        routes: [{ name: "Tabs" }],
      });
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: fade }]}>
      <LottieView
        source={require("../../assets/splash/logo.json")}
        autoPlay
        loop={false}
        style={{ width: 200, height: 200 }}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
});
