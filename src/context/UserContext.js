import React, { createContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      const saved = await AsyncStorage.getItem("user");
      if (saved) setUser(JSON.parse(saved));
    };
    loadUser();
  }, []);

  const updateUser = async (data) => {
    setUser(data);
    await AsyncStorage.setItem("user", JSON.stringify(data));
  };

  return (
    <UserContext.Provider value={{ user, setUser: updateUser }}>
      {children}
    </UserContext.Provider>
  );
}
