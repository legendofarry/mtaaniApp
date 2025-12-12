// /src/common/SVGWaveBackground.js
import React, { useRef, useEffect } from "react";
import { Animated, Easing, View, StyleSheet } from "react-native";
import Svg, { Path } from "react-native-svg";
import { useTheme } from "./ThemeProvider";

export default function SVGWaveBackground({ small = false }) {
  const { theme } = useTheme();

  const waveAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(waveAnim, {
        toValue: 1,
        duration: 6000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const translateX = waveAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["-25%", "25%"],
  });

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.waveContainer,
          {
            transform: [{ translateX }],
            opacity: 0.18,
          },
        ]}
      >
        <Svg height={small ? 80 : 120} width="200%">
          <Path
            d="M0 40 Q 50 0 100 40 T 200 40 T 300 40 T 400 40"
            fill="none"
            stroke={theme.colors.secondary}
            strokeWidth={small ? 14 : 22}
            strokeLinecap="round"
          />
        </Svg>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
  },
  waveContainer: {
    position: "absolute",
    bottom: -20,
    width: "200%",
  },
});
