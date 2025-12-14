import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated, Text } from "react-native";
import LottieView from "lottie-react-native";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../../store/useAuth";

export default function LogoutSplash() {
  const fade = useRef(new Animated.Value(0)).current;
  const navigation = useNavigation();
  const { logoutAndReset } = useAuth();

  useEffect(() => {
    // fade in
    Animated.timing(fade, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    // logout process
    const timer = setTimeout(async () => {
      await logoutAndReset();
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={{ opacity: fade }}>
        <LottieView
          source={require("../../assets/splash/logo.json")}
          autoPlay
          loop={false}
          style={{ width: 200, height: 200 }}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: "600",
    color: "#0B68FF",
  },
});
