// /src/auth/Onboarding.js
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { useTheme } from "../common/ThemeProvider";
import AnimatedBackground from "../common/AnimatedBackground";
import { Button } from "../common/Button";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL, headers } from "../services/api";

// Only import Camera on mobile
const Camera = Platform.OS !== "web" ? require("expo-camera").Camera : null;

const SCREEN_WIDTH = Dimensions.get("window").width;

export default function Onboarding({ route, navigation }) {
  const { userId, token: routeToken } = route.params || {};
  const { theme } = useTheme();

  // profile fields
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("other");
  const [age, setAge] = useState("");
  const [location, setLocation] = useState({
    area: "",
    estate: "",
    apartmentName: "",
    plotNumber: "",
    block: "",
    floor: "",
    houseNumber: "",
    landmark: "",
    gps: { lat: null, lng: null },
  });

  // avatar state
  const [avatarLocalUri, setAvatarLocalUri] = useState(null);
  const [avatarBase64, setAvatarBase64] = useState(null);
  const [uploading, setUploading] = useState(false);

  // camera state (only for mobile)
  const [cameraOpen, setCameraOpen] = useState(false);
  const cameraRef = useRef(null);
  const [hasCameraPermission, setHasCameraPermission] = useState(null);
  const [flash, setFlash] = useState(
    Platform.OS !== "web" && Camera ? Camera.Constants.FlashMode.off : "off"
  );

  const [token, setToken] = useState(routeToken || null);

  useEffect(() => {
    if (!token) {
      (async () => {
        const t = await AsyncStorage.getItem("token");
        if (t) setToken(t);
      })();
    }
  }, []);

  // request camera permissions on mount (mobile only)
  useEffect(() => {
    if (Platform.OS !== "web" && Camera) {
      (async () => {
        const { status } = await Camera.requestCameraPermissionsAsync();
        setHasCameraPermission(status === "granted");
      })();
    }
  }, []);

  // helper: open image gallery
  const pickImageFromGallery = async () => {
    try {
      const res = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (res.status !== "granted") {
        Alert.alert(
          "Permission required",
          "Allow gallery access to choose a photo."
        );
        return;
      }
      const pick = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"], // ⭐ Fixed deprecation
        quality: 0.8,
        base64: true,
      });
      if (!pick.cancelled && !pick.canceled) {
        setAvatarLocalUri(pick.uri);
        setAvatarBase64(
          pick.base64 ? `data:image/jpeg;base64,${pick.base64}` : null
        );
      }
    } catch (err) {
      console.log("Gallery error", err);
      Alert.alert("Error", "Could not pick image. Try again.");
    }
  };

  // helper: open camera capture (mobile only)
  const openCamera = () => {
    if (Platform.OS === "web") {
      Alert.alert(
        "Camera unavailable",
        "Camera is not available on web. Please use gallery."
      );
      return;
    }
    if (hasCameraPermission === false) {
      Alert.alert(
        "Camera permission",
        "Camera permission is required to take a selfie."
      );
      return;
    }
    setCameraOpen(true);
  };

  // capture photo (mobile only)
  const capturePhoto = async () => {
    if (Platform.OS === "web") return;
    try {
      if (!cameraRef.current) return;
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: true,
      });
      setAvatarLocalUri(photo.uri);
      setAvatarBase64(
        photo.base64 ? `data:image/jpeg;base64,${photo.base64}` : null
      );
      setCameraOpen(false);
    } catch (err) {
      console.log("Capture error", err);
      Alert.alert("Error", "Failed to take photo. Try again.");
    }
  };

  // GPS fetching helper
  const fetchGPS = async () => {
    try {
      const Location = await import("expo-location");
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Location required", "Allow location to auto-fill GPS.");
        return;
      }
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Highest,
      });
      setLocation((p) => ({
        ...p,
        gps: { lat: pos.coords.latitude, lng: pos.coords.longitude },
      }));
    } catch (err) {
      console.log("GPS error", err);
      Alert.alert("Error", "Could not get GPS. Try again.");
    }
  };

  // determine default avatar asset
  const getDefaultAvatar = () => {
    if (gender === "male") return require("../../assets/avatars/male.png");
    if (gender === "female") return require("../../assets/avatars/female.png");
    return require("../../assets/avatars/female.png");
  };

  // Validate required fields
  const validate = () => {
    console.log("🔍 Validating fields...");
    console.log("Phone:", phone);
    console.log("Area:", location.area);
    console.log("Age:", age);

    if (!phone || phone.length < 7) {
      Alert.alert("Enter phone", "Please enter a valid phone number.");
      return false;
    }
    if (!location.area || location.area.trim().length < 2) {
      Alert.alert("Enter area", "Please enter your area (neighbourhood).");
      return false;
    }

    const ageNum = parseInt(age, 10);
    if (!age || isNaN(ageNum) || ageNum < 10 || ageNum > 120) {
      Alert.alert("Enter age", "Please enter a valid age (10-120).");
      return false;
    }

    console.log("✅ Validation passed!");
    return true;
  };

  // upload / save profile
  const handleSaveProfile = async () => {
    console.log("🚀 Save profile clicked!");
    console.log("UserId:", userId);
    console.log("Token:", token);

    if (!validate()) return;
    setUploading(true);

    try {
      const url = `${API_URL}/users/${userId}`;
      const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

      // If we have avatar, upload it
      if (avatarLocalUri) {
        const form = new FormData();
        form.append("phone", phone);
        form.append("gender", gender);
        form.append("age", `${age}`);
        form.append("location", JSON.stringify(location));
        form.append("onboardingCompleted", "true"); // ⭐ Mark as completed

        const filename = avatarLocalUri.split("/").pop();
        const match = /\.(\w+)$/.exec(filename || "");
        const filetype = match ? `image/${match[1]}` : "image/jpeg";

        let fileToUpload;
        try {
          const response = await fetch(avatarLocalUri);
          const blob = await response.blob();
          fileToUpload = {
            uri: avatarLocalUri,
            name: filename || `avatar.${match ? match[1] : "jpg"}`,
            type: filetype,
          };
          form.append("avatar", fileToUpload);
        } catch (err) {
          console.log("Form file fetch failed", err);
          if (avatarBase64) {
            form.append("avatarBase64", avatarBase64);
          }
        }

        const res = await fetch(url, {
          method: "PUT",
          headers: {
            ...authHeaders,
            Accept: "application/json",
          },
          body: form,
        });

        const resJson = await res.json();
        setUploading(false);

        if (!res.ok) {
          console.log("Save profile (form) failed", resJson);
          Alert.alert("Failed", resJson.message || "Could not save profile.");
          return;
        }

        await AsyncStorage.setItem("user", JSON.stringify(resJson.user || {}));
        navigation.reset &&
          navigation.reset({ index: 0, routes: [{ name: "Tabs" }] });
        return;
      }

      // No avatar - use default
      const payload = {
        phone,
        gender,
        age: parseInt(age, 10),
        location,
        onboardingCompleted: true, // ⭐ Mark as completed
        useDefaultAvatar: true,
        defaultAvatarGender:
          gender === "male"
            ? "male"
            : gender === "female"
            ? "female"
            : "neutral",
      };

      const res2 = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(authHeaders || {}),
        },
        body: JSON.stringify(payload),
      });

      const json2 = await res2.json();
      setUploading(false);

      if (!res2.ok) {
        console.log("Save profile (json) failed", json2);
        Alert.alert("Failed", json2.message || "Could not save profile.");
        return;
      }

      await AsyncStorage.setItem("user", JSON.stringify(json2.user || {}));
      navigation.reset &&
        navigation.reset({
          index: 0,
          routes: [{ name: "Tabs" }],
        });
    } catch (err) {
      setUploading(false);
      console.log("Save profile error", err);
      Alert.alert("Network error", "Could not save profile. Try again.");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1, backgroundColor: theme.colors.background }}
    >
      <AnimatedBackground small />

      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.header, { color: theme.colors.textPrimary }]}>
            Complete your profile
          </Text>

          <Text style={[styles.hint, { color: theme.colors.textSecondary }]}>
            Tell us a bit more to personalize your experience.
          </Text>

          {/* Selfie / Avatar */}
          <View style={styles.avatarRow}>
            <View style={styles.avatarPreview}>
              {avatarLocalUri ? (
                <Image
                  source={{ uri: avatarLocalUri }}
                  style={styles.avatarImage}
                />
              ) : (
                <Image source={getDefaultAvatar()} style={styles.avatarImage} />
              )}
            </View>

            <View style={{ flex: 1, marginLeft: 12 }}>
              {Platform.OS !== "web" && (
                <>
                  <Button title="Take selfie" onPress={openCamera} />
                  <View style={{ height: 10 }} />
                </>
              )}
              <Button
                title="Choose from gallery"
                variant="secondary"
                onPress={pickImageFromGallery}
              />
              <View style={{ height: 8 }} />
              <TouchableOpacity
                onPress={() => {
                  setAvatarLocalUri(null);
                  setAvatarBase64(null);
                  Alert.alert(
                    "Skipped",
                    "You can change avatar later in profile settings."
                  );
                }}
              >
                <Text
                  style={{ color: theme.colors.textSecondary, marginTop: 8 }}
                >
                  Skip
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Camera inline (mobile only) */}
          {Platform.OS !== "web" &&
            cameraOpen &&
            hasCameraPermission &&
            Camera && (
              <View style={styles.cameraContainer}>
                <Camera
                  style={styles.cameraPreview}
                  type={Camera.Constants.Type.front}
                  flashMode={flash}
                  ref={cameraRef}
                >
                  <View style={styles.cameraTop}>
                    <TouchableOpacity
                      onPress={() =>
                        setFlash((f) =>
                          f === Camera.Constants.FlashMode.off
                            ? Camera.Constants.FlashMode.torch
                            : Camera.Constants.FlashMode.off
                        )
                      }
                    >
                      <Ionicons name="flash" size={28} color="#fff" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setCameraOpen(false)}>
                      <Ionicons name="close" size={28} color="#fff" />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.cameraBottom}>
                    <TouchableOpacity
                      onPress={capturePhoto}
                      style={styles.captureButton}
                    >
                      <View style={styles.captureInner} />
                    </TouchableOpacity>
                  </View>
                </Camera>
              </View>
            )}

          {/* Phone */}
          <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
            Phone
          </Text>
          <View style={styles.inputRow}>
            <Ionicons
              name="call-outline"
              size={20}
              color={theme.colors.textSecondary}
            />
            <TextInput
              placeholder="Phone number"
              placeholderTextColor={theme.colors.textDisabled}
              style={[styles.input, { color: theme.colors.textPrimary }]}
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />
          </View>

          {/* Gender */}
          <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
            Gender
          </Text>
          <View style={styles.genderRow}>
            <TouchableOpacity
              style={[
                styles.genderBtn,
                gender === "male" && styles.genderBtnActive,
              ]}
              onPress={() => setGender("male")}
            >
              <Text
                style={[
                  styles.genderText,
                  gender === "male" && styles.genderTextActive,
                ]}
              >
                Male
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.genderBtn,
                gender === "female" && styles.genderBtnActive,
              ]}
              onPress={() => setGender("female")}
            >
              <Text
                style={[
                  styles.genderText,
                  gender === "female" && styles.genderTextActive,
                ]}
              >
                Female
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.genderBtn,
                gender === "other" && styles.genderBtnActive,
              ]}
              onPress={() => setGender("other")}
            >
              <Text
                style={[
                  styles.genderText,
                  gender === "other" && styles.genderTextActive,
                ]}
              >
                Other
              </Text>
            </TouchableOpacity>
          </View>

          {/* Age */}
          <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
            Age
          </Text>
          <View style={styles.inputRow}>
            <Ionicons
              name="calendar-outline"
              size={20}
              color={theme.colors.textSecondary}
            />
            <TextInput
              placeholder="Age"
              placeholderTextColor={theme.colors.textDisabled}
              style={[styles.input, { color: theme.colors.textPrimary }]}
              keyboardType="number-pad"
              value={age}
              onChangeText={setAge}
            />
          </View>

          {/* Location area */}
          <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
            Area (neighbourhood)
          </Text>
          <View style={styles.inputRow}>
            <Ionicons
              name="location-outline"
              size={20}
              color={theme.colors.textSecondary}
            />
            <TextInput
              placeholder="Area (e.g., Kayole Soweto)"
              placeholderTextColor={theme.colors.textDisabled}
              style={[styles.input, { color: theme.colors.textPrimary }]}
              value={location.area}
              onChangeText={(t) => setLocation((p) => ({ ...p, area: t }))}
            />
          </View>

          {/* Optional address details */}
          <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
            Estate / Apartment (optional)
          </Text>
          <View style={styles.inputRow}>
            <Ionicons
              name="home-outline"
              size={20}
              color={theme.colors.textSecondary}
            />
            <TextInput
              placeholder="Estate or apartment name"
              placeholderTextColor={theme.colors.textDisabled}
              style={[styles.input, { color: theme.colors.textPrimary }]}
              value={location.estate}
              onChangeText={(t) => setLocation((p) => ({ ...p, estate: t }))}
            />
          </View>

          <View style={{ flexDirection: "row", gap: 8 }}>
            <View style={{ flex: 1 }}>
              <Text
                style={[styles.label, { color: theme.colors.textSecondary }]}
              >
                Block
              </Text>
              <View style={styles.inputRow}>
                <TextInput
                  placeholder="Block"
                  placeholderTextColor={theme.colors.textDisabled}
                  style={[styles.input, { color: theme.colors.textPrimary }]}
                  value={location.block}
                  onChangeText={(t) => setLocation((p) => ({ ...p, block: t }))}
                />
              </View>
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={[styles.label, { color: theme.colors.textSecondary }]}
              >
                House No
              </Text>
              <View style={styles.inputRow}>
                <TextInput
                  placeholder="House No"
                  placeholderTextColor={theme.colors.textDisabled}
                  style={[styles.input, { color: theme.colors.textPrimary }]}
                  value={location.houseNumber}
                  onChangeText={(t) =>
                    setLocation((p) => ({ ...p, houseNumber: t }))
                  }
                />
              </View>
            </View>
          </View>

          <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
            Landmark (optional)
          </Text>
          <View style={styles.inputRow}>
            <Ionicons
              name="map-outline"
              size={20}
              color={theme.colors.textSecondary}
            />
            <TextInput
              placeholder="Landmark"
              placeholderTextColor={theme.colors.textDisabled}
              style={[styles.input, { color: theme.colors.textPrimary }]}
              value={location.landmark}
              onChangeText={(t) => setLocation((p) => ({ ...p, landmark: t }))}
            />
          </View>

          <TouchableOpacity onPress={fetchGPS} style={{ marginTop: 8 }}>
            <Text style={{ color: theme.colors.primary }}>Use current GPS</Text>
          </TouchableOpacity>

          <View style={{ height: 14 }} />

          {uploading ? (
            <View style={{ alignItems: "center" }}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text
                style={{ marginTop: 10, color: theme.colors.textSecondary }}
              >
                Saving profile...
              </Text>
            </View>
          ) : (
            <>
              <TouchableOpacity
                onPress={() => console.log("TEST: Button was pressed!")}
                style={{
                  padding: 10,
                  backgroundColor: "red",
                  marginBottom: 10,
                }}
              >
                <Text style={{ color: "white" }}>TEST BUTTON (DELETE ME)</Text>
              </TouchableOpacity>

              <Button
                title="Finish & Go to Home"
                onPress={handleSaveProfile}
                disabled={uploading}
              />
            </>
          )}

          <View style={{ height: 28 }} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { paddingVertical: 24, flexGrow: 1 },
  card: {
    marginHorizontal: 16,
    padding: 18,
    borderRadius: 18,
  },

  header: { fontSize: 24, fontWeight: "700", marginBottom: 8 },
  hint: { fontSize: 13, marginBottom: 12 },

  avatarRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  avatarPreview: {
    width: 110,
    height: 110,
    borderRadius: 55,
    overflow: "hidden",
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarImage: { width: "100%", height: "100%" },

  label: { marginTop: 8, marginBottom: 6, fontWeight: "600" },

  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: "#fff",
    borderColor: "#E6E6E6",
    gap: 10,
  },

  input: { flex: 1, fontSize: 16 },

  genderRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
    flexWrap: "wrap",
  },
  genderBtn: {
    borderWidth: 1,
    borderColor: "#E6E6E6",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: "#fff",
  },
  genderBtnActive: { borderColor: "#0B68FF", backgroundColor: "#EAF2FF" },
  genderText: { fontSize: 14 },
  genderTextActive: { color: "#0B68FF", fontWeight: "700" },

  cameraContainer: {
    marginVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: 360,
    borderRadius: 12,
    overflow: "hidden",
  },
  cameraPreview: { width: "100%", height: "100%" },
  cameraTop: {
    marginTop: 12,
    marginHorizontal: 12,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cameraBottom: {
    flex: 1,
    justifyContent: "flex-end",
    paddingBottom: 18,
    alignItems: "center",
  },
  captureButton: {
    width: 78,
    height: 78,
    borderRadius: 39,
    borderWidth: 6,
    borderColor: "rgba(255,255,255,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  captureInner: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#fff",
  },
});
