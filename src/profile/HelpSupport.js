import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

export default function HelpSupport() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} />
        </TouchableOpacity>
        <Text style={styles.title}>Help & Support</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Help Options */}
        <Card
          icon="help-circle-outline"
          title="FAQs"
          subtitle="Find quick answers to common questions"
          onPress={() => navigation.navigate("FAQ")}
        />

        <Card
          icon="chatbubble-ellipses-outline"
          title="Live Chat"
          subtitle="Chat with in-app support"
          onPress={() => navigation.navigate("SupportChat")}
        />

        <Card
          icon="mail-outline"
          title="Email Support"
          subtitle=""
          onPress={() =>
            Linking.openURL("mailto:moderation.mails.go@gmail.com")
          }
        />

        <Card
          icon="call-outline"
          title="Call Support"
          subtitle=""
          onPress={() => Linking.openURL("tel:+254748510136")}
        />

        <Card
          icon="logo-whatsapp"
          title="WhatsApp"
          subtitle="Chat with support on WhatsApp"
          onPress={() => Linking.openURL("https://wa.me/254762634893")}
        />

        <Card
          icon="bug-outline"
          title="Report a Problem"
          onPress={() =>
            Linking.openURL("mailto:moderation.mails.go@gmail.com")
          }
          subtitle="Let us know if something isn’t working"
        />
      </ScrollView>
    </View>
  );
}

/* ---------- Card Component ---------- */

const Card = ({ icon, title, subtitle, onPress }) => (
  <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
    <Ionicons name={icon} size={26} color="#2563eb" />
    <View style={{ flex: 1 }}>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardSub}>{subtitle}</Text>
    </View>
    <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
  </TouchableOpacity>
);

/* ---------- Styles ---------- */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f3f4f6" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  title: { fontSize: 18, fontWeight: "600" },

  content: { padding: 16 },

  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 12,
  },

  cardTitle: { fontWeight: "700", fontSize: 15 },
  cardSub: { color: "#6b7280", marginTop: 2 },
});
