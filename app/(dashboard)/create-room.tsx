import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { rooms } from "../../services/api";
import {
  ArrowLeft,
  Save,
  DoorOpen,
  Users,
  Clock,
  Euro,
} from "lucide-react-native";

export default function CreateRoomScreen() {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    min_capacity: "2",
    max_capacity: "6",
    duration_minutes: "60",
    base_price: "60",
  });

  const handleCreate = async () => {
    if (!form.name) {
      Alert.alert("Error", "El nombre de la sala es obligatorio");
      return;
    }

    setLoading(true);
    try {
      await rooms.create({
        ...form,
        min_capacity: parseInt(form.min_capacity),
        max_capacity: parseInt(form.max_capacity),
        duration_minutes: parseInt(form.duration_minutes),
        base_price: parseFloat(form.base_price),
      });
      Alert.alert("Éxito", "Sala creada correctamente");
      router.back();
    } catch (error) {
      console.error("Error creating room", error);
      Alert.alert("Error", "No se pudo crear la sala");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-gray-50"
    >
      <ScrollView className="flex-1">
        <View className="p-4">
          <View className="flex-row items-center mb-6">
            <TouchableOpacity onPress={() => router.back()} className="mr-4">
              <ArrowLeft size={24} color="#1e293b" />
            </TouchableOpacity>
            <Text className="text-2xl font-bold text-gray-900">Nueva Sala</Text>
          </View>

          <View className="space-y-4">
            <View>
              <Text className="text-gray-700 font-medium mb-1">
                Nombre de la sala
              </Text>
              <View className="flex-row items-center bg-white border border-gray-200 rounded-xl px-4 py-3">
                <DoorOpen size={20} color="#64748b" className="mr-2" />
                <TextInput
                  className="flex-1 text-gray-900"
                  placeholder="Ej: La Mina Abandonada"
                  value={form.name}
                  onChangeText={(text) => setForm({ ...form, name: text })}
                />
              </View>
            </View>

            <View>
              <Text className="text-gray-700 font-medium mb-1">
                Descripción
              </Text>
              <TextInput
                className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900 h-24"
                placeholder="Describe la temática de la sala..."
                multiline
                textAlignVertical="top"
                value={form.description}
                onChangeText={(text) => setForm({ ...form, description: text })}
              />
            </View>

            <View className="flex-row space-x-4">
              <View className="flex-1">
                <Text className="text-gray-700 font-medium mb-1">
                  Min. Pers.
                </Text>
                <View className="flex-row items-center bg-white border border-gray-200 rounded-xl px-4 py-3">
                  <Users size={18} color="#64748b" className="mr-2" />
                  <TextInput
                    className="flex-1 text-gray-900"
                    keyboardType="numeric"
                    value={form.min_capacity}
                    onChangeText={(text) =>
                      setForm({ ...form, min_capacity: text })
                    }
                  />
                </View>
              </View>
              <View className="flex-1">
                <Text className="text-gray-700 font-medium mb-1">
                  Max. Pers.
                </Text>
                <View className="flex-row items-center bg-white border border-gray-200 rounded-xl px-4 py-3">
                  <Users size={18} color="#64748b" className="mr-2" />
                  <TextInput
                    className="flex-1 text-gray-900"
                    keyboardType="numeric"
                    value={form.max_capacity}
                    onChangeText={(text) =>
                      setForm({ ...form, max_capacity: text })
                    }
                  />
                </View>
              </View>
            </View>

            <View className="flex-row space-x-4">
              <View className="flex-1">
                <Text className="text-gray-700 font-medium mb-1">
                  Duración (min)
                </Text>
                <View className="flex-row items-center bg-white border border-gray-200 rounded-xl px-4 py-3">
                  <Clock size={18} color="#64748b" className="mr-2" />
                  <TextInput
                    className="flex-1 text-gray-900"
                    keyboardType="numeric"
                    value={form.duration_minutes}
                    onChangeText={(text) =>
                      setForm({ ...form, duration_minutes: text })
                    }
                  />
                </View>
              </View>
              <View className="flex-1">
                <Text className="text-gray-700 font-medium mb-1">
                  Precio Base (€)
                </Text>
                <View className="flex-row items-center bg-white border border-gray-200 rounded-xl px-4 py-3">
                  <Euro size={18} color="#64748b" className="mr-2" />
                  <TextInput
                    className="flex-1 text-gray-900"
                    keyboardType="numeric"
                    value={form.base_price}
                    onChangeText={(text) =>
                      setForm({ ...form, base_price: text })
                    }
                  />
                </View>
              </View>
            </View>

            <TouchableOpacity
              className={`bg-blue-600 rounded-xl py-4 items-center mt-6 flex-row justify-center ${
                loading ? "opacity-70" : ""
              }`}
              onPress={handleCreate}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" className="mr-2" />
              ) : (
                <Save size={20} color="white" className="mr-2" />
              )}
              <Text className="text-white font-bold text-lg">Crear Sala</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
