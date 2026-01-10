import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { auth } from "../../services/api";
import { useTheme, ThemeType } from "../../hooks/useTheme";
import {
  LogOut,
  User,
  Bell,
  Shield,
  CircleHelp,
  Palette,
  Check,
  Building,
  Copy,
} from "lucide-react-native";
import * as Clipboard from "expo-clipboard";

const THEMES: { id: ThemeType; name: string; color: string }[] = [
  { id: "tropical", name: "Tropical", color: "#1f6357" },
  { id: "twilight", name: "Twilight", color: "#4338ca" },
  { id: "vista", name: "Vista", color: "#d56a34" },
  { id: "mint", name: "Mint", color: "#1f756e" },
  { id: "sunset", name: "Sunset", color: "#ff6b9d" },
  { id: "ocean", name: "Ocean", color: "#006d77" },
  { id: "lavender", name: "Lavender", color: "#9d84b7" },
  { id: "fire", name: "Fire", color: "#ff4500" },
];

export default function SettingsScreen() {
  const { theme: currentTheme, setTheme } = useTheme();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await auth.me();
        setUser(userData);
      } catch (error: any) {
        // Don't log 401 errors as they are handled by the API interceptor
        if (error.response?.status !== 401) {
          console.error("Error fetching user", error);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = () => {
    Alert.alert("Cerrar sesión", "¿Estás seguro de que quieres salir?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Salir", style: "destructive", onPress: () => auth.logout() },
    ]);
  };

  const copyToClipboard = async (text: string) => {
    await Clipboard.setStringAsync(text);
    Alert.alert("Copiado", "Código de invitación copiado al portapapeles");
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#1f6357" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50 p-4">
      <Text className="text-gray-500 font-bold mb-2 ml-1">ORGANIZACIÓN</Text>
      <View className="bg-white rounded-2xl border border-gray-100 p-4 mb-6">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Building size={20} color="#64748b" />
            <View className="ml-3">
              <Text className="text-gray-900 font-medium">
                {user?.organization_name || "Sin organización"}
              </Text>
              <Text className="text-gray-500 text-sm">
                Código: {user?.invitation_code || "N/A"}
              </Text>
            </View>
          </View>
          {user?.invitation_code && (
            <TouchableOpacity
              onPress={() => copyToClipboard(user.invitation_code)}
              className="bg-gray-100 p-2 rounded-lg"
            >
              <Copy size={18} color="#1f6357" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <Text className="text-gray-500 font-bold mb-2 ml-1">CUENTA</Text>
      <View className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-6">
        <SettingItem icon={<User size={20} color="#64748b" />} title="Perfil" />
        <SettingItem
          icon={<Bell size={20} color="#64748b" />}
          title="Notificaciones"
        />
        <SettingItem
          icon={<Shield size={20} color="#64748b" />}
          title="Seguridad"
        />
      </View>

      <Text className="text-gray-500 font-bold mb-2 ml-1">APARIENCIA</Text>
      <View className="bg-white rounded-2xl border border-gray-100 p-4 mb-6">
        <View className="flex-row items-center mb-4">
          <Palette size={20} color="#64748b" />
          <Text className="text-gray-900 font-medium ml-3">
            Tema de la aplicación
          </Text>
        </View>

        <View className="flex-row flex-wrap -mx-1">
          {THEMES.map((theme) => (
            <TouchableOpacity
              key={theme.id}
              onPress={() => setTheme(theme.id)}
              className={`w-1/2 p-1`}
            >
              <View
                className={`flex-row items-center p-3 rounded-xl border ${
                  currentTheme === theme.id
                    ? "border-primary bg-light"
                    : "border-gray-100 bg-gray-50"
                }`}
              >
                <View
                  className="w-4 h-4 rounded-full mr-2"
                  style={{ backgroundColor: theme.color }}
                />
                <Text
                  className={`flex-1 text-sm ${
                    currentTheme === theme.id
                      ? "text-primary font-bold"
                      : "text-gray-600"
                  }`}
                >
                  {theme.name}
                </Text>
                {currentTheme === theme.id && (
                  <Check size={16} color={theme.color} />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <Text className="text-gray-500 font-bold mb-2 ml-1">OTROS</Text>
      <View className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-6">
        <SettingItem
          icon={<CircleHelp size={20} color="#64748b" />}
          title="Ayuda"
          last
        />
      </View>

      <TouchableOpacity
        className="bg-white rounded-2xl border border-red-100 p-4 flex-row items-center justify-center mb-10"
        onPress={handleLogout}
      >
        <LogOut size={20} color="#dc2626" />
        <Text className="text-red-600 font-bold ml-2">Cerrar Sesión</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function SettingItem({
  icon,
  title,
  last,
}: {
  icon: React.ReactNode;
  title: string;
  last?: boolean;
}) {
  return (
    <TouchableOpacity
      className={`p-4 flex-row items-center ${
        !last ? "border-b border-gray-50" : ""
      }`}
    >
      <View className="w-8">{icon}</View>
      <Text className="text-gray-900 font-medium ml-1 flex-1">{title}</Text>
      <Text className="text-gray-400">›</Text>
    </TouchableOpacity>
  );
}
