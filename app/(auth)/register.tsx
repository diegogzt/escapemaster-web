import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";
import { Link, useRouter } from "expo-router";
import { auth } from "../../services/api";
import { Lock, Mail, User, Building } from "lucide-react-native";

export default function RegisterScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [orgName, setOrgName] = useState("");
  const [invitationCode, setInvitationCode] = useState("");
  const [mode, setMode] = useState<"create" | "join">("create");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password || (mode === "create" && !orgName) || (mode === "join" && !invitationCode)) {
      Alert.alert("Error", "Por favor rellena todos los campos");
      return;
    }

    setLoading(true);
    try {
      await auth.register(
        name,
        email,
        password,
        mode === "create" ? orgName : undefined,
        mode === "join" ? invitationCode : undefined
      );
      Alert.alert(
        "Éxito",
        "Cuenta creada correctamente. Ahora puedes iniciar sesión.",
        [{ text: "OK", onPress: () => router.replace("/login") }]
      );
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.response?.data?.detail || "Error al registrarse"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="p-6 pt-20">
        <View className="mb-10 items-center">
          <Text className="text-3xl font-bold text-gray-900">EscapeMaster</Text>
          <Text className="text-gray-500 mt-2">
            Crea tu cuenta de administrador
          </Text>
        </View>

        <View className="space-y-4">
          <View className="flex-row bg-gray-100 p-1 rounded-lg mb-6">
            <TouchableOpacity
              className={`flex-1 py-2 rounded-md ${mode === "create" ? "bg-white shadow-sm" : ""}`}
              onPress={() => setMode("create")}
            >
              <Text className={`text-center font-medium ${mode === "create" ? "text-primary" : "text-gray-500"}`}>
                Nueva Org
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-1 py-2 rounded-md ${mode === "join" ? "bg-white shadow-sm" : ""}`}
              onPress={() => setMode("join")}
            >
              <Text className={`text-center font-medium ${mode === "join" ? "text-primary" : "text-gray-500"}`}>
                Unirse a Org
              </Text>
            </TouchableOpacity>
          </View>

          <View>
            <Text className="text-sm font-medium text-gray-700 mb-1">
              Nombre Completo
            </Text>
            <View className="flex-row items-center border border-gray-300 rounded-lg px-3 py-2">
              <User size={20} color="#6B7280" />
              <TextInput
                className="flex-1 ml-2 text-gray-900"
                placeholder="Juan Pérez"
                value={name}
                onChangeText={setName}
              />
            </View>
          </View>

          <View className="mt-4">
            <Text className="text-sm font-medium text-gray-700 mb-1">
              Email
            </Text>
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

          {mode === "create" ? (
            <View className="mt-4">
              <Text className="text-sm font-medium text-gray-700 mb-1">
                Nombre de la Organización
              </Text>
              <View className="flex-row items-center border border-gray-300 rounded-lg px-3 py-2">
                <Building size={20} color="#6B7280" />
                <TextInput
                  className="flex-1 ml-2 text-gray-900"
                  placeholder="Mi Escape Room"
                  value={orgName}
                  onChangeText={setOrgName}
                />
              </View>
            </View>
          ) : (
            <View className="mt-4">
              <Text className="text-sm font-medium text-gray-700 mb-1">
                Código de Invitación
              </Text>
              <View className="flex-row items-center border border-gray-300 rounded-lg px-3 py-2">
                <Building size={20} color="#6B7280" />
                <TextInput
                  className="flex-1 ml-2 text-gray-900"
                  placeholder="ABC123"
                  value={invitationCode}
                  onChangeText={setInvitationCode}
                  autoCapitalize="characters"
                />
              </View>
            </View>
          )}

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
            className={`mt-8 py-3 rounded-lg items-center ${
              loading ? "bg-primary/70" : "bg-primary"
            }`}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-bold text-lg">Registrarse</Text>
            )}
          </TouchableOpacity>
        </View>

        <View className="mt-10 flex-row justify-center mb-10">
          <Text className="text-gray-600">¿Ya tienes cuenta? </Text>
          <Link href="/login">
            <Text className="text-primary font-bold">Inicia sesión</Text>
          </Link>
        </View>
      </View>
    </ScrollView>
  );
}
