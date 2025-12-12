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
        <TouchableOpacity style={styles.notificationBtn} activeOpacity={0.7}>
          <View style={styles.notificationIconWrapper}>
            <Icon
              name="notifications-outline"
              size={22}
              color={theme.colors.textSecondary}
            />
            <View
              style={[styles.badge, { backgroundColor: theme.colors.error }]}
            />
          </View>
        </TouchableOpacity>
      </View>

      {/* MAIN CONTENT */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text
            style={[
              styles.welcomeGreeting,
              { color: theme.colors.textSecondary },
            ]}
          >
            Good morning
          </Text>
          <Text
            style={[styles.welcomeTitle, { color: theme.colors.textPrimary }]}
          >
            Welcome back 👋
          </Text>
        </View>

        {/* STATUS CARDS - Grid Layout */}
        <View style={styles.cardsGrid}>
          {/* WATER STATUS CARD */}
          <View
            style={[
              styles.card,
              {
                backgroundColor: theme.colors.surface,
                shadowColor: theme.colors.primary + "20",
              },
            ]}
          >
            <View style={styles.cardIconContainer}>
              <View
                style={[
                  styles.iconBackground,
                  { backgroundColor: theme.colors.primary + "15" },
                ]}
              >
                <Icon name="water" size={24} color={theme.colors.primary} />
              </View>
            </View>
            <Text
              style={[styles.cardTitle, { color: theme.colors.textPrimary }]}
            >
              Water Status
            </Text>
            <Text style={[styles.cardValue, { color: theme.colors.primary }]}>
              ON in your area
            </Text>
            <Text
              style={[styles.cardSub, { color: theme.colors.textSecondary }]}
            >
              Updated 10 min ago
            </Text>
          </View>

          {/* ELECTRICITY STATUS CARD */}
          <View
            style={[
              styles.card,
              {
                backgroundColor: theme.colors.surface,
                shadowColor: theme.colors.warning + "20",
              },
            ]}
          >
            <View style={styles.cardIconContainer}>
              <View
                style={[
                  styles.iconBackground,
                  { backgroundColor: theme.colors.warning + "15" },
                ]}
              >
                <Icon name="flash" size={24} color={theme.colors.warning} />
              </View>
            </View>
            <Text
              style={[styles.cardTitle, { color: theme.colors.textPrimary }]}
            >
              Electricity Balance
            </Text>
            <Text
              style={[styles.cardValue, { color: theme.colors.textPrimary }]}
            >
              KSh 128
            </Text>
            <Text
              style={[styles.cardSub, { color: theme.colors.textSecondary }]}
            >
              2.5 days remaining
            </Text>
          </View>

          {/* PREDICTIONS CARD */}
          <View
            style={[
              styles.card,
              {
                backgroundColor: theme.colors.surface,
                shadowColor: theme.colors.primary + "20",
              },
            ]}
          >
            <View style={styles.cardIconContainer}>
              <View
                style={[
                  styles.iconBackground,
                  { backgroundColor: theme.colors.primary + "15" },
                ]}
              >
                <Icon
                  name="time-outline"
                  size={24}
                  color={theme.colors.primary}
                />
              </View>
            </View>
            <Text
              style={[styles.cardTitle, { color: theme.colors.textPrimary }]}
            >
              Next Water
            </Text>
            <Text
              style={[styles.cardValue, { color: theme.colors.textPrimary }]}
            >
              8:00 AM
            </Text>
            <Text
              style={[styles.cardSub, { color: theme.colors.textSecondary }]}
            >
              14-day trend analysis
            </Text>
          </View>

          {/* VENDOR ALERTS CARD */}
          <View
            style={[
              styles.card,
              {
                backgroundColor: theme.colors.surface,
                shadowColor: theme.colors.primary + "20",
              },
            ]}
          >
            <View style={styles.cardIconContainer}>
              <View
                style={[
                  styles.iconBackground,
                  { backgroundColor: theme.colors.primary + "15" },
                ]}
              >
                <Icon
                  name="storefront-outline"
                  size={24}
                  color={theme.colors.primary}
                />
              </View>
            </View>
            <Text
              style={[styles.cardTitle, { color: theme.colors.textPrimary }]}
            >
              Nearby Vendors
            </Text>
            <Text
              style={[styles.cardValue, { color: theme.colors.textPrimary }]}
            >
              2 Available
            </Text>
            <Text
              style={[styles.cardSub, { color: theme.colors.textSecondary }]}
            >
              Mkokoteni & kiosk nearby
            </Text>
          </View>
        </View>

        {/* RECENT ACTIVITY SECTION */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text
              style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}
            >
              Recent Activity
            </Text>
            <TouchableOpacity activeOpacity={0.6}>
              <Text
                style={[styles.seeAllText, { color: theme.colors.primary }]}
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
            <View style={styles.activityRow}>
              <View
                style={[
                  styles.activityIcon,
                  { backgroundColor: theme.colors.primary + "15" },
                ]}
              >
                <Icon
                  name="checkmark-circle"
                  size={20}
                  color={theme.colors.primary}
                />
              </View>
              <View style={styles.activityContent}>
                <Text
                  style={[
                    styles.activityTitle,
                    { color: theme.colors.textPrimary },
                  ]}
                >
                  Water restored
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
              <Text
                style={[styles.activityStatus, { color: theme.colors.success }]}
              >
                Completed
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.bottomSpacing} />
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
  scrollContent: {
    padding: 16,
  },
  welcomeSection: {
    marginBottom: 24,
  },
  welcomeGreeting: {
    fontSize: 14,
    marginBottom: 4,
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: "700",
    letterSpacing: -0.5,
  },
  cardsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  card: {
    width: "48%",
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  cardIconContainer: {
    marginBottom: 12,
  },
  iconBackground: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  cardTitle: {
    fontSize: 14,
    marginBottom: 4,
    opacity: 0.8,
  },
  cardValue: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 4,
  },
  cardSub: {
    fontSize: 12,
  },
  notificationIconWrapper: {
    position: "relative",
    padding: 8,
  },
  section: {
    marginTop: 8,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: "500",
  },
  activityCard: {
    borderRadius: 12,
    padding: 16,
  },
  activityRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 13,
  },
  activityStatus: {
    fontSize: 14,
    fontWeight: "500",
  },
  bottomSpacing: {
    height: 32,
  },
});
