// src/modules/home/HomeScreen.js
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  RefreshControl,
  Animated,
  Dimensions,
} from "react-native";
import { useTheme } from "../../common/ThemeProvider";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

export default function HomeScreen({ navigation }) {
  const { theme } = useTheme();
  const [user, setUser] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    loadUser();
    animateIn();
  }, []);

  const animateIn = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  };

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

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUser();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const getFirstName = () => {
    if (!user?.fullName) return "User";
    return user.fullName.split(" ")[0];
  };

  const AnimatedCard = ({ children, delay = 0, style }) => {
    const cardAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      Animated.timing(cardAnim, {
        toValue: 1,
        duration: 500,
        delay,
        useNativeDriver: true,
      }).start();
    }, []);

    return (
      <Animated.View
        style={[
          {
            opacity: cardAnim,
            transform: [
              {
                translateY: cardAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                }),
              },
            ],
          },
          style,
        ]}
      >
        {children}
      </Animated.View>
    );
  };

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      {/* Modern Header with Gradient */}
      <LinearGradient
        colors={["#fff"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
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
              activeOpacity={0.8}
              onPress={() => navigation.navigate("Profile")}
              style={styles.avatarContainer}
            >
              {user?.profileImageUrl ? (
                <Image
                  source={{ uri: user.profileImageUrl }}
                  style={styles.avatar}
                />
              ) : (
                <View style={[styles.avatar, styles.avatarPlaceholder]}>
                  <Text style={styles.avatarText}>
                    {getFirstName().charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
              <View style={styles.onlineIndicator} />
            </TouchableOpacity>
            <View style={styles.greetingContainer}>
              <Text style={styles.userName}>{getFirstName()} 👋</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.notificationBtn}
            onPress={() => navigation.navigate("Notifications")}
            activeOpacity={0.7}
          >
            <View style={styles.notificationIconWrap}>
              <Ionicons
                name="notifications-outline"
                size={24}
                color="#023020"
              />
              <View style={styles.notificationDot} />
            </View>
          </TouchableOpacity>
        </Animated.View>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ backgroundColor: "#F7F7F7" }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
          />
        }
      >
        {/* Quick Status Cards */}
        <View style={styles.statusSection}>
          <AnimatedCard delay={100}>
            <TouchableOpacity
              style={[
                styles.statusCard,
                { backgroundColor: theme.colors.surface },
              ]}
              onPress={() => navigation.navigate("Water")}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={["#3b82f6", "#2563eb"]}
                style={styles.statusIconGradient}
              >
                <Ionicons name="water" size={24} color="#fff" />
              </LinearGradient>
              <View style={styles.statusContent}>
                <Text
                  style={[
                    styles.statusLabel,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  Water Status
                </Text>
                <Text
                  style={[
                    styles.statusValue,
                    { color: theme.colors.textPrimary },
                  ]}
                >
                  Available
                </Text>
                <Text
                  style={[
                    styles.statusTime,
                    { color: theme.colors.textDisabled },
                  ]}
                >
                  Updated 10m ago
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={theme.colors.textDisabled}
              />
            </TouchableOpacity>
          </AnimatedCard>

          <AnimatedCard delay={200}>
            <TouchableOpacity
              style={[
                styles.statusCard,
                { backgroundColor: theme.colors.surface },
              ]}
              onPress={() => navigation.navigate("Electricity")}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={["#eab308", "#ca8a04"]}
                style={styles.statusIconGradient}
              >
                <Ionicons name="flash" size={24} color="#fff" />
              </LinearGradient>
              <View style={styles.statusContent}>
                <Text
                  style={[
                    styles.statusLabel,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  Token Balance
                </Text>
                <Text
                  style={[
                    styles.statusValue,
                    { color: theme.colors.textPrimary },
                  ]}
                >
                  8Hrs
                </Text>
                <Text
                  style={[
                    styles.statusTime,
                    { color: theme.colors.textDisabled },
                  ]}
                >
                  2.5 days left
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={theme.colors.textDisabled}
              />
            </TouchableOpacity>
          </AnimatedCard>
        </View>

        {/* Quick Actions Grid */}
        <View style={styles.section}>
          <Text
            style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}
          >
            Quick Actions
          </Text>

          <View style={styles.actionsGrid}>
            <AnimatedCard delay={300}>
              <TouchableOpacity
                style={[
                  styles.actionCard,
                  { backgroundColor: theme.colors.surface },
                ]}
                onPress={() => navigation.navigate("ReportWater")}
                activeOpacity={0.7}
              >
                <View
                  style={[styles.actionIcon, { backgroundColor: "#3b82f615" }]}
                >
                  <Ionicons name="add-circle" size={28} color="#3b82f6" />
                </View>
                <Text
                  style={[
                    styles.actionText,
                    { color: theme.colors.textPrimary },
                  ]}
                >
                  Report Water
                </Text>
              </TouchableOpacity>
            </AnimatedCard>

            <AnimatedCard delay={350}>
              <TouchableOpacity
                style={[
                  styles.actionCard,
                  { backgroundColor: theme.colors.surface },
                ]}
                onPress={() => navigation.navigate("ReportBlackout")}
                activeOpacity={0.7}
              >
                <View
                  style={[styles.actionIcon, { backgroundColor: "#eab30815" }]}
                >
                  <Ionicons name="flash" size={28} color="#eab308" />
                </View>
                <Text
                  style={[
                    styles.actionText,
                    { color: theme.colors.textPrimary },
                  ]}
                >
                  Report Blackout
                </Text>
              </TouchableOpacity>
            </AnimatedCard>

            <AnimatedCard delay={400}>
              <TouchableOpacity
                style={[
                  styles.actionCard,
                  { backgroundColor: theme.colors.surface },
                ]}
                onPress={() => navigation.navigate("WaterPrediction")}
                activeOpacity={0.7}
              >
                <View
                  style={[styles.actionIcon, { backgroundColor: "#8b5cf615" }]}
                >
                  <Ionicons name="time-outline" size={28} color="#8b5cf6" />
                </View>
                <Text
                  style={[
                    styles.actionText,
                    { color: theme.colors.textPrimary },
                  ]}
                >
                  Predictions
                </Text>
              </TouchableOpacity>
            </AnimatedCard>

            <AnimatedCard delay={450}>
              <TouchableOpacity
                style={[
                  styles.actionCard,
                  { backgroundColor: theme.colors.surface },
                ]}
                onPress={() => navigation.navigate("Vendors")}
                activeOpacity={0.7}
              >
                <View
                  style={[styles.actionIcon, { backgroundColor: "#10b98115" }]}
                >
                  <Ionicons name="people-outline" size={28} color="#10b981" />
                </View>
                <Text
                  style={[
                    styles.actionText,
                    { color: theme.colors.textPrimary },
                  ]}
                >
                  Water Vendors
                </Text>
              </TouchableOpacity>
            </AnimatedCard>
          </View>
        </View>

        {/* Recent Updates */}
        <AnimatedCard delay={500} style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text
              style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}
            >
              Recent Updates
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate("ActivityFeed")}
            >
              <Text
                style={{
                  color: theme.colors.primary,
                  fontSize: 13,
                  fontWeight: "600",
                  fontFamily: "Montserrat_600SemiBold",
                }}
              >
                See all
              </Text>
            </TouchableOpacity>
          </View>

          <View
            style={[
              styles.activityCard,
              { backgroundColor: theme.colors.surface },
            ]}
          >
            <TouchableOpacity style={styles.activityItem} activeOpacity={0.7}>
              <View style={styles.activityLeft}>
                <View
                  style={[
                    styles.activityIcon,
                    { backgroundColor: "#22c55e20" },
                  ]}
                >
                  <Ionicons name="checkmark-circle" size={20} color="#22c55e" />
                </View>
                <View style={styles.activityContent}>
                  <Text
                    style={[
                      styles.activityTitle,
                      { color: theme.colors.textPrimary },
                    ]}
                  >
                    Water restored in your area
                  </Text>
                  <Text
                    style={[
                      styles.activityTime,
                      { color: theme.colors.textSecondary },
                    ]}
                  >
                    2 hours ago
                  </Text>
                </View>
              </View>
              <Ionicons
                name="chevron-forward"
                size={18}
                color={theme.colors.textDisabled}
              />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.activityItem} activeOpacity={0.7}>
              <View style={styles.activityLeft}>
                <View
                  style={[
                    styles.activityIcon,
                    { backgroundColor: "#3b82f620" },
                  ]}
                >
                  <Ionicons name="pricetag" size={20} color="#3b82f6" />
                </View>
                <View style={styles.activityContent}>
                  <Text
                    style={[
                      styles.activityTitle,
                      { color: theme.colors.textPrimary },
                    ]}
                  >
                    Vendor updated prices nearby
                  </Text>
                  <Text
                    style={[
                      styles.activityTime,
                      { color: theme.colors.textSecondary },
                    ]}
                  >
                    5 hours ago
                  </Text>
                </View>
              </View>
              <Ionicons
                name="chevron-forward"
                size={18}
                color={theme.colors.textDisabled}
              />
            </TouchableOpacity>
          </View>
        </AnimatedCard>

        {/* Prediction Card */}
        <AnimatedCard delay={550} style={styles.section}>
          <TouchableOpacity
            style={[
              styles.predictionCard,
              { backgroundColor: theme.colors.surface },
            ]}
            onPress={() => navigation.navigate("WaterPrediction")}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={["#8b5cf6", "#7c3aed"]}
              style={styles.predictionGradient}
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
            </View>
            <Ionicons
              name="arrow-forward"
              size={20}
              color={theme.colors.primary}
            />
          </TouchableOpacity>
        </AnimatedCard>

        <View style={{ height: 32 }} />
      </ScrollView>
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
  avatarContainer: {
    marginRight: 12,
    position: "relative",
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: "#fff",
  },
  avatarPlaceholder: {
    backgroundColor: "#E0E0E0",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#667eea",
    fontFamily: "Montserrat_700Bold",
  },
  onlineIndicator: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#22c55e",
    borderWidth: 2,
    borderColor: "#764ba2",
  },
  greetingContainer: {
    justifyContent: "center",
  },
  greeting: {
    fontSize: 13,
    color: "#ffffffaa",
    marginBottom: 2,
  },
  userName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#023020",
    marginBottom: 2,
    fontFamily: "Montserrat_700Bold",
  },
  location: {
    fontSize: 12,
    color: "#ffffffaa",
  },
  notificationBtn: {
    padding: 8,
  },
  notificationIconWrap: {
    position: "relative",
  },
  notificationDot: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ef4444",
    borderWidth: 1.5,
    borderColor: "#764ba2",
  },
  statusSection: {
    paddingHorizontal: 16,
    paddingTop: 20,
    gap: 12,
  },
  statusCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  statusIconGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  statusContent: {
    flex: 1,
  },
  statusLabel: {
    fontSize: 12,
    marginBottom: 4,
    fontFamily: "Montserrat_700Bold",
  },
  statusValue: {
    fontSize: 18,
    fontWeight: "700",
    fontFamily: "Montserrat_700Bold",

    marginBottom: 2,
  },
  statusTime: {
    fontSize: 11,
    fontFamily: "Montserrat_700Bold",
  },
  section: {
    paddingHorizontal: 16,
    marginTop: 28,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 14,
    fontFamily: "Montserrat_700Bold",
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  actionCard: {
    width: (width - 44) / 2,
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  actionText: {
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
    fontFamily: "Montserrat_700Bold",
  },
  activityCard: {
    padding: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  activityLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  activityIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: "500",
    fontFamily: "Montserrat_700Bold",
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 12,
    fontFamily: "Montserrat_700Bold",
  },
  divider: {
    height: 1,
    backgroundColor: "#f3f4f6",
    marginVertical: 8,
  },
  predictionCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  predictionGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  predictionContent: {
    flex: 1,
  },
  predictionTitle: {
    fontSize: 13,
    marginBottom: 4,
    fontFamily: "Montserrat_700Bold",
  },
  predictionValue: {
    fontSize: 16,
    fontWeight: "700",
    fontFamily: "Montserrat_700Bold",
  },
});
