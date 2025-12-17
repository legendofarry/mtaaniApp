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
  FlatList,
} from "react-native";
import { useTheme } from "../common/ThemeProvider";
import AnimatedBackground from "../common/AnimatedBackground";
import { Button } from "../common/Button";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL, headers } from "../services/api";
import { search } from "kenya-locations";
import { useAuth } from "../store/useAuth";

// Only import Camera on mobile
const Camera = Platform.OS !== "web" ? require("expo-camera").Camera : null;

const SCREEN_WIDTH = Dimensions.get("window").width;

export default function Onboarding({ route, navigation }) {
  const routeParams = route?.params || {};
  const routeUserId = routeParams.userId;
  const routeToken = routeParams.token;

  const [userId, setUserId] = useState(routeUserId || null);
  const [token, setToken] = useState(routeToken || null);

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
  const [error, setError] = useState("");

  // ⭐ Kenya locations autocomplete
  const [areaSearch, setAreaSearch] = useState("");
  const [areaResults, setAreaResults] = useState([]);
  const [showAreaDropdown, setShowAreaDropdown] = useState(false);

  // camera state (only for mobile)
  const [cameraOpen, setCameraOpen] = useState(false);
  const cameraRef = useRef(null);
  const [hasCameraPermission, setHasCameraPermission] = useState(null);
  const [flash, setFlash] = useState(
    Platform.OS !== "web" && Camera ? Camera.Constants.FlashMode.off : "off"
  );

  const auth = useAuth();

  useEffect(() => {
    if (!token) {
      (async () => {
        const t = await AsyncStorage.getItem("token");
        if (t) setToken(t);
      })();
    }
  }, []);

  useEffect(() => {
    if (!userId) {
      (async () => {
        const storedUser = await AsyncStorage.getItem("user");
        const storedToken = await AsyncStorage.getItem("token");

        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          if (parsed?.id || parsed?._id) {
            setUserId(parsed.id || parsed._id);
          }
        }

        if (!token && storedToken) {
          setToken(storedToken);
        }
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

      // ⭐ Fix: Properly set lat/lng
      const newGPS = {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
      };

      setLocation((p) => ({
        ...p,
        gps: newGPS,
      }));

      Alert.alert(
        "Success",
        `GPS coordinates saved: ${newGPS.lat.toFixed(4)}, ${newGPS.lng.toFixed(
          4
        )}`
      );
    } catch (err) {
      console.log("GPS error", err);
      Alert.alert("Error", "Could not get GPS. Try again.");
    }
  };

  // ⭐ Kenya locations search handler
  const handleAreaSearch = (text) => {
    setAreaSearch(text);
    setLocation((p) => ({ ...p, area: text }));

    if (text.length >= 2) {
      try {
        const results = search(text);
        setAreaResults(results.slice(0, 10)); // Limit to 10 results
        setShowAreaDropdown(true);
      } catch (err) {
        console.log("Search error:", err);
        setAreaResults([]);
      }
    } else {
      setAreaResults([]);
      setShowAreaDropdown(false);
    }
  };

  const selectArea = (result) => {
    const areaText = `${result.name}, ${result.parent || ""}`.trim();
    setAreaSearch(areaText);
    setLocation((p) => ({ ...p, area: areaText }));
    setShowAreaDropdown(false);
    setAreaResults([]);
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

    // ⭐ Phone validation: must start with +254 and be correct length
    if (!phone || !phone.startsWith("+254")) {
      const msg = "Phone number must start with +254 (e.g., +254712345678)";
      setError(msg);
      Alert.alert("Invalid phone", msg);
      return false;
    }

    // Kenyan phone format: +254 + 9 digits = 13 chars total
    if (phone.length !== 13) {
      const msg =
        "Phone number must be 13 characters (+254 followed by 9 digits)";
      setError(msg);
      Alert.alert("Invalid phone", msg);
      return false;
    }

    if (!location.area || location.area.trim().length < 2) {
      const msg = "Please enter your area (neighbourhood).";
      setError(msg);
      Alert.alert("Enter area", msg);
      return false;
    }

    const ageNum = parseInt(age, 10);
    if (!age || isNaN(ageNum) || ageNum < 10 || ageNum > 120) {
      const msg = "Please enter a valid age (10-120).";
      setError(msg);
      Alert.alert("Enter age", msg);
      return false;
    }

    setError("");
    console.log("✅ Validation passed!");
    return true;
  };

  // upload / save profile
  const handleSaveProfile = async () => {
    console.log("🚀 Save profile clicked!");
    console.log("UserId:", userId);
    console.log("Token:", token);

    if (!userId) {
      Alert.alert(
        "Session error",
        "User session not found. Please log in again."
      );
      return;
    }

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
        await completeOnboarding();
        // ❌ DO NOT NAVIGATE

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
      await completeOnboarding();
      // ❌ DO NOT NAVIGATE
    } catch (err) {
      setUploading(false);
      console.log("Save profile error", err);
      Alert.alert("Network error", "Could not save profile. Try again.");
    }
  };

  const completeOnboarding = async () => {
    try {
      const storedUser = await AsyncStorage.getItem("user");
      const storedToken = token || (await AsyncStorage.getItem("token"));

      if (!storedUser || !storedToken) {
        console.warn("⚠️ Missing session data", { storedUser, storedToken });
        throw new Error("Session missing");
      }

      const parsedUser = JSON.parse(storedUser);

      // ✅ Update auth store (THIS drives routing)
      auth.restoreAuth(
        {
          ...parsedUser,
          onboardingCompleted: true,
        },
        storedToken
      );

      // ✅ HARD RESET navigation → HOME
      navigation.reset({
        index: 0,
        routes: [{ name: "MainStack" }],
      });
    } catch (err) {
      console.error("Complete onboarding error:", err);
      Alert.alert(
        "Error",
        "Something went wrong finishing onboarding. Please restart the app."
      );
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
              placeholder="+254...."
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
              placeholder=""
              placeholderTextColor={theme.colors.textDisabled}
              style={[styles.input, { color: theme.colors.textPrimary }]}
              keyboardType="number-pad"
              value={age}
              onChangeText={setAge}
            />
          </View>

          {/* Location area with autocomplete */}
          <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
            Area (neighbourhood)
          </Text>
          <View style={{ position: "relative" }}>
            <View style={styles.inputRow}>
              <Ionicons
                name="location-outline"
                size={20}
                color={theme.colors.primary}
              />
              <TextInput
                placeholder=""
                placeholderTextColor={theme.colors.textDisabled}
                style={[styles.input, { color: theme.colors.textPrimary }]}
                value={areaSearch}
                onChangeText={handleAreaSearch}
                onFocus={() =>
                  areaSearch.length >= 2 && setShowAreaDropdown(true)
                }
              />
            </View>

            {/* ⭐ Dropdown results */}
            {showAreaDropdown && areaResults.length > 0 && (
              <View style={styles.dropdown}>
                <FlatList
                  data={areaResults}
                  keyExtractor={(item, index) => `${item.name}-${index}`}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.dropdownItem}
                      onPress={() => selectArea(item)}
                    >
                      <Ionicons name="location" size={16} color="#6b7280" />
                      <View style={{ marginLeft: 8 }}>
                        <Text style={styles.dropdownName}>{item.name}</Text>
                        {item.parent && (
                          <Text style={styles.dropdownParent}>
                            {item.parent}
                          </Text>
                        )}
                      </View>
                    </TouchableOpacity>
                  )}
                  style={{ maxHeight: 200 }}
                />
              </View>
            )}
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
              placeholder=""
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
                  placeholder=""
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
                  placeholder="House Label"
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
            Landmark
          </Text>
          <View style={styles.inputRow}>
            <Ionicons
              name="map-outline"
              size={20}
              color={theme.colors.textSecondary}
            />
            <TextInput
              placeholder="optional"
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

          {/* ⭐ Error message */}
          {error ? (
            <View
              style={{
                backgroundColor: "#fee2e2",
                padding: 12,
                borderRadius: 8,
                marginBottom: 12,
              }}
            >
              <Text style={{ color: "#dc2626", fontSize: 14 }}>{error}</Text>
            </View>
          ) : null}

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
            <Button
              title="Finish & Go to Home"
              onPress={handleSaveProfile}
              disabled={uploading}
            />
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
