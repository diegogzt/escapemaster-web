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
import { KeyRound, Lock, ArrowLeft } from "lucide-react-native";
import { auth } from "../../services/api";

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
      Alert.alert(
        "Éxito",
        "Tu contraseña ha sido actualizada correctamente.",
        [{ text: "Ir al Login", onPress: () => router.replace("/login") }]
      );
    } catch (error: any) {
      const message = error.response?.data?.detail || "Error al restablecer la contraseña";
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
        contentContainerStyle={{ padding: 24 }}
      >
        <TouchableOpacity
          className="mt-10 mb-6 flex-row items-center"
          onPress={() => router.back()}
        >
          <ArrowLeft size={20} color="#2563eb" />
          <Text className="text-blue-600 ml-2 font-medium">Volver</Text>
        </TouchableOpacity>

        <View className="mb-10">
          <Text className="text-3xl font-bold text-gray-900">
            Nueva contraseña
          </Text>
          <Text className="text-gray-500 mt-2">
            Introduce el código que recibiste y tu nueva contraseña
          </Text>
        </View>

        <View>
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-1">Email</Text>
            <TextInput
              className="border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-gray-50"
              value={email}
              editable={false}
            />
          </View>

          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-1">Código de verificación</Text>
            <View className="flex-row items-center border border-gray-300 rounded-lg px-3 py-2">
              <KeyRound size={20} color="#6B7280" />
              <TextInput
                className="flex-1 ml-2 text-gray-900"
                placeholder="123456"
                value={code}
                onChangeText={setCode}
                keyboardType="number-pad"
                maxLength={6}
                textContentType="oneTimeCode"
              />
            </View>
          </View>

          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-1">Nueva contraseña</Text>
            <View className="flex-row items-center border border-gray-300 rounded-lg px-3 py-2">
              <Lock size={20} color="#6B7280" />
              <TextInput
                className="flex-1 ml-2 text-gray-900"
                placeholder="••••••••"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
                textContentType="newPassword"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>

          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-1">Confirmar contraseña</Text>
            <View className="flex-row items-center border border-gray-300 rounded-lg px-3 py-2">
              <Lock size={20} color="#6B7280" />
              <TextInput
                className="flex-1 ml-2 text-gray-900"
                placeholder="••••••••"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                textContentType="newPassword"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>

          <TouchableOpacity
            className={`mt-4 py-3 rounded-lg items-center ${
              loading ? "bg-blue-400" : "bg-blue-600"
            }`}
            onPress={handleReset}
            disabled={loading}
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
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
