import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import Routes from "./Routes";
import { ThemeProvider } from "../common/ThemeProvider";
import { UserProvider } from "../context/UserContext";
import { useAuth } from "../store/useAuth";

export default function App() {
  const restoreAuth = useAuth((state) => state.restoreAuth);

  useEffect(() => {
    restoreAuth(); // 🔥 restore token + user ONCE
  }, []);

  return (
    <UserProvider>
      <ThemeProvider>
        <NavigationContainer>
          <Routes />
        </NavigationContainer>
      </ThemeProvider>
    </UserProvider>
  );
}
