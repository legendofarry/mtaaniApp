import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useTheme } from "../../common/ThemeProvider";
import { Icon } from "../../common/Icons";

export default function HomeScreen() {
  const { theme } = useTheme();

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      {/* HEADER */}
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.logo, { color: theme.colors.primary }]}>Flow</Text>

        <TouchableOpacity style={styles.notificationBtn}>
          <Icon
            name="notifications-outline"
            size={26}
            color={theme.colors.textPrimary}
          />
          <View
            style={[styles.badge, { backgroundColor: theme.colors.error }]}
          />
        </TouchableOpacity>
      </View>

      {/* MAIN CONTENT */}
      <ScrollView
        contentContainerStyle={{
          padding: 20,
        }}
      >
        {/* Welcome */}
        <Text style={[styles.welcome, { color: theme.colors.textPrimary }]}>
          Welcome back 👋
        </Text>

        {/* WATER STATUS CARD */}
        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.cardRow}>
            <Icon name="water" size={28} color={theme.colors.primary} />
            <Text
              style={[styles.cardTitle, { color: theme.colors.textPrimary }]}
            >
              Water: ON in your area
            </Text>
          </View>
          <Text style={[styles.cardSub, { color: theme.colors.textSecondary }]}>
            Last updated: 10 min ago
          </Text>
        </View>

        {/* ELECTRICITY STATUS CARD */}
        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.cardRow}>
            <Icon name="flash" size={28} color={theme.colors.warning} />
            <Text
              style={[styles.cardTitle, { color: theme.colors.textPrimary }]}
            >
              Electricity Balance: KSh 128
            </Text>
          </View>
          <Text style={[styles.cardSub, { color: theme.colors.textSecondary }]}>
            Estimated: 2.5 days remaining
          </Text>
        </View>

        {/* PREDICTIONS */}
        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.cardRow}>
            <Icon name="time-outline" size={26} color={theme.colors.primary} />
            <Text
              style={[styles.cardTitle, { color: theme.colors.textPrimary }]}
            >
              Next Water Prediction: 8:00 AM
            </Text>
          </View>
          <Text style={[styles.cardSub, { color: theme.colors.textSecondary }]}>
            Based on last 14 days trend
          </Text>
        </View>

        {/* VENDOR ALERTS */}
        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.cardRow}>
            <Icon
              name="storefront-outline"
              size={26}
              color={theme.colors.primary}
            />
            <Text
              style={[styles.cardTitle, { color: theme.colors.textPrimary }]}
            >
              Vendors Nearby: 2
            </Text>
          </View>
          <Text style={[styles.cardSub, { color: theme.colors.textSecondary }]}>
            Mkokoteni & kiosk nearby your court
          </Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  /* HEADER */
  header: {
    height: 60,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    elevation: 2,
  },
  logo: {
    fontSize: 22,
    fontWeight: "700",
  },
  notificationBtn: {
    position: "relative",
  },
  badge: {
    width: 10,
    height: 10,
    borderRadius: 6,
    position: "absolute",
    top: -2,
    right: -2,
  },

  /* CONTENT */
  welcome: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 14,
  },

  card: {
    width: "100%",
    padding: 18,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 12,
  },
  cardSub: {
    fontSize: 14,
  },
});
