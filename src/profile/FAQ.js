import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const FAQS = [
  {
    q: "How do I link a meter?",
    a: "Go to Profile → My Meters → Add Meter, select the type, enter meter number and save.",
  },
  {
    q: "Can I have multiple meters?",
    a: "Yes. You can link multiple water and electricity meters to your account.",
  },
  {
    q: "What is a Main Meter?",
    a: "A Main Meter is the primary meter for a utility type. You can only have one Main Meter per utility.",
  },
  {
    q: "How do I edit my profile?",
    a: "Go to Profile → Edit Profile and follow the steps.",
  },
  {
    q: "Why can’t I change my email directly?",
    a: "Email changes require verification. Use the Edit Email screen to update it securely.",
  },
];

export default function FAQ() {
  const navigation = useNavigation();
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (index) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenIndex(index === openIndex ? null : index);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} />
        </TouchableOpacity>
        <Text style={styles.title}>FAQs</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {FAQS.map((item, index) => {
          const open = openIndex === index;
          return (
            <View key={index} style={styles.card}>
              <TouchableOpacity
                style={styles.questionRow}
                onPress={() => toggle(index)}
                activeOpacity={0.8}
              >
                <Text style={styles.question}>{item.q}</Text>
                <Ionicons
                  name={open ? "chevron-up" : "chevron-down"}
                  size={20}
                  color="#6b7280"
                />
              </TouchableOpacity>

              {open && <Text style={styles.answer}>{item.a}</Text>}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

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
    marginBottom: 12,
  },

  questionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  question: {
    fontWeight: "700",
    fontSize: 15,
    flex: 1,
    paddingRight: 10,
  },

  answer: {
    marginTop: 10,
    color: "#374151",
    lineHeight: 20,
  },
});
