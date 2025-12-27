import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from "react-native";
import { format, addDays, startOfToday, isSameDay, eachDayOfInterval, endOfMonth, startOfMonth } from "date-fns";
import { es } from "date-fns/locale";
import { bookings } from "../../services/api";
import { useTheme } from "../../hooks/useTheme";
import { Calendar as CalendarIcon, Clock, Users, ChevronRight, AlertCircle } from "lucide-react-native";

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

export default function CalendarScreen() {
  const [selectedDate, setSelectedDate] = useState(startOfToday());
  const [bookingList, setBookingList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { theme } = useTheme();

  // Generate 14 days starting from today
  const days = eachDayOfInterval({
    start: startOfToday(),
    end: addDays(startOfToday(), 13)
  });

  const loadBookings = async () => {
    setLoading(true);
    try {
      const data = await bookings.list({
        date: format(selectedDate, "yyyy-MM-dd")
      });
      setBookingList(data.bookings || []);
    } catch (error) {
      console.error("Error loading bookings", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, [selectedDate]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadBookings();
    setRefreshing(false);
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header with Date Selector */}
      <View className="bg-white pt-4 pb-2 shadow-sm border-b border-gray-100">
        <View className="px-4 mb-4">
          <Text className="text-2xl font-bold text-gray-900">Calendario</Text>
          <Text className="text-gray-500 capitalize">
            {format(selectedDate, "MMMM yyyy", { locale: es })}
          </Text>
        </View>
        
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          className="px-4"
          contentContainerStyle={{ paddingRight: 32 }}
        >
          {days.map((day) => {
            const isSelected = isSameDay(day, selectedDate);
            return (
              <TouchableOpacity
                key={day.toString()}
                onPress={() => setSelectedDate(day)}
                className={`items-center justify-center w-14 h-20 rounded-2xl mr-3 ${
                  isSelected ? "bg-primary" : "bg-gray-50"
                }`}
              >
                <Text className={`text-xs uppercase ${isSelected ? "text-white/80" : "text-gray-400"}`}>
                  {format(day, "eee", { locale: es })}
                </Text>
                <Text className={`text-lg font-bold mt-1 ${isSelected ? "text-white" : "text-gray-900"}`}>
                  {format(day, "d")}
                </Text>
                {isSelected && <View className="w-1.5 h-1.5 bg-white rounded-full mt-1" />}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Bookings List */}
      <ScrollView 
        className="flex-1 p-4"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading && !refreshing ? (
          <View className="py-20 items-center">
            <ActivityIndicator size="large" color={THEME_COLORS[theme] || "#1f6357"} />
          </View>
        ) : bookingList.length === 0 ? (
          <View className="bg-white rounded-2xl p-10 items-center justify-center border border-gray-100 mt-4">
            <CalendarIcon size={48} color={THEME_COLORS[theme] || "#1f6357"} />
            <Text className="text-gray-500 mt-4 text-center font-medium">No hay reservas para este día</Text>
            <TouchableOpacity 
              className="mt-6 bg-light px-6 py-3 rounded-xl"
              onPress={() => {/* Navigate to create booking */}}
            >
              <Text className="text-primary font-bold">Crear Reserva</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="space-y-4 pb-10">
            {bookingList.map((booking) => (
              <TouchableOpacity 
                key={booking.id}
                className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex-row items-center"
              >
                <View className="w-16 items-center border-r border-gray-100 mr-4">
                  <Text className="text-lg font-bold text-gray-900">
                    {format(new Date(booking.start_time), "HH:mm")}
                  </Text>
                  <Text className="text-xs text-gray-400">
                    {booking.duration_minutes} min
                  </Text>
                </View>
                
                <View className="flex-1">
                  <Text className="text-lg font-bold text-gray-900">{booking.room_name}</Text>
                  <View className="flex-row items-center mt-1">
                    <Users size={14} color="#64748b" />
                    <Text className="text-gray-500 text-sm ml-1">{booking.guest?.full_name || "N/A"}</Text>
                    <View className="w-1 h-1 bg-gray-300 rounded-full mx-2" />
                    <Text className="text-gray-500 text-sm">{booking.num_people} pers.</Text>
                  </View>
                </View>
                
                <View className={`px-3 py-1 rounded-full ${
                  booking.booking_status === 'confirmed' ? 'bg-green-50' : 'bg-orange-50'
                }`}>
                  <Text className={`text-xs font-bold ${
                    booking.booking_status === 'confirmed' ? 'text-green-600' : 'text-orange-600'
                  }`}>
                    {booking.booking_status === 'confirmed' ? 'CONF' : 'PEND'}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
