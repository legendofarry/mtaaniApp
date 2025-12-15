import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Animated,
  StatusBar,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { saveChat, loadChat } from "../storage/chatStorage";

/* ================= CONFIG ================= */

const STORAGE_KEY = "SUPPORT_CHAT_MESSAGES";

/* ================= AI BRIDGE ================= */
/* Replace this with OpenAI / local LLM later */
const sendToAI = async (text) => {
  await new Promise((r) => setTimeout(r, 1600));

  if (/meter/i.test(text))
    return "You can manage meters under Profile → My Meters.";
  if (/token|payment/i.test(text))
    return "Token purchases appear instantly after confirmation.";
  if (/hello|hi/i.test(text)) return "Hello 👋 How can I assist you today?";

  return "I’m thinking about this. A human agent can also assist if needed.";
};

/* ================= MAIN ================= */

export default function SupportChat() {
  const navigation = useNavigation();
  const listRef = useRef();

  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [humanMode, setHumanMode] = useState(false);
  const [messages, setMessages] = useState([]);

  /* ---------- LOAD CHAT ---------- */
  useEffect(() => {
    (async () => {
      const saved = await loadChat();
      if (saved) {
        setMessages(saved);
      } else {
        setMessages([
          {
            id: "intro",
            role: "ai",
            text: "Hi 👋 I’m your smart assistant. How can I help today?",
            time: new Date(),
          },
        ]);
      }
    })();
  }, []);

  /* ---------- SAVE CHAT ---------- */
  useEffect(() => {
    saveChat(messages);
  }, [messages, thinking]);

  /* ---------- SEND MESSAGE ---------- */
  const send = async () => {
    if (!input.trim()) return;

    const userMsg = {
      id: Date.now().toString(),
      role: "user",
      text: input,
      time: new Date(),
    };

    setMessages((m) => [...m, userMsg]);
    setInput("");

    if (humanMode) {
      // future: send to live agent
      return;
    }

    setThinking(true);

    const aiText = await sendToAI(userMsg.text);

    setThinking(false);
    setMessages((m) => [
      ...m,
      {
        id: Date.now().toString() + "-ai",
        role: "ai",
        text: aiText,
        time: new Date(),
      },
    ]);
  };

  /* ---------- ATTACH IMAGE ---------- */
  const pickImage = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.6,
    });

    if (!res.canceled) {
      setMessages((m) => [
        ...m,
        {
          id: Date.now().toString(),
          role: "user",
          image: res.assets[0].uri,
          time: new Date(),
        },
      ]);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <StatusBar barStyle="dark-content" />

      <Header
        humanMode={humanMode}
        onToggle={() => setHumanMode((v) => !v)}
        onClose={() => navigation.goBack()}
      />

      <FlatList
        ref={listRef}
        data={thinking ? [...messages, { id: "thinking" }] : messages}
        keyExtractor={(i) => i.id}
        contentContainerStyle={styles.chat}
        renderItem={({ item }) =>
          item.id === "thinking" ? (
            <ThinkingBubble />
          ) : (
            <MessageBubble item={item} />
          )
        }
      />

      <Composer
        value={input}
        onChange={setInput}
        onSend={send}
        onAttach={pickImage}
      />
    </KeyboardAvoidingView>
  );
}

/* ================= SUB COMPONENTS ================= */

/* ---------- HEADER ---------- */
const Header = ({ onClose, onToggle, humanMode }) => (
  <View style={styles.header}>
    <View style={styles.badge}>
      <Ionicons name="sparkles" size={14} color="#2563eb" />
      <Text style={styles.badgeText}>
        {humanMode ? "Human Support" : "AI Support"}
      </Text>
    </View>

    <TouchableOpacity onPress={onToggle}>
      <Text style={{ color: humanMode ? "green" : "#2563eb" }}>
        {humanMode ? "Connected" : "Switch to Human"}
      </Text>
    </TouchableOpacity>

    <TouchableOpacity onPress={onClose}>
      <Ionicons name="close" size={26} />
    </TouchableOpacity>
  </View>
);

/* ---------- MESSAGE ---------- */
const MessageBubble = ({ item }) => {
  const isUser = item.role === "user";

  return (
    <View style={[styles.bubble, isUser ? styles.user : styles.ai]}>
      {item.image && (
        <Image source={{ uri: item.image }} style={styles.image} />
      )}
      {item.text && <Text style={styles.text}>{item.text}</Text>}
      <Text style={styles.time}>
        {new Date(item.time).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </Text>
    </View>
  );
};

/* ---------- THINKING ---------- */
const ThinkingBubble = () => {
  const dots = Array.from({ length: 3 }).map(
    () => useRef(new Animated.Value(0)).current
  );

  useEffect(() => {
    dots.forEach((dot, i) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 150),
          Animated.timing(dot, {
            toValue: -6,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ])
      ).start();
    });
  }, []);

  return (
    <View style={[styles.bubble, styles.ai]}>
      <View style={styles.wave}>
        {dots.map((d, i) => (
          <Animated.View
            key={i}
            style={[styles.dot, { transform: [{ translateY: d }] }]}
          />
        ))}
      </View>
    </View>
  );
};

/* ---------- INPUT ---------- */
const Composer = ({ value, onChange, onSend, onAttach }) => (
  <View style={styles.composer}>
    <TouchableOpacity onPress={onAttach}>
      <Ionicons name="attach" size={22} />
    </TouchableOpacity>

    <TextInput
      style={styles.input}
      placeholder="Type your message…"
      value={value}
      onChangeText={onChange}
    />

    <TouchableOpacity>
      <Ionicons name="mic" size={22} />
    </TouchableOpacity>

    <TouchableOpacity style={styles.send} onPress={onSend}>
      <Ionicons name="send" size={18} color="#fff" />
    </TouchableOpacity>
  </View>
);

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderColor: "#e5e7eb",
  },

  badge: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
    backgroundColor: "#eef2ff",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },

  badgeText: { fontWeight: "600", color: "#2563eb" },

  chat: { padding: 16 },

  bubble: {
    maxWidth: "78%",
    padding: 14,
    borderRadius: 18,
    marginBottom: 10,
  },

  user: {
    backgroundColor: "#2563eb",
    alignSelf: "flex-end",
    borderBottomRightRadius: 4,
  },

  ai: {
    backgroundColor: "#fff",
    alignSelf: "flex-start",
    borderBottomLeftRadius: 4,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },

  text: { color: "#111827", fontSize: 15 },

  time: {
    fontSize: 11,
    color: "#9ca3af",
    marginTop: 6,
    alignSelf: "flex-end",
  },

  image: {
    width: 180,
    height: 120,
    borderRadius: 12,
    marginBottom: 6,
  },

  composer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderColor: "#e5e7eb",
  },

  input: {
    flex: 1,
    backgroundColor: "#f1f5f9",
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },

  send: {
    backgroundColor: "#2563eb",
    borderRadius: 999,
    padding: 12,
  },

  wave: { flexDirection: "row", gap: 6 },

  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#9ca3af",
  },
});
