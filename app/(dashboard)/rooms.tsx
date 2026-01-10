import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { rooms } from "../../services/api";
import { usePermissions } from "../../hooks/usePermissions";
import { useTheme } from "../../hooks/useTheme";
import { Plus, Users, Clock, DoorOpen } from "lucide-react-native";
import { router } from "expo-router";
import { THEME_COLORS, SEMANTIC_COLORS } from "../../constants/Colors";

export default function RoomsScreen() {
  const [roomList, setRoomList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { hasPermission } = usePermissions();
  const { theme } = useTheme();

  const activeThemeColor = THEME_COLORS[theme] || THEME_COLORS.tropical;

  const loadRooms = async () => {
    try {
      const data = await rooms.list();
      setRoomList(data.rooms || []);
    } catch (error: any) {
      // Don't log 401 errors as they are handled by the API interceptor
      if (error.response?.status !== 401) {
        console.error("Error loading rooms", error);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRooms();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRooms();
    setRefreshing(false);
  };

  const handleCreateRoom = () => {
    router.push("/create-room");
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color={activeThemeColor} />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView
        className="flex-1 p-4"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={activeThemeColor}
          />
        }
      >
        <View className="flex-row justify-between items-center mb-6">
          <View>
            <Text className="text-2xl font-bold text-gray-900">Salas</Text>
            <Text className="text-gray-500">Gestiona tus escape rooms</Text>
          </View>
          {hasPermission("manage_rooms") && (
            <TouchableOpacity
              className="bg-primary w-12 h-12 rounded-full items-center justify-center shadow-sm"
              onPress={handleCreateRoom}
              activeOpacity={0.8}
            >
              <Plus size={28} color="white" />
            </TouchableOpacity>
          )}
        </View>

        {roomList.length === 0 ? (
          <View className="bg-white rounded-2xl p-10 items-center justify-center border border-gray-100">
            <DoorOpen size={48} color={activeThemeColor} />
            <Text className="text-gray-500 mt-4 text-center font-medium">
              No hay salas configuradas
            </Text>
            {hasPermission("manage_rooms") && (
              <TouchableOpacity
                className="mt-6 bg-light px-8 py-4 rounded-2xl h-14 justify-center"
                onPress={handleCreateRoom}
                activeOpacity={0.7}
              >
                <Text className="text-primary font-bold text-lg">
                  Crear Primera Sala
                </Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View className="pb-10">
            {roomList.map((room) => (
              <TouchableOpacity
                key={room.id}
                className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex-row mb-4"
                activeOpacity={0.7}
                onPress={() => {
                  /* Navigate to room details */
                }}
              >
                <View className="w-20 h-20 bg-light rounded-xl items-center justify-center mr-4">
                  <DoorOpen size={36} color={activeThemeColor} />
                </View>
                <View className="flex-1 justify-center">
                  <Text className="text-lg font-bold text-gray-900">
                    {room.name}
                  </Text>
                  <View className="flex-row items-center mt-1">
                    <Users size={14} color={SEMANTIC_COLORS.gray[500]} />
                    <Text className="text-gray-500 text-sm ml-1">
                      {room.capacity_min}-{room.capacity} pers.
                    </Text>
                    <View className="w-1 h-1 bg-gray-300 rounded-full mx-2" />
                    <Clock size={14} color={SEMANTIC_COLORS.gray[500]} />
                    <Text className="text-gray-500 text-sm ml-1">
                      {room.duration_minutes} min.
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
