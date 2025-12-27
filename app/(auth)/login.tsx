import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Link, router } from "expo-router";
import { auth } from "../../services/api";
import { Lock, Mail } from "lucide-react-native";

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
    <View className="flex-1 bg-white p-6 justify-center">
      <View className="mb-10 items-center">
        <Text className="text-3xl font-bold text-gray-900">EscapeMaster</Text>
        <Text className="text-gray-500 mt-2">Inicia sesión en tu cuenta</Text>
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

        <View className="mt-4">
          <Text className="text-sm font-medium text-gray-700 mb-1">
            Contraseña
          </Text>
          <View className="flex-row items-center border border-gray-300 rounded-lg px-3 py-2">
            <Lock size={20} color="#6B7280" />
            <TextInput
              className="flex-1 ml-2 text-gray-900"
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>
        </View>

        <TouchableOpacity
          className="mt-2 self-end"
          onPress={() => router.push("/forgot-password")}
        >
          <Text className="text-primary text-sm">
            ¿Olvidaste tu contraseña?
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className={`mt-6 py-3 rounded-lg items-center ${
            loading ? "bg-primary/70" : "bg-primary"
          }`}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-bold text-lg">Entrar</Text>
          )}
        </TouchableOpacity>
      </View>

      <View className="mt-10 flex-row justify-center">
        <Text className="text-gray-600">¿No tienes cuenta? </Text>
        <Link href="/register">
          <Text className="text-primary font-bold">Regístrate</Text>
        </Link>
      </View>
    </View>
  );
}
