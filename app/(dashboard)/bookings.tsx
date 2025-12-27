import React, { useEffect, useState } from "react";
import { 
  View, 
  Text, 
  ScrollView, 
  RefreshControl, 
  ActivityIndicator, 
  TouchableOpacity,
  TextInput
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
  XCircle
} from "lucide-react-native";
import { format } from "date-fns";
import { es } from "date-fns/locale";

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

const STATUS_COLORS: any = {
  confirmed: { bg: "bg-green-100", text: "text-green-700", icon: <CheckCircle2 size={14} color="#15803d" /> },
  pending: { bg: "bg-yellow-100", text: "text-yellow-700", icon: <Clock size={14} color="#a16207" /> },
  cancelled: { bg: "bg-red-100", text: "text-red-700", icon: <XCircle size={14} color="#b91c1c" /> },
  completed: { bg: "bg-blue-100", text: "text-blue-700", icon: <CheckCircle2 size={14} color="#1d4ed8" /> },
};

export default function BookingsScreen() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { theme } = useTheme();

  const loadBookings = async () => {
    try {
      const response = await bookingsApi.list();
      setBookings(response.bookings || []);
    } catch (error) {
      console.error("Error loading bookings", error);
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

  const filteredBookings = bookings.filter(b => 
    b.room_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.guest?.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color={THEME_COLORS[theme] || "#1f6357"} />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <View className="p-4 bg-white border-b border-gray-100">
        <Text className="text-2xl font-bold text-gray-900 mb-4">Reservas</Text>
        
        <View className="flex-row items-center">
          <View className="flex-1 flex-row items-center bg-gray-100 rounded-xl px-3 py-2 mr-2">
            <Search size={18} color="#94a3b8" />
            <TextInput
              className="flex-1 ml-2 text-gray-900 text-sm"
              placeholder="Buscar por sala o cliente..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <TouchableOpacity className="bg-gray-100 p-2 rounded-xl">
            <Filter size={20} color="#64748b" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredBookings.length > 0 ? (
          filteredBookings.map((booking) => (
            <TouchableOpacity 
              key={booking.id}
              className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-gray-100"
            >
              <View className="flex-row justify-between items-start mb-3">
                <View className="flex-1">
                  <Text className="text-lg font-bold text-gray-900">{booking.room_name}</Text>
                  <View className="flex-row items-center mt-1">
                    <Calendar size={14} color="#64748b" />
                    <Text className="text-gray-500 text-xs ml-1">
                      {format(new Date(booking.start_time), "EEEE, d 'de' MMMM", { locale: es })}
                    </Text>
                  </View>
                </View>
                <View className={`flex-row items-center px-2 py-1 rounded-full ${STATUS_COLORS[booking.booking_status]?.bg || 'bg-gray-100'}`}>
                  {STATUS_COLORS[booking.booking_status]?.icon}
                  <Text className={`text-[10px] font-bold ml-1 uppercase ${STATUS_COLORS[booking.booking_status]?.text || 'text-gray-600'}`}>
                    {booking.booking_status}
                  </Text>
                </View>
              </View>

              <View className="flex-row items-center justify-between pt-3 border-t border-gray-50">
                <View className="flex-row items-center">
                  <View className="w-8 h-8 bg-gray-100 rounded-full items-center justify-center mr-2">
                    <User size={16} color="#64748b" />
                  </View>
                  <View>
                    <Text className="text-gray-900 font-medium text-sm">{booking.guest?.full_name || "N/A"}</Text>
                    <View className="flex-row items-center">
                      <Users size={12} color="#94a3b8" />
                      <Text className="text-gray-500 text-xs ml-1">{booking.num_people} personas</Text>
                    </View>
                  </View>
                </View>
                
                <View className="items-end">
                  <Text className="text-primary font-bold text-base">
                    {new Date(booking.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                  <Text className="text-gray-400 text-[10px]">Hora de inicio</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View className="py-20 items-center">
            <AlertCircle size={48} color="#cbd5e1" />
            <Text className="text-gray-500 mt-4 text-center">
              {searchQuery ? "No se encontraron reservas para tu búsqueda" : "No hay reservas registradas"}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
