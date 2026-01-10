import React from 'react';
import { View, Text } from 'react-native';
import { SEMANTIC_COLORS } from '../constants/Colors';

interface StatusBadgeProps {
  status: string;
  label?: string;
}

export function StatusBadge({ status, label }: StatusBadgeProps) {
  const getStatusStyles = () => {
    switch (status.toLowerCase()) {
      case 'confirmed':
      case 'active':
      case 'completed':
        return {
          bg: 'bg-success/10',
          text: 'text-success',
          dot: 'bg-success',
        };
      case 'pending':
      case 'waiting':
        return {
          bg: 'bg-warning/10',
          text: 'text-warning',
          dot: 'bg-warning',
        };
      case 'cancelled':
      case 'error':
        return {
          bg: 'bg-error/10',
          text: 'text-error',
          dot: 'bg-error',
        };
      default:
        return {
          bg: 'bg-info/10',
          text: 'text-info',
          dot: 'bg-info',
        };
    }
  };

  const styles = getStatusStyles();

  return (
    <View className={`flex-row items-center px-2 py-1 rounded-full ${styles.bg}`}>
      <View className={`w-1.5 h-1.5 rounded-full mr-1.5 ${styles.dot}`} />
      <Text className={`text-xs font-medium capitalize ${styles.text}`}>
        {label || status}
      </Text>
    </View>
  );
}
