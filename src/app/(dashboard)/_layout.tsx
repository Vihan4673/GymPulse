import React from "react";
import { TouchableOpacity, View } from "react-native";
import { Tabs } from "expo-router";
import type { BottomTabBarButtonProps } from "@react-navigation/bottom-tabs";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";

const tabs = [
    { label: "Home", name: "home", icon: "home", type: "material" },
    { label: "Workout", name: "WorkoutsScreen", icon: "dumbbell", type: "community" },
    { label: "Add", name: "add", icon: "add", type: "material" },
    { label: "Analytics", name: "reports", icon: "bar-chart", type: "material" },
    { label: "Profile", name: "profile", icon: "account", type: "community" },
] as const;
const DashboardLayout = () => {
    return (
        <Tabs
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarActiveTintColor: "#f97316",
                tabBarInactiveTintColor: "#71717a",
                tabBarShowLabel: true,

                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: "700",
                    letterSpacing: 0.5,
                    marginTop: -4,
                },

                tabBarStyle: {
                    backgroundColor: "#09090b",
                    borderTopWidth: 1,
                    borderTopColor: "#27272a",
                    height: 88,
                    paddingTop: 8,
                    paddingBottom: 24,
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                },

                tabBarButton:
                    route.name === "add"
                        ? ({ onPress }: BottomTabBarButtonProps) => (
                            <TouchableOpacity
                                onPress={onPress}
                                activeOpacity={0.8}
                                className="flex-1 justify-center items-center"
                            >
                                <View
                                    className="w-14 h-14 bg-orange-500 rounded-full items-center justify-center -mt-7 shadow-xl shadow-orange-500/40 border-4 border-zinc-950 elevation-8"
                                >
                                    <MaterialIcons name="add" size={32} color="black" />
                                </View>
                            </TouchableOpacity>
                        )
                        : ({ children, onPress, accessibilityState }: BottomTabBarButtonProps) => (
                            <TouchableOpacity
                                onPress={onPress}
                                activeOpacity={0.5}
                                className="flex-1 justify-center items-center"
                            >
                                {accessibilityState?.selected && (
                                    <View className="absolute top-[-8px] w-6 h-[3px] bg-orange-500 rounded-full shadow-md shadow-orange-500/50" />
                                )}
                                {children}
                            </TouchableOpacity>
                        ),
            })}
        >
            {tabs.map((tab) => (
                <Tabs.Screen
                    key={tab.name}
                    name={tab.name}
                    options={{
                        title: tab.label,
                        tabBarLabel: tab.name === "add" ? "" : tab.label,

                        tabBarIcon: ({ color, focused }) => {
                            const iconSize = focused ? 26 : 24;

                            if (tab.type === "community") {
                                return (
                                    <MaterialCommunityIcons
                                        name={tab.icon as any}
                                        color={color}
                                        size={iconSize}
                                    />
                                );
                            }

                            return (
                                <MaterialIcons
                                    name={tab.icon as any}
                                    color={color}
                                    size={iconSize}
                                />
                            );
                        },
                    }}
                />
            ))}
        </Tabs>
    );
};

export default DashboardLayout;