import React from 'react';
import {
  Modal,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  View,
  TouchableOpacity,
} from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  joinDate: Date;
  age?: string;
  height?: string;
  weight?: string;
}

type EditProfileModalProps = {
  showEditModal: boolean;
  setShowEditModal: React.Dispatch<React.SetStateAction<boolean>>;
  editForm: UserProfile;
  setEditForm: React.Dispatch<React.SetStateAction<UserProfile>>;
  handleSaveProfile: () => Promise<void>;
};

const EditProfileModal: React.FC<EditProfileModalProps> = ({
                                                             showEditModal,
                                                             setShowEditModal,
                                                             editForm,
                                                             setEditForm,
                                                             handleSaveProfile,
                                                           }) => {
  return (
      <Modal
          visible={showEditModal}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setShowEditModal(false)}
      >
        <SafeAreaView className="flex-1 bg-zinc-950">

          {/* Header */}
          <View className="bg-zinc-900 px-6 py-4 border-b border-zinc-800">
            <View className="flex-row justify-between items-center">
              <TouchableOpacity
                  onPress={() => setShowEditModal(false)}
                  className="w-9 h-9 bg-zinc-950 rounded-xl items-center justify-center border border-zinc-800"
              >
                <MaterialIcons name="close" size={20} color="#a1a1aa" />
              </TouchableOpacity>

              <Text className="text-xl font-black text-white uppercase tracking-tight">Edit Profile</Text>

              <TouchableOpacity
                  onPress={handleSaveProfile}
                  className="px-5 py-2.5 bg-orange-500 rounded-xl active:opacity-85"
              >
                <Text className="text-black font-black text-xs uppercase tracking-wider">Save</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Form Content */}
          <ScrollView className="flex-1 px-6 py-6" showsVerticalScrollIndicator={false}>

            {/* Personal Details Section */}
            <Text className="text-zinc-500 font-black text-[11px] uppercase tracking-widest mb-4">Basic Information</Text>

            {/* Full Name Input */}
            <View className="mb-5">
              <Text className="text-zinc-400 font-bold text-xs uppercase tracking-wider mb-2">Full Name</Text>
              <TextInput
                  value={editForm.name || ""}
                  onChangeText={(value) => setEditForm((prev) => ({ ...prev, name: value }))}
                  className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800 text-white font-semibold focus:border-orange-500 text-base"
                  placeholder="Enter your full name"
                  placeholderTextColor="#52525b"
              />
            </View>

            {/* Email Address Input */}
            <View className="mb-5">
              <Text className="text-zinc-400 font-bold text-xs uppercase tracking-wider mb-2">Email Address</Text>
              <TextInput
                  value={editForm.email || ""}
                  onChangeText={(value) => setEditForm((prev) => ({ ...prev, email: value }))}
                  className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800 text-white font-semibold focus:border-orange-500 text-base"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholder="Enter your email"
                  placeholderTextColor="#52525b"
              />
            </View>

            {/* Phone Number Input */}
            <View className="mb-6">
              <Text className="text-zinc-400 font-bold text-xs uppercase tracking-wider mb-2">Phone Number</Text>
              <TextInput
                  value={editForm.phone || ""}
                  onChangeText={(value) => setEditForm((prev) => ({ ...prev, phone: value }))}
                  className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800 text-white font-semibold focus:border-orange-500 text-base"
                  placeholder="Enter your phone number"
                  placeholderTextColor="#52525b"
                  keyboardType="phone-pad"
              />
            </View>

            {/* BMI Insights Section */}
            <View className="border-t border-zinc-900 pt-5 mt-2">
              <Text className="text-zinc-500 font-black text-[11px] uppercase tracking-widest mb-4">Body Metrics (For Analytics)</Text>

              <View className="flex-row space-x-2 justify-between">

                {/* Age Input */}
                <View className="flex-1 mr-1">
                  <Text className="text-zinc-400 font-bold text-xs uppercase tracking-wider mb-2">Age</Text>
                  <View className="bg-zinc-900 rounded-2xl border border-zinc-800 flex-row items-center px-3">
                    <TextInput
                        value={editForm.age !== undefined && editForm.age !== null ? String(editForm.age) : ""}
                        onChangeText={(value) => setEditForm((prev) => ({ ...prev, age: value }))}
                        className="flex-1 text-white font-semibold text-base py-3.5"
                        placeholder="24"
                        placeholderTextColor="#3f3f46"
                        keyboardType="number-pad"
                        maxLength={3}
                    />
                    <Text className="text-zinc-600 font-bold text-xs">Yrs</Text>
                  </View>
                </View>

                {/* Height Input */}
                <View className="flex-1 mr-1">
                  <Text className="text-zinc-400 font-bold text-xs uppercase tracking-wider mb-2">Height</Text>
                  <View className="bg-zinc-900 rounded-2xl border border-zinc-200/5 flex-row items-center px-3">
                    <TextInput
                        value={editForm.height !== undefined && editForm.height !== null ? String(editForm.height) : ""}
                        onChangeText={(value) => setEditForm((prev) => ({ ...prev, height: value }))}
                        className="flex-1 text-white font-semibold text-base py-3.5"
                        placeholder="175"
                        placeholderTextColor="#3f3f46"
                        keyboardType="numeric"
                        maxLength={3}
                    />
                    <Text className="text-zinc-600 font-bold text-xs">Cm</Text>
                  </View>
                </View>

                {/* Weight Input */}
                <View className="flex-1">
                  <Text className="text-zinc-400 font-bold text-xs uppercase tracking-wider mb-2">Weight</Text>
                  <View className="bg-zinc-900 rounded-2xl border border-zinc-800 flex-row items-center px-3">
                    <TextInput
                        value={editForm.weight !== undefined && editForm.weight !== null ? String(editForm.weight) : ""}
                        onChangeText={(value) => setEditForm((prev) => ({ ...prev, weight: value }))}
                        className="flex-1 text-white font-semibold text-base py-3.5"
                        placeholder="70"
                        placeholderTextColor="#3f3f46"
                        keyboardType="numeric"
                        maxLength={3}
                    />
                    <Text className="text-zinc-600 font-bold text-xs">Kg</Text>
                  </View>
                </View>

              </View>

              <View className="flex-row items-center bg-zinc-900/40 border border-zinc-900 p-3 rounded-xl mt-4">
                <MaterialCommunityIcons name="shield-check-outline" size={16} color="#71717a" />
                <Text className="text-zinc-500 text-[11px] ml-2 flex-1 font-medium">
                  These metrics are used purely to generate your fitness insights privately on your dashboard.
                </Text>
              </View>

            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
  );
};

export default EditProfileModal;