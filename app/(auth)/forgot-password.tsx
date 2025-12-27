import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { Mail, ArrowLeft } from "lucide-react-native";
import { auth } from "../../services/api";

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
    <View className="flex-1 bg-white p-6">
      <TouchableOpacity
        className="mt-10 mb-6 flex-row items-center"
        onPress={() => router.back()}
      >
        <ArrowLeft size={20} color="#2563eb" />
        <Text className="text-blue-600 ml-2 font-medium">Volver</Text>
      </TouchableOpacity>

      <View className="mb-10">
        <Text className="text-3xl font-bold text-gray-900">
          Recuperar contraseña
        </Text>
        <Text className="text-gray-500 mt-2">
          Introduce tu email y te enviaremos un código
        </Text>
      </View>

      <View className="space-y-4">
        <View>
          <Text className="text-sm font-medium text-gray-700 mb-1">Email</Text>
          <View className="flex-row items-center border border-gray-300 rounded-lg px-3 py-2">
            <Mail size={20} color="#6B7280" />
            <TextInput
              className="flex-1 ml-2 text-gray-900"
              placeholder="tu@email.com"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>
        </View>

        <TouchableOpacity
          className={`mt-6 py-3 rounded-lg items-center ${
            loading ? "bg-blue-400" : "bg-blue-600"
          }`}
          onPress={handleReset}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-bold text-lg">
              Enviar instrucciones
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
