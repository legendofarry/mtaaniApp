import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../store/useAuth";

const REPORTS = [
  {
    id: "1",
    name: "Electricity – March",
    type: "Electricity",
    period: "Monthly",
  },
  { id: "2", name: "Water – March", type: "Water", period: "Monthly" },
  { id: "3", name: "Token Spending", type: "Finance", period: "Quarterly" },
];

export default function MyReports() {
  const navigation = useNavigation();
  const user = useAuth((s) => s.user);

  if (user?.subscription !== "premium") {
    return (
      <View style={styles.locked}>
        <Ionicons name="lock-closed" size={48} color="#9ca3af" />
        <Text style={styles.lockedTitle}>Premium Only</Text>
        <Text style={styles.lockedDesc}>
          Upgrade to premium to access reports.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="My Reports" onBack={() => navigation.goBack()} />

      {/* TABLE HEADER */}
      <View style={styles.tableHeader}>
        <Text style={[styles.col, { flex: 2 }]}>Report</Text>
        <Text style={styles.col}>Type</Text>
        <Text style={styles.col}>Period</Text>
      </View>

      <FlatList
        data={REPORTS}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ paddingBottom: 20 }}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.row}>
            <Text style={[styles.cell, { flex: 2 }]}>{item.name}</Text>
            <Text style={styles.cell}>{item.type}</Text>
            <Text style={styles.cell}>{item.period}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

/* ---------------- COMPONENTS ---------------- */

const Header = ({ title, onBack }) => (
  <View style={styles.header}>
    <TouchableOpacity onPress={onBack}>
      <Ionicons name="arrow-back" size={24} />
    </TouchableOpacity>
    <Text style={styles.headerTitle}>{title}</Text>
    <View style={{ width: 24 }} />
  </View>
);

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },

  headerTitle: { fontSize: 18, fontWeight: "600" },

  tableHeader: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#e5e7eb",
  },

  col: {
    flex: 1,
    fontWeight: "600",
    fontSize: 13,
  },

  row: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderColor: "#f1f5f9",
  },

  cell: {
    flex: 1,
    fontSize: 14,
  },

  locked: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },

  lockedTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginTop: 12,
  },

  lockedDesc: {
    color: "#6b7280",
    textAlign: "center",
    marginTop: 6,
  },
});
