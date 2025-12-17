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

import AsyncStorage from "@react-native-async-storage/async-storage";
import * as LocalAuthentication from "expo-local-authentication";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";

import { auth } from "../config/firebase";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithCredential,
} from "firebase/auth";

import { API_URL, headers } from "../services/api";
import {
  getBiometricCredentials,
  clearBiometricCredentials,
} from "../utils/biometricStorage";

WebBrowser.maybeCompleteAuthSession();

const Login = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [savedBiometricEmail, setSavedBiometricEmail] = useState(null);

  /* ======================================================
     GOOGLE AUTH (WEB ONLY)
  ====================================================== */
  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId:
      "70284803846-9kiqh3g4s2h2qcmpbvs3nhqb9g7mvm30.apps.googleusercontent.com",
    scopes: ["profile", "email"],
    useProxy: true,
  });

  /* ======================================================
     ROUTE AFTER LOGIN (BACKEND IS SOURCE OF TRUTH)
  ====================================================== */
  const routeAfterLogin = (user) => {
    if (!user) return;

    // 1️⃣ Onboarding is mandatory
    if (!user.onboardingCompleted) {
      navigation.reset({
        index: 0,
        routes: [{ name: "Onboarding" }],
      });
      return;
    }

    // 2️⃣ Passkey already enabled → Home
    if (user.biometrics?.enabled) {
      navigation.reset({
        index: 0,
        routes: [{ name: "Home" }],
      });
      return;
    }

    // 3️⃣ Optional passkey prompt
    Alert.alert(
      "Secure your account",
      "Would you like to enable passkey (biometrics) for faster and safer login?",
      [
        {
          text: "Not now",
          style: "cancel",
          onPress: () =>
            navigation.reset({
              index: 0,
              routes: [{ name: "Home" }],
            }),
        },
        {
          text: "Enable",
          onPress: () =>
            navigation.reset({
              index: 0,
              routes: [{ name: "EnablePasskey" }],
            }),
        },
      ]
    );
  };

  /* ======================================================
     HANDLE GOOGLE LOGIN RESPONSE
  ====================================================== */
  useEffect(() => {
    if (response?.type !== "success") return;

    const handleGoogleLogin = async () => {
      try {
        setLoading(true);

        const { id_token } = response.params;
        const credential = GoogleAuthProvider.credential(id_token);

        const result = await signInWithCredential(auth, credential);
        const firebaseUser = result.user;

        const res = await fetch(`${API_URL}/auth/sync-firebase-user`, {
          method: "POST",
          headers: headers(),
          body: JSON.stringify({
            firebaseUid: firebaseUser.uid,
            email: firebaseUser.email,
            fullName: firebaseUser.displayName,
            provider: "google",
            photoURL: firebaseUser.photoURL,
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Login failed");

        await AsyncStorage.setItem("token", data.accessToken);
        await AsyncStorage.setItem("user", JSON.stringify(data.user));

        routeAfterLogin(data.user);
      } catch (err) {
        Alert.alert("Google login failed", err.message);
      } finally {
        setLoading(false);
      }
    };

    handleGoogleLogin();
  }, [response]);

  /* ======================================================
     BIOMETRIC AVAILABILITY CHECK
  ====================================================== */
  useEffect(() => {
    const checkBiometrics = async () => {
      try {
        const compatible = await LocalAuthentication.hasHardwareAsync();
        const enrolled = await LocalAuthentication.isEnrolledAsync();
        const creds = await getBiometricCredentials();

        if (compatible && enrolled && creds?.email) {
          setBiometricAvailable(true);
          setSavedBiometricEmail(creds.email);
        } else {
          setBiometricAvailable(false);
        }
      } catch {
        setBiometricAvailable(false);
      }
    };

    checkBiometrics();
  }, []);

  /* ======================================================
     EMAIL + PASSWORD LOGIN
  ====================================================== */
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Missing fields", "Enter email and password");
      return;
    }

    try {
      setLoading(true);

      const result = await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      const firebaseUser = result.user;

      const res = await fetch(`${API_URL}/auth/sync-firebase-user`, {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({
          firebaseUid: firebaseUser.uid,
          email: firebaseUser.email,
          fullName: firebaseUser.displayName || "",
          provider: "email",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");

      await AsyncStorage.setItem("token", data.accessToken);
      await AsyncStorage.setItem("user", JSON.stringify(data.user));

      routeAfterLogin(data.user);
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
        throw new Error(data.message || "Biometric login failed");
      }

      await AsyncStorage.setItem("token", data.accessToken);
      await AsyncStorage.setItem("user", JSON.stringify(data.user));

      routeAfterLogin(data.user);
    } catch (err) {
      Alert.alert("Biometric login failed", err.message);
    } finally {
      setLoading(false);
    }
  };

  /* ======================================================
     UI
  ====================================================== */
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

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.primaryText}>Login</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.socialButton}
        onPress={() => promptAsync()}
        disabled={!request || loading}
      >
        <Text style={styles.socialText}>Continue with Google</Text>
      </TouchableOpacity>

      {biometricAvailable && (
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={handleBiometricLogin}
          disabled={loading}
        >
          <Text style={styles.secondaryText}>
            Login with biometrics ({savedBiometricEmail})
          </Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={styles.link}
        onPress={() => navigation.navigate("Register")}
        disabled={loading}
      >
        <Text style={styles.linkText}>Don’t have an account? Sign up</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Login;

/* ======================================================
   STYLES
====================================================== */
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
  secondaryText: { fontWeight: "500" },
  link: { marginTop: 20, alignItems: "center" },
  linkText: { color: "#0066cc", fontWeight: "500" },
});
