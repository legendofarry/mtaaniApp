// /src/appScreens/navigation/SplashScreen.js
import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated, Text } from "react-native";
import LottieView from "lottie-react-native";

export default function SplashScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 900,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={{ opacity: fadeAnim }}>
        <LottieView
          source={require("../../assets/splash/logo.json")} // ⭐ your Lottie file
          autoPlay
          loop
          style={{ width: 200, height: 200 }}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
  },
  appName: {
    marginTop: 10,
    fontSize: 22,
    fontWeight: "700",
    color: "#0B68FF",
  },
});
