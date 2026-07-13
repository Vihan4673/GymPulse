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
        if (dateField instanceof Date) return dateField;
        if (typeof dateField.toDate === 'function') return dateField.toDate();
        return new Date(dateField);
    };

    const filteredWorkouts = useMemo(() => {
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

        return allWorkouts.filter((workout) => {
            if (!workout.date) return false;
            const workoutDate = safeParseDate(workout.date);
            const timeDiff = todayStart - new Date(workoutDate.getFullYear(), workoutDate.getMonth(), workoutDate.getDate()).getTime();
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

    const totalDisciplineMinutes = cardioMinutes + strengthMinutes;
    const cardioPercentage = totalDisciplineMinutes > 0 ? Math.round((cardioMinutes / totalDisciplineMinutes) * 100) : 0;
    const strengthPercentage = totalDisciplineMinutes > 0 ? Math.round((strengthMinutes / totalDisciplineMinutes) * 100) : 0;

    const bestDayInfo = useMemo(() => {
        if (filteredWorkouts.length === 0) return { day: 'N/A', mins: 0 };
        const dayMap: { [key: string]: number } = {};

        filteredWorkouts.forEach(w => {
            const date = safeParseDate(w.date);
            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
            dayMap[dayName] = (dayMap[dayName] || 0) + (Number(w.durationMinutes) || 0);
        });

        let bestDay = 'N/A';
        let maxMins = 0;
        Object.keys(dayMap).forEach(day => {
            if (dayMap[day] > maxMins) {
                maxMins = dayMap[day];
                bestDay = day;
            }
        });

        return { day: bestDay, mins: maxMins };
    }, [filteredWorkouts]);

    const consistencyScore = useMemo(() => {
        if (filteredWorkouts.length === 0) return 0;
        const uniqueDays = new Set(filteredWorkouts.map(w => {
            const d = safeParseDate(w.date);
            return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
        })).size;

        const periodDays = selectedPeriod === 'week' ? 7 : selectedPeriod === 'month' ? 30 : 365;
        return Math.min(Math.round((uniqueDays / periodDays) * 100), 100);
    }, [filteredWorkouts, selectedPeriod]);

    const chartData = useMemo(() => {
        const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const last7DaysData = Array(7).fill(0);
        const last7DaysLabels = Array(7).fill('');

        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            last7DaysLabels[6 - i] = daysOfWeek[d.getDay()];

            const dStr = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

            const dayWorkouts = allWorkouts.filter((w) => {
                if (!w.date) return false;
                const wDate = safeParseDate(w.date);
                const wStr = `${wDate.getFullYear()}-${wDate.getMonth()}-${wDate.getDate()}`;
                return wStr === dStr;
            });

            last7DaysData[6 - i] = dayWorkouts.reduce((sum, item) => sum + (Number(item.durationMinutes) || 0), 0);
        }

        const hasData = last7DaysData.some(val => val > 0);

        return {
            labels: last7DaysLabels,
            datasets: [{
                data: last7DaysData,
                color: (opacity = 1) => `rgba(249, 115, 22, ${opacity})`,
                strokeWidth: 3,
            }],
            hasData
        };
    }, [allWorkouts]);

    const getInsightText = () => {
        if (filteredWorkouts.length === 0) {
            return "No workouts logged for this period yet. Start smashing your routines to see your time insights!";
        }
        if (totalDuration > 180) {
            const focus = cardioMinutes >= strengthMinutes ? 'Cardio' : 'Strength';
            return `Incredible dedication! You have dedicated ${totalDuration} minutes to your health. Your training is heavily focused on ${focus} exercises.`;
        }
        return "Consistency is key! Every single minute spent exercising builds a healthier habits loop. Keep pushing!";
    };

    const StatCard = ({ title, value, unit, icon, color, subtitle }: any) => (
        <View className="bg-zinc-900 p-5 rounded-3xl border border-zinc-800 flex-1 shadow-md justify-between">
            <View>
                <View className="flex-row items-center mb-3 justify-between">
                    <View className="w-10 h-10 rounded-xl items-center justify-center bg-zinc-950 border border-zinc-800">
                        <MaterialIcons name={icon} size={20} color={color} />
                    </View>
                </View>
                <Text className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider">{title}</Text>
                <Text className="text-white text-2xl font-black mt-1">
                    {value} <Text className="text-xs font-normal text-zinc-500">{unit}</Text>
                </Text>
            </View>
            {subtitle && <Text className="text-zinc-600 text-[10px] mt-2 font-medium">{subtitle}</Text>}
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

                    {/* Period Selector Tabs */}
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

                    {/* Row 1 Stats */}
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

                    {/* Row 2 Stats */}
                    <View className="flex-row gap-4 mb-6">
                        <StatCard
                            title="Best Day Streak"
                            value={bestDayInfo.day}
                            unit={bestDayInfo.mins > 0 ? `(${bestDayInfo.mins}m)` : ''}
                            icon="star"
                            color="#f59e0b"
                            subtitle="Most active day in this period"
                        />
                        <StatCard
                            title="Consistency"
                            value={`${consistencyScore}%`}
                            unit=""
                            icon="donut-large"
                            color="#10b981"
                            subtitle="Frequency of active days"
                        />
                    </View>

                    {/* Focus Breakdown Card */}
                    <View className="bg-zinc-900 p-5 rounded-3xl border border-zinc-800 mb-6">
                        <Text className="text-zinc-400 font-bold uppercase text-xs tracking-wider mb-4">Training Focus Breakdown</Text>

                        <View className="flex-row justify-between items-center mb-2">
                            <Text className="text-white font-bold text-sm">⏱️ Cardio ({cardioPercentage}%)</Text>
                            <Text className="text-zinc-400 font-bold text-sm">Strength ({strengthPercentage}%)</Text>
                        </View>

                        <View className="w-full h-3 bg-zinc-950 rounded-full flex-row overflow-hidden border border-zinc-800">
                            {totalDisciplineMinutes > 0 ? (
                                <>
                                    <View style={{ width: `${cardioPercentage}%` }} className="h-full bg-orange-500" />
                                    <View style={{ width: `${strengthPercentage}%` }} className="h-full bg-zinc-700" />
                                </>
                            ) : (
                                <View className="w-full h-full bg-zinc-800" />
                            )}
                        </View>
                        <Text className="text-[11px] text-zinc-500 mt-2">Calculated based on active minutes spent per discipline.</Text>
                    </View>

                    {/* Line Chart Card */}
                    <View className="bg-zinc-900 p-5 rounded-3xl border border-zinc-800 mb-6 shadow-md">
                        <View className="flex-row items-center mb-4">
                            <MaterialCommunityIcons name="chart-bell-curve-cumulative" size={18} color="#f97316" />
                            <Text className="text-white font-black uppercase text-xs tracking-wider ml-2">Workout Duration Trend (Last 7 Days)</Text>
                        </View>

                        {chartData.hasData ? (
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
                                }}
                                yAxisSuffix=" m"
                                bezier
                                style={{
                                    marginVertical: 4,
                                    borderRadius: 16,
                                    marginLeft: -15
                                }}
                                renderDotContent={({ x, y, index }) => (
                                    <View
                                        key={index}
                                        style={{
                                            position: 'absolute',
                                            top: y - 4,
                                            left: x - 4,
                                            width: 8,
                                            height: 8,
                                            borderRadius: 4,
                                            backgroundColor: '#ea580c',
                                        }}
                                    />
                                )}
                            />
                        ) : (
                            <View className="h-[180px] items-center justify-center bg-zinc-950/40 rounded-2xl border border-dashed border-zinc-800">
                                <MaterialIcons name="bar-chart" size={28} color="#52525b" />
                                <Text className="text-zinc-500 text-xs mt-2 font-medium">No activity tracked in the last 7 days</Text>
                            </View>
                        )}
                    </View>

                    {/* Bottom Insight Card */}
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