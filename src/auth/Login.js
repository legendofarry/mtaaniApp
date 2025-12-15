import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";

import { Button } from "../common/Button";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../common/ThemeProvider";
import * as LocalAuth from "expo-local-authentication";

import { API_URL, headers } from "../services/api";
import { useAuth } from "../store/useAuth";

export default function Login({ navigation }) {
  const { theme } = useTheme();
  const login = useAuth((state) => state.login);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [bioSupported, setBioSupported] = useState(false);

  useEffect(() => {
    (async () => {
      const supported = await LocalAuth.hasHardwareAsync();
      const enrolled = await LocalAuth.isEnrolledAsync();
      setBioSupported(supported && enrolled);
    })();
  }, []);

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

      if (!res.ok) {
        setLoading(false);
        return setError(data.message || "Login failed");
      }

      // 🔥 THIS TRIGGERS ROUTES RE-RENDER
      await login({
        token: data.accessToken,
      });
    } catch (err) {
      console.log("Login error:", err);
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Welcome Back</Text>

      <TextInput
        placeholder="Email"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />

      <TextInput
        placeholder="Password"
        style={styles.input}
        value={password}
        secureTextEntry
        onChangeText={setPassword}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Button title="Login" onPress={handleLogin} disabled={loading} />

      {loading && <ActivityIndicator style={{ marginTop: 10 }} />}

      <TouchableOpacity onPress={() => navigation.navigate("Register")}>
        <Text style={styles.link}>Create Account</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 20,
    fontFamily: "Montserrat_700Bold",
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    fontFamily: "Montserrat_700Bold",
    color: "#6b728086",
  },
  error: {
    color: "red",
    marginBottom: 10,
  },
  link: {
    marginTop: 20,
    color: "#0B68FF",
    textAlign: "center",
    fontFamily: "Montserrat_700Bold",
  },
});
