// DashboardLayout.tsx
import { MaterialIcons } from "@expo/vector-icons";
import type { BottomTabBarButtonProps } from "@react-navigation/bottom-tabs";
import { Tabs } from "expo-router";
import React from "react";
import { TouchableOpacity, View } from "react-native";

const tabs = [
    { label: "Home", name: "home", icon: "home" },
    { label: "Reports", name: "reports", icon: "bar-chart" },
    { label: "Add", name: "add", icon: "add" }, // Middle Action Button
    { label: "Workouts", name: "transactions", icon: "fitness-center" }, // Icon එක fitness-center ලෙස වෙනස් කළා
    { label: "Profile", name: "profile", icon: "person" },
] as const;

const DashboardLayout = () => {
    return (
        <Tabs
            screenOptions={({ route }) => ({
                tabBarActiveTintColor: "#f97316", // Active Color එක Orange (#f97316) කළා
                tabBarInactiveTintColor: "#52525b", // Inactive Color එක Zinc-600 කළා
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: "#09090b", // Bottom Tab එක Dark Zinc (#09090b) කළා
                    borderTopWidth: 1,
                    borderTopColor: "#18181b", // Border එක Zinc-900 කළා
                    height: 85,
                    paddingTop: 8,
                    paddingBottom: 20,
                    elevation: 0, // Android shadow අයින් කළා (Dark theme එකට පිරිසිදුව පෙනීමට)
                },
                tabBarButton:
                    route.name === "add"
                        ? ({ accessibilityState, onPress }: BottomTabBarButtonProps) => (
                            <TouchableOpacity
                                onPress={onPress}
                                activeOpacity={0.8}
                                style={{
                                    flex: 1,
                                    justifyContent: "center",
                                    alignItems: "center",
                                }}
                            >
                                {/* මැද බටන් එක Orange සහ Glow Effect එකක් සහිතව වෙනස් කළා */}
                                <View className="w-14 h-14 bg-orange-500 rounded-full items-center justify-center -mt-6 shadow-xl shadow-orange-500/50 border-4 border-zinc-950">
                                    <MaterialIcons name="add" color="black" size={28} />
                                </View>
                            </TouchableOpacity>
                        )
                        : undefined,
            })}
        >
            {tabs.map(({ name, icon, label }) => (
                <Tabs.Screen
                    key={name}
                    name={name}
                    options={{
                        title: label,
                        tabBarLabel: name === "add" ? "" : label,
                        tabBarIcon: ({ color, size }) => (
                            <MaterialIcons name={icon as any} color={color} size={size} />
                        ),
                    }}
                />
            ))}
        </Tabs>
    );
};

export default DashboardLayout;