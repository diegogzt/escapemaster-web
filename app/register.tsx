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
import { router } from "expo-router";
import { auth } from "../services/api";
import {
  Lock,
  Mail,
  User,
  Building,
  ArrowRight,
  UserPlus,
  Users,
} from "lucide-react-native";
import { SEMANTIC_COLORS } from "../constants/Colors";

export default function RegisterScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [orgName, setOrgName] = useState("");
  const [invitationCode, setInvitationCode] = useState("");
  const [mode, setMode] = useState<"create" | "join">("create");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (
      !name ||
      !email ||
      !password ||
      (mode === "create" && !orgName) ||
      (mode === "join" && !invitationCode)
    ) {
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
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-white"
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="p-6 pt-16">
          <View className="mb-10 items-center">
            <View className="w-16 h-16 bg-primary/10 rounded-2xl items-center justify-center mb-4">
              <UserPlus size={32} color={SEMANTIC_COLORS.primary} />
            </View>
            <Text className="text-3xl font-bold text-gray-900 tracking-tight">
              EscapeMaster
            </Text>
            <Text className="text-gray-500 mt-2 text-center">
              Crea tu cuenta de administrador
            </Text>
          </View>

          <View className="space-y-5">
            <View className="flex-row bg-gray-100 p-1.5 rounded-2xl mb-6">
              <TouchableOpacity
                className={`flex-1 py-3 rounded-xl flex-row items-center justify-center ${
                  mode === "create" ? "bg-white shadow-sm" : ""
                }`}
                onPress={() => setMode("create")}
                activeOpacity={0.7}
              >
                <Building
                  size={18}
                  color={
                    mode === "create"
                      ? SEMANTIC_COLORS.primary
                      : SEMANTIC_COLORS.gray[500]
                  }
                />
                <Text
                  className={`text-center font-bold ml-2 ${
                    mode === "create" ? "text-primary" : "text-gray-500"
                  }`}
                >
                  Nueva Org
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`flex-1 py-3 rounded-xl flex-row items-center justify-center ${
                  mode === "join" ? "bg-white shadow-sm" : ""
                }`}
                onPress={() => setMode("join")}
                activeOpacity={0.7}
              >
                <Users
                  size={18}
                  color={
                    mode === "join"
                      ? SEMANTIC_COLORS.primary
                      : SEMANTIC_COLORS.gray[500]
                  }
                />
                <Text
                  className={`text-center font-bold ml-2 ${
                    mode === "join" ? "text-primary" : "text-gray-500"
                  }`}
                >
                  Unirse a Org
                </Text>
              </TouchableOpacity>
            </View>

            <View>
              <Text className="text-sm font-semibold text-gray-700 mb-2 ml-1">
                Nombre Completo
              </Text>
              <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-2xl px-4 py-4">
                <User size={20} color={SEMANTIC_COLORS.gray[400]} />
                <TextInput
                  className="flex-1 ml-3 text-gray-900 text-base"
                  placeholder="Juan Pérez"
                  value={name}
                  onChangeText={setName}
                  placeholderTextColor={SEMANTIC_COLORS.gray[400]}
                />
              </View>
            </View>

            <View className="mt-4">
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

            {mode === "create" ? (
              <View className="mt-4">
                <Text className="text-sm font-semibold text-gray-700 mb-2 ml-1">
                  Nombre de la Organización
                </Text>
                <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-2xl px-4 py-4">
                  <Building size={20} color={SEMANTIC_COLORS.gray[400]} />
                  <TextInput
                    className="flex-1 ml-3 text-gray-900 text-base"
                    placeholder="Mi Escape Room"
                    value={orgName}
                    onChangeText={setOrgName}
                    placeholderTextColor={SEMANTIC_COLORS.gray[400]}
                  />
                </View>
              </View>
            ) : (
              <View className="mt-4">
                <Text className="text-sm font-semibold text-gray-700 mb-2 ml-1">
                  Código de Invitación
                </Text>
                <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-2xl px-4 py-4">
                  <Building size={20} color={SEMANTIC_COLORS.gray[400]} />
                  <TextInput
                    className="flex-1 ml-3 text-gray-900 text-base"
                    placeholder="ABC123"
                    value={invitationCode}
                    onChangeText={setInvitationCode}
                    autoCapitalize="characters"
                    placeholderTextColor={SEMANTIC_COLORS.gray[400]}
                  />
                </View>
              </View>
            )}

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
              className={`mt-8 py-4 rounded-2xl items-center flex-row justify-center shadow-sm ${
                loading ? "bg-primary/70" : "bg-primary"
              }`}
              onPress={handleRegister}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Text className="text-white font-bold text-lg mr-2">
                    Registrarse
                  </Text>
                  <ArrowRight size={20} color="white" />
                </>
              )}
            </TouchableOpacity>
          </View>

          <View className="mt-12 flex-row justify-center items-center">
            <Text className="text-gray-500 text-base">¿Ya tienes cuenta? </Text>
            <TouchableOpacity
              onPress={() => router.push("/login")}
              activeOpacity={0.7}
              className="py-2"
            >
              <Text className="text-primary font-bold text-base">
                Inicia sesión
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
