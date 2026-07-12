import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { addWorkoutPlan } from '@/service/workoutService';
import { useAuth } from '@/hooks/useAuth';

type WeekDay = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

interface ExerciseItem {
  id: string;
  name: string;
  sets: string;
  reps: string;
}

const AddWorkoutPlanScreen: React.FC = () => {
  const { user } = useAuth();
  const [planName, setPlanName] = useState('');
  const [selectedDay, setSelectedDay] = useState<WeekDay>('Monday');
  const [exercises, setExercises] = useState<ExerciseItem[]>([
    { id: '1', name: '', sets: '', reps: '' }
  ]);

  const [isLoading, setIsLoading] = useState(false);
  const navigation = useRouter();
  const { width } = useWindowDimensions();

  const itemWidth = (width - 48 - 24) / 4;

  const addExerciseRow = () => {
    setExercises([
      ...exercises,
      { id: Date.now().toString(), name: '', sets: '', reps: '' }
    ]);
  };

  const removeExerciseRow = (id: string) => {
    if (exercises.length === 1) {
      if (Platform.OS === 'web') {
        alert("Warning: At least one exercise is required.");
      } else {
        Alert.alert("Warning", "At least one exercise is required.");
      }
      return;
    }
    setExercises(exercises.filter(item => item.id !== id));
  };

  const handleExerciseChange = (id: string, field: keyof ExerciseItem, value: string) => {
    setExercises(
        exercises.map(item => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleSavePlan = async () => {
    if (!user?.uid) {
      const errorMsg = "User session not found. Please log in again.";
      if (Platform.OS === 'web') alert(errorMsg);
      else Alert.alert("Error", errorMsg);
      return;
    }

    if (!planName.trim()) {
      if (Platform.OS === 'web') {
        alert("Required Field: Please enter a Routine Title.");
      } else {
        Alert.alert("Required Field", "Please enter a Routine Title.");
      }
      return;
    }

    const hasEmptyExercise = exercises.some(ex => !ex.name.trim() || !ex.sets.trim() || !ex.reps.trim());
    if (hasEmptyExercise) {
      if (Platform.OS === 'web') {
        alert("Required Fields: Please fill in all Exercise Names, Sets, and Reps.");
      } else {
        Alert.alert("Required Fields", "Please fill in all Exercise Names, Sets, and Reps.");
      }
      return;
    }

    setIsLoading(true);
    try {
      console.log("Saving Routine...");

      await addWorkoutPlan({
        userId: user.uid,
        title: planName.trim(),
        day: selectedDay,
        completed: false,
        exercises: exercises.map(ex => ({
          name: ex.name.trim(),
          sets: parseInt(ex.sets) || 0,
          reps: parseInt(ex.reps) || 0,
        })),
      });

      if (Platform.OS === 'web') {
        alert(`${selectedDay} routine saved successfully!`);
      } else {
        Alert.alert("Success", `${selectedDay} routine saved successfully!`);
      }

      navigation.back();
    } catch (error: any) {
      console.error("Firebase Save Error:", error);

      if (Platform.OS === 'web') {
        alert("Error: " + (error.message || "Failed to save workout plan"));
      } else {
        Alert.alert("Error", error.message || "Failed to save workout plan");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
      <SafeAreaView className="flex-1 bg-zinc-950">
        <StatusBar barStyle="light-content" />
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1"
        >
          {/* Header */}
          <View className="px-6 py-4 flex-row justify-between items-center border-b border-zinc-900 bg-zinc-950">
            <TouchableOpacity onPress={() => navigation.back()} disabled={isLoading}>
              <MaterialIcons name="close" size={24} color="#fff" />
            </TouchableOpacity>
            <Text className="text-white font-black uppercase tracking-widest">Create Routine</Text>
            <TouchableOpacity onPress={handleSavePlan} disabled={isLoading}>
              {isLoading ? (
                  <ActivityIndicator size="small" color="#f97316" />
              ) : (
                  <Text className="text-orange-500 font-bold tracking-wider">SAVE PLAN</Text>
              )}
            </TouchableOpacity>
          </View>

          <ScrollView className="flex-1 px-6 py-4" showsVerticalScrollIndicator={false}>

            {/* Plan Title Input */}
            <Text className="text-zinc-500 font-bold uppercase text-xs mb-2">Routine Title</Text>
            <TextInput
                value={planName}
                onChangeText={setPlanName}
                className="bg-zinc-900 p-4 rounded-2xl text-white border border-zinc-850 mb-5 text-base font-semibold focus:border-orange-500"
                placeholder="e.g., Chest & Triceps Shred, Legs Day"
                placeholderTextColor="#52525b"
                editable={!isLoading}
            />

            {/* Responsive Day Selector */}
            <Text className="text-zinc-500 font-bold uppercase text-xs mb-2">Target Day of Week</Text>
            <View className="flex-row flex-wrap gap-2 mb-6">
              {(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as WeekDay[]).map((day) => {
                const isSelected = selectedDay === day;
                return (
                    <TouchableOpacity
                        key={day}
                        onPress={() => setSelectedDay(day)}
                        disabled={isLoading}
                        style={{ width: itemWidth }}
                        className={`py-2.5 rounded-xl border items-center justify-center ${
                            isSelected ? 'bg-orange-500 border-orange-500' : 'bg-zinc-900 border-zinc-850'
                        }`}
                    >
                      <Text
                          numberOfLines={1}
                          className={`font-bold text-xs ${isSelected ? 'text-black' : 'text-zinc-400'}`}
                      >
                        {day.substring(0, 3)}
                      </Text>
                    </TouchableOpacity>
                );
              })}
            </View>

            {/* Dynamic Exercises List Section */}
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-zinc-500 font-bold uppercase text-xs">Exercises & Targets</Text>
              <TouchableOpacity
                  onPress={addExerciseRow}
                  disabled={isLoading}
                  className="flex-row items-center bg-orange-500/10 border border-orange-500/30 px-3 py-1 rounded-lg"
              >
                <MaterialIcons name="add" size={14} color="#f97316" />
                <Text className="text-orange-500 font-bold text-xs ml-1">Add Exercise</Text>
              </TouchableOpacity>
            </View>

            {/* Exercises Mapping */}
            {exercises.map((item, index) => (
                <View key={item.id} className="bg-zinc-900 p-4 rounded-2xl border border-zinc-850 mb-4">
                  <View className="flex-row justify-between items-center mb-3">
                    <Text className="text-orange-500 font-black text-xs uppercase tracking-wider">
                      Exercise #{index + 1}
                    </Text>
                    <TouchableOpacity onPress={() => removeExerciseRow(item.id)} disabled={isLoading}>
                      <MaterialIcons name="delete-outline" size={18} color="#ef4444" />
                    </TouchableOpacity>
                  </View>

                  {/* Exercise Name Input */}
                  <TextInput
                      value={item.name}
                      editable={!isLoading}
                      onChangeText={(val) => handleExerciseChange(item.id, 'name', val)}
                      className="bg-zinc-950 p-3 rounded-xl text-white border border-zinc-900 mb-3 text-sm font-medium focus:border-orange-500/50"
                      placeholder="e.g., Upper Chest Press / Lat Pulldown"
                      placeholderTextColor="#52525b"
                  />

                  {/* Sets & Reps Inputs */}
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1 mr-2 flex-row items-center bg-zinc-950 rounded-xl border border-zinc-900 px-3">
                      <Text className="text-zinc-500 text-xs font-bold uppercase mr-2">Sets</Text>
                      <TextInput
                          value={item.sets}
                          editable={!isLoading}
                          onChangeText={(val) => handleExerciseChange(item.id, 'sets', val)}
                          keyboardType="numeric"
                          className="flex-1 p-2 text-white font-bold text-center"
                          placeholder="3"
                          placeholderTextColor="#3f3f46"
                      />
                    </View>

                    <Text className="text-zinc-600 font-bold text-sm mx-1">×</Text>

                    <View className="flex-1 ml-2 flex-row items-center bg-zinc-950 rounded-xl border border-zinc-900 px-3">
                      <Text className="text-zinc-500 text-xs font-bold uppercase mr-2">Reps</Text>
                      <TextInput
                          value={item.reps}
                          editable={!isLoading}
                          onChangeText={(val) => handleExerciseChange(item.id, 'reps', val)}
                          keyboardType="numeric"
                          className="flex-1 p-2 text-white font-bold text-center"
                          placeholder="12"
                          placeholderTextColor="#3f3f46"
                      />
                    </View>
                  </View>
                </View>
            ))}

            <View className="h-20" />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
  );
};

export default AddWorkoutPlanScreen;