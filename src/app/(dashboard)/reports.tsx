import React, { useState, useEffect, useMemo } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    Dimensions,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';
import { LinearGradient } from 'expo-linear-gradient';
import { listenToWorkouts, WorkoutLog } from '@/service/workoutService';

type ReportPeriod = 'week' | 'month' | 'year';

const GymReportsScreen: React.FC = () => {
    const [selectedPeriod, setSelectedPeriod] = useState<ReportPeriod>('week');
    const [allWorkouts, setAllWorkouts] = useState<WorkoutLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const screenWidth = Dimensions.get('window').width;

    useEffect(() => {
        setIsLoading(true);
        const unsubscribe = listenToWorkouts((workoutsData) => {
            setAllWorkouts(workoutsData || []);
            setIsLoading(false);
        });

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, []);

    const safeParseDate = (dateField: any): Date => {
        if (!dateField) return new Date();
        if (typeof dateField.toDate === 'function') {
            return dateField.toDate();
        }
        if (dateField instanceof Date) return dateField;
        return new Date(dateField);
    };

    const filteredWorkouts = useMemo(() => {
        const now = new Date();
        return allWorkouts.filter((workout) => {
            if (!workout.date) return false;
            const workoutDate = safeParseDate(workout.date);
            const timeDiff = now.getTime() - workoutDate.getTime();
            const daysDiff = timeDiff / (1000 * 3600 * 24);

            if (selectedPeriod === 'week') return daysDiff <= 7;
            if (selectedPeriod === 'month') return daysDiff <= 30;
            if (selectedPeriod === 'year') return daysDiff <= 365;
            return true;
        });
    }, [allWorkouts, selectedPeriod]);

    const totalDuration = useMemo(() => {
        return filteredWorkouts.reduce((sum, item) => sum + (Number(item.durationMinutes) || 0), 0);
    }, [filteredWorkouts]);

    const totalSessions = filteredWorkouts.length;

    const { cardioMinutes, strengthMinutes } = useMemo(() => {
        const cardio = filteredWorkouts
            .filter(w => w.type?.toLowerCase() === 'cardio')
            .reduce((sum, item) => sum + (Number(item.durationMinutes) || 0), 0);

        const strength = filteredWorkouts
            .filter(w => w.type?.toLowerCase() === 'strength')
            .reduce((sum, item) => sum + (Number(item.durationMinutes) || 0), 0);

        return { cardioMinutes: cardio, strengthMinutes: strength };
    }, [filteredWorkouts]);

    const cardioPercentage = totalDuration > 0 ? Math.round((cardioMinutes / totalDuration) * 100) : 0;
    const strengthPercentage = totalDuration > 0 ? Math.round((strengthMinutes / totalDuration) * 100) : 0;

    const chartData = useMemo(() => {
        const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const last7DaysData = Array(7).fill(0);
        const last7DaysLabels = Array(7).fill('');

        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            last7DaysLabels[6 - i] = daysOfWeek[d.getDay()];

            const dStr = d.toLocaleDateString();

            const dayWorkouts = allWorkouts.filter((w) => {
                if (!w.date) return false;
                const wDate = safeParseDate(w.date);
                return wDate.toLocaleDateString() === dStr;
            });

            last7DaysData[6 - i] = dayWorkouts.reduce((sum, item) => sum + (Number(item.durationMinutes) || 0), 0);
        }

        const hasData = last7DaysData.some(val => val > 0);
        const finalData = hasData ? last7DaysData : [15, 30, 0, 45, 20, 60, 40]; // Fallback if empty

        return {
            labels: last7DaysLabels,
            datasets: [{
                data: finalData,
                color: (opacity = 1) => `rgba(249, 115, 22, ${opacity})`,
                strokeWidth: 3,
            }],
        };
    }, [allWorkouts]);

    const getInsightText = () => {
        if (filteredWorkouts.length === 0) {
            return "No workouts logged for this period yet. Start smashing your routines to see your time insights!";
        }
        if (totalDuration > 180) {
            return `Incredible dedication! You have dedicated ${totalDuration} minutes to your health. Your training is heavily focused on ${cardioMinutes >= strengthMinutes ? 'Cardio' : 'Strength'} exercises.`;
        }
        return "Consistency is key! Every single minute spent exercising builds a healthier habits loop. Keep pushing!";
    };

    const StatCard = ({ title, value, unit, icon, color }: any) => (
        <View className="bg-zinc-900 p-5 rounded-3xl border border-zinc-800 flex-1 shadow-md">
            <View className="flex-row items-center mb-3">
                <View className="w-10 h-10 rounded-xl items-center justify-center bg-zinc-950 border border-zinc-800">
                    <MaterialIcons name={icon} size={20} color={color} />
                </View>
            </View>
            <Text className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider">{title}</Text>
            <Text className="text-white text-2xl font-black mt-1">
                {value} <Text className="text-xs font-normal text-zinc-500">{unit}</Text>
            </Text>
        </View>
    );

    return (
        <SafeAreaView className="flex-1 bg-zinc-950">
            <StatusBar barStyle="light-content" backgroundColor="#09090b" />

            {isLoading ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#f97316" />
                    <Text className="text-zinc-500 font-bold mt-4 uppercase text-xs tracking-widest">Loading Analytics...</Text>
                </View>
            ) : (
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 40 }}>

                    <Text className="text-white text-3xl font-black uppercase tracking-tight mb-6">Analytics</Text>

                    <View className="flex-row bg-zinc-900 p-1.5 rounded-full mb-6 border border-zinc-800/60">
                        {(['week', 'month', 'year'] as ReportPeriod[]).map((p) => (
                            <TouchableOpacity
                                key={p}
                                onPress={() => setSelectedPeriod(p)}
                                className={`flex-1 py-3 rounded-full ${selectedPeriod === p ? 'bg-orange-500' : ''}`}
                            >
                                <Text className={`text-center font-black uppercase text-[11px] tracking-wider ${selectedPeriod === p ? 'text-black' : 'text-zinc-400'}`}>
                                    {p}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <View className="flex-row gap-4 mb-4">
                        <StatCard
                            title="Total Active Time"
                            value={totalDuration.toString()}
                            unit="mins"
                            icon="timer"
                            color="#38bdf8"
                        />
                        <StatCard
                            title="Sessions Completed"
                            value={totalSessions.toString()}
                            unit="times"
                            icon="fitness-center"
                            color="#a1a1aa"
                        />
                    </View>

                    <View className="flex-row gap-4 mb-6">
                        <StatCard
                            title="Avg/Session"
                            value={totalSessions > 0 ? Math.round(totalDuration / totalSessions).toString() : '0'}
                            unit="mins"
                            icon="bolt"
                            color="#f59e0b"
                        />
                        <StatCard
                            title="Weekly Commitment"
                            value={totalSessions > 0 ? Math.min(totalSessions, 7).toString() : '0'}
                            unit="days"
                            icon="calendar-today"
                            color="#10b981"
                        />
                    </View>

                    <View className="bg-zinc-900 p-5 rounded-3xl border border-zinc-800 mb-6">
                        <Text className="text-zinc-400 font-bold uppercase text-xs tracking-wider mb-4">Training Focus Breakdown</Text>

                        <View className="flex-row justify-between items-center mb-2">
                            <Text className="text-white font-bold text-sm">⏱️ Cardio ({cardioPercentage}%)</Text>
                            <Text className="text-zinc-400 font-bold text-sm">💪 Strength ({strengthPercentage}%)</Text>
                        </View>

                        {/* Progress Bar View */}
                        <View className="w-full h-3 bg-zinc-950 rounded-full flex-row overflow-hidden border border-zinc-800">
                            <View style={{ width: `${cardioPercentage}%` }} className="h-full bg-orange-500" />
                            <View style={{ width: `${strengthPercentage}%` }} className="h-full bg-zinc-700" />
                        </View>
                        <Text className="text-[11px] text-zinc-500 mt-2">Calculated based on active minutes spent per discipline.</Text>
                    </View>

                    <View className="bg-zinc-900 p-5 rounded-3xl border border-zinc-800 mb-6 shadow-md">
                        <View className="flex-row items-center mb-4">
                            <MaterialCommunityIcons name="chart-bell-curve-cumulative" size={18} color="#f97316" />
                            <Text className="text-white font-black uppercase text-xs tracking-wider ml-2">Workout Duration Trend</Text>
                        </View>

                        <LineChart
                            data={chartData}
                            width={screenWidth - 76}
                            height={180}
                            chartConfig={{
                                backgroundColor: '#18181b',
                                backgroundGradientFrom: '#18181b',
                                backgroundGradientTo: '#18181b',
                                color: (opacity = 1) => `rgba(249, 115, 22, ${opacity})`,
                                labelColor: (opacity = 1) => `rgba(113, 113, 122, ${opacity})`,
                                decimalPlaces: 0,
                                propsForDots: {
                                    r: "4",
                                    strokeWidth: "2",
                                    stroke: "#ea580c"
                                }
                            }}
                            yAxisSuffix=" m"
                            bezier
                            style={{
                                marginVertical: 4,
                                borderRadius: 16,
                                marginLeft: -15
                            }}
                        />
                    </View>

                    <LinearGradient
                        colors={["#ea580c", "#9a3412"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        className="p-6 rounded-3xl shadow-lg border border-orange-400/10"
                    >
                        <View className="flex-row items-center mb-2">
                            <MaterialIcons name="insights" size={20} color="black" />
                            <Text className="text-black font-black text-sm uppercase tracking-wider ml-2">Performance Insight</Text>
                        </View>
                        <Text className="text-black font-semibold text-sm leading-6">
                            {getInsightText()}
                        </Text>
                    </LinearGradient>

                </ScrollView>
            )}
        </SafeAreaView>
    );
};

export default GymReportsScreen;