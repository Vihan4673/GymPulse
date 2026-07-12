import { useRouter } from "expo-router";
import { ArrowRight, BarChart3, Dumbbell, Flame, PlusCircle, Smartphone, Target, TrendingUp, Zap } from "lucide-react-native";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

export default function WelcomeScreen() {
  const router = useRouter();

  return (
      <ScrollView className="flex-1 bg-zinc-950">
        <View className="absolute inset-0">
          <View className="absolute top-20 left-10 w-32 h-32 bg-orange-500 rounded-full opacity-10" />
          <View className="absolute top-40 right-20 w-24 h-24 bg-zinc-800 rounded-full opacity-15" />
        </View>

        {/* Top Navigation */}
        <View className="flex flex-row justify-between items-center p-6 pt-12 relative z-10">
          <View className="flex flex-row items-center space-x-2">
            <View className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <Dumbbell size={20} color="#000" />
            </View>
            <Text className="text-white font-black text-lg tracking-widest"> GYMPLUS</Text>
          </View>
        </View>

        {/* Hero Section */}
        <View className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center relative z-10">
          <View className="mb-8">
            <View className="w-24 h-24 bg-zinc-900 rounded-3xl flex items-center justify-center border border-zinc-800">
              <Flame size={48} color="#f97316" />
            </View>
          </View>

          <Text className="text-5xl font-black text-white mb-4 uppercase">GymPlus</Text>
          <Text className="text-xl text-zinc-400 mb-2 font-bold uppercase tracking-widest">
            Your Fitness Journey
          </Text>
          <Text className="text-zinc-500 text-lg leading-relaxed mb-12 max-w-md text-center">
            Crush your goals. Track workouts, monitor calorie burn, and build the strongest version of yourself.
          </Text>

          <TouchableOpacity onPress={() => router.push("/login")} className="bg-orange-500 px-10 py-4 rounded-2xl flex flex-row items-center space-x-2">
            <Text className="text-black font-black uppercase">Get Started</Text>
            <ArrowRight size={20} color="#000" />
          </TouchableOpacity>
        </View>

        {/* Feature Cards */}
        <View className="px-6 pb-12 relative z-10">
          <View className="flex flex-col gap-4">
            <View className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800">
              <View className="flex flex-row items-center space-x-3 mb-3">
                <PlusCircle size={20} color="#f97316" />
                <Text className="text-white font-black uppercase">Quick Log</Text>
              </View>
              <Text className="text-zinc-500 text-sm">Log your sessions in seconds</Text>
            </View>

            <View className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800">
              <View className="flex flex-row items-center space-x-3 mb-3">
                <BarChart3 size={20} color="#3b82f6" />
                <Text className="text-white font-black uppercase">Analytics</Text>
              </View>
              <Text className="text-zinc-500 text-sm">Visualize your fitness progress</Text>
            </View>
          </View>
        </View>

        {/* Choose Section */}
        <View className="bg-zinc-900 py-16 px-6">
          <View className="max-w-4xl mx-auto">
            <Text className="text-3xl font-black text-white mb-12 text-center uppercase">Why GymPlus?</Text>

            <View className="flex flex-col gap-8">
              <View className="bg-zinc-950 p-8 rounded-3xl border border-zinc-800">
                <Zap size={24} color="#f97316" className="mb-3" />
                <Text className="text-xl font-black text-white mb-3">Fast & Efficient</Text>
                <Text className="text-zinc-400">No fluff. Just the data you need to keep moving forward.</Text>
              </View>

              <View className="bg-zinc-950 p-8 rounded-3xl border border-zinc-800">
                <Target size={24} color="#3b82f6" className="mb-3" />
                <Text className="text-xl font-black text-white mb-3">Goal Oriented</Text>
                <Text className="text-zinc-400">Set targets and smash them with detailed workout tracking.</Text>
              </View>
            </View>

            {/* Signup Section */}
            <View className="bg-orange-500 rounded-3xl p-8 mt-12">
              <Text className="text-2xl font-black text-black mb-4 text-center uppercase">Ready to Transform?</Text>
              <TouchableOpacity onPress={() => router.push("/register")} className="bg-black px-8 py-4 rounded-2xl mb-4">
                <Text className="text-white font-black text-center uppercase">Sign Up</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.push("/login")}>
                <Text className="text-black/70 font-bold text-center underline">Login</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
  );
}