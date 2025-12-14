// src/modules/water/WaterHome.js
import React, { useRef, useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  RefreshControl,
} from "react-native";
import { useTheme } from "../../common/ThemeProvider";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

export default function WaterHome({ navigation }) {
  const { theme } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [waterStatus, setWaterStatus] = useState("available"); // available, unavailable, low-pressure

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    animateIn();
  }, []);

  const animateIn = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 40,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const onRefresh = async () => {
    setRefreshing(true);
    // TODO: Fetch latest water status
    setTimeout(() => setRefreshing(false), 1000);
  };

  const getStatusColor = () => {
    switch (waterStatus) {
      case "available":
        return "#22c55e";
      case "low-pressure":
        return "#eab308";
      case "unavailable":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  const getStatusText = () => {
    switch (waterStatus) {
      case "available":
        return "Water Available";
      case "low-pressure":
        return "Low Pressure";
      case "unavailable":
        return "No Water";
      default:
        return "Unknown";
    }
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
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      {/* Header */}
      <LinearGradient colors={["#3b82f6", "#2563eb"]} style={styles.header}>
        <Animated.View
          style={[
            styles.headerContent,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.headerLeft}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backBtn}
            >
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <View>
              <Text style={styles.headerTitle}>Water</Text>
              <Text style={styles.headerSubtitle}>Real-time monitoring</Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => navigation.navigate("AreaChat")}
            style={styles.chatBtn}
          >
            <Ionicons name="chatbubbles" size={24} color="#fff" />
            <View style={styles.chatBadge}>
              <Text style={styles.chatBadgeText}>3</Text>
            </View>
          </TouchableOpacity>
        </Animated.View>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
          />
        }
      >
        {/* Status Card - Large */}
        <AnimatedCard delay={100}>
          <View
            style={[
              styles.statusCard,
              { backgroundColor: theme.colors.surface },
            ]}
          >
            <View
              style={[
                styles.statusIndicator,
                { backgroundColor: getStatusColor() },
              ]}
            >
              <Ionicons name="water" size={32} color="#fff" />
            </View>
            <Text
              style={[styles.statusTitle, { color: theme.colors.textPrimary }]}
            >
              {getStatusText()}
            </Text>
            <Text
              style={[
                styles.statusSubtitle,
                { color: theme.colors.textSecondary },
              ]}
            >
              in your area • Updated 12 min ago
            </Text>
            <View style={styles.statusDetails}>
              <View style={styles.statusDetail}>
                <Ionicons
                  name="speedometer"
                  size={18}
                  color={theme.colors.textSecondary}
                />
                <Text
                  style={[
                    styles.statusDetailText,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  Medium pressure
                </Text>
              </View>
              <View style={styles.statusDetail}>
                <Ionicons
                  name="time"
                  size={18}
                  color={theme.colors.textSecondary}
                />
                <Text
                  style={[
                    styles.statusDetailText,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  Last change 2h ago
                </Text>
              </View>
            </View>
          </View>
        </AnimatedCard>

        {/* Quick Actions */}
        <View style={styles.section}>
          <View style={styles.quickActions}>
            <AnimatedCard delay={200}>
              <TouchableOpacity
                style={[
                  styles.quickActionCard,
                  { backgroundColor: theme.colors.surface },
                ]}
                onPress={() => navigation.navigate("ReportWater")}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={["#3b82f6", "#2563eb"]}
                  style={styles.quickActionIcon}
                >
                  <Ionicons name="add" size={24} color="#fff" />
                </LinearGradient>
                <Text
                  style={[
                    styles.quickActionText,
                    { color: theme.colors.textPrimary },
                  ]}
                >
                  Report Status
                </Text>
              </TouchableOpacity>
            </AnimatedCard>

            <AnimatedCard delay={250}>
              <TouchableOpacity
                style={[
                  styles.quickActionCard,
                  { backgroundColor: theme.colors.surface },
                ]}
                onPress={() => navigation.navigate("WaterMap")}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={["#8b5cf6", "#7c3aed"]}
                  style={styles.quickActionIcon}
                >
                  <Ionicons name="map" size={24} color="#fff" />
                </LinearGradient>
                <Text
                  style={[
                    styles.quickActionText,
                    { color: theme.colors.textPrimary },
                  ]}
                >
                  View Map
                </Text>
              </TouchableOpacity>
            </AnimatedCard>

            <AnimatedCard delay={300}>
              <TouchableOpacity
                style={[
                  styles.quickActionCard,
                  { backgroundColor: theme.colors.surface },
                ]}
                onPress={() => navigation.navigate("WaterPrediction")}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={["#10b981", "#059669"]}
                  style={styles.quickActionIcon}
                >
                  <Ionicons name="analytics" size={24} color="#fff" />
                </LinearGradient>
                <Text
                  style={[
                    styles.quickActionText,
                    { color: theme.colors.textPrimary },
                  ]}
                >
                  Prediction
                </Text>
              </TouchableOpacity>
            </AnimatedCard>
          </View>
        </View>

        {/* Nearby Vendors */}
        <AnimatedCard delay={350}>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text
                style={[
                  styles.sectionTitle,
                  { color: theme.colors.textPrimary },
                ]}
              >
                Nearby Vendors
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate("Vendors")}>
                <Text
                  style={{
                    color: theme.colors.primary,
                    fontSize: 13,
                    fontWeight: "600",
                    fontFamily: "Montserrat_700Bold",
                  }}
                >
                  View all
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[
                styles.vendorCard,
                { backgroundColor: theme.colors.surface },
              ]}
              onPress={() =>
                navigation.navigate("VendorDetails", { vendorId: 1 })
              }
              activeOpacity={0.7}
            >
              <View
                style={[styles.vendorIcon, { backgroundColor: "#3b82f615" }]}
              >
                <Ionicons name="bicycle" size={24} color="#3b82f6" />
              </View>
              <View style={styles.vendorContent}>
                <Text
                  style={[
                    styles.vendorName,
                    { color: theme.colors.textPrimary },
                  ]}
                >
                  Mkokoteni Vendor
                </Text>
                <Text
                  style={[
                    styles.vendorDetail,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  KSh 20 per 20L • 200m away
                </Text>
              </View>
              <View style={styles.vendorRating}>
                <Ionicons name="star" size={14} color="#eab308" />
                <Text
                  style={[
                    styles.vendorRatingText,
                    { color: theme.colors.textPrimary },
                  ]}
                >
                  4.8
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={theme.colors.textDisabled}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.vendorCard,
                { backgroundColor: theme.colors.surface },
              ]}
              onPress={() =>
                navigation.navigate("VendorDetails", { vendorId: 2 })
              }
              activeOpacity={0.7}
            >
              <View
                style={[styles.vendorIcon, { backgroundColor: "#10b98115" }]}
              >
                <Ionicons name="storefront" size={24} color="#10b981" />
              </View>
              <View style={styles.vendorContent}>
                <Text
                  style={[
                    styles.vendorName,
                    { color: theme.colors.textPrimary },
                  ]}
                >
                  Water Kiosk
                </Text>
                <Text
                  style={[
                    styles.vendorDetail,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  KSh 5 per L • 400m away
                </Text>
              </View>
              <View style={styles.vendorRating}>
                <Ionicons name="star" size={14} color="#eab308" />
                <Text
                  style={[
                    styles.vendorRatingText,
                    { color: theme.colors.textPrimary },
                  ]}
                >
                  4.6
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={theme.colors.textDisabled}
              />
            </TouchableOpacity>
          </View>
        </AnimatedCard>

        {/* Prediction Banner */}
        <AnimatedCard delay={400}>
          <TouchableOpacity
            style={[
              styles.predictionBanner,
              { backgroundColor: theme.colors.surface },
            ]}
            onPress={() => navigation.navigate("WaterPrediction")}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={["#8b5cf6", "#7c3aed"]}
              style={styles.predictionIconGradient}
            >
              <Ionicons name="sparkles" size={24} color="#fff" />
            </LinearGradient>
            <View style={styles.predictionContent}>
              <Text
                style={[
                  styles.predictionTitle,
                  { color: theme.colors.textPrimary },
                ]}
              >
                Next Water Prediction
              </Text>
              <Text
                style={[
                  styles.predictionValue,
                  { color: theme.colors.primary },
                ]}
              >
                Tomorrow at 8:00 AM
              </Text>
              <Text
                style={[
                  styles.predictionSubtitle,
                  { color: theme.colors.textSecondary },
                ]}
              >
                Based on 14-day pattern analysis
              </Text>
            </View>
            <Ionicons
              name="arrow-forward"
              size={24}
              color={theme.colors.primary}
            />
          </TouchableOpacity>
        </AnimatedCard>

        <View style={{ height: 32 }} />
      </ScrollView>

      {/* FAB - Report Water */}
      <TouchableOpacity
        style={[styles.fab]}
        onPress={() => navigation.navigate("ReportWater")}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={["#3b82f6", "#2563eb"]}
          style={styles.fabGradient}
        >
          <Ionicons name="add" size={28} color="#fff" />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 10,
    paddingBottom: 10,
    paddingHorizontal: 16,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  backBtn: {
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontFamily: "Montserrat_700Bold",
    fontWeight: "700",
    color: "#fff",
  },
  headerSubtitle: {
    fontSize: 12,
    fontFamily: "Montserrat_700Bold",
    color: "#ffffffaa",
    marginTop: 2,
  },
  chatBtn: {
    position: "relative",
  },
  chatBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#ef4444",
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  chatBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontFamily: "Montserrat_700Bold",
    fontWeight: "700",
  },
  statusCard: {
    marginHorizontal: 16,
    marginTop: 20,
    padding: 24,
    borderRadius: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  statusIndicator: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  statusTitle: {
    fontSize: 24,
    fontFamily: "Montserrat_700Bold",
    fontWeight: "700",
    marginBottom: 6,
  },
  statusSubtitle: {
    fontSize: 13,
    fontFamily: "Montserrat_700Bold",
    marginBottom: 16,
  },
  statusDetails: {
    flexDirection: "row",
    gap: 20,
  },
  statusDetail: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statusDetailText: {
    fontSize: 12,
    fontFamily: "Montserrat_700Bold",
  },
  section: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Montserrat_700Bold",
    fontWeight: "700",
  },
  quickActions: {
    flexDirection: "row",
    gap: 12,
  },
  quickActionCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  quickActionText: {
    fontSize: 12,
    fontFamily: "Montserrat_700Bold",
    fontWeight: "600",
    textAlign: "center",
  },
  vendorCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  vendorIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  vendorContent: {
    flex: 1,
  },
  vendorName: {
    fontSize: 15,
    fontFamily: "Montserrat_700Bold",
    fontWeight: "600",
    marginBottom: 3,
  },
  vendorDetail: {
    fontSize: 12,
    fontFamily: "Montserrat_700Bold",
  },
  vendorRating: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginRight: 8,
  },
  vendorRatingText: {
    fontSize: 13,
    fontFamily: "Montserrat_700Bold",
    fontWeight: "600",
  },
  predictionBanner: {
    marginHorizontal: 16,
    padding: 18,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    marginTop: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  predictionIconGradient: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  predictionContent: {
    flex: 1,
  },
  predictionTitle: {
    fontSize: 13,
    fontFamily: "Montserrat_700Bold",
    marginBottom: 4,
  },
  predictionValue: {
    fontSize: 17,
    fontFamily: "Montserrat_700Bold",
    fontWeight: "700",
    marginBottom: 3,
  },
  predictionSubtitle: {
    fontSize: 11,
    fontFamily: "Montserrat_700Bold",
  },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 20,
    borderRadius: 28,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
});
