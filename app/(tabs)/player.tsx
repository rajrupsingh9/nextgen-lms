import React from "react";
import { View, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import SecureVideoPlayer from "../components/SecureVideoPlayer";
import AIDoubtSolver from "../components/AIDoubtSolver";
import AILectureNotes from "../components/AILectureNotes";
import { StatusBar } from "expo-status-bar";

export default function EnterpriseLectureScreen() {
  const currentLectureId = "lec_2026_neural_networks";
  const activeStudentId = "student_usr_prod_99";
  const mockPlaybackUrl = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
  const complianceWatermarkIdentity = "+919876543210";

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-slate-950"
    >
      <StatusBar style="light" />
      
      {/* 
        Responsive Layout System (NFR 5.2): 
        Uses flat flex arrays to handle portrait smartphone setups safely 
        and scale cleanly on wider tablet dimensions.
      */}
      <View className="flex-1 flex-col p-4 pt-12 space-y-4">
        
        {/* Isolated Core Media Engine Frame */}
        <View className="w-full shrink-0">
          <SecureVideoPlayer
            mediaId={currentLectureId}
            testStreamUrl={mockPlaybackUrl}
            studentIdentity={complianceWatermarkIdentity}
          />
        </View>

        {/* Scrollable Context Panel Split (Whiteboard summaries and real-time interaction channels) */}
        <View className="flex-1 flex-col space-y-4">
          <ScrollView className="flex-1 space-y-4" showsVerticalScrollIndicator={false}>
            <View className="mb-4">
              <AILectureNotes lectureId={currentLectureId} />
            </View>
            
            <View className="h-[380px]">
              <AIDoubtSolver lectureId={currentLectureId} studentId={activeStudentId} />
            </View>
          </ScrollView>
        </View>

      </View>
    </KeyboardAvoidingView>
  );
}
