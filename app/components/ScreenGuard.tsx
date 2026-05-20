import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import * as ScreenCapture from "expo-screen-capture";

interface ScreenGuardProps {
  children: React.ReactNode;
}

export default function ScreenGuard({ children }: ScreenGuardProps) {
  const [isRecordingDetected, setIsRecordingDetected] = useState<boolean>(false);

  useEffect(() => {
    // Actively assert hardware-level protection flags (Android: FLAG_SECURE)
    async function activateHardwareBlock() {
      try {
        await ScreenCapture.preventScreenCaptureAsync();
      } catch (error) {
        console.error("Failed to assert native hardware display flags:", error);
      }
    }
    activateHardwareBlock();

    // Listeners for recording events (primarily iOS detection hooks)
    const subscription = ScreenCapture.addScreenshotListener(() => {
      console.warn("Security Event Triggered: Unauthorized screenshot vector executed.");
    });

    return () => {
      subscription.remove();
      ScreenCapture.allowScreenCaptureAsync().catch((err) =>
        console.error("Failed to release hardware display flags:", err)
      );
    };
  }, []);

  return (
    <View style={styles.container}>
      {children}
      {isRecordingDetected && (
        <View 
          style={StyleSheet.absoluteFillObject} 
          className="bg-slate-950/95 flex items-center justify-center p-6"
        >
          <View className="bg-red-500/10 border border-red-500/30 p-4 rounded-xl max-w-xs">
            <text className="text-red-500 font-bold text-center text-base mb-1">
              Protected Media Environment
            </text>
            <text className="text-slate-400 text-xs text-center">
              Screen recording and unauthorized capture streams are completely restricted on this platform.
            </text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
