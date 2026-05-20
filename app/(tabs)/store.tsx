import React from "react";
import { View } from "react-native";
import CourseStore from "../components/CourseStore";
import { StatusBar } from "expo-status-bar";

export default function CourseStoreScreen() {
  return (
    <View className="flex-1 bg-slate-950">
      <StatusBar style="light" />
      <CourseStore />
    </View>
  );
}
