import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import {
  format,
  addDays,
  startOfToday,
  isSameDay,
  eachDayOfInterval,
  startOfWeek,
  endOfWeek,
} from "date-fns";
import { es } from "date-fns/locale";
import { bookings } from "../../services/api";
import { useTheme } from "../../hooks/useTheme";
import {
  Calendar as CalendarIcon,
  Users,
  LayoutGrid,
  List,
} from "lucide-react-native";
import { THEME_COLORS, SEMANTIC_COLORS } from "../../constants/Colors";
import { router } from "expo-router";

export default function CalendarScreen() {
  const [selectedDate, setSelectedDate] = useState(startOfToday());
  const [viewMode, setViewMode] = useState<"day" | "week">("day");
  const [bookingList, setBookingList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { theme } = useTheme();

  const activeThemeColor = THEME_COLORS[theme] || THEME_COLORS.tropical;

  // Generate 14 days starting from today for the day selector
  const days = eachDayOfInterval({
    start: startOfToday(),
    end: addDays(startOfToday(), 13),
  });

  const loadBookings = async () => {
    setLoading(true);
    try {
      let params: any = {};
      if (viewMode === "day") {
        params.date_from = format(selectedDate, "yyyy-MM-dd'T'00:00:00");
        params.date_to = format(selectedDate, "yyyy-MM-dd'T'23:59:59");
      } else {
        const start = startOfWeek(selectedDate, { locale: es });
        const end = endOfWeek(selectedDate, { locale: es });
        params.date_from = format(start, "yyyy-MM-dd'T'00:00:00");
        params.date_to = format(end, "yyyy-MM-dd'T'23:59:59");
      }

      const data = await bookings.list(params);
      setBookingList(data.bookings || []);
    } catch (error: any) {
      // Don't log 401 errors as they are handled by the API interceptor
      if (error.response?.status !== 401) {
        console.error("Error loading bookings", error);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, [selectedDate, viewMode]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadBookings();
    setRefreshing(false);
  };

  const groupBookingsByDay = () => {
    const groups: { [key: string]: any[] } = {};
    bookingList.forEach((booking) => {
      const day = format(new Date(booking.start_time), "yyyy-MM-dd");
      if (!groups[day]) groups[day] = [];
      groups[day].push(booking);
    });
    return groups;
  };

  const groupedBookings = groupBookingsByDay();
  const sortedDays = Object.keys(groupedBookings).sort();

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header with Date Selector and View Toggle */}
      <View className="bg-white pt-4 pb-2 shadow-sm border-b border-gray-100">
        <View className="px-4 mb-4 flex-row justify-between items-center">
          <View>
            <Text className="text-2xl font-bold text-gray-900">Calendario</Text>
            <Text className="text-gray-500 capitalize">
              {viewMode === "day"
                ? format(selectedDate, "EEEE, d 'de' MMMM", { locale: es })
                : `Semana del ${format(
                    startOfWeek(selectedDate, { locale: es }),
                    "d 'de' MMMM",
                    { locale: es }
                  )}`}
            </Text>
          </View>

          <View className="flex-row bg-gray-100 p-1 rounded-xl">
            <TouchableOpacity
              onPress={() => setViewMode("day")}
              className={`px-3 py-2 rounded-lg flex-row items-center ${
                viewMode === "day" ? "bg-white shadow-sm" : ""
              }`}
              activeOpacity={0.7}
            >
              <LayoutGrid
                size={18}
                color={
                  viewMode === "day"
                    ? activeThemeColor
                    : SEMANTIC_COLORS.gray[500]
                }
              />
              <Text
                className={`ml-1.5 text-xs font-bold ${
                  viewMode === "day" ? "text-gray-900" : "text-gray-500"
                }`}
              >
                Día
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setViewMode("week")}
              className={`px-3 py-2 rounded-lg flex-row items-center ${
                viewMode === "week" ? "bg-white shadow-sm" : ""
              }`}
              activeOpacity={0.7}
            >
              <List
                size={18}
                color={
                  viewMode === "week"
                    ? activeThemeColor
                    : SEMANTIC_COLORS.gray[500]
                }
              />
              <Text
                className={`ml-1.5 text-xs font-bold ${
                  viewMode === "week" ? "text-gray-900" : "text-gray-500"
                }`}
              >
                Semana
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {viewMode === "day" && (
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
                  className={`items-center justify-center w-16 h-20 rounded-2xl mr-3 ${
                    isSelected ? "bg-primary" : "bg-gray-50"
                  }`}
                  activeOpacity={0.8}
                >
                  <Text
                    className={`text-xs uppercase font-bold ${
                      isSelected ? "text-white/80" : "text-gray-400"
                    }`}
                  >
                    {format(day, "eee", { locale: es })}
                  </Text>
                  <Text
                    className={`text-xl font-bold mt-1 ${
                      isSelected ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {format(day, "d")}
                  </Text>
                  {isSelected && (
                    <View className="w-1.5 h-1.5 bg-white rounded-full mt-1" />
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}
      </View>

      {/* Bookings List */}
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
        {loading && !refreshing ? (
          <View className="py-20 items-center">
            <ActivityIndicator size="large" color={activeThemeColor} />
          </View>
        ) : bookingList.length === 0 ? (
          <View className="bg-white rounded-2xl p-10 items-center justify-center border border-gray-100 mt-4">
            <CalendarIcon size={48} color={activeThemeColor} />
            <Text className="text-gray-500 mt-4 text-center font-medium">
              No hay reservas para este periodo
            </Text>
            <TouchableOpacity
              className="mt-6 bg-light px-8 py-4 rounded-2xl h-14 justify-center"
              onPress={() => router.push("/bookings")}
              activeOpacity={0.7}
            >
              <Text className="text-primary font-bold text-lg">
                Crear Reserva
              </Text>
            </TouchableOpacity>
          </View>
        ) : viewMode === "day" ? (
          <View className="pb-10">
            {bookingList.map((booking) => (
              <BookingCard key={booking.id} booking={booking} theme={theme} />
            ))}
          </View>
        ) : (
          <View className="pb-10">
            {sortedDays.map((day) => (
              <View key={day} className="mb-6">
                <View className="flex-row items-center mb-3 ml-1">
                  <Text className="text-sm font-bold text-gray-400 uppercase">
                    {format(new Date(day), "EEEE, d 'de' MMMM", { locale: es })}
                  </Text>
                  <View className="flex-1 h-[1px] bg-gray-100 ml-3" />
                </View>
                <View>
                  {groupedBookings[day].map((booking) => (
                    <BookingCard
                      key={booking.id}
                      booking={booking}
                      theme={theme}
                    />
                  ))}
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function BookingCard({ booking, theme }: { booking: any; theme: any }) {
  return (
    <TouchableOpacity
      className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex-row items-center mb-3"
      activeOpacity={0.7}
      onPress={() => {
        /* Navigate to booking details */
      }}
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
        <Text className="text-lg font-bold text-gray-900">
          {booking.room_name}
        </Text>
        <View className="flex-row items-center mt-1">
          <Users size={14} color={SEMANTIC_COLORS.gray[500]} />
          <Text className="text-gray-500 text-sm ml-1">
            {booking.guest?.full_name || "N/A"}
          </Text>
          <View className="w-1 h-1 bg-gray-300 rounded-full mx-2" />
          <Text className="text-gray-500 text-sm">
            {booking.num_people} pers.
          </Text>
        </View>
      </View>

      <View
        className={`px-3 py-1 rounded-full ${
          booking.booking_status === "confirmed"
            ? "bg-success/10"
            : "bg-warning/10"
        }`}
      >
        <Text
          className={`text-xs font-bold ${
            booking.booking_status === "confirmed"
              ? "text-success"
              : "text-warning"
          }`}
        >
          {booking.booking_status === "confirmed" ? "CONF" : "PEND"}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
