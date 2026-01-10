import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import {
  KeyRound,
  Lock,
  ArrowLeft,
  Mail,
  CheckCircle2,
} from "lucide-react-native";
import { auth } from "../services/api";
import { SEMANTIC_COLORS } from "../constants/Colors";

export default function ResetPasswordScreen() {
  const { email: initialEmail } = useLocalSearchParams<{ email: string }>();
  const [email, setEmail] = useState(initialEmail || "");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (!email || !code || !newPassword || !confirmPassword) {
      Alert.alert("Error", "Por favor completa todos los campos");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "Las contraseñas no coinciden");
      return;
    }

    if (newPassword.length < 8) {
      Alert.alert("Error", "La contraseña debe tener al menos 8 caracteres");
      return;
    }

    setLoading(true);
    try {
      await auth.resetPassword(email, code, newPassword);
      Alert.alert("Éxito", "Tu contraseña ha sido actualizada correctamente.", [
        { text: "Ir al Login", onPress: () => router.replace("/login") },
      ]);
    } catch (error: any) {
      const message =
        error.response?.data?.detail || "Error al restablecer la contraseña";
      Alert.alert("Error", message);
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
        className="flex-1"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="p-6 pt-12">
          <TouchableOpacity
            className="mb-8 flex-row items-center py-2"
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <ArrowLeft size={20} color={SEMANTIC_COLORS.primary} />
            <Text className="text-primary ml-2 font-bold text-base">
              Volver
            </Text>
          </TouchableOpacity>

          <View className="mb-10 items-center">
            <View className="w-16 h-16 bg-primary/10 rounded-2xl items-center justify-center mb-6">
              <CheckCircle2 size={32} color={SEMANTIC_COLORS.primary} />
            </View>
            <Text className="text-3xl font-bold text-gray-900 tracking-tight">
              Nueva contraseña
            </Text>
            <Text className="text-gray-500 mt-2 text-center text-base">
              Introduce el código que recibiste y tu nueva contraseña
            </Text>
          </View>

          <View className="space-y-5">
            <View>
              <Text className="text-sm font-semibold text-gray-700 mb-2 ml-1">
                Email
              </Text>
              <View className="flex-row items-center bg-gray-100 border border-gray-200 rounded-2xl px-4 py-4 opacity-60">
                <Mail size={20} color={SEMANTIC_COLORS.gray[400]} />
                <TextInput
                  className="flex-1 ml-3 text-gray-900 text-base"
                  value={email}
                  editable={false}
                />
              </View>
            </View>

            <View className="mt-4">
              <Text className="text-sm font-semibold text-gray-700 mb-2 ml-1">
                Código de verificación
              </Text>
              <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-2xl px-4 py-4">
                <KeyRound size={20} color={SEMANTIC_COLORS.gray[400]} />
                <TextInput
                  className="flex-1 ml-3 text-gray-900 text-base"
                  placeholder="123456"
                  value={code}
                  onChangeText={setCode}
                  keyboardType="number-pad"
                  maxLength={6}
                  textContentType="oneTimeCode"
                  placeholderTextColor={SEMANTIC_COLORS.gray[400]}
                />
              </View>
            </View>

            <View className="mt-4">
              <Text className="text-sm font-semibold text-gray-700 mb-2 ml-1">
                Nueva contraseña
              </Text>
              <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-2xl px-4 py-4">
                <Lock size={20} color={SEMANTIC_COLORS.gray[400]} />
                <TextInput
                  className="flex-1 ml-3 text-gray-900 text-base"
                  placeholder="••••••••"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry
                  textContentType="newPassword"
                  autoCapitalize="none"
                  autoCorrect={false}
                  placeholderTextColor={SEMANTIC_COLORS.gray[400]}
                />
              </View>
            </View>

            <View className="mt-4">
              <Text className="text-sm font-semibold text-gray-700 mb-2 ml-1">
                Confirmar contraseña
              </Text>
              <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-2xl px-4 py-4">
                <Lock size={20} color={SEMANTIC_COLORS.gray[400]} />
                <TextInput
                  className="flex-1 ml-3 text-gray-900 text-base"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  textContentType="newPassword"
                  autoCapitalize="none"
                  autoCorrect={false}
                  placeholderTextColor={SEMANTIC_COLORS.gray[400]}
                />
              </View>
            </View>

            <TouchableOpacity
              className={`mt-8 py-4 rounded-2xl items-center flex-row justify-center shadow-sm ${
                loading ? "bg-primary/70" : "bg-primary"
              }`}
              onPress={handleReset}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-bold text-lg">
                  Actualizar contraseña
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
