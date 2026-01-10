import React from "react";
import { Tabs } from "expo-router";
import {
  LayoutDashboard,
  Calendar,
  BookOpen,
  Settings,
  DoorOpen,
} from "lucide-react-native";
import { useTheme } from "../../hooks/useTheme";
import { THEME_COLORS, SEMANTIC_COLORS } from "../../constants/Colors";

export default function DashboardLayout() {
  const { theme } = useTheme();
  const activeColor = THEME_COLORS[theme] || THEME_COLORS.tropical;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: activeColor,
        tabBarInactiveTintColor: SEMANTIC_COLORS.gray[500],
        headerShown: true,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color }) => (
            <LayoutDashboard size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="bookings"
        options={{
          title: "Reservas",
          tabBarIcon: ({ color }) => <BookOpen size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: "Calendario",
          tabBarIcon: ({ color }) => <Calendar size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="rooms"
        options={{
          title: "Salas",
          tabBarIcon: ({ color }) => <DoorOpen size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Ajustes",
          tabBarIcon: ({ color }) => <Settings size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="create-room"
        options={{
          href: null,
          headerShown: false,
        }}
      />
    </Tabs>
  );
}
