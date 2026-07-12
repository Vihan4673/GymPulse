import React, { useState, useEffect } from 'react';
import { View, Text, Switch, TouchableOpacity, Platform, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import DateTimePicker from '@react-native-community/datetimepicker';

interface MenuItemProps {
    icon: string;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    color?: string;
    rightElement?: React.ReactNode;
}

interface NotificationSettingsProps {
    MenuItem: React.FC<MenuItemProps>;
}

const NotificationSettings: React.FC<NotificationSettingsProps> = ({ MenuItem }) => {
    const [isReminderEnabled, setIsReminderEnabled] = useState<boolean>(true);
    const [notificationTime, setNotificationTime] = useState<Date>(new Date());
    const [showPicker, setShowPicker] = useState<boolean>(false);

    useEffect(() => {
        loadNotificationSettings();
    }, []);

    const loadNotificationSettings = async () => {
        try {
            const savedEnabled = await AsyncStorage.getItem('notification_enabled');
            const savedHour = await AsyncStorage.getItem('notification_hour');
            const savedMinute = await AsyncStorage.getItem('notification_minute');

            if (savedEnabled !== null) {
                setIsReminderEnabled(savedEnabled === 'true');
            }

            const defaultDate = new Date();
            const hour = savedHour ? parseInt(savedHour, 10) : 8;
            const minute = savedMinute ? parseInt(savedMinute, 10) : 0;
            defaultDate.setHours(hour);
            defaultDate.setMinutes(minute);
            setNotificationTime(defaultDate);
        } catch (error) {
            console.error("Failed to load notification settings:", error);
        }
    };

    const updateDailyReminder = async (enabled: boolean, dateToSchedule: Date) => {
        try {
            await Notifications.cancelAllScheduledNotificationsAsync();

            await AsyncStorage.setItem('notification_enabled', enabled.toString());
            await AsyncStorage.setItem('notification_hour', dateToSchedule.getHours().toString());
            await AsyncStorage.setItem('notification_minute', dateToSchedule.getMinutes().toString());

            if (!enabled) {
                Alert.alert("Reminders Disabled", "Daily workout reminders turned off.");
                return;
            }

            const { status } = await Notifications.getPermissionsAsync();
            if (status !== 'granted') {
                const { status: askStatus } = await Notifications.requestPermissionsAsync();
                if (askStatus !== 'granted') {
                    Alert.alert("Permission Denied", "Please enable notifications in your phone settings.");
                    return;
                }
            }

            await Notifications.scheduleNotificationAsync({
                content: {
                    title: "💪 Time to hit the gym!",
                    body: "You have scheduled workouts for today. Let's get moving!",
                    sound: 'default',
                },
                trigger: {
                    type: 'daily',
                    hour: dateToSchedule.getHours(),
                    minute: dateToSchedule.getMinutes(),
                } as any,
            });

            const formattedTime = dateToSchedule.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            Alert.alert("Reminder Updated! ⏰", `You will be reminded daily at ${formattedTime}`);

        } catch (error) {
            console.error("Failed to update reminder:", error);
        }
    };

    const handleToggleSwitch = async (value: boolean) => {
        setIsReminderEnabled(value);
        await updateDailyReminder(value, notificationTime);
    };

    const handleTimeChange = async (event: any, selectedDate?: Date) => {
        setShowPicker(Platform.OS === 'ios');
        if (selectedDate) {
            setNotificationTime(selectedDate);
            await updateDailyReminder(isReminderEnabled, selectedDate);
        }
    };

    const displayTime = notificationTime.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
    });

    return (
        <>
            <MenuItem
                icon="notifications"
                title="Workout Reminders"
                subtitle="Get notified for daily routines"
                color="#f97316"
                rightElement={
                    <Switch
                        value={isReminderEnabled}
                        onValueChange={handleToggleSwitch}
                        trackColor={{ false: '#27272a', true: '#f97316' }}
                        thumbColor={isReminderEnabled ? '#000000' : '#a1a1aa'}
                        ios_backgroundColor="#27272a"
                    />
                }
            />
            <MenuItem
                icon="alarm"
                title="Reminder Time"
                subtitle="Tap to change schedule"
                color="#f59e0b"
                onPress={() => isReminderEnabled && setShowPicker(true)}
                rightElement={
                    <View className={`flex-row items-center bg-zinc-950 border border-zinc-800 px-3 py-1.5 rounded-xl ${!isReminderEnabled ? 'opacity-30' : ''}`}>
                        <Text className="text-orange-400 font-mono font-black text-sm mr-1">{displayTime}</Text>
                        <MaterialIcons name="chevron-right" size={16} color="#71717a" />
                    </View>
                }
            />

            {showPicker && (
                <DateTimePicker
                    value={notificationTime}
                    mode="time"
                    is24Hour={false}
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={handleTimeChange}
                />
            )}
        </>
    );
};

export default NotificationSettings;