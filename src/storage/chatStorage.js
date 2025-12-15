import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Storage keys
 * You can later scope per user or per chat room
 */
const CHAT_KEY = "SUPPORT_CHAT_MESSAGES";

/* ===============================
   SAVE CHAT MESSAGES
================================ */
export async function saveChat(messages) {
  try {
    await AsyncStorage.setItem(CHAT_KEY, JSON.stringify(messages));
  } catch (e) {
    console.error("Failed to save chat", e);
  }
}

/* ===============================
   LOAD CHAT MESSAGES
================================ */
export async function loadChat() {
  try {
    const raw = await AsyncStorage.getItem(CHAT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.error("Failed to load chat", e);
    return null;
  }
}

/* ===============================
   CLEAR CHAT (optional)
================================ */
export async function clearChat() {
  try {
    await AsyncStorage.removeItem(CHAT_KEY);
  } catch (e) {
    console.error("Failed to clear chat", e);
  }
}
