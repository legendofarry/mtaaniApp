// /src/auth/Login.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Modal,
  Pressable,
  ScrollView,
  ActivityIndicator,
} from "react-native";

import { Button } from "../common/Button";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../common/ThemeProvider";
import * as LocalAuth from "expo-local-authentication";
import AsyncStorage from "@react-native-async-storage/async-storage";

// API
import { API_URL, headers } from "../services/api";

export default function Login({ navigation }) {
  const { theme } = useTheme();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const [loading, setLoading] = useState(false);

  // Biometrics
  const [bioSupported, setBioSupported] = useState(false);
  const [showBioModal, setShowBioModal] = useState(false);

  useEffect(() => {
    (async () => {
      const supported = await LocalAuth.hasHardwareAsync();
      const enrolled = await LocalAuth.isEnrolledAsync();
      setBioSupported(supported && enrolled);
    })();
  }, []);

  // ------------------------------
  //   REAL LOGIN → BACKEND
  // ------------------------------
  const handleLogin = async () => {
    setError("");
    if (!email.includes("@")) return setError("Enter a valid email.");
    if (password.length < 6)
      return setError("Password must be at least 6 characters.");

    try {
      setLoading(true);

      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        return setError(data.message || "Login failed");
      }

      // Save token + small user info
      await AsyncStorage.setItem("token", data.accessToken);
      await AsyncStorage.setItem("user", JSON.stringify(data.user));

      console.log("LOGIN SUCCESS:", data);

      // Navigate to Home/Main
      navigation.replace("SplashAfterLogin"); // <-- Make sure Tabs exists
    } catch (err) {
      console.log("LOGIN ERROR:", err);
      setError("Network error. Check connection.");
      setLoading(false);
    }
  };

  // ------------------------------
  //   SOCIAL PLACEHOLDERS
  // ------------------------------
  const handleGoogleLogin = () => {
    console.log("Google login");
    // Will connect to backend later
  };

  const handleFacebookLogin = () => {
    console.log("Facebook login");
    // Will connect to backend later
  };

  // ------------------------------
  //    BIOMETRICS
  // ------------------------------
  const attemptBiometricLogin = async () => {
    try {
      const result = await LocalAuth.authenticateAsync({
        promptMessage: "Login with biometrics",
        fallbackLabel: "Use password",
      });

      if (result.success) {
        setShowBioModal(false);
        console.log("Biometric auth success!");

        // OPTIONAL: auto-login if user previously saved credentials
        navigation.replace("MainTabs");
      }
    } catch (e) {
      console.log("Biometric Error:", e);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <View
            style={[styles.panel, { backgroundColor: theme.colors.surface }]}
          >
            <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
              Welcome Back
            </Text>

            {/* EMAIL */}
            <View style={styles.inputRow}>
              <Ionicons name="mail-outline" size={20} color="#7A8BA0" />
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#8B94A4"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            {/* PASSWORD */}
            <View style={styles.inputRow}>
              <Ionicons name="lock-closed-outline" size={20} color="#7A8BA0" />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#8B94A4"
                value={password}
                secureTextEntry
                onChangeText={setPassword}
              />
            </View>

            {/* ERROR */}
            {error ? (
              <Text style={[styles.error, { color: theme.colors.error }]}>
                {error}
              </Text>
            ) : null}

            {/* Forgot Password */}
            <TouchableOpacity
              style={{ alignSelf: "flex-end", marginBottom: 10 }}
              onPress={() => navigation.navigate("ForgotPassword")}
            >
              <Text style={{ color: theme.colors.warning }}>
                Forgot password?
              </Text>
            </TouchableOpacity>

            {/* LOGIN BUTTON */}
            <Button
              title={loading ? "Logging in..." : "Login"}
              variant="primary"
              onPress={handleLogin}
              disabled={loading}
            />

            {loading && (
              <ActivityIndicator
                size="small"
                color={theme.colors.primary}
                style={{ marginTop: 10 }}
              />
            )}

            {/* DIVIDER */}
            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or continue with</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* GOOGLE */}
            <TouchableOpacity
              style={styles.googleBtn}
              onPress={handleGoogleLogin}
            >
              <Ionicons name="logo-google" size={20} color="#DB4437" />
              <Text style={styles.socialText}>Continue with Google</Text>
            </TouchableOpacity>

            {/* FACEBOOK */}
            <TouchableOpacity
              style={styles.facebookBtn}
              onPress={handleFacebookLogin}
            >
              <Ionicons name="logo-facebook" size={20} color="#0B68FF" />
              <Text style={styles.socialText}>Continue with Facebook</Text>
            </TouchableOpacity>

            {/* BIOMETRICS */}
            <View style={{ marginTop: 15, alignItems: "center" }}>
              <TouchableOpacity
                disabled={!bioSupported}
                onPress={() => setShowBioModal(true)}
                style={{ opacity: bioSupported ? 1 : 0.35 }}
              >
                <Ionicons
                  name="finger-print-outline"
                  size={36}
                  color={theme.colors.primary}
                />
              </TouchableOpacity>
              <Text style={{ color: "#7A8BA0", marginTop: 4, fontSize: 13 }}>
                {bioSupported
                  ? "Use biometrics"
                  : "Biometrics unavailable on Web"}
              </Text>
            </View>

            {/* FOOTER */}
            <View style={styles.footer}>
              <Pressable onPress={() => navigation.navigate("Register")}>
                <Text style={{ color: theme.colors.warning, fontSize: 14 }}>
                  Create Account
                </Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* BIOMETRIC MODAL */}
      <Modal visible={showBioModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View class={styles.modalBox}>
            <Ionicons
              name="finger-print"
              size={90}
              color={theme.colors.primary}
              style={{ marginBottom: 10 }}
            />

            <Text style={styles.modalTitle}>Biometric Login</Text>
            <Text style={styles.modalText}>
              Authenticate using your fingerprint or Face ID.
            </Text>

            <Button title="Authenticate" onPress={attemptBiometricLogin} />

            <TouchableOpacity onPress={() => setShowBioModal(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    paddingVertical: 40,
  },

  panel: {
    marginHorizontal: 20,
    padding: 22,
    paddingTop: 40,
    borderRadius: 26,
  },

  title: { fontSize: 26, fontWeight: "700", marginBottom: 20 },

  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },

  input: { flex: 1, fontSize: 15 },

  error: { fontSize: 13, marginBottom: 10 },

  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
  },

  dividerLine: { flex: 1, height: 1, backgroundColor: "#E5E7EB" },

  dividerText: {
    marginHorizontal: 16,
    color: "#8B94A4",
    fontSize: 14,
    fontWeight: "500",
  },

  googleBtn: {
    marginTop: 18,
    flexDirection: "row",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5EAF0",
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },

  facebookBtn: {
    marginTop: 12,
    flexDirection: "row",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5EAF0",
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },

  socialText: { fontSize: 15, fontWeight: "600", color: "#444" },

  footer: { marginTop: 20, alignItems: "center" },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalBox: {
    width: "80%",
    backgroundColor: "#FFF",
    padding: 24,
    borderRadius: 18,
    alignItems: "center",
  },

  modalTitle: { fontSize: 20, fontWeight: "700", marginBottom: 8 },

  modalText: {
    textAlign: "center",
    fontSize: 14,
    color: "#777",
    marginBottom: 20,
  },

  modalCancel: {
    marginTop: 14,
    color: "#FF3B30",
    fontSize: 14,
    fontWeight: "600",
  },
});
