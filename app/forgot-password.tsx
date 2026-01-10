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
} from "react-native";
import { router } from "expo-router";
import { Mail, ArrowLeft, KeyRound, Send } from "lucide-react-native";
import { auth } from "../services/api";
import { SEMANTIC_COLORS } from "../constants/Colors";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (!email) {
      Alert.alert("Error", "Por favor introduce tu email");
      return;
    }

    setLoading(true);
    try {
      await auth.forgotPassword(email);
      Alert.alert(
        "Enviado",
        "Si el email existe, recibirás instrucciones para restablecer tu contraseña.",
        [
          {
            text: "OK",
            onPress: () =>
              router.push({
                pathname: "/reset-password",
                params: { email },
              }),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert("Error", "Error al procesar la solicitud");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-white"
    >
      <View className="p-6 pt-12">
        <TouchableOpacity
          className="mb-8 flex-row items-center py-2"
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <ArrowLeft size={20} color={SEMANTIC_COLORS.primary} />
          <Text className="text-primary ml-2 font-bold text-base">Volver</Text>
        </TouchableOpacity>

        <View className="mb-10 items-center">
          <View className="w-16 h-16 bg-primary/10 rounded-2xl items-center justify-center mb-6">
            <KeyRound size={32} color={SEMANTIC_COLORS.primary} />
          </View>
          <Text className="text-3xl font-bold text-gray-900 tracking-tight">
            Recuperar contraseña
          </Text>
          <Text className="text-gray-500 mt-2 text-center text-base">
            Introduce tu email y te enviaremos un código para restablecer tu
            acceso
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
              <>
                <Text className="text-white font-bold text-lg mr-2">
                  Enviar instrucciones
                </Text>
                <Send size={18} color="white" />
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
