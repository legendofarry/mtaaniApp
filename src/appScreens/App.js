// src/appScreens/App.js
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import Routes from "./Routes";
import { ThemeProvider } from "../common/ThemeProvider";
import { UserProvider } from "../context/UserContext"; // ⭐ Added

export default function App() {
  return (
    <UserProvider>
      {" "}
      {/* ⭐ Wrap whole app for global user state */}
      <ThemeProvider>
        <NavigationContainer>
          <Routes />
        </NavigationContainer>
      </ThemeProvider>
    </UserProvider>
  );
}
