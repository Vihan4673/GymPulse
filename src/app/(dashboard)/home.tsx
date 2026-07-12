import { useAuth } from '@/hooks/useAuth';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from "expo-linear-gradient";
import { listenToWorkouts } from '@/service/workoutService';
import { useRouter } from 'expo-router';

interface WorkoutLog {
  id: string;
  type: 'cardio' | 'strength' | string;
  caloriesBurned: number;
  durationMinutes: number;
  exercise: {
    name: string;
    icon: string;
  } | null;
  notes: string;
  date: Date;
}

type FilterPeriod = 'today' | 'weekly' | 'monthly';

const HomeScreen: React.FC = () => {
  const { user } = useAuth();
  const navigation = useRouter();
  const [filterPeriod, setFilterPeriod] = useState<FilterPeriod>('monthly');
  const [workouts, setWorkouts] = useState<WorkoutLog[]>([]);

  // --- BMI STEP 1: BMI States & Logic ---
  const [weight, setWeight] = useState('70'); // Default Weight in kg
  const [height, setHeight] = useState('175'); // Default Height in cm
  const [showBmiModal, setShowBmiModal] = useState(false);
  const [tempWeight, setTempWeight] = useState(weight);
  const [tempHeight, setTempHeight] = useState(height);

  const calculateBMI = (w: string, h: string) => {
    const weightNum = parseFloat(w);
    const heightNum = parseFloat(h) / 100; // cm -> meters
    if (!weightNum || !heightNum) return { bmi: '0.0', status: 'N/A', color: 'text-zinc-400' };

    const bmiVal = weightNum / (heightNum * heightNum);
    const fixedBmi = bmiVal.toFixed(1);

    if (bmiVal < 18.5) return { bmi: fixedBmi, status: 'Underweight', color: 'text-blue-400' };
    if (bmiVal < 24.9) return { bmi: fixedBmi, status: 'Normal weight', color: 'text-green-400' };
    if (bmiVal < 29.9) return { bmi: fixedBmi, status: 'Overweight', color: 'text-amber-500' };
    return { bmi: fixedBmi, status: 'Obese', color: 'text-red-500' };
  };

  const bmiResult = calculateBMI(weight, height);

  const handleSaveBmi = () => {
    if (!tempWeight || !tempHeight || parseFloat(tempWeight) <= 0 || parseFloat(tempHeight) <= 0) {
      Alert.alert("Invalid Input", "Please enter valid height and weight values.");
      return;
    }
    setWeight(tempWeight);
    setHeight(tempHeight);
    setShowBmiModal(false);
  };

  const screenWidth = Dimensions.get('window').width;

  useEffect(() => {
    const unsubscribe = listenToWorkouts(setWorkouts);
    return () => unsubscribe && unsubscribe();
  }, []);

  const totalCardioCalories = workouts
      .filter(w => w.type === 'cardio')
      .reduce((sum, w) => sum + w.caloriesBurned, 0);

  const totalStrengthCalories = workouts
      .filter(w => w.type === 'strength')
      .reduce((sum, w) => sum + w.caloriesBurned, 0);

  const totalCaloriesBurned = totalCardioCalories + totalStrengthCalories;
  const totalMinutesActive = workouts.reduce((sum, w) => sum + w.durationMinutes, 0);

  const barData = {
    labels: ['Cardio', 'Strength'],
    datasets: [
      {
        data: [totalCardioCalories, totalStrengthCalories],
        colors: [
          (opacity = 1) => `rgba(249, 115, 22, ${opacity})`,
          (opacity = 1) => `rgba(161, 161, 170, ${opacity})`,
        ],
      },
    ],
  };

  return (
      <SafeAreaView className="flex-1 bg-zinc-950">
        <StatusBar barStyle="light-content" backgroundColor="#09090b" />

        <ScrollView showsVerticalScrollIndicator={false}>

          <LinearGradient
              colors={["#ea580c", "#9a3412"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ paddingHorizontal: 24, paddingTop: 24, paddingBottom: 32, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 }}
          >
            {/* Header */}
            <View className="px-2 pt-2">
              <View className="flex flex-row justify-between items-center mb-6">
                <View>
                  <Text className="text-orange-100 text-sm font-medium tracking-wide uppercase">Crush Your Goals,</Text>
                  <Text className="text-white text-2xl font-black uppercase tracking-tight">{user?.displayName || 'Athlete'}</Text>
                </View>
                <TouchableOpacity className="w-10 h-10 bg-white/10 border border-white/20 rounded-full items-center justify-center">
                  <MaterialIcons name="notifications-none" size={24} color="white" />
                </TouchableOpacity>
              </View>

              {/* Dashboard Fitness Card */}
              <View className="bg-zinc-950/40 rounded-3xl p-6 border border-white/10 backdrop-blur-md">
                <Text className="text-orange-100/80 text-xs font-bold uppercase tracking-wider mb-1">Total Energy Burned</Text>
                <Text className="text-white text-3xl font-black mb-4">
                  {totalCaloriesBurned.toLocaleString()} <Text className="text-lg font-normal text-orange-200">kcal</Text>
                </Text>

                <View className="flex-row justify-between border-t border-white/10 pt-4">
                  <View className="flex-1">
                    <Text className="text-orange-200/60 text-xs font-semibold uppercase">Active Time</Text>
                    <Text className="text-white text-base font-bold">
                      {totalMinutesActive} <Text className="text-xs font-normal text-zinc-300">mins</Text>
                    </Text>
                  </View>
                  <View className="flex-1 items-end">
                    <Text className="text-orange-200/60 text-xs font-semibold uppercase">Total Workouts</Text>
                    <Text className="text-white text-base font-bold">
                      {workouts.length} <Text className="text-xs font-normal text-zinc-300">sessions</Text>
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </LinearGradient>

          {/* --- BMI STEP 2: BMI Dashboard Card Component --- */}
          <TouchableOpacity
              onPress={() => {
                setTempWeight(weight);
                setTempHeight(height);
                setShowBmiModal(true);
              }}
              className="bg-zinc-900 border border-zinc-800 p-5 rounded-3xl mb-2 mx-6 mt-6 flex-row justify-between items-center shadow-xl"
          >
            <View className="flex-1">
              <Text className="text-zinc-500 font-bold uppercase text-xs mb-1">Body Mass Index (BMI)</Text>
              <View className="flex-row items-baseline mb-1">
                <Text className="text-white text-3xl font-black">{bmiResult.bmi}</Text>
                <Text className={`font-bold text-sm ml-3 ${bmiResult.color}`}>{bmiResult.status}</Text>
              </View>
              <Text className="text-zinc-400 text-xs">Weight: {weight}kg | Height: {height}cm</Text>
            </View>
            <View className="bg-zinc-800 p-3 rounded-2xl">
              <MaterialIcons name="speed" size={24} color="#f97316" />
            </View>
          </TouchableOpacity>

          {/* Progress Gallery Button Card */}
          <TouchableOpacity
              onPress={() => navigation.push('/(dashboard)/progress')}
              className="bg-zinc-900 border border-zinc-800 p-5 rounded-3xl mb-2 mx-6 mt-2 flex-row justify-between items-center shadow-xl"
          >
            <View className="flex-row items-center flex-1">
              <View className="bg-orange-500/10 border border-orange-500/20 p-3 rounded-2xl">
                <MaterialIcons name="photo-library" size={24} color="#f97316" />
              </View>
              <View className="ml-4">
                <Text className="text-white font-bold text-base">Progress Gallery</Text>
                <Text className="text-zinc-400 text-xs mt-0.5">Track your transformation photos</Text>
              </View>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#52525b" />
          </TouchableOpacity>

          {/* Charts Section */}
          <View className="px-6 mb-6 mt-4">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-white text-xl font-black uppercase tracking-tight">Fitness Analytics</Text>
            </View>

            {/* Bar Chart */}
            <View className="bg-zinc-900 border border-zinc-800 rounded-3xl p-4 shadow-xl">
              <Text className="text-zinc-300 font-bold mb-4 uppercase text-xs tracking-wider">Calorie Burn Distribution</Text>
              <BarChart
                  data={barData}
                  width={screenWidth - 80}
                  height={200}
                  yAxisLabel=""
                  yAxisSuffix=" kcal"
                  chartConfig={{
                    backgroundColor: 'transparent',
                    backgroundGradientFrom: '#18181b',
                    backgroundGradientTo: '#18181b',
                    decimalPlaces: 0,
                    color: (opacity = 1) => `rgba(249, 115, 22, ${opacity})`,
                    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity * 0.7})`,
                    style: { borderRadius: 16 },
                  }}
                  style={{ marginVertical: 8, borderRadius: 16 }}
                  showValuesOnTopOfBars
              />
            </View>
          </View>

          {/* Recent Workouts */}
          <View className="px-6 mb-12">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-white text-xl font-black uppercase tracking-tight">Recent Activity</Text>
              <TouchableOpacity onPress={() => { navigation.push('/(dashboard)/WorkoutsScreen'); }}>
                <Text className="text-orange-500 font-bold">View History</Text>
              </TouchableOpacity>
            </View>

            <View className="bg-zinc-900 border border-zinc-800 rounded-3xl shadow-xl overflow-hidden">
              {workouts.length === 0 ? (
                  <View className="p-8 items-center">
                    <MaterialIcons name="fitness-center" size={32} color="#52525b" />
                    <Text className="text-zinc-500 mt-2 text-sm font-medium">No workouts logged yet.</Text>
                  </View>
              ) : (
                  workouts.slice(0, 5).map((workout, index) => (
                      <View
                          key={workout.id}
                          className={`flex-row items-center p-4 bg-zinc-900 ${
                              index !== workouts.slice(0, 5).length - 1 ? 'border-b border-zinc-800' : ''
                          }`}
                      >
                        <View className={`w-12 h-12 rounded-2xl items-center justify-center ${
                            workout.type === 'cardio' ? 'bg-orange-500/10 border border-orange-500/20' : 'bg-zinc-800 border border-zinc-700'
                        }`}>
                          <MaterialIcons
                              name={workout.type === 'cardio' ? 'directions-run' : 'fitness-center'}
                              size={22}
                              color={workout.type === 'cardio' ? '#f97316' : '#a1a1aa'}
                          />
                        </View>

                        <View className="flex-1 ml-4">
                          <Text className="text-white font-bold text-base">
                            {workout.exercise?.name || 'General Training'}
                          </Text>
                          <Text className="text-zinc-400 text-xs mt-0.5">
                            {workout.durationMinutes} mins • {workout.notes || 'No description'}
                          </Text>
                        </View>

                        <Text className="font-black text-base text-orange-500">
                          -{workout.caloriesBurned} kcal
                        </Text>
                      </View>
                  ))
              )}
            </View>
          </View>

        </ScrollView>

        {/* --- BMI STEP 3: BMI Update Modal Component --- */}
        <Modal
            visible={showBmiModal}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setShowBmiModal(false)}
        >
          <View className="flex-1 justify-end bg-black/70">
            <View className="bg-zinc-900 p-6 rounded-t-3xl border-t border-zinc-800">
              <View className="flex flex-row justify-between items-center mb-6">
                <Text className="text-white font-black text-lg uppercase tracking-wider">Update Body Metrics</Text>
                <TouchableOpacity onPress={() => setShowBmiModal(false)}>
                  <MaterialIcons name="close" size={24} color="#fff" />
                </TouchableOpacity>
              </View>

              <Text className="text-zinc-500 font-bold uppercase text-xs mb-2">Weight (kg)</Text>
              <TextInput
                  value={tempWeight}
                  onChangeText={setTempWeight}
                  keyboardType="numeric"
                  className="bg-zinc-950 p-4 rounded-2xl text-white border border-zinc-800 mb-4"
                  placeholder="e.g., 70"
                  placeholderTextColor="#52525b"
              />

              <Text className="text-zinc-500 font-bold uppercase text-xs mb-2">Height (cm)</Text>
              <TextInput
                  value={tempHeight}
                  onChangeText={setTempHeight}
                  keyboardType="numeric"
                  className="bg-zinc-950 p-4 rounded-2xl text-white border border-zinc-800 mb-6"
                  placeholder="e.g., 175"
                  placeholderTextColor="#52525b"
              />

              <TouchableOpacity
                  onPress={handleSaveBmi}
                  className="bg-orange-500 p-4 rounded-2xl items-center shadow-lg active:bg-orange-600"
              >
                <Text className="text-white font-black uppercase tracking-wider">Update BMI</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
  );
};

export default HomeScreen;