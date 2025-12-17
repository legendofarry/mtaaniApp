// src/auth/Onboarding.js

import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";
import * as LocalAuthentication from "expo-local-authentication";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { API_URL, headers } from "../services/api";
import { saveBiometricCredentials } from "../utils/biometricStorage";

const Onboarding = ({ navigation }) => {
  const [loading, setLoading] = useState(false);

  // Profile fields
  const [gender, setGender] = useState("");
  const [age, setAge] = useState("");
  const [area, setArea] = useState("");
  const [structureNumber, setStructureNumber] = useState("");
  const [landmark, setLandmark] = useState("");

  const [biometricsEnabled, setBiometricsEnabled] = useState(false);

  /* ======================================================
     ENABLE BIOMETRICS (OPTIONAL)
  ====================================================== */
  const handleEnableBiometrics = async () => {
    try {
      setLoading(true);

      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();

      if (!compatible || !enrolled) {
        Alert.alert("Unavailable", "Biometrics are not set up on this device.");
        return;
      }

      const auth = await LocalAuthentication.authenticateAsync({
        promptMessage: "Confirm biometrics to enable quick login",
        cancelLabel: "Cancel",
      });

      if (!auth.success) return;

      const storedUser = await AsyncStorage.getItem("user");
      const token = await AsyncStorage.getItem("token");

      if (!storedUser || !token) {
        throw new Error("Not authenticated");
      }

      const user = JSON.parse(storedUser);

      const res = await fetch(`${API_URL}/auth/save-passkey`, {
        method: "POST",
        headers: headers(token),
        body: JSON.stringify({
          userId: user.id,
          passkeyEnabled: true,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.biometricSecret) {
        throw new Error("Failed to enable biometrics");
      }

      await saveBiometricCredentials(user.email, data.biometricSecret);
      setBiometricsEnabled(true);

      Alert.alert("Success", "Biometric login enabled.");
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Could not enable biometrics.");
    } finally {
      setLoading(false);
    }
  };

  /* ======================================================
     COMPLETE ONBOARDING
  ====================================================== */
  const handleCompleteOnboarding = async () => {
    if (!area.trim()) {
      Alert.alert("Required", "Please enter your area.");
      return;
    }

    try {
      setLoading(true);

      const storedUser = await AsyncStorage.getItem("user");
      const token = await AsyncStorage.getItem("token");

      if (!storedUser || !token) {
        throw new Error("Not authenticated");
      }

      const user = JSON.parse(storedUser);

      const payload = {
        userId: user.id,
        gender: gender || undefined,
        age: age ? Number(age) : undefined,
        location: {
          area: area.trim(),
          structureNumber: structureNumber || undefined,
          landmark: landmark || undefined,
        },
      };

      const res = await fetch(`${API_URL}/auth/complete-onboarding`, {
        method: "POST",
        headers: headers(token),
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Onboarding failed");
      }

      navigation.reset({
        index: 0,
        routes: [{ name: "Home" }],
      });
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to complete onboarding.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Tell us about you</Text>

      {/* AREA (REQUIRED) */}
      <TextInput
        style={styles.input}
        placeholder="Area (required)"
        value={area}
        onChangeText={setArea}
      />

      {/* OPTIONAL FIELDS */}
      <TextInput
        style={styles.input}
        placeholder="Structure Number (optional)"
        value={structureNumber}
        onChangeText={setStructureNumber}
      />

      <TextInput
        style={styles.input}
        placeholder="Landmark (optional)"
        value={landmark}
        onChangeText={setLandmark}
      />

      <TextInput
        style={styles.input}
        placeholder="Gender (male / female / other)"
        value={gender}
        onChangeText={setGender}
      />

      <TextInput
        style={styles.input}
        placeholder="Age"
        value={age}
        onChangeText={setAge}
        keyboardType="number-pad"
      />

      {/* BIOMETRICS */}
      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={handleEnableBiometrics}
        disabled={loading || biometricsEnabled}
      >
        <Text style={styles.secondaryText}>
          {biometricsEnabled ? "Biometrics Enabled" : "Enable Biometric Login"}
        </Text>
      </TouchableOpacity>

      {/* SUBMIT */}
      <TouchableOpacity
        style={styles.primaryButton}
        onPress={handleCompleteOnboarding}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.primaryText}>Continue</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

export default Onboarding;

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: "#fff",
    flexGrow: 1,
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 14,
    marginBottom: 12,
    fontSize: 16,
  },
  primaryButton: {
    backgroundColor: "#111",
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 12,
  },
  primaryText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: "#ddd",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 8,
  },
  secondaryText: {
    fontSize: 15,
    color: "#111",
  },
});
