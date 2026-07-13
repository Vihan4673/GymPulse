import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StatusBar,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import {
  listenToWorkoutPlans,
  deleteWorkoutPlan,
  updateWorkoutPlan,
  WorkoutPlan,
  addWorkout
} from '@/service/workoutService';
import Toast from 'react-native-toast-message';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const WorkoutsScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDay, setSelectedDay] = useState<string>('All');
  const [workoutPlans, setWorkoutPlans] = useState<WorkoutPlan[]>([]);
  const [activePlanId, setActivePlanId] = useState<string | null>(null);
  const [seconds, setSeconds] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

  const timerRef = useRef<any>(null);
  const daysOfWeek = ['All', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const refreshScheduledReminder = async (plans: WorkoutPlan[]) => {
    if (Platform.OS === 'web') return;

    try {
      const savedHour = await AsyncStorage.getItem('notification_hour');
      const savedMinute = await AsyncStorage.getItem('notification_minute');

      const hour = savedHour ? parseInt(savedHour, 10) : 8;
      const minute = savedMinute ? parseInt(savedMinute, 10) : 0;

      await Notifications.cancelAllScheduledNotificationsAsync();

      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const todayName = days[new Date().getDay()];

      const todaysPendingPlans = plans.filter(
          (plan) => plan.day?.toLowerCase() === todayName.toLowerCase() && !plan.completed
      );

      let notificationBody = "You have scheduled workouts for today. Let's get moving!";
      if (todaysPendingPlans.length > 0) {
        const planTitles = todaysPendingPlans.map(p => `"${p.title}"`).join(', ');
        notificationBody = `Today's Routines: ${planTitles}. Let's smash it! 🔥`;
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title: "💪 Time to hit the gym!",
          body: notificationBody,
          sound: 'default',
        },
        trigger: {
          type: 'daily',
          hour: hour,
          minute: minute,
        } as any,
      });
    } catch (error) {
      console.error("Failed to refresh notification:", error);
    }
  };

  // Timer useEffect
  useEffect(() => {
    if (isTimerRunning && activePlanId) {
      timerRef.current = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning, activePlanId]);

  useEffect(() => {
    const unsubscribe = listenToWorkoutPlans((data) => {
      if (data) {
        const plans = data as WorkoutPlan[];
        setWorkoutPlans(plans);

        refreshScheduledReminder(plans);

        const now = new Date();
        plans.forEach(async (plan) => {
          if (plan.completed && plan.lastCompletedAt) {
            try {
              const completionDate = plan.lastCompletedAt.toDate
                  ? plan.lastCompletedAt.toDate()
                  : new Date(plan.lastCompletedAt);

              const timeDiff = now.getTime() - completionDate.getTime();
              const daysDiff = timeDiff / (1000 * 3600 * 24);

              if (daysDiff >= 6) {
                await updateWorkoutPlan(plan.id, { completed: false });
              }
            } catch (err) {
              console.error("Weekly auto-reset calculation failed:", err);
            }
          }
        });
      }
    });
    return () => unsubscribe && unsubscribe();
  }, []);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleToggleTimer = (planId: string) => {
    if (activePlanId !== planId) {
      setActivePlanId(planId);
      setSeconds(0);
      setIsTimerRunning(true);
    } else {
      setIsTimerRunning(!isTimerRunning);
    }
  };

  const handleToggleComplete = async (planId: string, currentStatus: boolean, title: string) => {
    const nextStatus = !currentStatus;

    const durationMins = seconds > 0 ? Math.max(1, Math.round(seconds / 60)) : 0;

    if (activePlanId === planId) {
      setIsTimerRunning(false);
      setActivePlanId(null);
    }

    setWorkoutPlans(prev =>
        prev.map(p => p.id === planId ? { ...p, completed: nextStatus, lastCompletedAt: new Date() } : p)
    );

    try {
      await updateWorkoutPlan(planId, { completed: nextStatus, lastCompletedAt: new Date() });

      if (nextStatus) {
        await addWorkout({
          type: "General",
          caloriesBurned: durationMins * 7,
          durationMinutes: durationMins,
          exercise: null,
          notes: `Completed via timer routine: ${title}`,
          date: new Date(),
          intensity: 'Moderate',
        });
      }

      setSeconds(0);

      Toast.show({
        type: 'success',
        text1: nextStatus ? 'Workout Completed! 🎉' : 'Workout Reset',
        text2: nextStatus ? `Great job! Logged ${durationMins} mins for "${title}".` : `"${title}" is back on your list.`,
      });
    } catch (error: any) {
      console.error(error);
      setWorkoutPlans(prev => prev.map(p => p.id === planId ? { ...p, completed: currentStatus } : p));
      Toast.show({ type: 'error', text1: 'Update Failed', text2: error.message || 'Something went wrong.' });
    }
  };

  const executeDeletePlan = async (planId: string) => {
    try {
      await deleteWorkoutPlan(planId);
      Toast.show({ type: 'success', text1: 'Plan Deleted', text2: 'Your workout plan has been removed successfully.' });
    } catch (error: any) {
      console.error(error);
    }
  };

  const handleDeletePlan = (planId: string, title: string) => {
    if (Platform.OS === 'web') {
      if (window.confirm(`Are you sure you want to delete "${title}" plan?`)) executeDeletePlan(planId);
    } else {
      Alert.alert("Delete Workout Plan", `Are you sure you want to delete "${title}" plan?`, [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => executeDeletePlan(planId) }
      ]);
    }
  };

  const handleEditPlan = (plan: WorkoutPlan) => {
    Toast.show({ type: 'info', text1: 'Edit Mode', text2: `Redirecting to edit "${plan.title}"...` });
  };

  const filteredPlans = useMemo(() => {
    return workoutPlans.filter(plan => {
      if (plan.completed === true) return false;
      const matchesDay = selectedDay === 'All' || plan.day?.toLowerCase() === selectedDay.toLowerCase();
      const matchesSearch = !searchQuery ||
          plan.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          plan.day?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesDay && matchesSearch;
    });
  }, [workoutPlans, searchQuery, selectedDay]);

  const suggestedNextPlan = useMemo(() => {
    return filteredPlans.length > 0 ? filteredPlans[0] : null;
  }, [filteredPlans]);

  return (
      <SafeAreaView className="flex-1 bg-zinc-950">
        <StatusBar barStyle="light-content" backgroundColor="#09090b" />

        {/* Header Section */}
        <View className="bg-zinc-900 px-6 pt-5 pb-4 border-b border-zinc-800">
          <View className="mb-4">
            <Text className="text-2xl font-black text-white uppercase tracking-tight">Workout Plans</Text>
            <Text className="text-zinc-400 text-sm">{filteredPlans.length} routines remaining</Text>
          </View>

          {/* Search Bar */}
          <View className="bg-zinc-950 border border-zinc-800 rounded-2xl px-4 py-3 mb-4 flex-row items-center">
            <MaterialIcons name="search" size={20} color="#71717a" />
            <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search plans or routines..."
                placeholderTextColor="#52525b"
                className="flex-1 ml-3 text-white text-base py-0"
            />
            {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <MaterialIcons name="close" size={20} color="#71717a" />
                </TouchableOpacity>
            )}
          </View>

          {/* Day Filter */}
          <FlatList
              horizontal
              data={daysOfWeek}
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item}
              renderItem={({ item }) => {
                const isActive = selectedDay === item;
                return (
                    <TouchableOpacity
                        onPress={() => setSelectedDay(item)}
                        className={`px-4 py-2 rounded-xl mr-2 border ${
                            isActive ? 'bg-orange-500 border-orange-500' : 'bg-zinc-950 border-zinc-800'
                        }`}
                    >
                      <Text className={`font-bold text-xs uppercase tracking-wider ${isActive ? 'text-black' : 'text-zinc-400'}`}>
                        {item}
                      </Text>
                    </TouchableOpacity>
                );
              }}
          />
        </View>

        {/* Workout Plans List */}
        <FlatList
            data={filteredPlans}
            keyExtractor={(item) => `${item.id}_${!!item.completed}`}
            extraData={[filteredPlans, activePlanId, seconds, isTimerRunning]}
            contentContainerStyle={{ paddingBottom: 100, paddingHorizontal: 16, paddingTop: 16 }}
            renderItem={({ item }) => {
              const isSuggestedNext = suggestedNextPlan?.id === item.id;
              const isCurrentTimerActive = activePlanId === item.id;

              return (
                  <View className={`border p-5 rounded-2xl mb-4 shadow-xl bg-zinc-900 ${
                      isSuggestedNext ? 'border-orange-500/50' : 'border-zinc-800'
                  }`}>

                    <View className="flex-row justify-between items-center mb-3">
                      {isSuggestedNext ? (
                          <View className="bg-orange-500/10 border border-orange-500/20 px-2.5 py-1 rounded-md">
                            <Text className="text-orange-500 font-black text-[10px] uppercase tracking-widest text-center">🎯 Suggested Next</Text>
                          </View>
                      ) : <View />}

                      {/* LIVE TIMER */}
                      <TouchableOpacity
                          onPress={() => handleToggleTimer(item.id)}
                          className={`flex-row items-center px-3 py-1.5 rounded-xl border ${
                              isCurrentTimerActive && isTimerRunning
                                  ? 'bg-emerald-500/10 border-emerald-500/30'
                                  : 'bg-zinc-950 border-zinc-800'
                          }`}
                      >
                        <MaterialCommunityIcons
                            name={isCurrentTimerActive && isTimerRunning ? "pause-circle" : "play-circle"}
                            size={16}
                            color={isCurrentTimerActive && isTimerRunning ? "#10b981" : "#a1a1aa"}
                        />
                        <Text className={`text-xs font-mono font-black ml-1.5 ${
                            isCurrentTimerActive && isTimerRunning ? 'text-emerald-400' : 'text-zinc-400'
                        }`}>
                          {isCurrentTimerActive ? formatTime(seconds) : "00:00"}
                        </Text>
                      </TouchableOpacity>
                    </View>

                    {/* Top Card Info */}
                    <View className="flex-row justify-between items-start mb-3">
                      <View className="flex-1">
                        <Text className="text-white font-black text-lg uppercase tracking-tight leading-tight">{item.title}</Text>
                        <Text className="text-orange-500 font-extrabold text-xs uppercase tracking-widest mt-0.5">{item.day}</Text>
                      </View>

                      {/* Action Buttons */}
                      <View className="flex-row items-center">
                        <TouchableOpacity
                            onPress={() => handleEditPlan(item)}
                            className="w-9 h-9 bg-zinc-800 rounded-xl items-center justify-center border border-zinc-700/60 mr-2"
                        >
                          <MaterialIcons name="edit" size={18} color="#a1a1aa" />
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => handleDeletePlan(item.id, item.title)}
                            className="w-9 h-9 bg-red-950/40 rounded-xl items-center justify-center border border-red-900/40"
                        >
                          <MaterialIcons name="delete-outline" size={18} color="#f87171" />
                        </TouchableOpacity>
                      </View>
                    </View>

                    <View className="bg-zinc-950/80 border border-zinc-800/80 rounded-2xl p-3.5 mt-2 mb-4">
                      {item.exercises && item.exercises.map((ex, idx) => (
                          <View
                              key={idx}
                              className={`flex-row justify-between items-center py-3 px-2 ${
                                  idx !== item.exercises.length - 1 ? 'border-b border-zinc-800/40' : ''
                              }`}
                          >
                            {/* Exercise Name */}
                            <View className="flex-row items-center flex-1 pr-3">
                              <MaterialCommunityIcons name="lightning-bolt" size={16} color="#f97316" className="mr-2" />
                              <Text className="text-zinc-100 text-sm font-bold tracking-wide" numberOfLines={1}>
                                {ex.name}
                              </Text>
                            </View>

                            <View className="flex-row items-center bg-zinc-900 border border-zinc-800 rounded-xl px-2.5 py-1.5">
                              <Text className="text-white text-xs font-black">
                                {ex.sets} <Text className="text-zinc-500 text-[9px] font-bold">SETS</Text>
                              </Text>

                              <Text className="text-zinc-600 text-xs mx-1.5">×</Text>

                              <View className="bg-orange-500/10 border border-orange-500/30 px-2 py-0.5 rounded-md">
                                <Text className="text-orange-400 text-xs font-black">
                                  {ex.reps} <Text className="text-orange-500 text-[9px] font-bold">REPS</Text>
                                </Text>
                              </View>
                            </View>

                          </View>
                      ))}
                    </View>

                    {/* COMPLETE WORKOUT BUTTON */}
                    <TouchableOpacity
                        onPress={() => handleToggleComplete(item.id, !!item.completed, item.title)}
                        className="w-full bg-orange-500 py-3.5 rounded-xl flex-row items-center justify-center border border-orange-600 active:bg-orange-600"
                    >
                      <MaterialCommunityIcons name="check-circle" size={18} color="#000" />
                      <Text className="text-black font-black text-sm uppercase tracking-wider text-center ml-2">
                        Complete Workout
                      </Text>
                    </TouchableOpacity>

                  </View>
              );
            }}
            ListEmptyComponent={
              <View className="items-center justify-center py-20 m-4 border border-zinc-900 border-dashed rounded-3xl bg-zinc-900/20">
                <MaterialIcons name="check-circle-outline" size={60} color="#f97316" />
                <Text className="text-zinc-400 text-lg font-bold uppercase tracking-wider mt-4">All Done for Now!</Text>
                <Text className="text-zinc-500 text-sm text-center mt-1 px-8">
                  {selectedDay !== 'All'
                      ? `You've cleared all scheduled workouts for ${selectedDay}.`
                      : "No pending workouts left!"}
                </Text>
              </View>
            }
        />
      </SafeAreaView>
  );
};

export default WorkoutsScreen;