// src/common/Text.js
import React from "react";
import { Text as RNText, StyleSheet } from "react-native";
import { useTheme } from "./ThemeProvider";

/**
 * Custom Text component that automatically applies Montserrat font
 *
 * Usage Examples:
 *   <Text>Regular text</Text>
 *   <Text variant="h1">Main Heading</Text>
 *   <Text variant="h2">Section Title</Text>
 *   <Text variant="h3">Subsection</Text>
 *   <Text variant="body">Paragraph text</Text>
 *   <Text variant="caption">Small text</Text>
 *   <Text weight="bold">Bold text</Text>
 *   <Text weight="semibold">Semi-bold text</Text>
 *   <Text weight="medium">Medium weight</Text>
 *   <Text style={{ color: 'red' }}>Custom styled</Text>
 */
export const Text = ({
  children,
  variant = "body",
  weight = null,
  style,
  ...props
}) => {
  const { theme } = useTheme();

  // Get base typography style from theme
  const baseStyle = theme.typography[variant] || theme.typography.body;

  // Override font family based on weight if provided
  let fontFamily = baseStyle.fontFamily;
  if (weight) {
    switch (weight) {
      case "regular":
      case "400":
        fontFamily = "Montserrat_400Regular";
        break;
      case "medium":
      case "500":
        fontFamily = "Montserrat_500Medium";
        break;
      case "semibold":
      case "600":
        fontFamily = "Montserrat_600SemiBold";
        break;
      case "bold":
      case "700":
        fontFamily = "Montserrat_700Bold";
        break;
      default:
        fontFamily = baseStyle.fontFamily;
    }
  }

  return (
    <RNText
      style={[
        {
          fontSize: baseStyle.fontSize,
          fontFamily: fontFamily,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </RNText>
  );
};

export default Text;
