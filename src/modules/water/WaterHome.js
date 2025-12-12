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

export default function WaterHome({ navigation }) {
  const { theme } = useTheme();

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      {/* HEADER */}
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.title, { color: theme.colors.primary }]}>
          Water
        </Text>

        <TouchableOpacity onPress={() => navigation.navigate("AreaChat")}>
          <Icon
            name="chatbubble-ellipses-outline"
            size={26}
            color={theme.colors.textPrimary}
          />
        </TouchableOpacity>
      </View>

      {/* MAIN CONTENT */}
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {/* WATER STATUS CARD */}
        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.row}>
            <Icon name="water" size={28} color={theme.colors.primary} />
            <Text
              style={[styles.cardTitle, { color: theme.colors.textPrimary }]}
            >
              Water is ON in your area
            </Text>
          </View>
          <Text style={[styles.cardSub, { color: theme.colors.textSecondary }]}>
            Pressure: Medium • Last change: 12 min ago
          </Text>
        </View>

        {/* MAP PREVIEW (Clickable) */}
        <TouchableOpacity
          onPress={() => navigation.navigate("WaterMap")}
          style={[styles.mapBox, { backgroundColor: theme.colors.surface }]}
        >
          <Icon name="map-outline" size={30} color={theme.colors.primary} />
          <Text style={[styles.mapText, { color: theme.colors.textPrimary }]}>
            View Water Map
          </Text>
        </TouchableOpacity>

        {/* VENDOR LIST PREVIEW */}
        <Text
          style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}
        >
          Nearby Vendors
        </Text>

        <View style={{ gap: 12 }}>
          {/* Vendor 1 */}
          <TouchableOpacity
            style={[
              styles.vendorCard,
              { backgroundColor: theme.colors.surface },
            ]}
            onPress={() => navigation.navigate("Vendors")}
          >
            <Icon
              name="bicycle-outline"
              size={26}
              color={theme.colors.primary}
            />
            <View style={{ marginLeft: 12 }}>
              <Text
                style={[styles.vendorName, { color: theme.colors.textPrimary }]}
              >
                Mkokoteni Vendor (200m)
              </Text>
              <Text style={{ color: theme.colors.textSecondary }}>
                Price: KSh 20 per 20L • Updated now
              </Text>
            </View>
          </TouchableOpacity>

          {/* Vendor 2 */}
          <TouchableOpacity
            style={[
              styles.vendorCard,
              { backgroundColor: theme.colors.surface },
            ]}
            onPress={() => navigation.navigate("Vendors")}
          >
            <Icon name="water-outline" size={26} color={theme.colors.primary} />
            <View style={{ marginLeft: 12 }}>
              <Text
                style={[styles.vendorName, { color: theme.colors.textPrimary }]}
              >
                Water Kiosk (400m)
              </Text>
              <Text style={{ color: theme.colors.textSecondary }}>
                Price: KSh 5 per L • Updated 5 min ago
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* PREDICTION CARD */}
        <View
          style={[
            styles.card,
            { backgroundColor: theme.colors.surface, marginTop: 22 },
          ]}
        >
          <View style={styles.row}>
            <Icon name="time-outline" size={26} color={theme.colors.primary} />
            <Text
              style={[styles.cardTitle, { color: theme.colors.textPrimary }]}
            >
              Next Water Prediction
            </Text>
          </View>

          <Text
            style={[
              styles.cardSub,
              { color: theme.colors.primary, fontWeight: "700" },
            ]}
          >
            Expected: Tomorrow 8:00 AM
          </Text>

          <TouchableOpacity
            style={styles.link}
            onPress={() => navigation.navigate("WaterPrediction")}
          >
            <Text style={[styles.linkText, { color: theme.colors.primary }]}>
              View full prediction →
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 60 }} />
      </ScrollView>

      {/* FAB BUTTON — REPORT WATER */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => navigation.navigate("ReportWater")}
      >
        <Icon name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  /* HEADER */
  header: {
    height: 60,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 2,
  },
  title: { fontSize: 22, fontWeight: "700" },

  /* SECTIONS */
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginVertical: 10,
  },

  /* CARDS */
  card: {
    padding: 18,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
  },
  cardTitle: { fontSize: 18, fontWeight: "600", marginLeft: 10 },
  cardSub: { fontSize: 14, marginTop: 4 },

  row: { flexDirection: "row", alignItems: "center" },

  /* MAP */
  mapBox: {
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
    marginVertical: 10,
  },
  mapText: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: "600",
  },

  /* VENDORS */
  vendorCard: {
    flexDirection: "row",
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    alignItems: "center",
  },
  vendorName: { fontSize: 16, fontWeight: "600" },

  /* LINKS */
  link: { marginTop: 8 },
  linkText: { fontSize: 14, fontWeight: "600" },

  /* FAB BUTTON */
  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    padding: 16,
    borderRadius: 50,
    elevation: 5,
  },
});
