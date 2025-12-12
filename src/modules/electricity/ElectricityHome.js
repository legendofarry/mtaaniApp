import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "../../common/ThemeProvider";

export default function ElectricityHome() {
  const { theme } = useTheme();

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Text style={{ color: theme.colors.textPrimary }}>
        Electricity System
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
