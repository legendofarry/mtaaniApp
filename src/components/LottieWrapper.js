// /src/components/LottieWrapper.js
import React from "react";
import { Platform, View, StyleSheet } from "react-native";
import LottieView from "lottie-react-native";

// Web fallback
let DotLottieReact = null;
if (Platform.OS === "web") {
  try {
    DotLottieReact = require("@lottiefiles/dotlottie-react").DotLottieReact;
  } catch (e) {
    console.warn("dotlottie-react not installed");
  }
}

export default function LottieWrapper({
  source,
  autoPlay = true,
  loop = true,
  style,
}) {
  if (Platform.OS === "web") {
    // Web player
    return (
      <View style={[styles.webContainer, style]}>
        {DotLottieReact ? (
          <DotLottieReact
            src={
              typeof source === "string"
                ? source
                : source?.uri
                ? source.uri
                : null
            }
            autoplay={autoPlay}
            loop={loop}
            style={{ width: "100%", height: "100%" }}
          />
        ) : (
          <Text>Missing web Lottie package</Text>
        )}
      </View>
    );
  }

  // Native iOS / Android (LottieView)
  return (
    <LottieView
      source={typeof source === "string" ? { uri: source } : source}
      autoPlay={autoPlay}
      loop={loop}
      style={style}
    />
  );
}

const styles = StyleSheet.create({
  webContainer: {
    width: "100%",
    height: "100%",
    overflow: "hidden",
  },
});
