// src/auth/Onboarding.js

import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL, headers } from "../services/api";

export default function Onboarding({ navigation }) {
  const [gender, setGender] = useState("");
  const [age, setAge] = useState("");
  const [area, setArea] = useState("");
  const [estate, setEstate] = useState("");
  const [loading, setLoading] = useState(false);

  /* ======================================================
     SUBMIT ONBOARDING
  ====================================================== */
  const handleSubmit = async () => {
    if (!area.trim()) {
      Alert.alert("Required", "Please enter your area");
      return;
    }

    try {
      setLoading(true);

      const token = await AsyncStorage.getItem("token");
      const storedUser = await AsyncStorage.getItem("user");

      if (!token || !storedUser) {
        throw new Error("Session expired. Please log in again.");
      }

      const user = JSON.parse(storedUser);

      const res = await fetch(`${API_URL}/auth/complete-onboarding`, {
        method: "POST",
        headers: headers(token),
        body: JSON.stringify({
          gender: gender || undefined,
          age: age ? Number(age) : undefined,
          location: {
            area: area.trim(),
            estate: estate.trim() || undefined,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to complete onboarding");
      }

      // Update local user cache
      const updatedUser = {
        ...user,
        onboardingCompleted: true,
        location: data.user.location,
        gender: gender || user.gender,
        age: age ? Number(age) : user.age,
      };

      await AsyncStorage.setItem("user", JSON.stringify(updatedUser));

      // Go to optional passkey enable
      navigation.reset({
        index: 0,
        routes: [{ name: "EnablePasskey" }],
      });
    } catch (err) {
      Alert.alert("Onboarding failed", err.message);
    } finally {
      setLoading(false);
    }
  };

  /* ======================================================
     UI
  ====================================================== */
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Tell us about yourself</Text>

      <Text style={styles.subtitle}>
        This helps us personalize your experience
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Gender (optional)"
        value={gender}
        onChangeText={setGender}
      />

      <TextInput
        style={styles.input}
        placeholder="Age (optional)"
        keyboardType="numeric"
        value={age}
        onChangeText={setAge}
      />

      <TextInput
        style={styles.input}
        placeholder="Area *"
        value={area}
        onChangeText={setArea}
      />

      <TextInput
        style={styles.input}
        placeholder="Estate (optional)"
        value={estate}
        onChangeText={setEstate}
      />

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={handleSubmit}
        disabled={loading}
      >
        <Text style={styles.primaryText}>
          {loading ? "Saving..." : "Continue"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    flexGrow: 1,
    justifyContent: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
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
    marginTop: 12,
  },
  primaryText: {
    color: "#fff",
    fontWeight: "600",
  },
});
