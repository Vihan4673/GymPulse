import { register } from "@/service/authService";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  Dumbbell,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Phone,
  User,
  UserPlus,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

export default function RegisterScreen() {
  const navigation = useRouter();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (!fullName || !email || !password || !confirmPassword) {
      Toast.show({
        type: "error",
        text1: "All fields are required",
        text2: "Please fill in all the fields to continue your onboarding.",
      });
      return;
    }

    if (password !== confirmPassword) {
      Toast.show({
        type: "error",
        text1: "Passwords do not match",
        text2: "Please make sure your passwords match.",
      });
      return;
    }

    setLoading(true);
    try {
      await register(email, password, fullName, phoneNumber);

      Toast.show({
        type: "success",
        text1: "Welcome to the team!",
        text2: "Account created successfully.",
      });

      navigation.replace("/(dashboard)/home");

    } catch (error: any) {
      console.error("Registration Error: ", error);
      Toast.show({
        type: "error",
        text1: "Registration failed.",
        text2: error.message || "Something went wrong. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
      <LinearGradient
          colors={["#09090b", "#18181b", "#ea580c"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ flex: 1, position: "relative" }}
      >
        <ScrollView className="flex-1 relative">
          {/* Floating background motivation accent blobs */}
          <View className="absolute inset-0">
            <View className="absolute top-20 left-10 w-32 h-32 bg-orange-500 rounded-full opacity-10" />
            <View className="absolute top-40 right-20 w-24 h-24 bg-amber-500 rounded-full opacity-10" />
            <View className="absolute bottom-32 left-1/4 w-40 h-40 bg-zinc-700 rounded-full opacity-10" />
          </View>

          {/* Top Navigation  */}
          <View className="flex flex-row justify-between items-center p-6 pt-12 z-10">
            <View className="flex-row items-center">
              <View className="w-8 h-8 bg-orange-500 rounded-lg items-center justify-center mr-2">
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
                  <UserPlus size={32} color="#f97316" />
                </View>
                <Text className="text-3xl font-black text-white mb-2 uppercase tracking-tight">
                  Create Account
                </Text>
                <Text className="text-zinc-400 text-center">
                  Join GymPlus and unleash your potential
                </Text>
              </View>

              {/* Register Card */}
              <View className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-8 shadow-2xl">
                {/* Full Name Input */}
                <View className="mb-6">
                  <Text className="text-zinc-300 font-semibold mb-2">
                    Full Name
                  </Text>
                  <View className="flex-row items-center border border-zinc-700 bg-zinc-950 rounded-2xl px-4">
                    <User size={20} color="#71717a" />
                    <TextInput
                        placeholder="Enter your full name"
                        placeholderTextColor="#52525b"
                        value={fullName}
                        onChangeText={setFullName}
                        className="flex-1 ml-2 py-3.5 text-white"
                    />
                  </View>
                </View>

                {/* Email Input */}
                <View className="mb-6">
                  <Text className="text-zinc-300 font-semibold mb-2">
                    Email Address
                  </Text>
                  <View className="flex-row items-center border border-zinc-700 bg-zinc-950 rounded-2xl px-4">
                    <Mail size={20} color="#71717a" />
                    <TextInput
                        placeholder="Enter your email"
                        placeholderTextColor="#52525b"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        value={email}
                        onChangeText={setEmail}
                        className="flex-1 ml-2 py-3.5 text-white"
                    />
                  </View>
                </View>

                {/* Phone Number Input */}
                <View className="mb-6">
                  <Text className="text-zinc-300 font-semibold mb-2">
                    Phone Number
                  </Text>
                  <View className="flex-row items-center border border-zinc-700 bg-zinc-950 rounded-2xl px-4">
                    <Phone size={20} color="#71717a" />
                    <TextInput
                        placeholder="Enter your phone number"
                        placeholderTextColor="#52525b"
                        keyboardType="phone-pad"
                        value={phoneNumber}
                        onChangeText={setPhoneNumber}
                        className="flex-1 ml-2 py-3.5 text-white"
                    />
                  </View>
                </View>

                {/* Password Input */}
                <View className="mb-6">
                  <Text className="text-zinc-300 font-semibold mb-2">
                    Password
                  </Text>
                  <View className="flex-row items-center border border-zinc-700 bg-zinc-950 rounded-2xl px-4">
                    <Lock size={20} color="#71717a" />
                    <TextInput
                        placeholder="Create a strong password"
                        placeholderTextColor="#52525b"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={!passwordVisible}
                        autoCapitalize="none"
                        className="flex-1 ml-2 py-3.5 text-white"
                    />
                    <TouchableOpacity
                        onPress={() => setPasswordVisible(!passwordVisible)}
                    >
                      {passwordVisible ? (
                          <Eye size={20} color="#71717a" />
                      ) : (
                          <EyeOff size={20} color="#71717a" />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Password Input */}
                <View className="mb-6">
                  <Text className="text-zinc-300 font-semibold mb-2">
                    Confirm Password
                  </Text>
                  <View className="flex-row items-center border border-zinc-700 bg-zinc-950 rounded-2xl px-4">
                    <Lock size={20} color="#71717a" />
                    <TextInput
                        placeholder="Re-enter your password"
                        placeholderTextColor="#52525b"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry={!confirmPasswordVisible}
                        autoCapitalize="none"
                        className="flex-1 ml-2 py-3.5 text-white"
                    />
                    <TouchableOpacity
                        onPress={() =>
                            setConfirmPasswordVisible(!confirmPasswordVisible)
                        }
                    >
                      {confirmPasswordVisible ? (
                          <Eye size={20} color="#71717a" />
                      ) : (
                          <EyeOff size={20} color="#71717a" />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Sign Up Button */}
                <TouchableOpacity
                    onPress={handleSignUp}
                    disabled={loading}
                    className={`bg-orange-500 py-4 rounded-2xl items-center mb-6 shadow-lg shadow-orange-500/20 ${loading ? "opacity-70" : ""}`}
                >
                  {loading ? (
                      <View className="flex-row items-center">
                        <ActivityIndicator size="small" color="#000" />
                        <Text className="text-black font-bold text-lg ml-2">Registering Team Member...</Text>
                      </View>
                  ) : (
                      <Text className="text-black font-extrabold text-lg uppercase tracking-wider">Start Journey</Text>
                  )}
                </TouchableOpacity>

                {/* Already have account? */}
                <View className="flex-row justify-center items-center mt-2">
                  <Text className="text-zinc-400">Already a member? </Text>
                  <TouchableOpacity onPress={() => navigation.push("/login")}>
                    <Text className="text-orange-500 font-bold underline">Sign In</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>

          {/* Footer */}
          <View className="py-8 px-6 mt-8">
            <Text className="text-zinc-500 text-xs text-center leading-relaxed">
              By signing up, you agree to the GymPlus{" "}
              <Text className="text-zinc-400 underline">Terms of Membership</Text>{" "}
              and <Text className="text-zinc-400 underline">Privacy Rules</Text>
            </Text>
          </View>
        </ScrollView>
      </LinearGradient>
  );
}