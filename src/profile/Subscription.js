import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import LottieView from "lottie-react-native";
import { useAuth } from "../store/useAuth";

export default function Subscription() {
  const navigation = useNavigation();
  const user = useAuth((s) => s.user);

  const isPremium = user?.subscription === "premium";
  const [selected, setSelected] = useState(isPremium ? "premium" : "free");

  const fade = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(fade, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.05,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <Header title="Subscription" onBack={() => navigation.goBack()} />

      <Animated.View style={{ opacity: fade }}>
        {/* PLANS */}
        <View style={styles.cardsRow}>
          <PlanCard
            title="Free"
            price="KES 0"
            selected={selected === "free"}
            disabled
            lottie={require("../assets/lotties/free.json")}
            features={[
              "Basic meter tracking",
              "Limited insights",
              "Standard support",
            ]}
          />

          <PlanCard
            title="Premium"
            price="KES 100 / month"
            selected={selected === "premium"}
            lottie={require("../assets/lotties/premium.json")}
            features={[
              "Unlimited meters",
              "Smart usage prediction",
              "Advanced reports",
              "Priority support",
            ]}
            onPress={() => setSelected("premium")}
            highlight
          />
        </View>

        {/* CTA */}
        {!isPremium && (
          <Animated.View>
            <TouchableOpacity
              style={[
                styles.upgradeBtn,
                selected !== "premium" && { opacity: 0.4 },
              ]}
              disabled={selected !== "premium"}
              onPress={() => navigation.navigate("SubPayment")}
            >
              <Text style={styles.upgradeText}>Upgrade to Premium</Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        {isPremium && (
          <View style={styles.activeBadge}>
            <Ionicons name="checkmark-circle" size={22} color="#16a34a" />
            <Text style={styles.activeText}>Premium Active</Text>
          </View>
        )}
      </Animated.View>
    </ScrollView>
  );
}

/* ================= COMPONENTS ================= */

const Header = ({ title, onBack }) => (
  <View style={styles.header}>
    <TouchableOpacity onPress={onBack}>
      <Ionicons name="arrow-back" size={24} />
    </TouchableOpacity>
    <Text style={styles.headerTitle}>{title}</Text>
    <View style={{ width: 24 }} />
  </View>
);

const PlanCard = ({
  title,
  price,
  features,
  selected,
  onPress,
  highlight,
  disabled,
  lottie,
}) => {
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(scale, {
      toValue: selected ? 1 : 1,
      useNativeDriver: true,
    }).start();
  }, [selected]);

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        disabled={disabled}
        onPress={onPress}
        style={[
          styles.card,
          highlight && styles.highlight,
          selected && styles.activeCard,
        ]}
      >
        <LottieView source={lottie} autoPlay loop style={styles.cardLottie} />

        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.price}>{price}</Text>

        {features.map((f) => (
          <View key={f} style={styles.featureRow}>
            <Ionicons name="checkmark" size={16} color="#10b981" />
            <Text style={styles.featureText}>{f}</Text>
          </View>
        ))}

        {selected && (
          <View style={styles.selectedBadge}>
            <Ionicons name="checkmark-circle" size={18} color="#2563eb" />
            <Text style={styles.selectedText}>Selected</Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
  },

  headerTitle: { fontSize: 18, fontWeight: "600" },

  cardsRow: {
    flexDirection: "column",
    marginBottom: 6,
    alignItems: "center",
    gap: 10,
  },

  card: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    height: 100,
    width: 200,
  },

  highlight: {
    borderColor: "#2563eb",
  },

  activeCard: {
    backgroundColor: "#fee49cae",
  },

  cardLottie: {
    height: 20,
    alignSelf: "center",
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
  },

  price: {
    textAlign: "center",
    marginVertical: 6,
    color: "#6b7280",
  },

  featureRow: {
    flexDirection: "row",
    gap: 6,
    marginTop: 6,
    alignItems: "center",
  },

  featureText: { fontSize: 13 },

  selectedBadge: {
    flexDirection: "row",
    gap: 6,
    justifyContent: "center",
    marginTop: 10,
  },

  selectedText: {
    color: "#2563eb",
    fontWeight: "600",
  },

  upgradeBtn: {
    backgroundColor: "#2563eb",
    margin: 16,
    padding: 18,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#2563eb",
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },

  upgradeText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },

  activeBadge: {
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    marginVertical: 30,
  },

  activeText: {
    fontWeight: "700",
    color: "#16a34a",
  },
});
