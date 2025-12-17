// src/auth/Login.js

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import * as LocalAuthentication from "expo-local-authentication";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { API_URL, headers } from "../services/api";
import { auth } from "../config/firebase";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithCredential,
} from "firebase/auth";

import {
  getBiometricCredentials,
  clearBiometricCredentials,
} from "../utils/biometricStorage";

import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";

WebBrowser.maybeCompleteAuthSession();

const Login = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [savedBiometricEmail, setSavedBiometricEmail] = useState(null);

  /* ======================================================
     GOOGLE AUTH REQUEST
  ====================================================== */
  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId:
      "437462714105-xxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com",
    webClientId:
      "437462714105-yyyyyyyyyyyyyyyyyyyyyyyy.apps.googleusercontent.com",
    scopes: ["profile", "email"],
  });

  /* ======================================================
     HANDLE GOOGLE RESPONSE
  ====================================================== */
  useEffect(() => {
    const handleGoogleLogin = async () => {
      if (response?.type !== "success") return;

      try {
        setLoading(true);

        const { id_token } = response.params;
        const credential = GoogleAuthProvider.credential(id_token);

        const result = await signInWithCredential(auth, credential);
        const user = result.user;

        // Sync with backend
        const res = await fetch(`${API_URL}/auth/sync-firebase-user`, {
          method: "POST",
          headers: headers(),
          body: JSON.stringify({
            firebaseUid: user.uid,
            email: user.email,
            fullName: user.displayName,
            provider: "google",
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || "Failed to sync user");
        }

        await AsyncStorage.setItem("token", data.accessToken);
        await AsyncStorage.setItem("user", JSON.stringify(data.user));

        navigation.reset({
          index: 0,
          routes: [
            { name: data.user.onboardingCompleted ? "Home" : "Onboarding" },
          ],
        });
      } catch (err) {
        Alert.alert("Google login failed", err.message);
      } finally {
        setLoading(false);
      }
    };

    handleGoogleLogin();
  }, [response]);

  /* ======================================================
     BIOMETRIC CHECK
  ====================================================== */
  useEffect(() => {
    const checkBiometrics = async () => {
      try {
        const compatible = await LocalAuthentication.hasHardwareAsync();
        const enrolled = await LocalAuthentication.isEnrolledAsync();
        const creds = await getBiometricCredentials();

        if (compatible && enrolled && creds) {
          setBiometricAvailable(true);
          setSavedBiometricEmail(creds.email);
        }
      } catch {}
    };

    checkBiometrics();
  }, []);

  /* ======================================================
     EMAIL + PASSWORD LOGIN (FIREBASE)
  ====================================================== */
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Missing", "Enter email and password");
      return;
    }

    try {
      setLoading(true);

      const result = await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      const user = result.user;

      const res = await fetch(`${API_URL}/auth/sync-firebase-user`, {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({
          firebaseUid: user.uid,
          email: user.email,
          fullName: user.displayName || "",
          provider: "email",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      await AsyncStorage.setItem("token", data.accessToken);
      await AsyncStorage.setItem("user", JSON.stringify(data.user));

      navigation.reset({
        index: 0,
        routes: [
          { name: data.user.onboardingCompleted ? "Home" : "Onboarding" },
        ],
      });
    } catch (err) {
      Alert.alert("Login failed", err.message);
    } finally {
      setLoading(false);
    }
  };

  /* ======================================================
     BIOMETRIC LOGIN
  ====================================================== */
  const handleBiometricLogin = async () => {
    try {
      setLoading(true);

      const creds = await getBiometricCredentials();
      if (!creds) return;

      const authResult = await LocalAuthentication.authenticateAsync({
        promptMessage: "Login with biometrics",
      });

      if (!authResult.success) return;

      const res = await fetch(`${API_URL}/auth/biometric-login`, {
        method: "POST",
        headers: headers(),
        body: JSON.stringify(creds),
      });

      const data = await res.json();
      if (!res.ok) {
        await clearBiometricCredentials();
        throw new Error("Biometric login failed");
      }

      await AsyncStorage.setItem("token", data.accessToken);
      await AsyncStorage.setItem("user", JSON.stringify(data.user));

      navigation.reset({
        index: 0,
        routes: [
          { name: data.user.onboardingCompleted ? "Home" : "Onboarding" },
        ],
      });
    } catch (err) {
      Alert.alert("Error", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome Back</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity style={styles.primaryButton} onPress={handleLogin}>
        <Text style={styles.primaryText}>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.socialButton}
        onPress={() => promptAsync()}
        disabled={!request}
      >
        <Text style={styles.socialText}>Continue with Google</Text>
      </TouchableOpacity>

      {biometricAvailable && (
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={handleBiometricLogin}
        >
          <Text style={styles.secondaryText}>
            Login with biometrics ({savedBiometricEmail})
          </Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={styles.link}
        onPress={() => navigation.navigate("Register")}
      >
        <Text style={styles.linkText}>Don’t have an account? Sign up</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Login;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: "center" },
  title: {
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 24,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 14,
    marginBottom: 12,
  },
  primaryButton: {
    backgroundColor: "#111",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  primaryText: { color: "#fff", fontWeight: "600" },
  socialButton: {
    marginTop: 12,
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
  },
  socialText: { fontWeight: "500" },
  secondaryButton: {
    marginTop: 12,
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
  },
  secondaryText: {},
  link: { marginTop: 20, alignItems: "center" },
  linkText: { color: "#0066cc", fontWeight: "500" },
});
