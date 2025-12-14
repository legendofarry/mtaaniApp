// src/profile/MyMeters.js
import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Swipeable } from "react-native-gesture-handler";
import { useFocusEffect, useNavigation } from "@react-navigation/native";

import { useAuth } from "../store/useAuth";
import { API_URL, headers } from "../services/api";

export default function MyMeters() {
  const navigation = useNavigation();
  const { user, token } = useAuth();

  const [meters, setMeters] = useState([]);
  const [tab, setTab] = useState("electricity");
  const [search, setSearch] = useState("");

  const loadMeters = async () => {
    const res = await fetch(`${API_URL}/meters/user/${user._id}`, {
      headers: headers(token),
    });
    const data = await res.json();
    setMeters(data.meters || []);
  };

  useFocusEffect(
    useCallback(() => {
      loadMeters();
    }, [])
  );

  const confirmDelete = (meter) => {
    Alert.alert("Unlink Meter", `Remove meter ${meter.meterNumber}?`, [
      { text: "Cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await fetch(`${API_URL}/meters/${meter._id}`, {
            method: "DELETE",
            headers: headers(token),
          });
          loadMeters();
        },
      },
    ]);
  };

  const filtered = meters.filter(
    (m) =>
      m.type === tab &&
      `${m.meterNumber} ${m.nickname} ${m.location?.area}`
        .toLowerCase()
        .includes(search.toLowerCase())
  );

  /* ---------- Swipe Actions ---------- */

  const renderLeft = (item) => (
    <TouchableOpacity
      style={[styles.swipeBtn, styles.editBtn]}
      onPress={() => navigation.navigate("LinkMeter", { meter: item })}
    >
      <Ionicons name="pencil" size={22} color="#fff" />
    </TouchableOpacity>
  );

  const renderRight = (item) => (
    <TouchableOpacity
      style={[styles.swipeBtn, styles.deleteBtn]}
      onPress={() => confirmDelete(item)}
    >
      <Ionicons name="trash" size={22} color="#fff" />
    </TouchableOpacity>
  );

  /* ---------- Row ---------- */

  const Row = ({ item }) => (
    <Swipeable
      renderLeftActions={() => renderLeft(item)}
      renderRightActions={() => renderRight(item)}
    >
      <TouchableOpacity
        style={styles.row}
        onPress={() => navigation.navigate("MeterDetails", { meter: item })}
        onLongPress={() =>
          Alert.alert("Actions", "Choose action", [
            {
              text: "Edit",
              onPress: () => navigation.navigate("LinkMeter", { meter: item }),
            },
            {
              text: "Delete",
              style: "destructive",
              onPress: () => confirmDelete(item),
            },
            { text: "Cancel" },
          ])
        }
      >
        {/* TABLE COLUMNS */}
        <View style={styles.colNick}>
          <Text style={styles.nick}>{item.nickname}</Text>
          <Text style={styles.sub}>{item.type.toUpperCase()}</Text>
        </View>

        <View style={styles.colNum}>
          <Text style={styles.mono}>{item.meterNumber}</Text>
        </View>

        <View style={styles.colLoc}>
          <Text style={styles.sub}>{item.location?.area || "—"}</Text>
        </View>

        <Ionicons name="chevron-forward" size={16} color="#9ca3af" />
      </TouchableOpacity>
    </Swipeable>
  );

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={26} />
        </TouchableOpacity>
        <Text style={styles.title}>My Meters</Text>
        <View style={{ width: 26 }} />
      </View>

      {/* TABS */}
      <View style={styles.tabs}>
        {["electricity", "water"].map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.tab, tab === t && styles.tabActive]}
            onPress={() => setTab(t)}
          >
            <Ionicons
              name={t === "electricity" ? "flash" : "water"}
              size={16}
            />
            <Text style={styles.tabText}>{t.toUpperCase()}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* SEARCH */}
      <View style={styles.searchWrap}>
        <Ionicons name="search" size={16} color="#9ca3af" />
        <TextInput
          placeholder="Search meters…"
          style={styles.search}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* ADD */}
      <TouchableOpacity
        style={styles.addBtn}
        onPress={() => navigation.navigate("LinkMeter", { type: tab })}
      >
        <Ionicons name="add" size={20} color="#fff" />
        <Text style={styles.addText}>
          Add {tab === "water" ? "Water" : "Electricity"} Meter
        </Text>
      </TouchableOpacity>

      {/* TABLE HEADER */}
      <View style={styles.tableHeader}>
        <Text style={styles.th}>NAME</Text>
        <Text style={styles.th}>NUMBER</Text>
        <Text style={styles.th}>AREA</Text>
      </View>

      {/* LIST */}
      <FlatList
        data={filtered}
        keyExtractor={(i) => i._id}
        renderItem={Row}
        contentContainerStyle={{ paddingBottom: 40 }}
      />
    </View>
  );
}

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    justifyContent: "space-between",
  },
  title: { fontSize: 18, fontWeight: "700" },

  tabs: {
    flexDirection: "row",
    paddingHorizontal: 16,
  },
  tab: {
    flex: 1,
    padding: 12,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
    borderBottomWidth: 2,
    borderColor: "transparent",
  },
  tabActive: { borderColor: "#2563eb" },
  tabText: { fontWeight: "600" },

  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    margin: 16,
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  search: { flex: 1 },

  addBtn: {
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: "#2563eb",
    padding: 14,
    borderRadius: 14,
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  addText: { color: "#fff", fontWeight: "600" },

  tableHeader: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  th: {
    flex: 1,
    fontSize: 11,
    color: "#6b7280",
    fontWeight: "600",
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginVertical: 6,
    padding: 14,
    borderRadius: 14,
    gap: 10,
  },

  colNick: { flex: 1 },
  colNum: { flex: 1 },
  colLoc: { flex: 1 },

  nick: { fontWeight: "600" },
  sub: { fontSize: 12, color: "#6b7280" },
  mono: { fontFamily: "monospace" },

  swipeBtn: {
    justifyContent: "center",
    alignItems: "center",
    width: 70,
  },
  editBtn: { backgroundColor: "#2563eb" },
  deleteBtn: { backgroundColor: "#ef4444" },
});
