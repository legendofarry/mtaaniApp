// src/auth/Register.js
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Alert,
} from "react-native";
import { useTheme } from "../common/ThemeProvider";
import AnimatedBackground from "../common/AnimatedBackground";
import { Button } from "../common/Button";
import { Ionicons } from "@expo/vector-icons";
import { API_URL, headers } from "../services/api";
import LottieWrapper from "../components/LottieWrapper";

const SCREEN_HEIGHT = Dimensions.get("window").height;

export default function Register({ navigation }) {
  const { theme } = useTheme();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const validateInputs = () => {
    if (!name || name.trim().length < 2) {
      setError("Name must be at least 2 characters.");
      return false;
    }
    if (!email || !email.includes("@")) {
      setError("Enter a valid email.");
      return false;
    }
    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters.");
      return false;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return false;
    }
    setError("");
    return true;
  };

  const handleRegister = async () => {
    if (!validateInputs()) return;

    setLoading(true);
    setError("");

    try {
      const payload = {
        fullName: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        location: {
          area: "pending", // Will be updated during onboarding
        },
      };

      const url = `${API_URL}/auth/register`;
      console.log("📤 Registering to:", url);
      console.log("📦 Payload:", payload);

      const res = await fetch(url, {
        method: "POST",
        headers: headers(),
        body: JSON.stringify(payload),
      });

      console.log("📊 Response status:", res.status);

      const data = await res.json();
      console.log("📥 Response:", data);

      if (res.ok && data.success) {
        // Show dev OTP in dev mode
        if (__DEV__ && data.otp) {
          Alert.alert("Dev OTP", `Your OTP is: ${data.otp}`);
        }

        // Navigate to OTP screen
        navigation.navigate("OTP", {
          email: email.trim().toLowerCase(),
          userId: data.userId,
        });
      } else {
        // Handle known errors
        if (res.status === 409) {
          setError("This email is already registered. Please sign in.");
        } else {
          setError(data.message || "Registration failed. Please try again.");
        }
      }
    } catch (err) {
      console.error("❌ Register error:", err);
      setError("Network error. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <AnimatedBackground small />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          {/* FORM PANEL */}
          <View
            style={[
              styles.panel,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
              Create Account
            </Text>

            <Text
              style={[styles.subtitle, { color: theme.colors.textSecondary }]}
            >
              Join the community services network
            </Text>

            {/* Full Name */}
            <View style={styles.inputRow}>
              <Ionicons
                name="person-outline"
                size={20}
                color={theme.colors.textSecondary}
              />
              <TextInput
                placeholder="Full Name"
                placeholderTextColor={theme.colors.textDisabled}
                style={[styles.input, { color: theme.colors.textPrimary }]}
                value={name}
                onChangeText={setName}
              />
            </View>

            {/* Email */}
            <View style={styles.inputRow}>
              <Ionicons
                name="mail-outline"
                size={20}
                color={theme.colors.textSecondary}
              />
              <TextInput
                placeholder="Email"
                placeholderTextColor={theme.colors.textDisabled}
                style={[styles.input, { color: theme.colors.textPrimary }]}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            {/* Password */}
            <View style={styles.inputRow}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color={theme.colors.textSecondary}
              />
              <TextInput
                placeholder="Password"
                placeholderTextColor={theme.colors.textDisabled}
                style={[styles.input, { color: theme.colors.textPrimary }]}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>

            {/* Confirm Password */}
            <View style={styles.inputRow}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color={theme.colors.textSecondary}
              />
              <TextInput
                placeholder="Confirm Password"
                placeholderTextColor={theme.colors.textDisabled}
                style={[styles.input, { color: theme.colors.textPrimary }]}
                secureTextEntry
                value={confirm}
                onChangeText={setConfirm}
              />
            </View>

            {/* Error */}
            {error ? (
              <Text style={[styles.error, { color: theme.colors.error }]}>
                {error}
              </Text>
            ) : (
              <Text style={[styles.error, { color: "transparent" }]}>
                placeholder
              </Text>
            )}

            <Button
              title={loading ? "Creating account..." : "Continue"}
              variant="primary"
              onPress={handleRegister}
              disabled={loading}
            />

            {/* Login Redirect */}
            <View style={styles.footerRow}>
              <Text style={{ color: theme.colors.textSecondary }}>
                Already have an account?
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                <Text style={{ color: theme.colors.warning, marginLeft: 6 }}>
                  Sign in
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 🎨 LOTTIE SECTION */}
          <View style={styles.lottieContainer}>
            <LottieWrapper
              source="https://lottie.host/5e8f68e7-5367-4bca-b0ce-3fd50a9a7838/wDZfM0DQY8.lottie"
              autoPlay
              loop
              style={styles.lottie}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    padding: 22,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    borderWidth: 1,
  },

  title: {
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 6,
  },

  subtitle: {
    fontSize: 14,
    marginBottom: 18,
  },

  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: "#fff",
    borderColor: "#E6E6E6",
    gap: 10,
  },

  input: {
    flex: 1,
    fontSize: 16,
  },

  error: {
    marginBottom: 10,
    fontSize: 13,
  },

  footerRow: {
    marginTop: 18,
    flexDirection: "row",
    justifyContent: "center",
  },

  lottieContainer: {
    width: "100%",
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    height: SCREEN_HEIGHT * 0.45,
  },

  lottie: {
    width: "100%",
    height: "100%",
  },
});
