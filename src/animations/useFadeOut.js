import { Animated } from "react-native";
import { useRef } from "react";

export function useFadeOut(duration = 400) {
  const opacity = useRef(new Animated.Value(1)).current;

  const fadeOut = () => {
    return new Promise((resolve) => {
      Animated.timing(opacity, {
        toValue: 0,
        duration,
        useNativeDriver: true,
      }).start(() => resolve());
    });
  };

  return { opacity, fadeOut };
}
