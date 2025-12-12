// /src/common/Icons.js

import React from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "./ThemeProvider";

export const Icon = ({ name, size = "md", color = null, style }) => {
  const { theme } = useTheme();

  // Size mapping from theme
  const sizeMap = {
    sm: theme.iconSizes.sm,
    md: theme.iconSizes.md,
    lg: theme.iconSizes.lg,
    xl: theme.iconSizes.xl,
  };

  const resolvedSize =
    typeof size === "number" ? size : sizeMap[size] || sizeMap.md;

  const resolvedColor = color || theme.colors.text;

  return (
    <MaterialCommunityIcons
      name={name}
      size={resolvedSize}
      color={resolvedColor}
      style={style}
    />
  );
};
