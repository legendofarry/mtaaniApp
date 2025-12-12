// /src/common/AnimatedBackground.js
import React, { useEffect, useRef, useState } from "react";
import { View, StyleSheet, Animated, Platform } from "react-native";
import Lottie from "lottie-react";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "./ThemeProvider";
import SVGWaveBackground from "./SVGWaveBackground";

export default function AnimatedBackground({ style, small = false }) {
  const { theme } = useTheme();
  const [hasLottie, setHasLottie] = useState(true);

  // Pulse animation for electricity icon
  const pulse = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const pulseInterpolate = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.9, 1.15],
  });

  // Try loading Lottie assets
  let waveAnim = null;
  let shapesAnim = null;
  try {
    waveAnim = require("../../assets/animations/waves.json");
    shapesAnim = require("../../assets/animations/ghost.json");
  } catch (e) {
    setTimeout(() => setHasLottie(false), 100);
  }

  return (
    <View style={[StyleSheet.absoluteFill, style]}>
      {hasLottie ? (
        <>
          {/* Water wave */}
          <View style={[StyleSheet.absoluteFill, { opacity: 0.3 }]}>
            <Lottie
              source={waveAnim}
              autoPlay
              loop
              style={{ width: "100%", height: "100%" }}
              resizemode="cover"
            />
          </View>

          {/* Soft floating shapes */}
          <View style={[StyleSheet.absoluteFill, { opacity: 0.14 }]}>
            <Lottie
              source={shapesAnim}
              autoPlay
              loop
              style={{ width: "100%", height: "100%" }}
            />
          </View>
        </>
      ) : (
        <SVGWaveBackground small={small} />
      )}

      {/* Pulsing electricity icon */}
      <Animated.View
        style={[
          styles.pulseWrap,
          {
            transform: [{ scale: pulseInterpolate }],
            backgroundColor: theme.colors.accentElectric + "22",
            borderColor: theme.colors.accentElectric + "44",
            width: small ? 60 : 100,
            height: small ? 60 : 100,
            borderRadius: small ? 30 : 50,
            top: small ? 20 : 40,
            right: small ? 20 : 30,
          },
        ]}
      >
        <Ionicons
          name="flash"
          size={small ? 28 : 38}
          color={theme.colors.accentElectric}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  pulseWrap: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },
});
