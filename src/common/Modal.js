// /src/common/Modal.js

import React from "react";
import { Modal as RNModal, View, StyleSheet } from "react-native";
import { useTheme } from "./ThemeProvider";

export const Modal = ({ visible, children }) => {
  const { theme } = useTheme();

  return (
    <RNModal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={[styles.content, { backgroundColor: theme.colors.card }]}>
          {children}
        </View>
      </View>
    </RNModal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  content: {
    width: "85%",
    padding: 20,
    borderRadius: 16,
  },
});
