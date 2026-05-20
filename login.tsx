import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { useAuth } from "../context/AuthContext";
import { StatusBar } from "expo-status-bar";

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleAuthenticationRequest() {
    if (!email.trim() || !password.trim()) {
      setErrorMessage("Please complete all requested verification entries.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      // Simulate API production payload authentication challenge
      // In production production workflows, replace with: const response = await api.post('/auth/login', { email, password });
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      const mockJwt = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c3JfMjAyNl9scXptOSIsIm5hbWUiOiJKb2huIERvZSIsImV4cCI6OTk5OTk5OTk5OX0.mock_signature_data";
      const mockUserId = "usr_2026_lqzm9";

      await login(mockJwt, mockUserId);
    } catch (err) {
      setErrorMessage("Authentication failed. Check security credentials and try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"} 
      className="flex-1 bg-slate-950"
    >
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="px-6 justify-center">
        <View className="w-full max-w-sm mx-auto space-y-6">
          
          {/* Brand Header */}
          <View className="space-y-2 text-center">
            <Text className="text-white font-extrabold text-4xl tracking-tight">
              NextGen <Text className="text-blue-500">LMS</Text>
            </Text>
            <Text className="text-slate-400 text-sm font-medium">
              Enterprise Secure Learning Infrastructure
            </Text>
          </View>

          {/* Form Processing Message Panels */}
          {errorMessage && (
            <View className="bg-red-500/10 border border-red-500/20 p-3 rounded-xl">
              <Text className="text-red-400 text-xs text-center font-medium">{errorMessage}</Text>
            </View>
          )}

          {/* Core Input Fields */}
          <View className="space-y-4">
            <View className="space-y-1">
              <Text className="text-slate-300 text-xs font-semibold uppercase tracking-wider pl-1">
                Corporate Email Address
              </Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="name@institution.com"
                placeholderTextColor="#64748b"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl px-4 py-3.5 text-base focus:border-blue-500"
              />
            </View>

            <View className="space-y-1">
              <Text className="text-slate-300 text-xs font-semibold uppercase tracking-wider pl-1">
                Security Password
              </Text>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••••••"
                placeholderTextColor="#64748b"
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl px-4 py-3.5 text-base focus:border-blue-500"
              />
            </View>
          </View>

          {/* Authentication CTA */}
          <TouchableOpacity
            onPress={handleAuthenticationRequest}
            disabled={isSubmitting}
            activeOpacity={0.8}
            className="w-full bg-blue-600 active:bg-blue-700 disabled:bg-blue-800/50 h-14 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20"
          >
            {isSubmitting ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text className="text-white text-base font-bold tracking-wide">
                Authorize Session
              </Text>
            )}
          </TouchableOpacity>

          {/* Hardware Compliance Attestation Footer */}
          <View className="pt-4 border-t border-slate-900">
            <Text className="text-slate-500 text-center text-xxs leading-relaxed">
              This application is hardened with hardware cryptographic keys. Active screen captures, duplicate logins, or interceptor modifications violate terms and trigger immediate session termination.
            </Text>
          </View>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}