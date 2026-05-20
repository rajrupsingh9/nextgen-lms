import React from "react";
import { Slot } from "expo-router";
import { AuthProvider } from "../context/AuthContext";
import ScreenGuard from "../components/ScreenGuard";
import "../global.css";

export default function RootLayout() {
  return (
    <AuthProvider>
      <ScreenGuard>
        <Slot />
      </ScreenGuard>
    </AuthProvider>
  );
}
