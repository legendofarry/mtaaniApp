// src/profile/Profile.js
import React, { useRef } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Switch,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../common/ThemeProvider";
import { useAuth } from "../store/useAuth"; // Zustand store

export default function Profile() {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const { logoutAndReset } = useAuth(); // Zustand clear function
  const opacity = useRef(new Animated.Value(1)).current;

  // Fade-out animation
  const fadeOut = () => {
    return new Promise((resolve) => {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 450,
        useNativeDriver: true,
      }).start(() => resolve());
    });
  };

  return (
    <Animated.View style={{ flex: 1, opacity }}>
      <Animated.ScrollView
        style={{ flex: 1, backgroundColor: theme.colors.background }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 30 }}
      >
        {/* Header */}
        <LinearGradient
          colors={["#667eea", "#764ba2"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <View style={styles.profileImageContainer}>
              <Image
                source={{
                  uri: "https://api.dicebear.com/7.x/avataaars/svg?seed=profile",
                }}
                style={styles.profileImage}
              />
              <View style={styles.onlineIndicator} />
              <TouchableOpacity style={styles.editPhotoButton}>
                <Ionicons name="camera" size={16} color="#FFF" />
              </TouchableOpacity>
            </View>

            <Text style={styles.userName}>Alex Morgan</Text>
            <Text style={styles.userEmail}>alex.morgan@example.com</Text>

            <View style={styles.membershipBadge}>
              <Ionicons name="diamond" size={12} color="#FFD700" />
              <Text style={styles.membershipText}>Premium Member</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <Animated.View style={styles.statCard}>
            <View
              style={[
                styles.statIconContainer,
                { backgroundColor: "rgba(59, 130, 246, 0.1)" },
              ]}
            >
              <Ionicons name="time" size={24} color="#3b82f6" />
            </View>
            <Text style={styles.statNumber}>24</Text>
            <Text style={styles.statLabel}>In Progress</Text>
          </Animated.View>

          <Animated.View style={styles.statCard}>
            <View
              style={[
                styles.statIconContainer,
                { backgroundColor: "rgba(234, 179, 8, 0.1)" },
              ]}
            >
              <Ionicons name="star" size={24} color="#eab308" />
            </View>
            <Text style={styles.statNumber}>4.9</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </Animated.View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text
            style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}
          >
            Quick Actions
          </Text>

          <View style={styles.quickActionsGrid}>
            <TouchableOpacity style={styles.actionCard}>
              <View
                style={[
                  styles.actionIcon,
                  { backgroundColor: "rgba(139, 92, 246, 0.1)" },
                ]}
              >
                <Ionicons name="settings" size={22} color="#8b5cf6" />
              </View>
              <Text style={styles.actionText}>Settings</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard}>
              <View
                style={[
                  styles.actionIcon,
                  { backgroundColor: "rgba(14, 165, 233, 0.1)" },
                ]}
              >
                <Ionicons name="shield-checkmark" size={22} color="#0ea5e9" />
              </View>
              <Text style={styles.actionText}>Security</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard}>
              <View
                style={[
                  styles.actionIcon,
                  { backgroundColor: "rgba(236, 72, 153, 0.1)" },
                ]}
              >
                <Ionicons name="notifications" size={22} color="#ec4899" />
              </View>
              <Text style={styles.actionText}>Notifications</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard}>
              <View
                style={[
                  styles.actionIcon,
                  { backgroundColor: "rgba(34, 197, 94, 0.1)" },
                ]}
              >
                <Ionicons name="help-circle" size={22} color="#22c55e" />
              </View>
              <Text style={styles.actionText}>Help</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Logout */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={async () => {
            await fadeOut();
            await fadeOut();
            navigation.replace("LogoutSplash");
          }}
          activeOpacity={0.7}
        >
          <Ionicons name="log-out-outline" size={22} color="#ef4444" />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>Version 1.0.0 • © 2025</Text>
      </Animated.ScrollView>
    </Animated.View>
  );
}

// ==============================
//          STYLES
// ==============================
const styles = StyleSheet.create({
  headerGradient: {
    paddingTop: 60,
    paddingBottom: 40,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: { alignItems: "center" },
  profileImageContainer: { position: "relative", marginBottom: 16 },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  onlineIndicator: {
    position: "absolute",
    bottom: 6,
    right: 6,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#22c55e",
    borderWidth: 2,
    borderColor: "#FFFFFF",
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
    marginBottom: 12,
  },
  membershipBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  membershipText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginTop: -25,
    marginBottom: 30,
  },
  statCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    flex: 1,
    marginHorizontal: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
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
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  seeAllText: {
    color: "#667eea",
    fontSize: 14,
    fontWeight: "600",
  },
  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  actionCard: {
    flex: 1,
    minWidth: "47%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  actionText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    padding: 18,
    borderRadius: 16,
    marginTop: 10,
    marginBottom: 20,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ef4444",
  },
  versionText: {
    textAlign: "center",
    color: "#9ca3af",
    fontSize: 12,
    marginTop: 10,
  },
});
