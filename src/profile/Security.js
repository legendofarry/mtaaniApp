// src\profile\Security.js

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
  ScrollView,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

export default function Security() {
  const navigation = useNavigation();

  const [biometric, setBiometric] = useState(false);
  const [changing, setChanging] = useState(false);

  const [form, setForm] = useState({
    current: "",
    password: "",
    confirm: "",
  });

  const changePassword = () => {
    if (!form.current || !form.password) {
      return Alert.alert("Error", "All fields are required");
    }
    if (form.password !== form.confirm) {
      return Alert.alert("Error", "Passwords do not match");
    }

    Alert.alert("Success", "Password updated successfully");
    setForm({ current: "", password: "", confirm: "" });
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <Header title="Security" onBack={() => navigation.goBack()} />

      {/* Password */}
      <Section title="Password">
        <Input
          placeholder="Current password"
          secure
          value={form.current}
          onChange={(v) => setForm({ ...form, current: v })}
        />
        <Input
          placeholder="New password"
          secure
          value={form.password}
          onChange={(v) => setForm({ ...form, password: v })}
        />
        <Input
          placeholder="Confirm new password"
          secure
          value={form.confirm}
          onChange={(v) => setForm({ ...form, confirm: v })}
        />

        <PrimaryButton text="Change Password" onPress={changePassword} />
      </Section>

      {/* Sessions */}
      <Section title="Sessions & Devices">
        <Row
          icon="phone-portrait"
          title="Current Device"
          subtitle="Active now"
        />
        <DangerButton
          text="Log out of all devices"
          onPress={() =>
            Alert.alert("Confirm", "This will log you out everywhere", [
              { text: "Cancel" },
              { text: "Log out", style: "destructive" },
            ])
          }
        />
      </Section>

      {/* Biometrics */}
      <Section title="Extra Protection">
        <View style={styles.toggleRow}>
          <View>
            <Text style={styles.toggleTitle}>Biometric Lock</Text>
            <Text style={styles.sub}>Use fingerprint / face unlock</Text>
          </View>
          <Switch value={biometric} onValueChange={setBiometric} />
        </View>
      </Section>
    </ScrollView>
  );
}

/* ---------- COMPONENTS ---------- */

const Header = ({ title, onBack }) => (
  <View style={styles.header}>
    <TouchableOpacity onPress={onBack}>
      <Ionicons name="arrow-back" size={24} />
    </TouchableOpacity>
    <Text style={styles.headerTitle}>{title}</Text>
    <View style={{ width: 24 }} />
  </View>
);

const Section = ({ title, children }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {children}
  </View>
);

const Row = ({ icon, title, subtitle }) => (
  <View style={styles.row}>
    <Ionicons name={icon} size={20} color="#2563eb" />
    <View>
      <Text style={styles.rowTitle}>{title}</Text>
      <Text style={styles.sub}>{subtitle}</Text>
    </View>
  </View>
);

const Input = ({ placeholder, secure, value, onChange }) => (
  <TextInput
    style={styles.input}
    placeholder={placeholder}
    secureTextEntry={secure}
    value={value}
    onChangeText={onChange}
  />
);

const PrimaryButton = ({ text, onPress }) => (
  <TouchableOpacity style={styles.primary} onPress={onPress}>
    <Text style={styles.primaryText}>{text}</Text>
  </TouchableOpacity>
);

const DangerButton = ({ text, onPress }) => (
  <TouchableOpacity style={styles.danger} onPress={onPress}>
    <Text style={styles.dangerText}>{text}</Text>
  </TouchableOpacity>
);

/* ---------- STYLES ---------- */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },

  headerTitle: { fontSize: 18, fontWeight: "600" },

  section: {
    backgroundColor: "#fff",
    margin: 16,
    borderRadius: 16,
    padding: 16,
  },

  sectionTitle: {
    fontWeight: "600",
    marginBottom: 12,
    color: "#374151",
  },

  input: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },

  primary: {
    backgroundColor: "#2563eb",
    padding: 14,
    borderRadius: 12,
    marginTop: 8,
  },

  primaryText: {
    color: "#fff",
    fontWeight: "600",
    textAlign: "center",
  },

  danger: {
    backgroundColor: "#fee2e2",
    padding: 14,
    borderRadius: 12,
    marginTop: 10,
  },

  dangerText: {
    color: "#b91c1c",
    fontWeight: "600",
    textAlign: "center",
  },

  row: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    paddingVertical: 10,
  },

  rowTitle: { fontWeight: "500" },

  sub: { fontSize: 12, color: "#6b7280" },

  toggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  toggleTitle: { fontWeight: "500" },
});
