import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { auth, stats as statsApi } from "../../services/api";
import { usePermissions } from "../../hooks/usePermissions";
import { useTheme } from "../../hooks/useTheme";
import { useDashboardConfig, WidgetId } from "../../hooks/useDashboardConfig";
import { 
  Users, 
  Calendar, 
  TrendingUp, 
  AlertCircle, 
  Settings, 
  Plus, 
  ChevronRight,
  DoorOpen,
  Clock,
  GripVertical,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown
} from "lucide-react-native";
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

export default function DashboardScreen() {
  const [user, setUser] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [summary, setSummary] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [revenue, setRevenue] = useState<any>(null);
  const { hasPermission, loading: permissionsLoading } = usePermissions();
  const { theme } = useTheme();
  const { widgets, toggleWidget, reorderWidgets } = useDashboardConfig();

  const loadData = async () => {
    try {
      const [userData, summaryData, statsData, revenueData] = await Promise.all([
        auth.me(),
        hasPermission("view_stats") ? statsApi.getSummary() : Promise.resolve(null),
        hasPermission("view_stats") ? statsApi.getStats("month") : Promise.resolve(null),
        hasPermission("view_stats") ? statsApi.getRevenue("month") : Promise.resolve(null)
      ]);
      setUser(userData);
      setSummary(summaryData);
      setStats(statsData);
      setRevenue(revenueData);
    } catch (error) {
      console.error("Error loading dashboard data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!permissionsLoading) {
      loadData();
    }
  }, [permissionsLoading]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const renderWidget = (id: WidgetId) => {
    switch (id) {
      case "stats_summary":
        return hasPermission("view_stats") && (
          <View className="flex-row flex-wrap -mx-2 mb-2">
            <View className="w-1/2 p-2">
              <View className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                <View className="bg-primary/10 w-10 h-10 rounded-full items-center justify-center mb-3">
                  <Calendar size={20} color={THEME_COLORS[theme]} />
                </View>
                <Text className="text-gray-500 text-xs">Reservas Hoy</Text>
                <Text className="text-xl font-bold text-gray-900">
                  {summary?.bookings_today || 0}
                </Text>
              </View>
            </View>

            <View className="w-1/2 p-2">
              <View className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                <View className="bg-green-50 w-10 h-10 rounded-full items-center justify-center mb-3">
                  <TrendingUp size={20} color="#16a34a" />
                </View>
                <Text className="text-gray-500 text-xs">Ingresos Hoy</Text>
                <Text className="text-xl font-bold text-gray-900">
                  {summary?.revenue_today || 0}€
                </Text>
              </View>
            </View>
          </View>
        );

      case "quick_actions":
        return (
          <View className="w-full p-2 mb-2">
            <View className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
              <Text className="text-gray-900 font-bold mb-4">Acciones Rápidas</Text>
              <View className="flex-row justify-between">
                {hasPermission("manage_bookings") && (
                  <TouchableOpacity className="items-center">
                    <View className="bg-primary w-12 h-12 rounded-xl items-center justify-center mb-1">
                      <Plus size={24} color="white" />
                    </View>
                    <Text className="text-xs text-gray-600">Reserva</Text>
                  </TouchableOpacity>
                )}
                {hasPermission("manage_rooms") && (
                  <TouchableOpacity 
                    className="items-center"
                    onPress={() => router.push("/rooms")}
                  >
                    <View className="bg-secondary w-12 h-12 rounded-xl items-center justify-center mb-1">
                      <DoorOpen size={24} color="white" />
                    </View>
                    <Text className="text-xs text-gray-600">Salas</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity className="items-center">
                  <View className="bg-accent w-12 h-12 rounded-xl items-center justify-center mb-1">
                    <Users size={24} color="white" />
                  </View>
                  <Text className="text-xs text-gray-600">Clientes</Text>
                </TouchableOpacity>
                <TouchableOpacity className="items-center">
                  <View className="bg-dark w-12 h-12 rounded-xl items-center justify-center mb-1">
                    <Clock size={24} color="white" />
                  </View>
                  <Text className="text-xs text-gray-600">Horarios</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        );

      case "upcoming_bookings":
        return hasPermission("view_bookings") && (
          <View className="w-full p-2 mb-2">
            <View className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-gray-900 font-bold">Próximas Reservas</Text>
                <TouchableOpacity>
                  <Text className="text-primary text-sm font-medium">Ver todas</Text>
                </TouchableOpacity>
              </View>
              
              {summary?.upcoming_bookings?.length > 0 ? (
                summary.upcoming_bookings.map((booking: any) => (
                  <View key={booking.id} className="flex-row items-center py-3 border-b border-gray-50 last:border-0">
                    <View className="w-12 h-12 bg-light rounded-lg items-center justify-center mr-3">
                      <Text className="text-primary font-bold text-xs">
                        {new Date(booking.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                    </View>
                    <View className="flex-1">
                      <Text className="text-gray-900 font-medium">{booking.room_name}</Text>
                      <Text className="text-gray-500 text-xs">{booking.customer_name} • {booking.players} pers.</Text>
                    </View>
                    <ChevronRight size={16} color="#cbd5e1" />
                  </View>
                ))
              ) : (
                <View className="py-4 items-center">
                  <AlertCircle size={24} color="#94a3b8" />
                  <Text className="text-gray-500 text-sm mt-2">No hay reservas próximas</Text>
                </View>
              )}
            </View>
          </View>
        );

      case "monthly_stats":
        return hasPermission("view_stats") && stats && (
          <View className="w-full p-2 mb-2">
            <View className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
              <Text className="text-gray-900 font-bold mb-4">Estadísticas del Mes</Text>
              <View className="flex-row flex-wrap">
                <View className="w-1/2 mb-4">
                  <Text className="text-gray-500 text-xs">Total Reservas</Text>
                  <Text className="text-lg font-bold text-gray-900">{stats.total_bookings}</Text>
                </View>
                <View className="w-1/2 mb-4">
                  <Text className="text-gray-500 text-xs">Ingresos Totales</Text>
                  <Text className="text-lg font-bold text-gray-900">{stats.total_revenue}€</Text>
                </View>
                <View className="w-1/2">
                  <Text className="text-gray-500 text-xs">Media Jugadores</Text>
                  <Text className="text-lg font-bold text-gray-900">{stats.avg_players_per_booking}</Text>
                </View>
                <View className="w-1/2">
                  <Text className="text-gray-500 text-xs">Ocupación</Text>
                  <Text className="text-lg font-bold text-gray-900">{stats.occupancy_rate}%</Text>
                </View>
              </View>

              {stats.top_rooms?.length > 0 && (
                <View className="mt-6">
                  <Text className="text-gray-700 font-bold text-sm mb-3">Salas más populares</Text>
                  {stats.top_rooms.map((room: any, index: number) => (
                    <View key={index} className="flex-row items-center mb-2">
                      <View className="w-2 h-2 rounded-full bg-primary mr-2" />
                      <Text className="flex-1 text-gray-600 text-sm">{room.name}</Text>
                      <Text className="text-gray-900 font-bold text-sm">{room.count}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>
        );

      case "revenue_chart":
        return hasPermission("view_stats") && revenue && revenue.data?.length > 0 && (
          <View className="w-full p-2 mb-2">
            <View className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
              <Text className="text-gray-900 font-bold mb-4">Ingresos por Día</Text>
              <View className="h-40 flex-row items-end justify-between px-2">
                {revenue.data.slice(-7).map((value: number, index: number) => {
                  const maxValue = Math.max(...revenue.data);
                  const height = maxValue > 0 ? (value / maxValue) * 100 : 0;
                  return (
                    <View key={index} className="items-center flex-1">
                      <View 
                        className="bg-primary rounded-t-sm w-4" 
                        style={{ height: `${height}%` }} 
                      />
                      <Text className="text-[8px] text-gray-400 mt-1">
                        {revenue.labels[revenue.data.length - 7 + index]?.split('-').slice(2).join('/')}
                      </Text>
                    </View>
                  );
                })}
              </View>
              <View className="mt-4 pt-4 border-t border-gray-50 flex-row justify-between items-center">
                <Text className="text-gray-500 text-xs">Total periodo</Text>
                <Text className="text-gray-900 font-bold">{revenue.total}€</Text>
              </View>
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  if (loading || permissionsLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color={THEME_COLORS[theme] || "#1f6357"} />
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View className="p-4">
        <View className="flex-row justify-between items-center mb-6">
          <View>
            <Text className="text-gray-500 text-sm">Bienvenido de nuevo,</Text>
            <Text className="text-2xl font-bold text-gray-900">
              {user?.full_name || "Usuario"}
            </Text>
          </View>
          <TouchableOpacity 
            onPress={() => setIsEditMode(!isEditMode)}
            className={`p-2 rounded-full ${isEditMode ? 'bg-primary/10' : 'bg-gray-100'}`}
          >
            <Settings size={20} color={isEditMode ? THEME_COLORS[theme] : "#64748b"} />
          </TouchableOpacity>
        </View>

        {isEditMode ? (
          <View className="mb-6">
            <View className="bg-primary/10 p-4 rounded-2xl border border-primary/20 mb-4">
              <Text className="text-primary font-bold mb-1">Modo Edición</Text>
              <Text className="text-primary/80 text-xs">
                Personaliza tu dashboard activando o reordenando los widgets.
              </Text>
            </View>
            
            {widgets.map((widget, index) => (
              <View 
                key={widget.id} 
                className="bg-white p-4 rounded-2xl border border-gray-100 mb-3 flex-row items-center"
              >
                <View className="flex-row items-center flex-1">
                  <GripVertical size={20} color="#cbd5e1" />
                  <Text className="text-gray-900 font-medium ml-3">{widget.title}</Text>
                </View>
                
                <View className="flex-row items-center">
                  <View className="flex-row mr-4">
                    <TouchableOpacity 
                      onPress={() => index > 0 && reorderWidgets(index, index - 1)}
                      disabled={index === 0}
                      className="p-1"
                    >
                      <ArrowUp size={18} color={index === 0 ? "#f1f5f9" : "#94a3b8"} />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      onPress={() => index < widgets.length - 1 && reorderWidgets(index, index + 1)}
                      disabled={index === widgets.length - 1}
                      className="p-1"
                    >
                      <ArrowDown size={18} color={index === widgets.length - 1 ? "#f1f5f9" : "#94a3b8"} />
                    </TouchableOpacity>
                  </View>
                  
                  <TouchableOpacity 
                    onPress={() => toggleWidget(widget.id)}
                    className={`w-10 h-10 rounded-full items-center justify-center ${widget.enabled ? 'bg-primary/10' : 'bg-gray-100'}`}
                  >
                    {widget.enabled ? (
                      <Eye size={20} color={THEME_COLORS[theme]} />
                    ) : (
                      <EyeOff size={20} color="#94a3b8" />
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            ))}
            
            <TouchableOpacity 
              onPress={() => setIsEditMode(false)}
              className="bg-primary p-4 rounded-2xl items-center mt-2"
            >
              <Text className="text-white font-bold">Guardar Cambios</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            {widgets.filter(w => w.enabled).map(widget => (
              <React.Fragment key={widget.id}>
                {renderWidget(widget.id)}
              </React.Fragment>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}
