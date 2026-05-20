import React from "react";
import { View } from "react-native";
import SmartBoard from "../components/SmartBoard";
import { StatusBar } from "expo-status-bar";

export default function WhiteboardScreen() {
  return (
    <View className="flex-1 bg-slate-950">
      <StatusBar style="light" />
      <SmartBoard />
    </View>
  );
}