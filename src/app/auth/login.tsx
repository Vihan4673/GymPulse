import { Login } from "@/service/authService";
import { useRouter } from "expo-router";
import { Dumbbell, Eye, EyeOff, Lock, Mail, ShieldCheck, Smartphone, Target, Trophy, UserCheck } from "lucide-react-native";
import React, { useState } from "react";
import { ActivityIndicator, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";

export default function LoginScreen() {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const navigation = useRouter();

  const handleSignIn = async () => {
    if (!email || !password) {
      Toast.show({
        type: "error",
        text1: "Email and Password required",
        text2: "Please enter your credentials to access your workout panel.",
      });
      return;
    }

    setLoading(true);
    try {
      await Login(email, password);
      Toast.show({
        type: "success",
        text1: "Welcome back to GymPlus!",
      });
      navigation.push("/home");
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Login failed.",
        text2: "Please check your email/password and try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
      <ScrollView className="flex-1 bg-slate-950">
        {/* Floating background gym motivation accent blobs */}
        <View className="absolute inset-0">
          <View className="absolute top-20 left-10 w-32 h-32 bg-orange-500 rounded-full opacity-10" />
          <View className="absolute top-40 right-20 w-24 h-24 bg-amber-500 rounded-full opacity-10" />
          <View className="absolute bottom-32 left-1/4 w-40 h-40 bg-zinc-700 rounded-full opacity-10" />
        </View>

        {/* Top Navigation / Brand */}
        <View className="flex flex-row justify-between items-center p-6 pt-12">
          <View className="flex-row items-center space-x-2">
            <View className="w-8 h-8 bg-orange-500 rounded-lg items-center justify-center">
              <Dumbbell size={18} color="#09090b" />
            </View>
            <Text className="text-white font-extrabold text-xl tracking-wider"> GymPlus</Text>
          </View>
        </View>

        {/* Main Content */}
        <View className="flex-1 items-center justify-center px-6">
          <View className="w-full max-w-md">
            {/* Header */}
            <View className="items-center mb-8">
              <View className="w-16 h-16 bg-zinc-900 border border-zinc-800 rounded-2xl items-center justify-center mb-4">
                <UserCheck size={32} color="#f97316" />
              </View>
              <Text className="text-3xl font-black text-white mb-2 uppercase tracking-tight">Welcome Back!</Text>
              <Text className="text-zinc-400 text-center">Sign in to crush your fitness goals today</Text>
            </View>

            {/* Login Card */}
            <View className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-8 shadow-2xl">
              {/* Email Input */}
              <View className="mb-6">
                <Text className="text-zinc-300 font-semibold mb-2">Email Address</Text>
                <View className="flex-row items-center border border-zinc-700 bg-zinc-950 rounded-2xl px-4">
                  <Mail size={20} color="#71717a" />
                  <TextInput
                      placeholder="Enter your registered email"
                      placeholderTextColor="#52525b"
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      className="flex-1 ml-2 py-3.5 text-white"
                  />
                </View>
              </View>

              {/* Password Input */}
              <View className="mb-6">
                <Text className="text-zinc-300 font-semibold mb-2">Password</Text>
                <View className="flex-row items-center border border-zinc-700 bg-zinc-950 rounded-2xl px-4">
                  <Lock size={20} color="#71717a" />
                  <TextInput
                      placeholder="Enter your password"
                      placeholderTextColor="#52525b"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!passwordVisible}
                      autoCapitalize="none"
                      className="flex-1 ml-2 py-3.5 text-white"
                  />
                  <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)}>
                    {passwordVisible ? (
                        <Eye size={20} color="#71717a" />
                    ) : (
                        <EyeOff size={20} color="#71717a" />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              {/* Sign In Button */}
              <TouchableOpacity
                  onPress={handleSignIn}
                  disabled={loading}
                  className={`bg-orange-500 py-4 rounded-2xl items-center mb-6 shadow-lg shadow-orange-500/20 ${loading ? "opacity-70" : ""}`}
              >
                {loading ? (
                    <View className="flex-row items-center">
                      <ActivityIndicator size="small" color="#fff" />
                      <Text className="text-white font-bold text-lg ml-2">Loading Profile...</Text>
                    </View>
                ) : (
                    <Text className="text-black font-extrabold text-lg uppercase tracking-wider">Let's Train</Text>
                )}
              </TouchableOpacity>

              {/* Sign Up Link */}
              <View className="flex-row justify-center items-center mt-4">
                <Text className="text-zinc-400">New to GymPlus? </Text>
                <TouchableOpacity onPress={() => navigation.push("/register")}>
                  <Text className="text-orange-500 font-bold underline">Join Now</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Gym Benefits / Stats Info */}
          <View className="flex-row justify-between mt-8 w-full max-w-md px-2">
            <View className="items-center flex-1">
              <View className="w-12 h-12 bg-zinc-900 border border-zinc-800 rounded-2xl items-center justify-center mb-2">
                <Target size={22} color="#f97316" />
              </View>
              <Text className="text-zinc-400 text-xs font-medium">Track Workouts</Text>
            </View>
            <View className="items-center flex-1">
              <View className="w-12 h-12 bg-zinc-900 border border-zinc-800 rounded-2xl items-center justify-center mb-2">
                <Trophy size={22} color="#f97316" />
              </View>
              <Text className="text-zinc-400 text-xs font-medium">Daily Goals</Text>
            </View>
            <View className="items-center flex-1">
              <View className="w-12 h-12 bg-zinc-900 border border-zinc-800 rounded-2xl items-center justify-center mb-2">
                <ShieldCheck size={22} color="#f97316" />
              </View>
              <Text className="text-zinc-400 text-xs font-medium">Secure Access</Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View className="py-8 px-6 mt-4">
          <Text className="text-zinc-500 text-xs text-center leading-relaxed">
            By signing in, you agree to the GymPlus{" "}
            <Text className="text-zinc-400 underline">Terms of Membership</Text> and{" "}
            <Text className="text-zinc-400 underline">Privacy Rules</Text>
          </Text>
        </View>
      </ScrollView>
  );
}