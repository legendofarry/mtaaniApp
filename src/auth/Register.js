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
  Alert,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";

import { auth } from "../config/firebase";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithCredential,
} from "firebase/auth";

import { API_URL, headers } from "../services/api";

WebBrowser.maybeCompleteAuthSession();

export default function Register({ navigation }) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  /* ======================================================
     GOOGLE AUTH (WEB)
  ====================================================== */
  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId:
      "70284803846-9kiqh3g4s2h2qcmpbvs3nhqb9g7mvm30.apps.googleusercontent.com",
    scopes: ["profile", "email"],
    useProxy: true,
  });

  /* ======================================================
     HANDLE GOOGLE REGISTER
  ====================================================== */
  React.useEffect(() => {
    if (response?.type !== "success") return;

    const handleGoogleRegister = async () => {
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
            fullName: firebaseUser.displayName || "User",
            provider: "google",
            photoURL: firebaseUser.photoURL,
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Google sign-up failed");

        await AsyncStorage.setItem("token", data.accessToken);
        await AsyncStorage.setItem("user", JSON.stringify(data.user));

        navigation.reset({
          index: 0,
          routes: [{ name: "Onboarding" }],
        });
      } catch (err) {
        Alert.alert("Google sign-up failed", err.message);
      } finally {
        setLoading(false);
      }
    };

    handleGoogleRegister();
  }, [response]);

  /* ======================================================
     EMAIL REGISTER
  ====================================================== */
  const handleRegister = async () => {
    if (!fullName.trim()) {
      Alert.alert("Required", "Enter your full name");
      return;
    }
    if (!email.includes("@")) {
      Alert.alert("Invalid email", "Enter a valid email address");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Weak password", "Minimum 6 characters");
      return;
    }
    if (password !== confirm) {
      Alert.alert("Mismatch", "Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      // 1️⃣ Create Firebase user
      const result = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      const firebaseUser = result.user;

      // 2️⃣ Sync with backend
      const res = await fetch(`${API_URL}/auth/sync-firebase-user`, {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({
          firebaseUid: firebaseUser.uid,
          email: firebaseUser.email,
          fullName: fullName.trim(),
          provider: "email",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Registration failed");

      // 3️⃣ Persist session
      await AsyncStorage.setItem("token", data.accessToken);
      await AsyncStorage.setItem("user", JSON.stringify(data.user));

      // 4️⃣ Go to onboarding
      navigation.reset({
        index: 0,
        routes: [{ name: "Onboarding" }],
      });
    } catch (err) {
      Alert.alert("Registration failed", err.message);
    } finally {
      setLoading(false);
    }
  };

  /* ======================================================
     UI
  ====================================================== */
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Create Account</Text>

        <TouchableOpacity
          style={styles.googleButton}
          onPress={() => promptAsync()}
          disabled={!request || loading}
        >
          <Text style={styles.googleText}>Continue with Google</Text>
        </TouchableOpacity>

        <Text style={styles.divider}>or sign up with email</Text>

        <TextInput
          style={styles.input}
          placeholder="Full name"
          value={fullName}
          onChangeText={setFullName}
        />

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

        <TextInput
          style={styles.input}
          placeholder="Confirm password"
          secureTextEntry
          value={confirm}
          onChangeText={setConfirm}
        />

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleRegister}
          disabled={loading}
        >
          <Text style={styles.primaryText}>
            {loading ? "Creating..." : "Create Account"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate("Login")}>
          <Text style={styles.link}>Already have an account? Sign in</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    justifyContent: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 24,
    textAlign: "center",
  },
  googleButton: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
    marginBottom: 16,
  },
  googleText: {
    fontWeight: "600",
  },
  divider: {
    textAlign: "center",
    marginVertical: 12,
    color: "#666",
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
    marginTop: 8,
  },
  primaryText: {
    color: "#fff",
    fontWeight: "600",
  },
  link: {
    marginTop: 20,
    textAlign: "center",
    color: "#0066cc",
    fontWeight: "500",
  },
});
