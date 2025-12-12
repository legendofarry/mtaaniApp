// /src/auth/OTP.js
import React, { useState, useRef, useEffect } from "react";
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
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL, headers } from "../services/api";

export default function OTP({ route, navigation }) {
  const { email, userId, devOtp = null } = route.params || {};
  const { theme } = useTheme();

  const [otpArr, setOtpArr] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(30);
  const [loading, setLoading] = useState(false);
  const inputs = useRef([]);

  // If devOtp provided (returned in dev mode), auto-fill for convenience
  useEffect(() => {
    if (__DEV__ && devOtp) {
      const devDigits = devOtp.slice(0, 6).split("");
      const padded = [...devDigits, "", "", "", "", ""].slice(0, 6);
      setOtpArr(padded);
    }
  }, [devOtp]);

  // countdown timer
  useEffect(() => {
    if (timer === 0) return;
    const id = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [timer]);

  // handle text change for single digit input
  const handleChange = (text, i) => {
    // accept only digits
    const digit = text.replace(/[^\d]/g, "").slice(-1);
    const next = [...otpArr];
    next[i] = digit;
    setOtpArr(next);

    if (digit && i < 5) {
      inputs.current[i + 1]?.focus();
    }
    if (!digit && i > 0) {
      // if user cleared box, focus previous (optional)
      // inputs.current[i - 1]?.focus();
    }
  };

  const joinOtp = () => otpArr.join("");

  const handleVerify = async () => {
    const code = joinOtp();
    if (code.length !== 6) {
      Alert.alert("Invalid OTP", "Please enter the full 6-digit code.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/auth/verify-otp`, {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({ email, otp: code }),
      });
      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        Alert.alert("Verification failed", data?.message || "Invalid OTP");
        return;
      }

      // store token and navigate to onboarding
      if (data?.accessToken) {
        await AsyncStorage.setItem("token", data.accessToken);
      }
      // pass user id (backend returns user id too); prefer returned user id
      const returnedUserId = data?.user?.id || userId;
      navigation.replace("Onboarding", {
        userId: returnedUserId,
        token: data.accessToken,
      });
    } catch (err) {
      setLoading(false);
      console.log("VERIFY ERROR", err);
      Alert.alert("Network error", "Could not verify OTP. Try again.");
    }
  };

  const handleResend = async () => {
    if (timer !== 0) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/auth/request-otp`, {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({ email, purpose: "verify" }),
      });
      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        Alert.alert("Failed to resend", data?.message || "Try later");
        return;
      }

      // restart timer
      setTimer(30);

      if (__DEV__ && data?.otp) {
        Alert.alert("Dev OTP", `OTP (dev): ${data.otp}`);
      } else {
        Alert.alert("OTP Sent", "A new code was sent to your email.");
      }
    } catch (err) {
      setLoading(false);
      console.log("RESEND ERROR", err);
      Alert.alert("Network error", "Could not resend OTP. Try again.");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1, backgroundColor: theme.colors.background }}
    >
      <AnimatedBackground small />

      <View style={[styles.panel, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
          Verify OTP
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          Enter the 6-digit code sent to{" "}
          <Text style={{ fontWeight: "700" }}>{email}</Text>
        </Text>

        {/* OTP Boxes */}
        <View style={styles.otpRow}>
          {otpArr.map((d, i) => (
            <TextInput
              key={i}
              ref={(ref) => (inputs.current[i] = ref)}
              value={d}
              onChangeText={(text) => handleChange(text, i)}
              keyboardType="number-pad"
              maxLength={1}
              style={[
                styles.otpBox,
                {
                  borderColor: theme.colors.primary,
                  color: theme.colors.textPrimary,
                },
              ]}
              returnKeyType="next"
              onKeyPress={({ nativeEvent }) => {
                if (
                  nativeEvent.key === "Backspace" &&
                  otpArr[i] === "" &&
                  i > 0
                ) {
                  inputs.current[i - 1]?.focus();
                }
              }}
            />
          ))}
        </View>

        <Button
          title={loading ? "Verifying..." : "Verify"}
          variant="primary"
          onPress={handleVerify}
          disabled={loading}
        />

        <TouchableOpacity
          disabled={timer !== 0}
          onPress={handleResend}
          style={{ marginTop: 18, alignSelf: "center" }}
        >
          <Text
            style={{
              color:
                timer === 0 ? theme.colors.primary : theme.colors.textDisabled,
            }}
          >
            {timer === 0 ? "Resend OTP" : `Resend OTP in ${timer}s`}
          </Text>
        </TouchableOpacity>
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

  otpRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
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
