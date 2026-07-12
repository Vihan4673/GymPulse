import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { logout } from '@/service/authService';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { getUserProfile, updateUserProfile } from '@/service/userService';
import EditProfileModal from '@/components/EditProfileModal';
import ChangePasswordModal from '@/components/ChangePasswordModal';

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  joinDate: Date;
  age?: string;
  height?: string;
  weight?: string;
}

const ProfileScreen: React.FC = () => {
  const { user: userDetail } = useAuth();
  const router = useRouter();

  const [user, setUser] = useState<UserProfile>({
    name: userDetail?.displayName || "Member",
    email: userDetail?.email || "",
    phone: "",
    joinDate: new Date(),
    age: "",
    height: "",
    weight: "",
  });

  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [editForm, setEditForm] = useState<UserProfile>(user);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const fetchProfile = async () => {
    if (!userDetail?.uid) return;
    try {
      const data = await getUserProfile(userDetail.uid);
      if (data) {
        let parsedDate = new Date();
        if (data.joinDate) {
          if (typeof data.joinDate.toDate === 'function') {
            parsedDate = data.joinDate.toDate();
          } else {
            parsedDate = new Date(data.joinDate as any);
          }
        }

        setUser({
          name: data.name || userDetail.displayName || "Member",
          email: data.email || userDetail.email || "",
          phone: data.phone || "",
          joinDate: parsedDate,
          age: data.age || "",
          height: data.height || "",
          weight: data.weight || "",
        });
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  useEffect(() => {
    if (userDetail) {
      setUser(prev => ({
        ...prev,
        name: userDetail.displayName || prev.name,
        email: userDetail.email || prev.email
      }));
      fetchProfile();
    }
  }, [userDetail]);

  const handleOpenEditModal = () => {
    setEditForm({ ...user });
    setShowEditModal(true);
  };

  const handleSaveProfile = async () => {
    if (!userDetail?.uid) return;

    try {
      await updateUserProfile(userDetail.uid, {
        name: editForm.name,
        email: editForm.email,
        phone: editForm.phone,
        age: editForm.age,
        height: editForm.height,
        weight: editForm.weight,
      });

      setUser({
        ...user,
        name: editForm.name,
        email: editForm.email,
        phone: editForm.phone,
        age: editForm.age,
        height: editForm.height,
        weight: editForm.weight,
      });

      setShowEditModal(false);
      Alert.alert("Success", "Profile updated successfully!");

      fetchProfile();
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to update profile.");
    }
  };

  const handleChangePassword = () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setShowPasswordModal(false);
    Alert.alert('Success', 'Password changed successfully!');
  };

  const handleDeleteAccount = () => {
    Alert.alert(
        'Delete Account',
        'This action cannot be undone. All your workout data will be permanently deleted.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: () => console.log('Delete account') }
        ]
    );
  };

  const MenuSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
      <View className="mb-8">
        <Text className="text-zinc-500 font-bold text-xs uppercase tracking-widest mb-4 px-6">{title}</Text>
        <View className="bg-zinc-900 mx-6 rounded-2xl border border-zinc-800 overflow-hidden">
          {children}
        </View>
      </View>
  );

  const MenuItem = ({
                      icon,
                      title,
                      subtitle,
                      onPress,
                      color = '#a1a1aa',
                    }: {
    icon: string;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    color?: string;
  }) => (
      <TouchableOpacity
          onPress={onPress}
          className="flex-row items-center p-4 border-b border-zinc-800 last:border-0"
          activeOpacity={0.7}
          disabled={!onPress}
      >
        <View className="w-10 h-10 rounded-xl items-center justify-center mr-4 bg-zinc-800">
          <MaterialIcons name={icon as any} size={20} color={color} />
        </View>
        <View className="flex-1">
          <Text className="text-white font-bold text-base">{title}</Text>
          {subtitle && <Text className="text-zinc-500 text-xs mt-0.5">{subtitle}</Text>}
        </View>
        <MaterialIcons name="chevron-right" size={20} color="#52525b" />
      </TouchableOpacity>
  );

  const getAvatarName = () => {
    const safeName = user.name || "Member";
    return encodeURIComponent(safeName.trim().split(' ')[0]);
  };

  return (
      <SafeAreaView className="flex-1 bg-zinc-950">
        <StatusBar barStyle="light-content" backgroundColor="#09090b" />

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>

          {/* Profile Header */}
          <View className="items-center py-10 bg-zinc-900 border-b border-zinc-800">
            <View className="relative mb-4">
              <Image
                  source={{ uri: `https://ui-avatars.com/api/?name=${getAvatarName()}&background=f97316&color=000&size=200&bold=true` }}
                  className="w-28 h-28 rounded-full border-4 border-zinc-800"
              />
              <View className="absolute -bottom-1 -right-1 w-8 h-8 bg-orange-500 rounded-full items-center justify-center border-2 border-zinc-900">
                <MaterialIcons name="verified" size={16} color="black" />
              </View>
            </View>

            <Text className="text-white text-2xl font-black">{user.name}</Text>
            <Text className="text-zinc-400 text-sm mt-1">{user.email}</Text>

            <Text className="text-orange-500 text-xs font-bold uppercase mt-3 bg-orange-500/10 px-3 py-1 rounded-full overflow-hidden">
              Member since {user.joinDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
            </Text>
          </View>

          <View className="flex-row mx-6 -mt-6 mb-8 bg-zinc-900 p-6 rounded-3xl border border-zinc-800 shadow-xl">
            <View className="flex-1 items-center">
              <Text className="text-zinc-500 text-[10px] font-bold uppercase mb-1">Age</Text>
              <Text className="text-white text-xl font-black">{user.age || "--"}</Text>
            </View>
            <View className="w-px bg-zinc-800" />
            <View className="flex-1 items-center">
              <Text className="text-zinc-500 text-[10px] font-bold uppercase mb-1">Height</Text>
              <Text className="text-orange-500 text-xl font-black">{user.height ? `${user.height} cm` : "--"}</Text>
            </View>
            <View className="w-px bg-zinc-800" />
            <View className="flex-1 items-center">
              <Text className="text-zinc-500 text-[10px] font-bold uppercase mb-1">Weight</Text>
              <Text className="text-white text-xl font-black">{user.weight ? `${user.weight} kg` : "--"}</Text>
            </View>
          </View>

          {/* Account Settings */}
          <MenuSection title="Account Settings">
            <MenuItem icon="person" title="Personal Info" subtitle={user.phone ? `Phone: ${user.phone}` : "Update your profile details"} onPress={handleOpenEditModal} color="#f97316" />
            <MenuItem icon="lock" title="Change Password" subtitle="Keep your account secure" onPress={() => setShowPasswordModal(true)} color="#f59e0b" />
          </MenuSection>

          <MenuSection title="Danger Zone">
            <MenuItem
                icon="logout"
                title="Sign Out"
                subtitle="Sign out of your account"
                onPress={async () => {
                  try {
                    await logout();
                    router.replace('/(auth)/login');
                  } catch (e) {
                    console.error(e);
                  }
                }}
                color="#ef4444"
            />
            <MenuItem icon="delete-forever" title="Delete Account" subtitle="Permanently delete your gym account" onPress={handleDeleteAccount} color="#b91c1c" />
          </MenuSection>

          <Text className="text-center text-zinc-600 text-xs font-bold uppercase tracking-widest mt-4">
            GymPlus v1.0.0
          </Text>
        </ScrollView>

        <EditProfileModal showEditModal={showEditModal} setShowEditModal={setShowEditModal} editForm={editForm} setEditForm={setEditForm} handleSaveProfile={handleSaveProfile} />
        <ChangePasswordModal showPasswordModal={showPasswordModal} setShowPasswordModal={setShowPasswordModal} passwordForm={passwordForm} setPasswordForm={setPasswordForm} handleChangePassword={handleChangePassword} />
      </SafeAreaView>
  );
};

export default ProfileScreen;