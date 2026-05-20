import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { BoardTool } from "../types/board";

interface BoardToolbarProps {
  currentTool: BoardTool;
  setCurrentTool: (tool: BoardTool) => void;
  currentColor: string;
  setCurrentColor: (color: string) => void;
  strokeWidth: number;
  setStrokeWidth: (width: number) => void;
  onClearCanvas: () => void;
}

const PALETTE = ["#ffffff", "#ef4444", "#3b82f6", "#10b981", "#eab308", "#a855f7"];
const WIDTHS = [3, 6, 12, 24];

export default function BoardToolbar({
  currentTool,
  setCurrentTool,
  currentColor,
  setCurrentColor,
  strokeWidth,
  setStrokeWidth,
  onClearCanvas,
}: BoardToolbarProps) {
  return (
    <View className="absolute top-12 left-4 right-4 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col space-y-3 z-50 backdrop-blur-md">
      {/* Tool Selection Matrix */}
      <View className="flex flex-row items-center justify-between border-b border-slate-800 pb-2">
        <View className="flex flex-row space-x-2">
          <TouchableOpacity
            onPress={() => setCurrentTool("pen")}
            className={`px-4 py-2 rounded-xl border ${
              currentTool === "pen" 
                ? "bg-blue-600 border-blue-500" 
                : "bg-slate-800 border-slate-700"
            }`}
          >
            <Text className="text-white text-xs font-bold tracking-wide">Pen Vector</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setCurrentTool("eraser")}
            className={`px-4 py-2 rounded-xl border ${
              currentTool === "eraser" 
                ? "bg-red-600 border-red-500" 
                : "bg-slate-800 border-slate-700"
            }`}
          >
            <Text className="text-white text-xs font-bold tracking-wide">Vector Eraser</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={onClearCanvas}
          className="bg-slate-800 border border-slate-700 px-3 py-2 rounded-xl active:bg-slate-700"
        >
          <Text className="text-red-400 text-xs font-semibold">Flush Canvas</Text>
        </TouchableOpacity>
      </View>

      {/* Dynamic Property Controller Matrix */}
      {currentTool === "pen" && (
        <View className="flex flex-col space-y-2">
          <Text className="text-slate-400 text-xxs font-bold uppercase tracking-wider pl-1">
            Active Chroma Layer
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }} className="flex flex-row py-1">
            {PALETTE.map((color) => (
              <TouchableOpacity
                key={color}
                onPress={() => setCurrentColor(color)}
                style={{ backgroundColor: color }}
                className={`w-8 h-8 rounded-full border-2 ${
                  currentColor === color ? "border-blue-500 scale-110" : "border-slate-950"
                }`}
              />
            ))}
          </ScrollView>
        </View>
      )}

      <View className="flex flex-col space-y-2">
        <Text className="text-slate-400 text-xxs font-bold uppercase tracking-wider pl-1">
          Stroke Width Calibration
        </Text>
        <View className="flex flex-row space-x-3 items-center">
          {WIDTHS.map((width) => (
            <TouchableOpacity
              key={width}
              onPress={() => setStrokeWidth(width)}
              className={`flex-1 py-2 rounded-lg border items-center justify-center ${
                strokeWidth === width ? "bg-slate-700 border-blue-500" : "bg-slate-800 border-slate-700"
              }`}
            >
              <Text className="text-white text-xs font-medium">{width}px</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
}