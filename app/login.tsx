import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import { auth } from "../services/api";
import { Lock, Mail, ArrowRight } from "lucide-react-native";
import { SEMANTIC_COLORS } from "../constants/Colors";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Por favor rellena todos los campos");
      return;
    }

    setLoading(true);
    try {
      await auth.login(email, password);
      router.replace("/(dashboard)");
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.response?.data?.detail || "Error al iniciar sesión"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-white"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
        className="p-6"
      >
        <View className="mb-12 items-center">
          <View className="w-20 h-20 bg-primary/10 rounded-3xl items-center justify-center mb-6">
            <Lock size={40} color={SEMANTIC_COLORS.primary} />
          </View>
          <Text className="text-4xl font-bold text-gray-900 tracking-tight">
            EscapeMaster
          </Text>
          <Text className="text-gray-500 mt-2 text-lg">
            Bienvenido de nuevo
          </Text>
        </View>

        <View className="space-y-5">
          <View>
            <Text className="text-sm font-semibold text-gray-700 mb-2 ml-1">
              Email
            </Text>
            <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-2xl px-4 py-4">
              <Mail size={20} color={SEMANTIC_COLORS.gray[400]} />
              <TextInput
                className="flex-1 ml-3 text-gray-900 text-base"
                placeholder="tu@email.com"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                placeholderTextColor={SEMANTIC_COLORS.gray[400]}
              />
            </View>
          </View>

          <View className="mt-4">
            <Text className="text-sm font-semibold text-gray-700 mb-2 ml-1">
              Contraseña
            </Text>
            <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-2xl px-4 py-4">
              <Lock size={20} color={SEMANTIC_COLORS.gray[400]} />
              <TextInput
                className="flex-1 ml-3 text-gray-900 text-base"
                placeholder="••••••••"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholderTextColor={SEMANTIC_COLORS.gray[400]}
              />
            </View>
          </View>

          <TouchableOpacity
            className="mt-2 self-end py-2"
            onPress={() => router.push("/forgot-password")}
            activeOpacity={0.7}
          >
            <Text className="text-primary font-semibold text-sm">
              ¿Olvidaste tu contraseña?
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className={`mt-8 py-4 rounded-2xl items-center flex-row justify-center shadow-sm ${
              loading ? "bg-primary/70" : "bg-primary"
            }`}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Text className="text-white font-bold text-lg mr-2">
                  Entrar
                </Text>
                <ArrowRight size={20} color="white" />
              </>
            )}
          </TouchableOpacity>
        </View>

        <View className="mt-12 flex-row justify-center items-center">
          <Text className="text-gray-500 text-base">¿No tienes cuenta? </Text>
          <TouchableOpacity
            onPress={() => router.push("/register")}
            activeOpacity={0.7}
            className="py-2"
          >
            <Text className="text-primary font-bold text-base">Regístrate</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
