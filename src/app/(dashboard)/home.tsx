import { useAuth } from '@/hooks/useAuth';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useState, useMemo } from 'react';
import {
    Dimensions,
    ScrollView,
    StatusBar,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from "expo-linear-gradient";
import { listenToWorkouts, listenToWorkoutPlans, WorkoutPlan, WorkoutLog } from '@/service/workoutService';
import { getUserProfile } from '@/service/userService';
import { useRouter } from 'expo-router';

const convertToDate = (dateVal: any): Date | null => {
    if (!dateVal) return null;
    if (typeof dateVal.toDate === 'function') {
        return dateVal.toDate();
    }
    const parsedDate = new Date(dateVal);
    return isNaN(parsedDate.getTime()) ? null : parsedDate;
};

const HomeScreen: React.FC = () => {
    const { user } = useAuth();
    const navigation = useRouter();
    const [workouts, setWorkouts] = useState<WorkoutLog[]>([]);
    const [workoutPlans, setWorkoutPlans] = useState<WorkoutPlan[]>([]);

    const [weight, setWeight] = useState<string>("");
    const [height, setHeight] = useState<string>("");

    const motivationalQuotes = [
        "Your only limit is you. Push harder today! 🔥",
        "Consistency beats talent every single time. Keep going! 🎯",
        "Don't stop when you are tired. Stop when you are done! 💪",
        "Small daily improvements over time lead to stunning results. 📈",
        "Sweat now, shine later. Make today count! ✨",
        "Action is the foundational key to all success. 🚀",
        "Believe you can and you're halfway there. 🏁"
    ];

    const dailyQuote = useMemo(() => {
        const dayIndex = new Date().getDay();
        return motivationalQuotes[dayIndex];
    }, []);

    useEffect(() => {
        const fetchUserMetrics = async () => {
            if (!user?.uid) return;
            try {
                const profileData = await getUserProfile(user.uid);
                if (profileData) {
                    setWeight(profileData.weight || "");
                    setHeight(profileData.height || "");
                }
            } catch (error) {
                console.error("Error fetching metrics for BMI:", error);
            }
        };

        fetchUserMetrics();
    }, [user?.uid]);

    useEffect(() => {
        if (!user?.uid) return;

        const unsubscribeWorkouts = listenToWorkouts((workoutsData: WorkoutLog[]) => {
            if (workoutsData) {
                setWorkouts([...workoutsData]);
            }
        });

        const unsubscribePlans = listenToWorkoutPlans((data: WorkoutPlan[]) => {
            if (data) {
                setWorkoutPlans([...data]);
            }
        });

        return () => {
            if (unsubscribeWorkouts) unsubscribeWorkouts();
            if (unsubscribePlans) unsubscribePlans();
        };
    }, [user?.uid]);

    const todaysWorkouts = useMemo(() => {
        const todayStr = new Date().toDateString();

        return workouts.filter(w => {
            const workoutDate = convertToDate(w.date);
            if (!workoutDate) return false;
            return workoutDate.toDateString() === todayStr;
        });
    }, [workouts]);

    const remainingPlans = useMemo(() => {
        return workoutPlans.filter(plan => !plan.completed);
    }, [workoutPlans]);

    const suggestedPlan = useMemo(() => {
        const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const currentDayName = daysOfWeek[new Date().getDay()];

        const todayPlan = remainingPlans.find(
            plan => plan.day?.toLowerCase() === currentDayName.toLowerCase()
        );

        return todayPlan || null;
    }, [remainingPlans]);

    const todayMinutesActive = useMemo(() => {
        return todaysWorkouts.reduce((sum, w) => {
            const mins = Number(w.durationMinutes) || 0;
            return sum + mins;
        }, 0);
    }, [todaysWorkouts]);

    const chartData = useMemo(() => {
        if (todaysWorkouts.length === 0) return { labels: [], data: [] };

        const recentWorkouts = todaysWorkouts.slice(0, 4);

        const labels = recentWorkouts.map(w => {
            if (w.notes?.startsWith('Completed via timer routine:')) {
                return w.notes.replace('Completed via timer routine:', '').trim().substring(0, 8);
            }
            return w.exercise?.name ? w.exercise.name.substring(0, 8) : "Session";
        });

        const data = recentWorkouts.map(w => Number(w.durationMinutes) || 0);

        return { labels, data };
    }, [todaysWorkouts]);

    const bmiResult = useMemo(() => {
        const weightNum = parseFloat(weight);
        const heightNum = parseFloat(height) / 100;

        if (!weightNum || !heightNum || isNaN(weightNum) || isNaN(heightNum)) {
            return { bmi: '--', status: 'Set Metrics in Profile', color: 'text-zinc-500' };
        }

        const bmiVal = weightNum / (heightNum * heightNum);
        const fixedBmi = bmiVal.toFixed(1);

        if (bmiVal < 18.5) return { bmi: fixedBmi, status: 'Underweight', color: 'text-blue-400' };
        if (bmiVal < 24.9) return { bmi: fixedBmi, status: 'Normal weight', color: 'text-green-400' };
        if (bmiVal < 29.9) return { bmi: fixedBmi, status: 'Overweight', color: 'text-amber-500' };
        return { bmi: fixedBmi, status: 'Obese', color: 'text-red-500' };
    }, [weight, height]);

    const screenWidth = Dimensions.get('window').width;

    return (
        <SafeAreaView className="flex-1 bg-zinc-950">
            <StatusBar barStyle="light-content" backgroundColor="#09090b" />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ flexGrow: 1, paddingBottom: 120 }}
            >

                <LinearGradient
                    colors={["#ea580c", "#9a3412"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{ paddingHorizontal: 24, paddingTop: 24, paddingBottom: 32, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 }}
                >
                    <View className="px-2 pt-2">
                        <View className="flex flex-row justify-between items-center mb-5">
                            <View>
                                <Text className="text-orange-100 text-sm font-medium tracking-wide uppercase">Crush Your Goals,</Text>
                                <Text className="text-white text-2xl font-black uppercase tracking-tight">{user?.displayName || 'Athlete'}</Text>
                            </View>
                            <TouchableOpacity className="w-10 h-10 bg-white/10 border border-white/20 rounded-full items-center justify-center">
                                <MaterialIcons name="notifications-none" size={24} color="white" />
                            </TouchableOpacity>
                        </View>

                        <View className="bg-white/10 border border-white/10 rounded-2xl px-4 py-3 mb-5 flex-row items-center">
                            <MaterialCommunityIcons name="format-quote-close" size={20} color="#ffedd5" style={{ marginRight: 12 }} />
                            <Text className="text-orange-50 font-bold text-xs flex-1 italic tracking-wide">
                                "{dailyQuote}"
                            </Text>
                        </View>

                        <View className="bg-zinc-950/60 rounded-3xl p-6 border border-white/10 shadow-lg">
                            <View className="flex-row items-center mb-1">
                                <MaterialCommunityIcons name="clock-outline" size={14} color="#ffedd5" style={{ marginRight: 6 }} />
                                <Text className="text-orange-100/80 text-xs font-bold uppercase tracking-wider">Today's Workout Time</Text>
                            </View>

                            <Text className="text-white text-3xl font-black mb-4">
                                {todayMinutesActive} <Text className="text-lg font-normal text-orange-200">mins</Text>
                            </Text>

                            <View className="flex-row justify-between border-t border-white/10 pt-4">
                                <View className="flex-1">
                                    <Text className="text-orange-200/60 text-xs font-semibold uppercase">Logged Today</Text>
                                    <Text className="text-white text-base font-bold">
                                        {todaysWorkouts.length} <Text className="text-xs font-normal text-zinc-300">sessions</Text>
                                    </Text>
                                </View>
                                <View className="flex-1 items-end">
                                    <Text className="text-orange-200/60 text-xs font-semibold uppercase">Pending Routines</Text>
                                    <Text className="text-white text-base font-bold">
                                        {remainingPlans.filter(p => p.day?.toLowerCase() === ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"][new Date().getDay()].toLowerCase()).length} <Text className="text-xs font-normal text-zinc-300">left</Text>
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </LinearGradient>

                <View className="bg-zinc-900 border border-zinc-800 p-5 rounded-3xl mb-2 mx-6 mt-6 shadow-xl">
                    <View className="flex-row justify-between items-center mb-4">
                        <View className="flex-row items-center">
                            <View className="bg-orange-500/10 border border-orange-500/20 p-2 rounded-xl" style={{ marginRight: 10 }}>
                                <MaterialCommunityIcons name="dumbbell" size={18} color="#f97316" />
                            </View>
                            <Text className="text-white font-black text-sm uppercase tracking-wider">Workout Status</Text>
                        </View>
                        <View className="bg-zinc-950 border border-zinc-800 px-2.5 py-1 rounded-md">
                            <Text className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest">
                                Suggested Plan
                            </Text>
                        </View>
                    </View>

                    {suggestedPlan ? (
                        <View className="space-y-3">
                            <View className="bg-zinc-950/50 border border-zinc-800/60 rounded-2xl p-4 flex-row justify-between items-center">
                                <View className="flex-1 pr-2">
                                    <Text className="text-orange-500 font-extrabold text-[10px] uppercase tracking-widest">{suggestedPlan.day}</Text>
                                    <Text className="text-white font-bold text-base mt-0.5 uppercase tracking-tight" numberOfLines={1}>
                                        {suggestedPlan.title}
                                    </Text>
                                </View>
                                <TouchableOpacity
                                    onPress={() => navigation.push('/(dashboard)/WorkoutsScreen')}
                                    className="bg-orange-500 rounded-xl px-3 py-2 flex-row items-center"
                                >
                                    <Text className="text-black font-black text-xs uppercase mr-1">Start</Text>
                                    <MaterialIcons name="play-arrow" size={14} color="#000" />
                                </TouchableOpacity>
                            </View>

                            <View className="bg-zinc-950/30 rounded-2xl border border-zinc-800/40 p-1 mt-2">
                                {suggestedPlan.exercises && suggestedPlan.exercises.length > 0 ? (
                                    suggestedPlan.exercises.map((ex, index) => (
                                        <View
                                            key={index}
                                            className={`flex-row justify-between items-center p-3 ${
                                                index !== suggestedPlan.exercises.length - 1 ? 'border-b border-zinc-800/50' : ''
                                            }`}
                                        >
                                            <View className="flex-row items-center flex-1">
                                                <View className="w-2 h-2 rounded-full bg-orange-500 mr-3" />
                                                <Text className="text-zinc-200 font-semibold text-sm capitalize" numberOfLines={1}>
                                                    {ex.name}
                                                </Text>
                                            </View>
                                            <View className="bg-zinc-800/80 px-2.5 py-1 rounded-md">
                                                <Text className="text-zinc-400 font-bold text-xs">
                                                    {ex.sets} Sets × {ex.reps} Reps
                                                </Text>
                                            </View>
                                        </View>
                                    ))
                                ) : (
                                    <Text className="text-zinc-500 text-xs p-3 italic text-center">No exercises added to this plan.</Text>
                                )}
                            </View>
                        </View>
                    ) : (
                        <View className="py-6 items-center justify-center bg-zinc-950/30 rounded-2xl border border-dashed border-zinc-800">
                            <MaterialCommunityIcons name="check-all" size={24} color="#10b981" />
                            <Text className="text-zinc-400 text-xs font-bold uppercase tracking-wider mt-1.5">No plans pending for today! 🎉</Text>
                        </View>
                    )}
                </View>

                <View className="bg-zinc-900 border border-zinc-800 p-5 rounded-3xl mb-2 mx-6 mt-2 flex-row justify-between items-center shadow-xl">
                    <View className="flex-1">
                        <Text className="text-zinc-500 font-bold uppercase text-xs mb-1">Body Mass Index (BMI)</Text>
                        <View className="flex-row items-baseline mb-1">
                            <Text className="text-white text-3xl font-black">{bmiResult.bmi}</Text>
                            <Text className={`font-bold text-sm ml-3 ${bmiResult.color}`}>{bmiResult.status}</Text>
                        </View>
                        <Text className="text-zinc-400 text-xs">
                            {weight && height ? `Weight: ${weight}kg | Height: ${height}cm` : "No metrics available"}
                        </Text>
                    </View>
                    <View className="bg-zinc-800 p-3 rounded-2xl">
                        <MaterialIcons name="speed" size={24} color="#f97316" />
                    </View>
                </View>

                <TouchableOpacity
                    onPress={() => navigation.push('/progress')}
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

                <View className="px-6 mb-6 mt-4">
                    <View className="flex-row justify-between items-center mb-4">
                        <Text className="text-white text-xl font-black uppercase tracking-tight">Today's Analytics</Text>
                    </View>

                    <View className="bg-zinc-900 border border-zinc-800 rounded-3xl p-4 shadow-xl">
                        <Text className="text-zinc-300 font-bold mb-4 uppercase text-xs tracking-wider">Today's Active Routines Breakdown</Text>

                        {todayMinutesActive === 0 ? (
                            <View className="py-12 items-center justify-center">
                                <MaterialCommunityIcons name="timer-off-outline" size={36} color="#52525b" />
                                <Text className="text-zinc-500 text-xs mt-2 font-medium">No active workout time recorded today.</Text>
                            </View>
                        ) : (
                            <BarChart
                                data={{
                                    labels: chartData.labels,
                                    datasets: [
                                        {
                                            data: chartData.data
                                        },
                                    ],
                                }}
                                width={screenWidth - 80}
                                height={200}
                                yAxisLabel=""
                                yAxisSuffix=" m"
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
                        )}
                    </View>
                </View>

                {/* Today's Activity List */}
                <View className="px-6">
                    <View className="flex-row justify-between items-center mb-4">
                        <Text className="text-white text-xl font-black uppercase tracking-tight">Today's Activity</Text>
                        <TouchableOpacity onPress={() => navigation.push('/(dashboard)/WorkoutsScreen')}>
                            <Text className="text-orange-500 font-bold">View History</Text>
                        </TouchableOpacity>
                    </View>

                    <View className="bg-zinc-900 border border-zinc-800 rounded-3xl shadow-xl overflow-hidden">
                        {todaysWorkouts.length === 0 ? (
                            <View className="p-8 items-center">
                                <MaterialIcons name="fitness-center" size={32} color="#52525b" />
                                <Text className="text-zinc-500 mt-2 text-sm font-medium">No workouts logged today yet.</Text>
                            </View>
                        ) : (
                            todaysWorkouts.map((workout) => {
                                const displayName = workout.notes?.startsWith('Completed via timer routine:')
                                    ? workout.notes.replace('Completed via timer routine:', '').trim()
                                    : (workout.exercise?.name || 'General Training');

                                return (
                                    <View
                                        key={workout.id}
                                        className="flex-row items-center justify-between p-4 bg-zinc-900 border-b border-zinc-800"
                                    >
                                        <View className="flex-row items-center flex-1 pr-3">
                                            <View className="w-12 h-12 rounded-2xl items-center justify-center bg-orange-500/10 border border-orange-500/20 flex-shrink-0">
                                                <MaterialIcons
                                                    name="fitness-center"
                                                    size={22}
                                                    color="#f97316"
                                                />
                                            </View>

                                            <View className="flex-1 ml-4">
                                                <Text className="text-white font-bold text-base capitalize" numberOfLines={1}>
                                                    {displayName}
                                                </Text>
                                                <Text className="text-zinc-400 text-xs mt-0.5" numberOfLines={1}>
                                                    Logged Today • 🔥 Ready to crush more
                                                </Text>
                                            </View>
                                        </View>

                                        <View className="flex-shrink-0 items-end">
                                            <Text className="font-black text-base text-orange-500">
                                                {workout.durationMinutes} min
                                            </Text>
                                        </View>
                                    </View>
                                );
                            })
                        )}
                    </View>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
};

export default HomeScreen;