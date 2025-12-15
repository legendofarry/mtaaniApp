import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

export default function Notifications() {
  const navigation = useNavigation();

  const [settings, setSettings] = useState({
    push: true,
    tokens: true,
    usage: true,
    system: true,
    marketing: false,
  });

  const toggle = (k) => setSettings((s) => ({ ...s, [k]: !s[k] }));

  return (
    <ScrollView style={styles.container}>
      <Header title="Notifications" onBack={() => navigation.goBack()} />

      <Section title="General">
        <Toggle
          label="Push Notifications"
          desc="Allow notifications on this device"
          value={settings.push}
          onToggle={() => toggle("push")}
        />
      </Section>

      <Section title="Meters & Tokens">
        <Toggle
          label="Low Token Alerts"
          desc="Get notified before tokens run out"
          value={settings.tokens}
          onToggle={() => toggle("tokens")}
        />
        <Toggle
          label="Usage Alerts"
          desc="High consumption warnings"
          value={settings.usage}
          onToggle={() => toggle("usage")}
        />
      </Section>

      <Section title="System">
        <Toggle
          label="System Updates"
          desc="Maintenance and important updates"
          value={settings.system}
          onToggle={() => toggle("system")}
        />
        <Toggle
          label="Tips & Offers"
          desc="Optional messages"
          value={settings.marketing}
          onToggle={() => toggle("marketing")}
        />
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

const Toggle = ({ label, desc, value, onToggle }) => (
  <View style={styles.toggleRow}>
    <View>
      <Text style={styles.toggleTitle}>{label}</Text>
      <Text style={styles.desc}>{desc}</Text>
    </View>
    <Switch value={value} onValueChange={onToggle} />
  </View>
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

  toggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
  },

  toggleTitle: { fontWeight: "500" },

  desc: { fontSize: 12, color: "#6b7280" },
});
