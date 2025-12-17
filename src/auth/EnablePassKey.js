// src/auth/EnablePasskey.js

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";

import * as LocalAuthentication from "expo-local-authentication";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Crypto from "expo-crypto";

import { API_URL, headers } from "../services/api";
import { saveBiometricCredentials } from "../utils/biometricStorage";

const EnablePasskey = ({ navigation }) => {
  const [loading, setLoading] = useState(false);

  /* ======================================================
     ENABLE PASSKEY
  ====================================================== */
  const handleEnablePasskey = async () => {
    try {
      setLoading(true);

      // 1️⃣ Check biometric capability
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (!hasHardware || !isEnrolled) {
        Alert.alert(
          "Biometrics unavailable",
          "Your device does not support biometric authentication."
        );
        return;
      }

      // 2️⃣ Authenticate user biometrically
      const authResult = await LocalAuthentication.authenticateAsync({
        promptMessage: "Confirm to enable passkey",
        cancelLabel: "Cancel",
      });

      if (!authResult.success) return;

      // 3️⃣ Load session
      const token = await AsyncStorage.getItem("token");
      const storedUser = await AsyncStorage.getItem("user");

      if (!token || !storedUser) {
        throw new Error("Session expired. Please log in again.");
      }

      const user = JSON.parse(storedUser);

      // 4️⃣ Generate secure random passkey
      const passkeyRaw = Crypto.randomUUID();

      // 5️⃣ Save passkey locally (device-bound)
      await saveBiometricCredentials({
        email: user.email,
        passkeyRaw,
      });

      // 6️⃣ Send passkey to backend (JWT identifies user)
      const res = await fetch(`${API_URL}/auth/enable-passkey`, {
        method: "POST",
        headers: headers(token),
        body: JSON.stringify({ passkeyRaw }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to enable passkey");
      }

      // 7️⃣ Update local user cache from backend truth
      const updatedUser = {
        ...user,
        biometrics: {
          enabled: true,
          createdAt: data.user?.biometrics?.createdAt,
        },
      };

      await AsyncStorage.setItem("user", JSON.stringify(updatedUser));

      // 8️⃣ Success → Home
      Alert.alert("Success", "Passkey enabled successfully");
      navigation.reset({
        index: 0,
        routes: [{ name: "Home" }],
      });
    } catch (err) {
      Alert.alert("Error", err.message);
    } finally {
      setLoading(false);
    }
  };

  /* ======================================================
     SKIP
  ====================================================== */
  const handleSkip = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: "Home" }],
    });
  };

  /* ======================================================
     UI
  ====================================================== */
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Secure Your Account</Text>

      <Text style={styles.subtitle}>
        Enable passkey (biometrics) for faster and safer login on this device.
      </Text>

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={handleEnablePasskey}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.primaryText}>Enable Passkey</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
        <Text style={styles.skipText}>Skip for now</Text>
      </TouchableOpacity>
    </View>
  );
};

export default EnablePasskey;

/* ======================================================
   STYLES
====================================================== */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    textAlign: "center",
    color: "#555",
    marginBottom: 32,
  },
  primaryButton: {
    backgroundColor: "#111",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  primaryText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  skipButton: {
    marginTop: 16,
    alignItems: "center",
  },
  skipText: {
    color: "#0066cc",
    fontWeight: "500",
  },
});
