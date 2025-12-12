// /src/auth/ForgotPassword.js
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useTheme } from "../common/ThemeProvider";
import AnimatedBackground from "../common/AnimatedBackground";
import { Button } from "../common/Button";
import { Ionicons } from "@expo/vector-icons";
import { API_URL, headers } from "../services/api";

export default function ForgotPassword({ navigation }) {
  const { theme } = useTheme();
  const [email, setEmail] = useState("");
  const [step, setStep] = useState("request"); // 'request' | 'verify'
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(0);
  const [newPassword, setNewPassword] = useState("");
  const [devOtp, setDevOtp] = useState(null);

  const joinOtp = () => otp.join("");

  // Request reset OTP
  const handleRequest = async () => {
    if (!email || !email.includes("@")) {
      Alert.alert("Invalid email", "Enter a valid email address.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        Alert.alert("Error", data?.message || "Failed to send reset email");
        return;
      }

      if (data?.otp && __DEV__) {
        setDevOtp(data.otp);
        Alert.alert("Dev OTP", `OTP (dev): ${data.otp}`);
      } else {
        Alert.alert("OTP Sent", `A reset code has been sent to ${email}`);
      }

      setStep("verify");
      setTimer(120);
      // start countdown client-side
      const interval = setInterval(() => {
        setTimer((t) => {
          if (t <= 1) {
            clearInterval(interval);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    } catch (err) {
      setLoading(false);
      console.log("FORGOT ERROR", err);
      Alert.alert("Network error", "Could not send reset email. Try again.");
    }
  };

  const handleVerifyAndReset = async () => {
    const code = joinOtp();
    if (code.length !== 6) {
      Alert.alert("Invalid OTP", "Enter the 6-digit code.");
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      Alert.alert("Weak password", "Password must be at least 6 characters.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/auth/reset-password`, {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({ email, otp: code, newPassword }),
      });
      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        Alert.alert("Failed", data?.message || "Could not reset password");
        return;
      }

      Alert.alert("Success", "Password reset successful. Please login.");
      navigation.navigate("Login");
    } catch (err) {
      setLoading(false);
      console.log("RESET ERROR", err);
      Alert.alert("Network error", "Could not reset password. Try again.");
    }
  };

  const handleResend = async () => {
    if (timer > 0) {
      return;
    }
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/auth/request-otp`, {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({ email, purpose: "reset" }),
      });
      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        Alert.alert("Error", data?.message || "Could not resend OTP");
        return;
      }

      if (data?.otp && __DEV__) {
        setDevOtp(data.otp);
        Alert.alert("Dev OTP", `OTP (dev): ${data.otp}`);
      } else {
        Alert.alert("OTP Sent", `A reset code has been sent to ${email}`);
      }

      setTimer(120);
      const interval = setInterval(() => {
        setTimer((t) => {
          if (t <= 1) {
            clearInterval(interval);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    } catch (err) {
      setLoading(false);
      console.log("RESEND RESET ERROR", err);
      Alert.alert("Network error", "Could not resend OTP. Try again.");
    }
  };

  // OTP single-digit handler for the verify step
  const handleOtpChange = (text, idx) => {
    const val = text.replace(/[^\d]/g, "").slice(-1);
    const next = [...otp];
    next[idx] = val;
    setOtp(next);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1, backgroundColor: theme.colors.background }}
    >
      <AnimatedBackground small />

      <View style={[styles.panel, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
          Forgot Password
        </Text>

        {step === "request" ? (
          <>
            <Text
              style={[styles.subtitle, { color: theme.colors.textSecondary }]}
            >
              Enter your email and we’ll send a reset code.
            </Text>

            <View style={styles.inputRow}>
              <Ionicons
                name="mail-outline"
                size={20}
                color={theme.colors.textSecondary}
              />
              <TextInput
                placeholder="Email address"
                placeholderTextColor={theme.colors.textDisabled}
                style={[styles.input, { color: theme.colors.textPrimary }]}
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
              />
            </View>

            <Button
              title={loading ? "Sending..." : "Send Reset Code"}
              onPress={handleRequest}
              disabled={loading}
            />

            <TouchableOpacity
              style={{ marginTop: 18, alignSelf: "center" }}
              onPress={() => navigation.navigate("Login")}
            >
              <Text style={{ color: theme.colors.primary }}>Back to Login</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text
              style={[styles.subtitle, { color: theme.colors.textSecondary }]}
            >
              Enter the 6-digit code sent to{" "}
              <Text style={{ fontWeight: "700" }}>{email}</Text>
            </Text>

            <View style={styles.otpRow}>
              {otp.map((d, i) => (
                <TextInput
                  key={i}
                  value={d}
                  onChangeText={(t) => handleOtpChange(t, i)}
                  keyboardType="number-pad"
                  maxLength={1}
                  style={[
                    styles.otpBox,
                    {
                      borderColor: theme.colors.primary,
                      color: theme.colors.textPrimary,
                    },
                  ]}
                />
              ))}
            </View>

            <View style={{ marginTop: 8 }}>
              <Text
                style={{ color: theme.colors.textSecondary, marginBottom: 8 }}
              >
                New password
              </Text>
              <View style={styles.inputRow}>
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={theme.colors.textSecondary}
                />
                <TextInput
                  placeholder="New password"
                  placeholderTextColor={theme.colors.textDisabled}
                  style={[styles.input, { color: theme.colors.textPrimary }]}
                  secureTextEntry
                  value={newPassword}
                  onChangeText={setNewPassword}
                />
              </View>
            </View>

            <Button
              title={loading ? "Resetting..." : "Verify & Reset Password"}
              onPress={handleVerifyAndReset}
              disabled={loading}
            />

            <TouchableOpacity
              disabled={timer !== 0}
              onPress={handleResend}
              style={{ marginTop: 16, alignSelf: "center" }}
            >
              <Text
                style={{
                  color:
                    timer === 0
                      ? theme.colors.primary
                      : theme.colors.textDisabled,
                }}
              >
                {timer === 0 ? "Resend code" : `Resend in ${timer}s`}
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  panel: {
    marginTop: "28%",
    marginHorizontal: 20,
    padding: 22,
    borderRadius: 18,
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

  otpRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  otpBox: {
    width: 48,
    height: 54,
    borderWidth: 1.5,
    borderRadius: 10,
    textAlign: "center",
    fontSize: 22,
    fontWeight: "600",
    backgroundColor: "#fff",
  },
});
