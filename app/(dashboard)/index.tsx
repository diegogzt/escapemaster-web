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
  ArrowDown,
} from "lucide-react-native";
import { router } from "expo-router";
import { THEME_COLORS, SEMANTIC_COLORS } from "../../constants/Colors";

export default function DashboardScreen() {
  const [user, setUser] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [summary, setSummary] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [revenue, setRevenue] = useState<any>(null);
  const [bookingsChart, setBookingsChart] = useState<any>(null);
  const {
    hasPermission,
    loading: permissionsLoading,
    user: permissionUser,
  } = usePermissions();
  const { theme } = useTheme();
  const { widgets, toggleWidget, reorderWidgets } = useDashboardConfig();

  const activeThemeColor = THEME_COLORS[theme] || THEME_COLORS.tropical;

  const loadData = async () => {
    try {
      const [summaryData, statsData, revenueData, bookingsChartData] =
        await Promise.all([
          auth.me(),
          hasPermission("view_stats")
            ? statsApi.getSummary()
            : Promise.resolve(null),
          hasPermission("view_stats")
            ? statsApi.getStats("month")
            : Promise.resolve(null),
          hasPermission("view_stats")
            ? statsApi.getRevenue("month")
            : Promise.resolve(null),
          hasPermission("view_stats")
            ? statsApi.getBookingsChart("month")
            : Promise.resolve(null),
        ]);
      setUser(permissionUser || summaryData);
      setSummary(summaryData);
      setStats(statsData);
      setRevenue(revenueData);
      setBookingsChart(bookingsChartData);
    } catch (error: any) {
      // Don't log 401 errors as they are handled by the API interceptor
      if (error.response?.status !== 401) {
        console.error("Error loading dashboard data", error);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!permissionsLoading) {
      loadData();
    }
  }, [permissionsLoading, permissionUser]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const renderWidget = (id: WidgetId) => {
    switch (id) {
      case "stats_summary":
        return (
          hasPermission("view_stats") && (
            <View className="flex-row flex-wrap -mx-2 mb-2">
              <View className="w-1/2 p-2">
                <View className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                  <View className="bg-primary/10 w-10 h-10 rounded-full items-center justify-center mb-3">
                    <Calendar size={20} color={activeThemeColor} />
                  </View>
                  <Text className="text-gray-500 text-xs">Reservas Hoy</Text>
                  <Text className="text-xl font-bold text-gray-900">
                    {summary?.bookings_today || 0}
                  </Text>
                </View>
              </View>

              <View className="w-1/2 p-2">
                <View className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                  <View className="bg-success/10 w-10 h-10 rounded-full items-center justify-center mb-3">
                    <TrendingUp size={20} color={SEMANTIC_COLORS.success} />
                  </View>
                  <Text className="text-gray-500 text-xs">Ingresos Hoy</Text>
                  <Text className="text-xl font-bold text-gray-900">
                    {summary?.revenue_today || 0}€
                  </Text>
                </View>
              </View>
            </View>
          )
        );

      case "quick_actions":
        return (
          <View className="w-full p-2 mb-2">
            <View className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
              <Text className="text-gray-900 font-bold mb-4">
                Acciones Rápidas
              </Text>
              <View className="flex-row justify-between">
                {hasPermission("manage_bookings") && (
                  <TouchableOpacity
                    className="items-center"
                    activeOpacity={0.7}
                  >
                    <View className="bg-primary w-14 h-14 rounded-xl items-center justify-center mb-1">
                      <Plus size={24} color="white" />
                    </View>
                    <Text className="text-xs text-gray-600">Reserva</Text>
                  </TouchableOpacity>
                )}
                {hasPermission("manage_rooms") && (
                  <TouchableOpacity
                    className="items-center"
                    onPress={() => router.push("/rooms")}
                    activeOpacity={0.7}
                  >
                    <View className="bg-secondary w-14 h-14 rounded-xl items-center justify-center mb-1">
                      <DoorOpen size={24} color="white" />
                    </View>
                    <Text className="text-xs text-gray-600">Salas</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity className="items-center" activeOpacity={0.7}>
                  <View className="bg-accent w-14 h-14 rounded-xl items-center justify-center mb-1">
                    <Users size={24} color={activeThemeColor} />
                  </View>
                  <Text className="text-xs text-gray-600">Clientes</Text>
                </TouchableOpacity>
                <TouchableOpacity className="items-center" activeOpacity={0.7}>
                  <View className="bg-dark w-14 h-14 rounded-xl items-center justify-center mb-1">
                    <Clock size={24} color="white" />
                  </View>
                  <Text className="text-xs text-gray-600">Horarios</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        );

      case "upcoming_bookings":
        return (
          hasPermission("view_bookings") && (
            <View className="w-full p-2 mb-2">
              <View className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                <View className="flex-row justify-between items-center mb-4">
                  <Text className="text-gray-900 font-bold">
                    Próximas Reservas
                  </Text>
                  <TouchableOpacity
                    onPress={() => router.push("/bookings")}
                    className="py-1 px-2"
                  >
                    <Text className="text-primary text-sm font-medium">
                      Ver todas
                    </Text>
                  </TouchableOpacity>
                </View>

                {summary?.upcoming_bookings?.length > 0 ? (
                  summary.upcoming_bookings.map((booking: any) => (
                    <TouchableOpacity
                      key={booking.id}
                      className="flex-row items-center py-3 border-b border-gray-50 last:border-0"
                      activeOpacity={0.6}
                    >
                      <View className="w-12 h-12 bg-light rounded-lg items-center justify-center mr-3">
                        <Text className="text-primary font-bold text-xs">
                          {new Date(booking.start_time).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </Text>
                      </View>
                      <View className="flex-1">
                        <Text className="text-gray-900 font-medium">
                          {booking.room_name}
                        </Text>
                        <Text className="text-gray-500 text-xs">
                          {booking.customer_name} • {booking.players} pers.
                        </Text>
                      </View>
                      <ChevronRight
                        size={16}
                        color={SEMANTIC_COLORS.gray[300]}
                      />
                    </TouchableOpacity>
                  ))
                ) : (
                  <View className="py-4 items-center">
                    <AlertCircle size={24} color={SEMANTIC_COLORS.gray[400]} />
                    <Text className="text-gray-500 text-sm mt-2">
                      No hay reservas próximas
                    </Text>
                  </View>
                )}
              </View>
            </View>
          )
        );

      case "monthly_stats":
        return (
          hasPermission("view_stats") &&
          stats && (
            <View className="w-full p-2 mb-2">
              <View className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                <Text className="text-gray-900 font-bold mb-4">
                  Estadísticas del Mes
                </Text>
                <View className="flex-row flex-wrap">
                  <View className="w-1/2 mb-4">
                    <Text className="text-gray-500 text-xs">
                      Total Reservas
                    </Text>
                    <Text className="text-lg font-bold text-gray-900">
                      {stats.total_bookings}
                    </Text>
                  </View>
                  <View className="w-1/2 mb-4">
                    <Text className="text-gray-500 text-xs">
                      Ingresos Totales
                    </Text>
                    <Text className="text-lg font-bold text-gray-900">
                      {stats.total_revenue}€
                    </Text>
                  </View>
                  <View className="w-1/2">
                    <Text className="text-gray-500 text-xs">
                      Media Jugadores
                    </Text>
                    <Text className="text-lg font-bold text-gray-900">
                      {stats.avg_players_per_booking}
                    </Text>
                  </View>
                  <View className="w-1/2">
                    <Text className="text-gray-500 text-xs">Ocupación</Text>
                    <Text className="text-lg font-bold text-gray-900">
                      {stats.occupancy_rate}%
                    </Text>
                  </View>
                </View>

                {stats.top_rooms?.length > 0 && (
                  <View className="mt-6">
                    <Text className="text-gray-700 font-bold text-sm mb-3">
                      Salas más populares
                    </Text>
                    {stats.top_rooms.map((room: any, index: number) => (
                      <View key={index} className="flex-row items-center mb-2">
                        <View className="w-2 h-2 rounded-full bg-primary mr-2" />
                        <Text className="flex-1 text-gray-600 text-sm">
                          {room.name}
                        </Text>
                        <Text className="text-gray-900 font-bold text-sm">
                          {room.count}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </View>
          )
        );

      case "revenue_chart":
        return (
          hasPermission("view_stats") &&
          revenue &&
          revenue.data?.length > 0 && (
            <View className="w-full p-2 mb-2">
              <View className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                <Text className="text-gray-900 font-bold mb-4">
                  Ingresos por Día
                </Text>
                <View className="h-40 flex-row items-end justify-between px-2">
                  {revenue.data
                    .slice(-7)
                    .map((value: number, index: number) => {
                      const maxValue = Math.max(...revenue.data);
                      const height =
                        maxValue > 0 ? (value / maxValue) * 100 : 0;
                      return (
                        <View key={index} className="items-center flex-1">
                          <View
                            className="bg-primary rounded-t-sm w-4"
                            style={{ height: `${height}%` }}
                          />
                          <Text className="text-[8px] text-gray-400 mt-1">
                            {revenue.labels[revenue.data.length - 7 + index]
                              ?.split("-")
                              .slice(2)
                              .join("/")}
                          </Text>
                        </View>
                      );
                    })}
                </View>
                <View className="mt-4 pt-4 border-t border-gray-50 flex-row justify-between items-center">
                  <Text className="text-gray-500 text-xs">Total periodo</Text>
                  <Text className="text-gray-900 font-bold">
                    {revenue.total}€
                  </Text>
                </View>
              </View>
            </View>
          )
        );

      case "bookings_chart":
        return (
          hasPermission("view_stats") &&
          bookingsChart &&
          bookingsChart.data?.length > 0 && (
            <View className="w-full p-2 mb-2">
              <View className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                <Text className="text-gray-900 font-bold mb-4">
                  Reservas por Día
                </Text>
                <View className="h-40 flex-row items-end justify-between px-2">
                  {bookingsChart.data
                    .slice(-7)
                    .map((value: number, index: number) => {
                      const maxValue = Math.max(...bookingsChart.data);
                      const height =
                        maxValue > 0 ? (value / maxValue) * 100 : 0;
                      return (
                        <View key={index} className="items-center flex-1">
                          <View
                            className="bg-secondary rounded-t-sm w-4"
                            style={{ height: `${height}%` }}
                          />
                          <Text className="text-[8px] text-gray-400 mt-1">
                            {bookingsChart.labels[
                              bookingsChart.data.length - 7 + index
                            ]
                              ?.split("-")
                              .slice(2)
                              .join("/")}
                          </Text>
                        </View>
                      );
                    })}
                </View>
                <View className="mt-4 pt-4 border-t border-gray-50 flex-row justify-between items-center">
                  <Text className="text-gray-500 text-xs">Total periodo</Text>
                  <Text className="text-gray-900 font-bold">
                    {bookingsChart.total} reservas
                  </Text>
                </View>
              </View>
            </View>
          )
        );

      case "top_rooms_chart":
        return (
          hasPermission("view_stats") &&
          stats?.top_rooms?.length > 0 && (
            <View className="w-full p-2 mb-2">
              <View className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                <Text className="text-gray-900 font-bold mb-4">
                  Salas Populares
                </Text>
                {stats.top_rooms.map((room: any, index: number) => (
                  <View key={index} className="mb-4">
                    <View className="flex-row justify-between mb-1">
                      <Text className="text-sm text-gray-700">{room.name}</Text>
                      <Text className="text-sm font-bold text-gray-900">
                        {room.count}
                      </Text>
                    </View>
                    <View className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <View
                        className="h-full bg-primary"
                        style={{
                          width: `${
                            (room.count / stats.top_rooms[0].count) * 100
                          }%`,
                        }}
                      />
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )
        );

      case "occupancy_widget":
        return (
          hasPermission("view_stats") &&
          stats && (
            <View className="w-full p-2 mb-2">
              <View className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                <Text className="text-gray-900 font-bold mb-4">
                  Tasa de Ocupación
                </Text>
                <View className="items-center justify-center py-4">
                  <View className="w-32 h-32 rounded-full bg-gray-50 items-center justify-center border-8 border-gray-100">
                    <View
                      className="absolute w-32 h-32 rounded-full border-8 border-primary"
                      style={{
                        borderLeftColor: "transparent",
                        borderBottomColor: "transparent",
                        transform: [
                          {
                            rotate: `${
                              (stats.occupancy_rate / 100) * 360 - 45
                            }deg`,
                          },
                        ],
                      }}
                    />
                    <View className="bg-white w-24 h-24 rounded-full items-center justify-center shadow-sm">
                      <Text className="text-2xl font-bold text-gray-900">
                        {stats.occupancy_rate}%
                      </Text>
                    </View>
                  </View>
                  <Text className="text-gray-500 text-xs mt-4 text-center">
                    Basado en los slots disponibles este mes
                  </Text>
                </View>
              </View>
            </View>
          )
        );

      default:
        return null;
    }
  };

  if (loading || permissionsLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color={activeThemeColor} />
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={activeThemeColor}
        />
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
            className={`w-12 h-12 rounded-full items-center justify-center ${
              isEditMode ? "bg-primary/10" : "bg-gray-100"
            }`}
            activeOpacity={0.7}
          >
            <Settings
              size={24}
              color={isEditMode ? activeThemeColor : SEMANTIC_COLORS.gray[500]}
            />
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
                  <GripVertical size={20} color={SEMANTIC_COLORS.gray[300]} />
                  <Text className="text-gray-900 font-medium ml-3">
                    {widget.title}
                  </Text>
                </View>

                <View className="flex-row items-center">
                  <View className="flex-row mr-4">
                    <TouchableOpacity
                      onPress={() =>
                        index > 0 && reorderWidgets(index, index - 1)
                      }
                      disabled={index === 0}
                      className="p-2"
                    >
                      <ArrowUp
                        size={20}
                        color={
                          index === 0
                            ? SEMANTIC_COLORS.gray[100]
                            : SEMANTIC_COLORS.gray[400]
                        }
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() =>
                        index < widgets.length - 1 &&
                        reorderWidgets(index, index + 1)
                      }
                      disabled={index === widgets.length - 1}
                      className="p-2"
                    >
                      <ArrowDown
                        size={20}
                        color={
                          index === widgets.length - 1
                            ? SEMANTIC_COLORS.gray[100]
                            : SEMANTIC_COLORS.gray[400]
                        }
                      />
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity
                    onPress={() => toggleWidget(widget.id)}
                    className={`w-12 h-12 rounded-full items-center justify-center ${
                      widget.enabled ? "bg-primary/10" : "bg-gray-100"
                    }`}
                    activeOpacity={0.7}
                  >
                    {widget.enabled ? (
                      <Eye size={24} color={activeThemeColor} />
                    ) : (
                      <EyeOff size={24} color={SEMANTIC_COLORS.gray[400]} />
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            <TouchableOpacity
              onPress={() => setIsEditMode(false)}
              className="bg-primary p-4 rounded-2xl items-center mt-2 h-14 justify-center"
              activeOpacity={0.8}
            >
              <Text className="text-white font-bold text-lg">
                Guardar Cambios
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            {widgets
              .filter((w) => w.enabled)
              .map((widget) => (
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
