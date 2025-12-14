// src/profile/EditProfileWizard.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

import { useAuth } from "../store/useAuth";
import { API_URL, headers } from "../services/api";

const STEPS = ["Profile", "Contact", "Location", "Review"];

export default function EditProfileWizard() {
  const navigation = useNavigation();
  const user = useAuth((s) => s.user);
  const token = useAuth((s) => s.token);

  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    fullName: "",
    phone: "+254",
    avatarBase64: null,
    location: {
      area: "",
      estate: "",
      apartmentName: "",
      plotNumber: "",
      block: "",
      floor: "",
      houseNumber: "",
      landmark: "",
      gps: null,
    },
  });

  /* ---------------- INIT ---------------- */
  useEffect(() => {
    if (!user) return;
    setForm((f) => ({
      ...f,
      fullName: user.fullName || "",
      phone: user.phone || "+254",
      location: { ...f.location, ...user.location },
    }));
  }, [user]);

  /* ---------------- VALIDATION ---------------- */
  const validateStep = () => {
    const e = {};

    if (step === 0 && !form.fullName.trim()) {
      e.fullName = "Full name is required";
    }

    if (step === 1 && !/^\+2547\d{8}$/.test(form.phone)) {
      e.phone = "Enter a valid +2547XXXXXXXX number";
    }

    if (step === 2 && !form.location.area.trim()) {
      e.area = "Area is required";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  /* ---------------- ACTIONS ---------------- */
  const nextStep = () => validateStep() && setStep((s) => s + 1);
  const prevStep = () => setStep((s) => s - 1);

  const pickAvatar = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      base64: true,
      quality: 0.6,
    });

    if (!res.canceled) {
      setForm((f) => ({
        ...f,
        avatarBase64: `data:image/jpeg;base64,${res.assets[0].base64}`,
      }));
    }
  };

  const saveProfile = async () => {
    try {
      setSaving(true);
      const payload = {
        fullName: form.fullName,
        phone: form.phone,
        location: form.location,
        ...(form.avatarBase64 && { avatar: form.avatarBase64 }),
      };

      const res = await fetch(`${API_URL}/users/me`, {
        method: "PUT",
        headers: headers(token),
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) return Alert.alert("Error", data.message || "Update failed");

      await AsyncStorage.setItem("user", JSON.stringify(data.user));
      useAuth.setState({ user: data.user });
      navigation.goBack();
    } catch {
      Alert.alert("Error", "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  /* ---------------- UI ---------------- */

  const progress = ((step + 1) / STEPS.length) * 100 + "%";

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Progress */}
      <View style={styles.progressWrap}>
        <Text style={styles.stepText}>
          Step {step + 1} of {STEPS.length}
        </Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: progress }]} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* STEP 1 – PROFILE */}
        {step === 0 && (
          <View style={styles.card}>
            <TouchableOpacity style={styles.avatar} onPress={pickAvatar}>
              {form.avatarBase64 ? (
                <Image
                  source={{ uri: form.avatarBase64 }}
                  style={styles.avatarImg}
                />
              ) : (
                <Ionicons name="camera" size={28} color="#6b7280" />
              )}
            </TouchableOpacity>

            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              value={form.fullName}
              onChangeText={(t) => setForm((f) => ({ ...f, fullName: t }))}
            />
            {errors.fullName && (
              <Text style={styles.error}>{errors.fullName}</Text>
            )}
          </View>
        )}

        {/* STEP 2 – CONTACT */}
        {step === 1 && (
          <View style={styles.card}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.readonlyInput}>
              <Text style={styles.readonlyText}>{user.email}</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate("EditEmail")}
              >
                <Ionicons name="pencil" size={18} />
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={styles.input}
              keyboardType="phone-pad"
              value={form.phone}
              onChangeText={(t) => setForm((f) => ({ ...f, phone: t }))}
            />
            {errors.phone && <Text style={styles.error}>{errors.phone}</Text>}
          </View>
        )}

        {/* STEP 3 – LOCATION */}

        {step === 2 && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Location Details</Text>

            <Text style={styles.label}>Area *</Text>
            <TextInput
              style={styles.input}
              value={form.location.area}
              onChangeText={(t) =>
                setForm((f) => ({
                  ...f,
                  location: { ...f.location, area: t },
                }))
              }
            />
            {errors.area && <Text style={styles.error}>{errors.area}</Text>}

            <Text style={styles.label}>Estate</Text>
            <TextInput
              style={styles.input}
              value={form.location.estate}
              onChangeText={(t) =>
                setForm((f) => ({
                  ...f,
                  location: { ...f.location, estate: t },
                }))
              }
            />

            <Text style={styles.label}>Apartment Name</Text>
            <TextInput
              style={styles.input}
              value={form.location.apartmentName}
              onChangeText={(t) =>
                setForm((f) => ({
                  ...f,
                  location: { ...f.location, apartmentName: t },
                }))
              }
            />

            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Block</Text>
                <TextInput
                  style={styles.input}
                  value={form.location.block}
                  onChangeText={(t) =>
                    setForm((f) => ({
                      ...f,
                      location: { ...f.location, block: t },
                    }))
                  }
                />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Floor</Text>
                <TextInput
                  style={styles.input}
                  value={form.location.floor}
                  onChangeText={(t) =>
                    setForm((f) => ({
                      ...f,
                      location: { ...f.location, floor: t },
                    }))
                  }
                />
              </View>
            </View>

            <Text style={styles.label}>House Number</Text>
            <TextInput
              style={styles.input}
              value={form.location.houseNumber}
              onChangeText={(t) =>
                setForm((f) => ({
                  ...f,
                  location: { ...f.location, houseNumber: t },
                }))
              }
            />

            <Text style={styles.label}>Landmark</Text>
            <TextInput
              style={styles.input}
              value={form.location.landmark}
              onChangeText={(t) =>
                setForm((f) => ({
                  ...f,
                  location: { ...f.location, landmark: t },
                }))
              }
            />

            {/* GPS BUTTON */}
            <TouchableOpacity style={styles.gpsBtn}>
              <Ionicons name="location-outline" size={18} color="#2563eb" />
              <Text style={styles.gpsText}>Use current location</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* STEP 4 – REVIEW */}
        {step === 3 && (
          <View style={styles.card}>
            <Text style={styles.review}>Name: {form.fullName}</Text>
            <Text style={styles.review}>Phone: {form.phone}</Text>
            <Text style={styles.review}>Area: {form.location.area}</Text>
          </View>
        )}
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        {step > 0 && (
          <TouchableOpacity onPress={prevStep}>
            <Text style={styles.footerSecondary}>Back</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          onPress={step === 3 ? saveProfile : nextStep}
          disabled={saving}
          style={{ flex: 1 }}
        >
          <LinearGradient
            colors={["#2563eb", "#1d4ed8"]}
            style={styles.footerPrimary}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.footerText}>
                {step === 3 ? "Save Changes" : "Next"}
              </Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

/* ---------------- STYLES ---------------- */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  headerTitle: { fontSize: 18, fontWeight: "600" },
  progressWrap: { padding: 16 },
  stepText: { fontSize: 12, color: "#6b7280", marginBottom: 6 },
  progressBar: { height: 6, backgroundColor: "#e5e7eb", borderRadius: 6 },
  progressFill: { height: 6, backgroundColor: "#2563eb", borderRadius: 6 },
  content: { padding: 16 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  avatar: {
    alignSelf: "center",
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  avatarImg: { width: 96, height: 96, borderRadius: 48 },
  label: { fontSize: 14, marginBottom: 6, color: "#374151" },
  input: {
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#f9fafb",
    paddingHorizontal: 14,
    marginBottom: 6,
  },
  readonlyInput: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f3f4f6",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  readonlyText: { color: "#6b7280" },
  error: { fontSize: 12, color: "#dc2626", marginBottom: 6 },
  review: { fontSize: 14, marginBottom: 8 },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  footerSecondary: { fontSize: 15, color: "#6b7280" },
  footerPrimary: {
    height: 52,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  footerText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
