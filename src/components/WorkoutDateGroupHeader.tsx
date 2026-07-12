import React from 'react';
import { View, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const formatDate = (date: Date) => {
  const today = new Date();
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);

  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  } else if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  } else {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  }
};

type WorkoutDateGroupHeaderProps = {
  date: string;
  totalCalories: number;
  totalDuration: number;
};

const WorkoutDateGroupHeader: React.FC<WorkoutDateGroupHeaderProps> = ({
                                                                         date,
                                                                         totalCalories,
                                                                         totalDuration,
                                                                       }) => (
    <View className="bg-zinc-950 px-2 py-3 mt-2 flex-row justify-between items-center border-b border-zinc-900">
      <Text className="text-zinc-400 font-bold uppercase tracking-wider text-xs">
        {formatDate(new Date(date))}
      </Text>

      <View className="flex-row items-center space-x-3">
        {totalCalories > 0 && (
            <View className="flex-row items-center bg-orange-500/10 px-2.5 py-1 rounded-md">
              <MaterialIcons name="local-fire-department" size={14} color="#f97316" />
              <Text className="text-orange-500 font-black text-xs ml-1">
                {totalCalories} kcal
              </Text>
            </View>
        )}

        {totalDuration > 0 && (
            <View className="flex-row items-center bg-zinc-800 px-2.5 py-1 rounded-md">
              <MaterialIcons name="schedule" size={14} color="#a1a1aa" />
              <Text className="text-zinc-300 font-bold text-xs ml-1">
                {totalDuration}m
              </Text>
            </View>
        )}
      </View>
    </View>
);

export default WorkoutDateGroupHeader;