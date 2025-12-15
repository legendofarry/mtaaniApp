import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import Constants from "expo-constants";

export default function About() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} />
        </TouchableOpacity>
        <Text style={styles.title}>About</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* App Card */}
        <View style={styles.card}>
          <Ionicons name="home-outline" size={36} color="#f3f4f6" />
          <Text style={styles.appName}>MtaaniFlow</Text>
          <Text style={styles.version}>
            Version {Constants.expoConfig?.version || "1.0.0"}
          </Text>
        </View>

        {/* Mission */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Our Mission</Text>
          <Text style={styles.text}>
            MtaaniFlow helps households in informal and urban settlements manage
            electricity and water usage smarter, predict token consumption, and
            stay in control of essential services.
          </Text>
        </View>

        {/* Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Information</Text>

          <InfoRow label="Developer" value="karimiarrison@gmail.com" />
          <InfoRow label="Platform" value="Android • iOS • Web" />
          <InfoRow label="Country" value="Kenya" />
        </View>

        {/* Legal */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Legal</Text>

          <LinkRow label="Terms of Service" />
          <LinkRow label="Privacy Policy" />
          <LinkRow label="Licenses" />
        </View>
      </ScrollView>
    </View>
  );
}

/* ---------- Components ---------- */

const InfoRow = ({ label, value }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

const LinkRow = ({ label }) => (
  <TouchableOpacity style={styles.linkRow}>
    <Text style={styles.linkText}>{label}</Text>
    <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
  </TouchableOpacity>
);

/* ---------- Styles ---------- */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f3f4f6" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },

  title: { fontSize: 18, fontWeight: "600", fontFamily: "Montserrat_700Bold" },

  content: { padding: 16 },

  card: {
    backgroundColor: "#F4C542",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    marginBottom: 20,
  },
  appName: {
    fontSize: 20,
    fontWeight: "700",
    marginTop: 8,
    color: "#f3f4f6",
    fontFamily: "Montserrat_700Bold",
  },
  version: {
    color: "#a3a4a5ff",
    marginTop: 4,
    fontFamily: "Montserrat_700Bold",
  },

  section: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontWeight: "700",
    marginBottom: 10,
    fontSize: 15,
    fontFamily: "Montserrat_700Bold",
  },
  text: {
    color: "#374151",
    lineHeight: 20,
    fontWeight: "400",
    fontStyle: "italic",
  },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  infoLabel: { color: "#6b7280", fontFamily: "Montserrat_700Bold" },
  infoValue: { fontWeight: "600", fontFamily: "Montserrat_700Bold" },

  linkRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
  },
  linkText: {
    fontWeight: "600",
    color: "#2563eb",
    fontFamily: "Montserrat_700Bold",
  },
});
