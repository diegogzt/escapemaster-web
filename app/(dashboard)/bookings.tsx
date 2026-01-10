import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { bookings as bookingsApi } from "../../services/api";
import { useTheme } from "../../hooks/useTheme";
import {
  Calendar,
  User,
  Users,
  ChevronRight,
  Search,
  Filter,
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react-native";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { THEME_COLORS, SEMANTIC_COLORS } from "../../constants/Colors";

const STATUS_COLORS: any = {
  confirmed: {
    bg: "bg-success/10",
    text: "text-success",
    icon: (color: string) => <CheckCircle2 size={14} color={color} />,
    hex: SEMANTIC_COLORS.success,
  },
  pending: {
    bg: "bg-warning/10",
    text: "text-warning",
    icon: (color: string) => <Clock size={14} color={color} />,
    hex: SEMANTIC_COLORS.warning,
  },
  cancelled: {
    bg: "bg-error/10",
    text: "text-error",
    icon: (color: string) => <XCircle size={14} color={color} />,
    hex: SEMANTIC_COLORS.error,
  },
  completed: {
    bg: "bg-info/10",
    text: "text-info",
    icon: (color: string) => <CheckCircle2 size={14} color={color} />,
    hex: SEMANTIC_COLORS.info,
  },
};

export default function BookingsScreen() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { theme } = useTheme();

  const activeThemeColor = THEME_COLORS[theme] || THEME_COLORS.tropical;

  const loadBookings = async () => {
    try {
      const response = await bookingsApi.list();
      setBookings(response.bookings || []);
    } catch (error: any) {
      // Don't log 401 errors as they are handled by the API interceptor
      if (error.response?.status !== 401) {
        console.error("Error loading bookings", error);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadBookings();
  };

  const filteredBookings = bookings.filter(
    (b) =>
      b.room_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.guest?.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color={activeThemeColor} />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <View className="p-4 bg-white border-b border-gray-100">
        <Text className="text-2xl font-bold text-gray-900 mb-4">Reservas</Text>

        <View className="flex-row items-center">
          <View className="flex-1 flex-row items-center bg-gray-100 rounded-xl px-4 py-3 mr-2 h-12">
            <Search size={20} color={SEMANTIC_COLORS.gray[400]} />
            <TextInput
              className="flex-1 ml-2 text-gray-900 text-sm"
              placeholder="Buscar por sala o cliente..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <TouchableOpacity
            className="bg-gray-100 w-12 h-12 rounded-xl items-center justify-center"
            activeOpacity={0.7}
          >
            <Filter size={22} color={SEMANTIC_COLORS.gray[500]} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={activeThemeColor}
          />
        }
      >
        {filteredBookings.length > 0 ? (
          filteredBookings.map((booking) => (
            <TouchableOpacity
              key={booking.id}
              className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-gray-100"
              activeOpacity={0.7}
              onPress={() => {
                /* Navigate to booking details */
              }}
            >
              <View className="flex-row justify-between items-start mb-3">
                <View className="flex-1">
                  <Text className="text-lg font-bold text-gray-900">
                    {booking.room_name}
                  </Text>
                  <View className="flex-row items-center mt-1">
                    <Calendar size={14} color={SEMANTIC_COLORS.gray[500]} />
                    <Text className="text-gray-500 text-xs ml-1">
                      {format(
                        new Date(booking.start_time),
                        "EEEE, d 'de' MMMM",
                        { locale: es }
                      )}
                    </Text>
                  </View>
                </View>
                <View
                  className={`flex-row items-center px-3 py-1 rounded-full ${
                    STATUS_COLORS[booking.booking_status]?.bg || "bg-gray-100"
                  }`}
                >
                  {STATUS_COLORS[booking.booking_status]?.icon(
                    STATUS_COLORS[booking.booking_status]?.hex ||
                      SEMANTIC_COLORS.gray[600]
                  )}
                  <Text
                    className={`text-[10px] font-bold ml-1 uppercase ${
                      STATUS_COLORS[booking.booking_status]?.text ||
                      "text-gray-600"
                    }`}
                  >
                    {booking.booking_status}
                  </Text>
                </View>
              </View>

              <View className="flex-row items-center justify-between pt-3 border-t border-gray-50">
                <View className="flex-row items-center">
                  <View className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center mr-3">
                    <User size={20} color={SEMANTIC_COLORS.gray[500]} />
                  </View>
                  <View>
                    <Text className="text-gray-900 font-medium text-sm">
                      {booking.guest?.full_name || "N/A"}
                    </Text>
                    <View className="flex-row items-center">
                      <Users size={12} color={SEMANTIC_COLORS.gray[400]} />
                      <Text className="text-gray-500 text-xs ml-1">
                        {booking.num_people} personas
                      </Text>
                    </View>
                  </View>
                </View>

                <View className="items-end">
                  <Text className="text-primary font-bold text-lg">
                    {new Date(booking.start_time).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Text>
                  <ChevronRight size={16} color={SEMANTIC_COLORS.gray[300]} />
                </View>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View className="bg-white rounded-2xl p-10 items-center justify-center border border-gray-100 mt-4">
            <AlertCircle size={48} color={SEMANTIC_COLORS.gray[300]} />
            <Text className="text-gray-500 mt-4 text-center font-medium">
              {searchQuery
                ? "No se encontraron reservas"
                : "No hay reservas registradas"}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
