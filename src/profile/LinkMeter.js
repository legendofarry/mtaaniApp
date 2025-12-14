import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

import { useAuth } from "../store/useAuth";
import { API_URL, headers } from "../services/api";

export default function LinkMeter({ route }) {
  const navigation = useNavigation();
  const token = useAuth((s) => s.token);

  const existingMeters = route?.params?.meters || [];
  const presetType = route?.params?.type || null;

  const [type, setType] = useState(presetType);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    meterNumber: "",
    nickname: "",
    location: {
      area: "",
      estate: "",
      apartment: "",
      block: "",
      houseNumber: "",
    },
  });

  /* ---------------- VALIDATION ---------------- */

  const hasMainMeterAlready = useMemo(() => {
    return existingMeters.some(
      (m) => m.type === type && m.nickname?.toLowerCase() === "main meter"
    );
  }, [existingMeters, type]);

  const validate = () => {
    const e = {};

    if (!type) e.type = "Select meter type";

    if (!form.meterNumber.trim()) {
      e.meterNumber = "Meter number is required";
    }

    const nickname = form.nickname.trim() || "Main Meter";

    if (nickname.toLowerCase() === "main meter" && hasMainMeterAlready) {
      e.nickname = "You already have a Main Meter for this type";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  useEffect(() => {
    validate();
    // eslint-disable-next-line
  }, [form, type]);

  /* ---------------- ACTION ---------------- */

  const save = async () => {
    if (!validate()) return;

    try {
      setSaving(true);

      await fetch(`${API_URL}/meters/link`, {
        method: "POST",
        headers: headers(token),
        body: JSON.stringify({
          type,
          meterNumber: form.meterNumber.trim(),
          nickname: form.nickname.trim() || "Main Meter",
          location: form.location,
        }),
      });

      navigation.goBack();
    } finally {
      setSaving(false);
    }
  };

  /* ---------------- UI ---------------- */

  const typeColor = type === "electricity" ? "#f59e0b" : "#0ea5e9";

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={24} />
        </TouchableOpacity>
        <Text style={styles.title}>Link Meter</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* TYPE */}
        <View style={styles.card}>
          <Text style={styles.label}>Meter Type</Text>

          <View style={styles.row}>
            {["electricity", "water"].map((t) => {
              const active = type === t;
              return (
                <TouchableOpacity
                  key={t}
                  style={[
                    styles.typeBtn,
                    active && {
                      borderColor: t === "electricity" ? "#f59e0b" : "#0ea5e9",
                      backgroundColor:
                        t === "electricity" ? "#fff7ed" : "#ecfeff",
                    },
                  ]}
                  onPress={() => setType(t)}
                >
                  <Ionicons
                    name={t === "electricity" ? "flash" : "water"}
                    size={20}
                    color={
                      active
                        ? t === "electricity"
                          ? "#f59e0b"
                          : "#0ea5e9"
                        : "#666"
                    }
                  />
                  <Text
                    style={{
                      fontWeight: "600",
                      color: active ? "#111" : "#666",
                    }}
                  >
                    {t.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {errors.type && <Text style={styles.error}>{errors.type}</Text>}
        </View>

        {/* DETAILS */}
        <View style={styles.card}>
          <Text style={styles.label}>Meter Details</Text>

          <TextInput
            style={[styles.input, errors.meterNumber && styles.inputError]}
            placeholder="Meter Number"
            value={form.meterNumber}
            onChangeText={(v) => setForm({ ...form, meterNumber: v })}
          />
          {errors.meterNumber && (
            <Text style={styles.error}>{errors.meterNumber}</Text>
          )}

          <TextInput
            style={[styles.input, errors.nickname && styles.inputError]}
            placeholder="Nickname (default: Main Meter)"
            value={form.nickname}
            onChangeText={(v) => setForm({ ...form, nickname: v })}
          />
          {errors.nickname && (
            <Text style={styles.error}>{errors.nickname}</Text>
          )}
        </View>

        {/* LOCATION */}
        <View style={styles.card}>
          <Text style={styles.label}>Location</Text>

          {["area", "estate", "apartment", "block", "houseNumber"].map((k) => (
            <TextInput
              key={k}
              style={styles.input}
              placeholder={k}
              value={form.location[k]}
              onChangeText={(v) =>
                setForm({
                  ...form,
                  location: {
                    ...form.location,
                    [k]: v,
                  },
                })
              }
            />
          ))}
        </View>
      </ScrollView>

      {/* SAVE */}
      <TouchableOpacity
        style={[styles.saveBtn, { backgroundColor: typeColor }]}
        onPress={save}
        disabled={saving || Object.keys(errors).length > 0}
      >
        {saving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.saveText}>Link Meter</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f3f4f6" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  title: { fontSize: 17, fontWeight: "600" },

  content: { padding: 16 },

  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 18,
    marginBottom: 16,
  },

  label: { fontWeight: "600", marginBottom: 10 },

  row: { flexDirection: "row", gap: 12 },

  typeBtn: {
    flex: 1,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    alignItems: "center",
    gap: 6,
  },

  input: {
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },

  inputError: {
    borderWidth: 1,
    borderColor: "#ef4444",
  },

  error: {
    color: "#ef4444",
    fontSize: 12,
    marginBottom: 8,
  },

  saveBtn: {
    padding: 18,
    alignItems: "center",
  },

  saveText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});
