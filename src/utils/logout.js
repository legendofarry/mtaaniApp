import AsyncStorage from "@react-native-async-storage/async-storage";

export async function logout() {
  try {
    await AsyncStorage.removeItem("token");
  } catch (err) {
    console.log("Logout error", err);
  }
}
