// /src/common/Button.js

import React from "react";
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useTheme } from "./ThemeProvider";

export const Button = ({
  title,
  onPress,
  variant = "primary",
  loading = false,
  disabled = false,
  fullWidth = false,
  style,
}) => {
  const { theme } = useTheme();

  const getBgColor = () => {
    if (disabled) return theme.colors.surfaceVariant;

    switch (variant) {
      case "primary":
        return theme.colors.primary;
      case "secondary":
        return theme.colors.secondaryContainer;
      case "outline":
      case "text":
        return "transparent";
      default:
        return theme.colors.primary;
    }
  };

  const getTextColor = () => {
    if (disabled) return theme.colors.textDisabled;

    switch (variant) {
      case "primary":
        return "#fff";
      case "secondary":
        return theme.colors.textPrimary;
      case "outline":
      case "text":
        return theme.colors.primary;
      default:
        return "#fff";
    }
  };

  const getBorder = () => {
    if (variant === "outline")
      return { borderWidth: 1, borderColor: theme.colors.primary };
    return {};
  };

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={!disabled && !loading ? onPress : null}
      style={[
        styles.button,
        {
          backgroundColor: getBgColor(),
          borderRadius: theme.radius.pill,
          paddingVertical: theme.spacing.md,
          paddingHorizontal: theme.spacing.lg,
        },
        fullWidth && { alignSelf: "stretch" },
        getBorder(),
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <Text
          style={[
            styles.text,
            {
              color: getTextColor(),
              fontSize: theme.typography.body.fontSize,
              fontWeight: "600",
            },
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    textAlign: "center",
  },
});
