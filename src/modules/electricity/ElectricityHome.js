// src/modules/electricity/ElectricityHome.js
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

export default function ElectricityHome({ navigation }) {
  const { theme } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [tokenBalance, setTokenBalance] = useState(128.5);
  const [daysRemaining, setDaysRemaining] = useState(2.5);
  const [meterNumber, setMeterNumber] = useState("1234567890");

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    animateIn();
    startPulse();
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

  const startPulse = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const onRefresh = async () => {
    setRefreshing(true);
    // TODO: Fetch latest token balance
    setTimeout(() => setRefreshing(false), 1000);
  };

  const getBalanceColor = () => {
    if (tokenBalance > 100) return "#22c55e";
    if (tokenBalance > 50) return "#eab308";
    return "#ef4444";
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
      <LinearGradient colors={["#eab308", "#ca8a04"]} style={styles.header}>
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
              <Text style={styles.headerTitle}>Electricity</Text>
              <Text style={styles.headerSubtitle}>Token management</Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => navigation.navigate("TransactionHistory")}
            style={styles.historyBtn}
          >
            <Ionicons name="time" size={24} color="#fff" />
          </TouchableOpacity>
        </Animated.View>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.warning}
          />
        }
      >
        {/* Balance Card - Large with animation */}
        <AnimatedCard delay={100}>
          <View
            style={[
              styles.balanceCard,
              { backgroundColor: theme.colors.surface },
            ]}
          >
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <LinearGradient
                colors={[getBalanceColor(), getBalanceColor() + "dd"]}
                style={styles.balanceIconGradient}
              >
                <Ionicons name="flash" size={40} color="#fff" />
              </LinearGradient>
            </Animated.View>

            <Text
              style={[
                styles.balanceLabel,
                { color: theme.colors.textSecondary },
              ]}
            >
              Token Balance
            </Text>
            <Text
              style={[styles.balanceValue, { color: theme.colors.textPrimary }]}
            >
              KSh {tokenBalance.toFixed(2)}
            </Text>

            <View style={styles.balanceDetails}>
              <View style={styles.balanceDetail}>
                <Ionicons
                  name="calendar"
                  size={16}
                  color={theme.colors.textSecondary}
                />
                <Text
                  style={[
                    styles.balanceDetailText,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  {daysRemaining.toFixed(1)} days left
                </Text>
              </View>
              <View style={styles.balanceDetail}>
                <Ionicons
                  name="calculator"
                  size={16}
                  color={theme.colors.textSecondary}
                />
                <Text
                  style={[
                    styles.balanceDetailText,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  Meter: {meterNumber}
                </Text>
              </View>
            </View>

            {/* Progress bar */}
            <View style={styles.progressContainer}>
              <View
                style={[
                  styles.progressBar,
                  { backgroundColor: theme.colors.surfaceVariant },
                ]}
              >
                <View
                  style={[
                    styles.progressFill,
                    {
                      backgroundColor: getBalanceColor(),
                      width: `${Math.min((tokenBalance / 200) * 100, 100)}%`,
                    },
                  ]}
                />
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
                onPress={() => navigation.navigate("BuyToken")}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={["#22c55e", "#16a34a"]}
                  style={styles.quickActionIcon}
                >
                  <Ionicons name="add-circle" size={24} color="#fff" />
                </LinearGradient>
                <Text
                  style={[
                    styles.quickActionText,
                    { color: theme.colors.textPrimary },
                  ]}
                >
                  Buy Token
                </Text>
              </TouchableOpacity>
            </AnimatedCard>

            <AnimatedCard delay={250}>
              <TouchableOpacity
                style={[
                  styles.quickActionCard,
                  { backgroundColor: theme.colors.surface },
                ]}
                onPress={() => navigation.navigate("UsageHistory")}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={["#3b82f6", "#2563eb"]}
                  style={styles.quickActionIcon}
                >
                  <Ionicons name="bar-chart" size={24} color="#fff" />
                </LinearGradient>
                <Text
                  style={[
                    styles.quickActionText,
                    { color: theme.colors.textPrimary },
                  ]}
                >
                  Usage Stats
                </Text>
              </TouchableOpacity>
            </AnimatedCard>

            <AnimatedCard delay={300}>
              <TouchableOpacity
                style={[
                  styles.quickActionCard,
                  { backgroundColor: theme.colors.surface },
                ]}
                onPress={() => navigation.navigate("SetReminder")}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={["#8b5cf6", "#7c3aed"]}
                  style={styles.quickActionIcon}
                >
                  <Ionicons name="notifications" size={24} color="#fff" />
                </LinearGradient>
                <Text
                  style={[
                    styles.quickActionText,
                    { color: theme.colors.textPrimary },
                  ]}
                >
                  Reminders
                </Text>
              </TouchableOpacity>
            </AnimatedCard>
          </View>
        </View>

        {/* Recent Transactions */}
        <AnimatedCard delay={350}>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text
                style={[
                  styles.sectionTitle,
                  { color: theme.colors.textPrimary },
                ]}
              >
                Recent Transactions
              </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate("TransactionHistory")}
              >
                <Text
                  style={{
                    color: theme.colors.primary,
                    fontSize: 13,
                    fontWeight: "600",
                  }}
                >
                  View all
                </Text>
              </TouchableOpacity>
            </View>

            <View
              style={[
                styles.transactionCard,
                { backgroundColor: theme.colors.surface },
              ]}
            >
              <TouchableOpacity
                style={styles.transactionItem}
                onPress={() =>
                  navigation.navigate("TransactionDetails", { id: 1 })
                }
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.transactionIcon,
                    { backgroundColor: "#22c55e20" },
                  ]}
                >
                  <Ionicons name="arrow-down" size={20} color="#22c55e" />
                </View>
                <View style={styles.transactionContent}>
                  <Text
                    style={[
                      styles.transactionTitle,
                      { color: theme.colors.textPrimary },
                    ]}
                  >
                    Token Purchase
                  </Text>
                  <Text
                    style={[
                      styles.transactionDate,
                      { color: theme.colors.textSecondary },
                    ]}
                  >
                    Today, 10:30 AM
                  </Text>
                </View>
                <Text style={[styles.transactionAmount, { color: "#22c55e" }]}>
                  +KSh 100.00
                </Text>
              </TouchableOpacity>

              <View style={styles.divider} />

              <TouchableOpacity
                style={styles.transactionItem}
                onPress={() =>
                  navigation.navigate("TransactionDetails", { id: 2 })
                }
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.transactionIcon,
                    { backgroundColor: "#ef444420" },
                  ]}
                >
                  <Ionicons name="arrow-up" size={20} color="#ef4444" />
                </View>
                <View style={styles.transactionContent}>
                  <Text
                    style={[
                      styles.transactionTitle,
                      { color: theme.colors.textPrimary },
                    ]}
                  >
                    Daily Usage
                  </Text>
                  <Text
                    style={[
                      styles.transactionDate,
                      { color: theme.colors.textSecondary },
                    ]}
                  >
                    Yesterday
                  </Text>
                </View>
                <Text style={[styles.transactionAmount, { color: "#ef4444" }]}>
                  -KSh 15.50
                </Text>
              </TouchableOpacity>

              <View style={styles.divider} />

              <TouchableOpacity
                style={styles.transactionItem}
                onPress={() =>
                  navigation.navigate("TransactionDetails", { id: 3 })
                }
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.transactionIcon,
                    { backgroundColor: "#22c55e20" },
                  ]}
                >
                  <Ionicons name="arrow-down" size={20} color="#22c55e" />
                </View>
                <View style={styles.transactionContent}>
                  <Text
                    style={[
                      styles.transactionTitle,
                      { color: theme.colors.textPrimary },
                    ]}
                  >
                    Token Purchase
                  </Text>
                  <Text
                    style={[
                      styles.transactionDate,
                      { color: theme.colors.textSecondary },
                    ]}
                  >
                    Dec 10, 2025
                  </Text>
                </View>
                <Text style={[styles.transactionAmount, { color: "#22c55e" }]}>
                  +KSh 50.00
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </AnimatedCard>

        {/* Tips Card */}
        <AnimatedCard delay={400}>
          <TouchableOpacity
            style={[styles.tipsCard, { backgroundColor: theme.colors.surface }]}
            onPress={() => navigation.navigate("EnergySavingTips")}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={["#f59e0b", "#d97706"]}
              style={styles.tipsIcon}
            >
              <Ionicons name="bulb" size={24} color="#fff" />
            </LinearGradient>
            <View style={styles.tipsContent}>
              <Text
                style={[styles.tipsTitle, { color: theme.colors.textPrimary }]}
              >
                Energy Saving Tips
              </Text>
              <Text
                style={[
                  styles.tipsSubtitle,
                  { color: theme.colors.textSecondary },
                ]}
              >
                Learn how to reduce your electricity costs
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

      {/* FAB - Buy Token */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate("BuyToken")}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={["#22c55e", "#16a34a"]}
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
    fontWeight: "700",
    color: "#fff",
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#ffffffaa",
    marginTop: 2,
  },
  historyBtn: {
    padding: 4,
  },
  balanceCard: {
    marginHorizontal: 16,
    marginTop: 20,
    padding: 28,
    borderRadius: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  balanceIconGradient: {
    width: 88,
    height: 88,
    borderRadius: 44,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  balanceLabel: {
    fontSize: 13,
    marginBottom: 8,
  },
  balanceValue: {
    fontSize: 36,
    fontWeight: "700",
    marginBottom: 16,
  },
  balanceDetails: {
    flexDirection: "row",
    gap: 20,
    marginBottom: 20,
  },
  balanceDetail: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  balanceDetailText: {
    fontSize: 12,
  },
  progressContainer: {
    width: "100%",
    marginTop: 8,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
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
    fontWeight: "600",
    textAlign: "center",
  },
  transactionCard: {
    padding: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  transactionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  transactionContent: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 3,
  },
  transactionDate: {
    fontSize: 12,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: "700",
  },
  divider: {
    height: 1,
    backgroundColor: "#f3f4f6",
    marginVertical: 8,
  },
  tipsCard: {
    marginHorizontal: 16,
    marginTop: 24,
    padding: 18,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  tipsIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  tipsContent: {
    flex: 1,
  },
  tipsTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 3,
  },
  tipsSubtitle: {
    fontSize: 12,
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
