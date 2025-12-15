import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
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
  {
    id: "2",
    name: "Water – March",
    type: "Water",
    period: "Monthly",
  },
  {
    id: "3",
    name: "Token Spending",
    type: "Finance",
    period: "Quarterly",
  },
];

export default function MyReports() {
  const navigation = useNavigation();
  const user = useAuth((s) => s.user);

  /* 🔒 PREMIUM GATE */
  if (user?.subscription !== "premium") {
    return (
      <View style={styles.locked}>
        <TouchableOpacity
          style={styles.close}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="close" size={26} />
        </TouchableOpacity>

        <Ionicons name="lock-closed" size={56} color="#9ca3af" />
        <Text style={styles.lockedTitle}>Premium Reports</Text>
        <Text style={styles.lockedDesc}>
          Upgrade to premium to access detailed usage, spending & insights.
        </Text>

        <TouchableOpacity
          style={styles.upgradeBtn}
          onPress={() => navigation.navigate("Subscription")}
        >
          <Text style={styles.upgradeText}>Upgrade to Premium</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="My Reports" onBack={() => navigation.goBack()} />

      {/* SUMMARY */}
      <View style={styles.summaryRow}>
        <SummaryCard label="Total Reports" value={REPORTS.length} />
        <SummaryCard label="Latest Period" value="March" />
        <SummaryCard label="Types" value="3" />
      </View>

      {/* TABLE HEADER */}
      <View style={styles.tableHeader}>
        <Text style={[styles.colHeader, { flex: 2 }]}>Report</Text>
        <Text style={styles.colHeader}>Type</Text>
        <Text style={styles.colHeader}>Period</Text>
      </View>

      {/* TABLE */}
      <FlatList
        data={REPORTS}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ paddingBottom: 24 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.row}
            activeOpacity={0.85}
            onPress={() =>
              navigation.navigate("ReportDetails", { report: item })
            }
          >
            <View style={[styles.cell, { flex: 2 }]}>
              <Text style={styles.reportName}>{item.name}</Text>
            </View>

            <Badge
              label={item.type}
              color={
                item.type === "Electricity"
                  ? "#2563eb"
                  : item.type === "Water"
                  ? "#0ea5e9"
                  : "#16a34a"
              }
            />

            <Badge label={item.period} color="#6b7280" />
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

/* ================= COMPONENTS ================= */

const Header = ({ title, onBack }) => (
  <View style={styles.header}>
    <TouchableOpacity onPress={onBack}>
      <Ionicons name="arrow-back" size={24} />
    </TouchableOpacity>
    <Text style={styles.headerTitle}>{title}</Text>
    <View style={{ width: 24 }} />
  </View>
);

const SummaryCard = ({ label, value }) => (
  <View style={styles.summaryCard}>
    <Text style={styles.summaryValue}>{value}</Text>
    <Text style={styles.summaryLabel}>{label}</Text>
  </View>
);

const Badge = ({ label, color }) => (
  <View style={[styles.badge, { borderColor: color }]}>
    <Text style={[styles.badgeText, { color }]}>{label}</Text>
  </View>
);

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },

  /* HEADER */
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  headerTitle: { fontSize: 18, fontWeight: "600" },

  /* SUMMARY */
  summaryRow: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 16,
    marginBottom: 10,
  },

  summaryCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },

  summaryValue: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
  },

  summaryLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },

  /* TABLE */
  tableHeader: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: 10,
  },

  colHeader: {
    flex: 1,
    fontSize: 12,
    fontWeight: "600",
    color: "#6b7280",
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 10,
    padding: 14,
    borderRadius: 14,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },

  cell: { flex: 1 },

  reportName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },

  badge: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },

  badgeText: {
    fontSize: 12,
    fontWeight: "600",
  },

  /* LOCKED */
  locked: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#f8fafc",
  },

  close: {
    position: "absolute",
    top: 40,
    left: 20,
  },

  lockedTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginTop: 14,
  },

  lockedDesc: {
    color: "#6b7280",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 20,
  },

  upgradeBtn: {
    backgroundColor: "#2563eb",
    paddingHorizontal: 26,
    paddingVertical: 14,
    borderRadius: 14,
  },

  upgradeText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
});
