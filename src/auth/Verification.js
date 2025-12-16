// src/auth/Verification.js
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  Platform,
} from "react-native";
import { useTheme } from "../common/ThemeProvider";
import AnimatedBackground from "../common/AnimatedBackground";
import { Button } from "../common/Button";
import { Ionicons } from "@expo/vector-icons";
import * as LocalAuth from "expo-local-authentication";
import { API_URL, headers } from "../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Verification({ route, navigation }) {
  const { email, userId, fullName } = route.params || {};
  const { theme } = useTheme();

  const [loading, setLoading] = useState(false);
  const [bioSupported, setBioSupported] = useState(false);
  const [bioChecked, setBioChecked] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const pollerRef = useRef(null);

  // Check biometric support on mount
  useEffect(() => {
    checkBiometricSupport();
    startVerificationPolling();

    return () => {
      if (pollerRef.current) clearInterval(pollerRef.current);
    };
  }, []);

  const checkBiometricSupport = async () => {
    try {
      const compatible = await LocalAuth.hasHardwareAsync();
      const enrolled = await LocalAuth.isEnrolledAsync();

      if (compatible && enrolled) {
        setBioSupported(true);
        // Auto-trigger biometrics
        setTimeout(() => {
          handleBiometricAuth();
        }, 500);
      } else {
        // No biometrics, go straight to magic link
        setBioChecked(true);
        handleMagicLink();
      }
    } catch (error) {
      console.log("Biometric check error:", error);
      setBioChecked(true);
      handleMagicLink();
    }
  };

  const handleBiometricAuth = async () => {
    try {
      const result = await LocalAuth.authenticateAsync({
        promptMessage: "Verify it's you",
        fallbackLabel: "Use email verification",
        disableDeviceFallback: false,
      });

      if (result.success) {
        // Biometric success - save to backend and proceed
        await saveBiometricPreference(true);
        await loginUser();
      } else {
        // Biometric failed or cancelled - offer magic link
        setBioChecked(true);
        Alert.alert(
          "Verification Required",
          "Biometric authentication was cancelled. We'll send you an email verification link instead.",
          [
            {
              text: "Send Email Link",
              onPress: () => handleMagicLink(),
            },
            {
              text: "Try Again",
              onPress: () => handleBiometricAuth(),
            },
          ]
        );
      }
    } catch (error) {
      console.log("Biometric auth error:", error);
      setBioChecked(true);
      handleMagicLink();
    }
  };

  const saveBiometricPreference = async (enabled) => {
    try {
      await fetch(`${API_URL}/auth/save-passkey`, {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({
          userId,
          passkeyEnabled: enabled,
        }),
      });
    } catch (error) {
      console.log("Save biometric preference error:", error);
    }
  };

  const loginUser = async () => {
    try {
      setLoading(true);

      // Call backend to sync and get JWT
      const res = await fetch(`${API_URL}/auth/sync-firebase-user`, {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({
          firebaseUid: userId, // Using userId as temporary identifier
          email: email,
          fullName: fullName,
          signupMethod: "email",
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // Save token
        await AsyncStorage.setItem("token", data.accessToken);
        await AsyncStorage.setItem("user", JSON.stringify(data.user));

        // Navigate to onboarding
        navigation.replace("Onboarding", {
          userId: data.userId,
          token: data.accessToken,
        });
      } else {
        throw new Error(data.message || "Login failed");
      }
    } catch (error) {
      console.log("Login error:", error);
      Alert.alert(
        "Error",
        "Failed to complete verification. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleMagicLink = async () => {
    try {
      setLoading(true);

      const res = await fetch(`${API_URL}/auth/send-magic-link`, {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setMagicLinkSent(true);

        // In dev mode, show the magic link
        if (__DEV__ && data.magicLink) {
          Alert.alert(
            "Dev Mode - Magic Link",
            `Link: ${data.magicLink}\n\nToken: ${data.token}`,
            [
              { text: "OK" },
              {
                text: "Skip & Login",
                onPress: () => loginUser(),
              },
            ]
          );
        } else {
          Alert.alert(
            "Email Sent! 📧",
            `We've sent a verification link to ${email}. Please check your inbox.`,
            [{ text: "OK" }]
          );
        }
      } else {
        throw new Error(data.message || "Failed to send email");
      }
    } catch (error) {
      console.log("Magic link error:", error);
      Alert.alert(
        "Email Error",
        "We couldn't send the verification email. You can skip verification for now and verify later.",
        [
          {
            text: "Skip Verification",
            onPress: () => handleSkipVerification(),
          },
          {
            text: "Try Again",
            onPress: () => handleMagicLink(),
          },
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  /* ================= ENTER APP ================= */
  const enterApp = async (verified) => {
    const user = {
      id: userId,
      email,
      fullName,
      verified,
    };

    await AsyncStorage.setItem("user", JSON.stringify(user));

    navigation.reset({
      index: 0,
      routes: [{ name: "MainStack" }],
    });
  };

  /* ================= SKIP ================= */
  const handleSkipVerification = () => {
    Alert.alert("Skip Verification?", "You can verify later from settings.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Continue",
        onPress: () => enterApp(false),
      },
    ]);
  };

  /* ================= POLL VERIFICATION ================= */
  const startVerificationPolling = () => {
    pollerRef.current = setInterval(async () => {
      try {
        const res = await fetch(`${API_URL}/auth/check-verification`, {
          method: "POST",
          headers: headers(),
          body: JSON.stringify({ email }),
        });

        const data = await res.json();

        if (res.ok && data.verified) {
          clearInterval(pollerRef.current);

          await AsyncStorage.setItem("user", JSON.stringify(data.user));

          navigation.reset({
            index: 0,
            routes: [{ name: "MainStack" }],
          });
        }
      } catch (e) {
        // silent
      }
    }, 3000);
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <AnimatedBackground small />

      <View style={[styles.panel, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.iconContainer}>
          <Ionicons
            name="shield-checkmark"
            size={64}
            color={theme.colors.primary}
          />
        </View>

        <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
          Verify Your Account
        </Text>

        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          {!bioChecked && bioSupported
            ? "Please verify using your device biometrics"
            : magicLinkSent
            ? `Check your email at ${email}`
            : "We'll send a verification link to your email"}
        </Text>

        {loading && (
          <ActivityIndicator
            size="large"
            color={theme.colors.primary}
            style={{ marginVertical: 20 }}
          />
        )}

        {/* Show options after initial check */}
        {bioChecked && !loading && (
          <View style={styles.optionsContainer}>
            {bioSupported && (
              <Button
                title="Try Biometrics Again"
                variant="primary"
                onPress={handleBiometricAuth}
                style={{ marginBottom: 12 }}
              />
            )}

            {!magicLinkSent && (
              <Button
                title="Send Email Verification"
                variant="secondary"
                onPress={handleMagicLink}
                style={{ marginBottom: 12 }}
              />
            )}

            {magicLinkSent && (
              <Button
                title="Resend Email"
                variant="secondary"
                onPress={handleMagicLink}
                style={{ marginBottom: 12 }}
              />
            )}

            <TouchableOpacity
              onPress={handleSkipVerification}
              style={styles.skipButton}
            >
              <Text style={{ color: theme.colors.textSecondary, fontSize: 14 }}>
                Skip verification for now
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.infoBox}>
          <Ionicons
            name="information-circle-outline"
            size={20}
            color={theme.colors.primary}
          />
          <Text
            style={[styles.infoText, { color: theme.colors.textSecondary }]}
          >
            Verification helps keep your account secure
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    marginTop: "20%",
    marginHorizontal: 20,
    padding: 24,
    borderRadius: 18,
  },

  iconContainer: {
    alignSelf: "center",
    marginBottom: 16,
  },

  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
  },

  subtitle: {
    fontSize: 14,
    marginBottom: 24,
    textAlign: "center",
    lineHeight: 20,
  },

  optionsContainer: {
    marginTop: 20,
  },

  skipButton: {
    marginTop: 12,
    padding: 12,
    alignItems: "center",
  },

  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F8FF",
    padding: 12,
    borderRadius: 8,
    marginTop: 24,
    gap: 8,
  },

  infoText: {
    flex: 1,
    fontSize: 12,
  },
});
