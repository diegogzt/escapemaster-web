import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Alert } from "react-native";
import { rooms } from "../../services/api";
import { usePermissions } from "../../hooks/usePermissions";
import { useTheme } from "../../hooks/useTheme";
import { Plus, Users, Clock, DoorOpen } from "lucide-react-native";
import { router } from "expo-router";

const THEME_COLORS = {
  tropical: "#1f6357",
  twilight: "#4338ca",
  vista: "#d56a34",
  mint: "#1f756e",
  sunset: "#ff6b9d",
  ocean: "#006d77",
  lavender: "#9d84b7",
  fire: "#ff4500",
};

export default function RoomsScreen() {
  const [roomList, setRoomList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { hasPermission } = usePermissions();
  const { theme } = useTheme();

  const loadRooms = async () => {
    try {
      const data = await rooms.list();
      setRoomList(data.rooms || []);
    } catch (error) {
      console.error("Error loading rooms", error);
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
        <ActivityIndicator size="large" color={THEME_COLORS[theme] || "#1f6357"} />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView 
        className="flex-1 p-4"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className="flex-row justify-between items-center mb-6">
          <View>
            <Text className="text-2xl font-bold text-gray-900">Salas</Text>
            <Text className="text-gray-500">Gestiona tus escape rooms</Text>
          </View>
          {hasPermission("manage_rooms") && (
            <TouchableOpacity 
              className="bg-primary p-2 rounded-full"
              onPress={handleCreateRoom}
            >
              <Plus size={24} color="white" />
            </TouchableOpacity>
          )}
        </View>

        {roomList.length === 0 ? (
          <View className="bg-white rounded-xl p-8 items-center justify-center border border-gray-100">
            <DoorOpen size={48} color={THEME_COLORS[theme] || "#1f6357"} />
            <Text className="text-gray-500 mt-4 text-center">No hay salas configuradas</Text>
          </View>
        ) : (
          <View className="space-y-4">
            {roomList.map((room) => (
              <TouchableOpacity 
                key={room.id}
                className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex-row"
              >
                <View className="w-20 h-20 bg-light rounded-lg items-center justify-center mr-4">
                  <DoorOpen size={32} color={THEME_COLORS[theme] || "#1f6357"} />
                </View>
                <View className="flex-1 justify-center">
                  <Text className="text-lg font-bold text-gray-900">{room.name}</Text>
                  <View className="flex-row items-center mt-1">
                    <Users size={14} color="#64748b" />
                    <Text className="text-gray-500 text-sm ml-1">
                      {room.capacity_min}-{room.capacity} pers.
                    </Text>
                    <Clock size={14} color="#64748b" className="ml-3" />
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
