// src/profile/MeterDetails.js
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";

export default function MeterDetails() {
  const navigation = useNavigation();
  const { meter } = useRoute().params;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} />
        </TouchableOpacity>
        <Text style={styles.title}>{meter.nickname}</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Meter Number</Text>
        <Text style={styles.value}>{meter.meterNumber}</Text>

        <Text style={styles.label}>Type</Text>
        <Text style={styles.value}>{meter.type}</Text>

        <Text style={styles.label}>Location</Text>
        <Text style={styles.value}>{meter.location?.area}</Text>
      </View>

      <View style={styles.placeholder}>
        <Text>📊 Usage graph</Text>
        <Text>💳 Token history</Text>
        <Text>🔔 Alerts</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  header: {
    flexDirection: "row",
    padding: 16,
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: { fontWeight: "700", fontSize: 16 },

  card: {
    backgroundColor: "#fff",
    margin: 16,
    padding: 16,
    borderRadius: 14,
  },
  label: { fontSize: 12, color: "#6b7280" },
  value: { fontWeight: "600", marginBottom: 10 },

  placeholder: {
    alignItems: "center",
    gap: 12,
    marginTop: 40,
  },
});
