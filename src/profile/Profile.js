// src/profile/Profile.js
import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ScrollView,
  Alert,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../common/ThemeProvider";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "../store/useAuth";
import Modal from "../common/Modal";

export default function Profile() {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const { theme } = useTheme();
  const navigation = useNavigation();
  const [user, setUser] = useState(null);
  const opacity = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const logoutAndReset = useAuth((state) => state.logoutAndReset);

  useEffect(() => {
    loadUser();
    animateIn();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await AsyncStorage.getItem("user");
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (err) {
      console.log("Error loading user:", err);
    }
  };

  const animateIn = () => {
    Animated.spring(slideAnim, {
      toValue: 1,
      tension: 50,
      friction: 8,
      useNativeDriver: true,
    }).start();
  };

  const fadeOut = () => {
    return new Promise((resolve) => {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start(() => resolve());
    });
  };

  const performLogout = async () => {
    console.log("performLogout fired");
    await fadeOut();
    await logoutAndReset();
  };

  const confirmAndLogout = () => {
    setTimeout(() => {
      performLogout();
    }, 0);
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  const confirmLogout = () => {
    setShowLogoutModal(false);
    confirmAndLogout();
  };

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const getInitials = () => {
    if (!user?.fullName) return "U";
    const names = user.fullName.split(" ");
    if (names.length >= 2) {
      return names[0].charAt(0) + names[1].charAt(0);
    }
    return names[0].charAt(0);
  };

  const AnimatedCard = ({ children, delay = 0 }) => {
    const cardAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      Animated.timing(cardAnim, {
        toValue: 1,
        duration: 400,
        delay,
        useNativeDriver: true,
      }).start();
    }, []);

    return (
      <Animated.View
        style={{
          opacity: cardAnim,
          transform: [
            {
              translateY: cardAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0],
              }),
            },
          ],
        }}
      >
        {children}
      </Animated.View>
    );
  };

  return (
    <Animated.View style={[styles.container, { opacity }]}>
      <ScrollView
        style={{ flex: 1, backgroundColor: theme.colors.background }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 30 }}
      >
        {/* Header with Gradient */}
        <LinearGradient
          colors={["#667eea", "#764ba2"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <Animated.View
            style={[
              styles.headerContent,
              {
                opacity: slideAnim,
                transform: [
                  {
                    translateY: slideAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-20, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <TouchableOpacity
              style={styles.profileImageContainer}
              onPress={() => navigation.navigate("EditProfile")}
            >
              {user?.profileImageUrl ? (
                <Image
                  source={{ uri: user.profileImageUrl }}
                  style={styles.profileImage}
                />
              ) : (
                <View style={[styles.profileImage, styles.profilePlaceholder]}>
                  <Text style={styles.profileInitials}>{getInitials()}</Text>
                </View>
              )}
              <View style={styles.editPhotoButton}>
                <Ionicons name="camera" size={14} color="#FFF" />
              </View>
            </TouchableOpacity>

            <Text style={styles.userName}>{user?.fullName || "User"}</Text>
            <Text style={styles.userEmail}>
              {user?.email || "email@example.com"}
            </Text>

            {user?.phone && (
              <Text style={styles.userPhone}>
                <Ionicons name="call" size={12} color="#ffffffaa" />{" "}
                {user.phone}
              </Text>
            )}

            {user?.location?.area && (
              <View style={styles.locationBadge}>
                <Ionicons name="location" size={12} color="#FFF" />
                <Text style={styles.locationText}>{user.location.area}</Text>
              </View>
            )}
          </Animated.View>
        </LinearGradient>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <AnimatedCard delay={100}>
            <View style={styles.statCard}>
              <LinearGradient
                colors={["#3b82f6", "#2563eb"]}
                style={styles.statIconContainer}
              >
                <Ionicons name="water" size={20} color="#FFF" />
              </LinearGradient>
              <Text style={styles.statNumber}>24</Text>
              <Text style={styles.statLabel}>Water Reports</Text>
            </View>
          </AnimatedCard>

          <AnimatedCard delay={150}>
            <View style={styles.statCard}>
              <LinearGradient
                colors={["#eab308", "#ca8a04"]}
                style={styles.statIconContainer}
              >
                <Ionicons name="star" size={20} color="#FFF" />
              </LinearGradient>
              <Text style={styles.statNumber}>4.9</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
          </AnimatedCard>
        </View>

        {/* Quick Actions */}
        <AnimatedCard delay={200}>
          <View style={styles.section}>
            <Text
              style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}
            >
              Account
            </Text>

            <TouchableOpacity
              style={[
                styles.menuItem,
                { backgroundColor: theme.colors.surface },
              ]}
              onPress={() => navigation.navigate("EditProfile")}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIcon, { backgroundColor: "#8b5cf615" }]}>
                <Ionicons name="person" size={20} color="#8b5cf6" />
              </View>
              <Text
                style={[styles.menuText, { color: theme.colors.textPrimary }]}
              >
                Edit Profile
              </Text>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={theme.colors.textDisabled}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.menuItem,
                { backgroundColor: theme.colors.surface },
              ]}
              onPress={() => navigation.navigate("MyMeters")}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIcon, { backgroundColor: "#3b82f615" }]}>
                <Ionicons name="speedometer" size={20} color="#3b82f6" />
              </View>
              <Text
                style={[styles.menuText, { color: theme.colors.textPrimary }]}
              >
                My Meters
              </Text>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={theme.colors.textDisabled}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.menuItem,
                { backgroundColor: theme.colors.surface },
              ]}
              onPress={() => navigation.navigate("TransactionHistory")}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIcon, { backgroundColor: "#10b98115" }]}>
                <Ionicons name="receipt" size={20} color="#10b981" />
              </View>
              <Text
                style={[styles.menuText, { color: theme.colors.textPrimary }]}
              >
                Transaction History
              </Text>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={theme.colors.textDisabled}
              />
            </TouchableOpacity>
          </View>
        </AnimatedCard>

        {/* Settings */}
        <AnimatedCard delay={250}>
          <View style={styles.section}>
            <Text
              style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}
            >
              Settings
            </Text>

            <TouchableOpacity
              style={[
                styles.menuItem,
                { backgroundColor: theme.colors.surface },
              ]}
              onPress={() => navigation.navigate("Notifications")}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIcon, { backgroundColor: "#ec489915" }]}>
                <Ionicons name="notifications" size={20} color="#ec4899" />
              </View>
              <Text
                style={[styles.menuText, { color: theme.colors.textPrimary }]}
              >
                Notifications
              </Text>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={theme.colors.textDisabled}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.menuItem,
                { backgroundColor: theme.colors.surface },
              ]}
              onPress={() => navigation.navigate("Security")}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIcon, { backgroundColor: "#0ea5e915" }]}>
                <Ionicons name="shield-checkmark" size={20} color="#0ea5e9" />
              </View>
              <Text
                style={[styles.menuText, { color: theme.colors.textPrimary }]}
              >
                Security
              </Text>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={theme.colors.textDisabled}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.menuItem,
                { backgroundColor: theme.colors.surface },
              ]}
              onPress={() => navigation.navigate("Privacy")}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIcon, { backgroundColor: "#f59e0b15" }]}>
                <Ionicons name="lock-closed" size={20} color="#f59e0b" />
              </View>
              <Text
                style={[styles.menuText, { color: theme.colors.textPrimary }]}
              >
                Privacy
              </Text>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={theme.colors.textDisabled}
              />
            </TouchableOpacity>
          </View>
        </AnimatedCard>

        {/* Support */}
        <AnimatedCard delay={300}>
          <View style={styles.section}>
            <Text
              style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}
            >
              Support
            </Text>

            <TouchableOpacity
              style={[
                styles.menuItem,
                { backgroundColor: theme.colors.surface },
              ]}
              onPress={() => navigation.navigate("Help")}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIcon, { backgroundColor: "#22c55e15" }]}>
                <Ionicons name="help-circle" size={20} color="#22c55e" />
              </View>
              <Text
                style={[styles.menuText, { color: theme.colors.textPrimary }]}
              >
                Help & Support
              </Text>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={theme.colors.textDisabled}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.menuItem,
                { backgroundColor: theme.colors.surface },
              ]}
              onPress={() => navigation.navigate("About")}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIcon, { backgroundColor: "#6366f115" }]}>
                <Ionicons name="information-circle" size={20} color="#6366f1" />
              </View>
              <Text
                style={[styles.menuText, { color: theme.colors.textPrimary }]}
              >
                About
              </Text>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={theme.colors.textDisabled}
              />
            </TouchableOpacity>
          </View>
        </AnimatedCard>

        {/* Logout Button */}
        <AnimatedCard delay={350}>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={["#ef4444", "#dc2626"]}
              style={styles.logoutGradient}
            >
              <Ionicons name="log-out-outline" size={20} color="#FFF" />
              <Text style={styles.logoutText}>Sign Out</Text>
            </LinearGradient>
          </TouchableOpacity>
        </AnimatedCard>

        <Text style={styles.versionText}>
          Version 1.0.0 • © 2025 MtaaniFlow
        </Text>
      </ScrollView>

      <Modal
        visible={showLogoutModal}
        title="Sign Out"
        message="Are you sure you want to sign out?"
        cancelText="Cancel"
        confirmText="Sign Out"
        onCancel={cancelLogout}
        onConfirm={confirmLogout}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerGradient: {
    paddingTop: 10,
    paddingBottom: 40,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    alignItems: "center",
  },
  profileImageContainer: {
    position: "relative",
    marginBottom: 16,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  profilePlaceholder: {
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  profileInitials: {
    fontSize: 36,
    fontWeight: "700",
    color: "#667eea",
  },
  editPhotoButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#667eea",
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  userName: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 4,
  },
  userPhone: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.7)",
    marginBottom: 12,
  },
  locationBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  locationText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    paddingHorizontal: 20,
    marginTop: -25,
    marginBottom: 24,
    gap: 12,
  },
  statCard: {
    flex: 1,
    width: 130,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  statIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#6b7280",
    fontWeight: "500",
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 14,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  menuText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
  },
  logoutButton: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 20,
    borderRadius: 14,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  logoutGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    gap: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFF",
  },
  versionText: {
    textAlign: "center",
    color: "#9ca3af",
    fontSize: 12,
    marginTop: 10,
    marginBottom: 20,
  },
});
