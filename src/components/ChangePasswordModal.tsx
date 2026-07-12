import React, { useState } from 'react';
import {
    Modal,
    SafeAreaView,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { getAuth, EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';

export type PasswordForm = {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
};

type ChangePasswordModalProps = {
    showPasswordModal: boolean;
    setShowPasswordModal: React.Dispatch<React.SetStateAction<boolean>>;
    passwordForm: PasswordForm;
    setPasswordForm: React.Dispatch<React.SetStateAction<PasswordForm>>;
    handleChangePassword?: () => void;
};

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
                                                                     showPasswordModal,
                                                                     setShowPasswordModal,
                                                                     passwordForm,
                                                                     setPasswordForm,
                                                                 }) => {
    const [loading, setLoading] = useState<boolean>(false);
    const auth = getAuth();

    const handlePasswordUpdate = async () => {
        const { currentPassword, newPassword, confirmPassword } = passwordForm;

        if (!currentPassword || !newPassword || !confirmPassword) {
            Alert.alert("Error", "Please fill in all fields.");
            return;
        }

        if (newPassword.length < 6) {
            Alert.alert("Error", "New password must be at least 6 characters long.");
            return;
        }

        if (newPassword !== confirmPassword) {
            Alert.alert("Error", "New passwords do not match.");
            return;
        }

        const user = auth.currentUser;
        if (!user || !user.email) {
            Alert.alert("Error", "User session not found. Please log in again.");
            return;
        }

        setLoading(true);

        try {
            const credential = EmailAuthProvider.credential(user.email, currentPassword);
            await reauthenticateWithCredential(user, credential);

            await updatePassword(user, newPassword);

            Alert.alert("Success", "Your password has been changed successfully!");

            setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
            setShowPasswordModal(false);
        } catch (error: any) {
            console.error(error);

            if (error.code === 'auth/wrong-password') {
                Alert.alert("Error", "The current password you entered is incorrect.");
            } else if (error.code === 'auth/too-many-requests') {
                Alert.alert("Error", "Too many failed attempts. Please try again later.");
            } else {
                Alert.alert("Error", error.message || "Something went wrong. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (loading) return;
        setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
        setShowPasswordModal(false);
    };

    return (
        <Modal
            visible={showPasswordModal}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={handleClose}
        >
            <SafeAreaView className="flex-1 bg-zinc-950">

                {/* Header */}
                <View className="bg-zinc-900 px-6 py-4 border-b border-zinc-800">
                    <View className="flex-row justify-between items-center">

                        {/* Close Button */}
                        <TouchableOpacity
                            onPress={handleClose}
                            disabled={loading}
                            className="w-8 h-8 bg-zinc-800 rounded-full items-center justify-center active:opacity-70"
                        >
                            <MaterialIcons name="close" size={20} color="#a1a1aa" />
                        </TouchableOpacity>

                        <Text className="text-xl font-black text-white">
                            Change Password
                        </Text>

                        <TouchableOpacity
                            onPress={handlePasswordUpdate}
                            disabled={loading}
                            className={`px-5 py-2 rounded-xl active:opacity-80 flex-row items-center ${
                                loading ? 'bg-orange-600' : 'bg-orange-500'
                            }`}
                        >
                            {loading && <ActivityIndicator size="small" color="#000" style={{ marginRight: 6 }} />}
                            <Text className="text-black font-extrabold text-sm uppercase">
                                {loading ? "Saving" : "Save"}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <ScrollView className="flex-1 px-6 py-6" showsVerticalScrollIndicator={false}>
                    <View className="space-y-6">

                        {/* Current Password */}
                        <View className="mb-5">
                            <Text className="text-zinc-400 font-bold text-xs uppercase tracking-wider mb-2">
                                Current Password
                            </Text>
                            <TextInput
                                value={passwordForm.currentPassword}
                                editable={!loading}
                                onChangeText={(value) =>
                                    setPasswordForm((prev) => ({
                                        ...prev,
                                        currentPassword: value,
                                    }))
                                }
                                className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800 text-white font-semibold focus:border-orange-500"
                                placeholder="Enter current password"
                                placeholderTextColor="#52525b"
                                secureTextEntry
                            />
                        </View>

                        {/* New Password */}
                        <View className="mb-5">
                            <Text className="text-zinc-400 font-bold text-xs uppercase tracking-wider mb-2">
                                New Password
                            </Text>
                            <TextInput
                                value={passwordForm.newPassword}
                                editable={!loading}
                                onChangeText={(value) =>
                                    setPasswordForm((prev) => ({
                                        ...prev,
                                        newPassword: value,
                                    }))
                                }
                                className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800 text-white font-semibold focus:border-orange-500"
                                placeholder="Enter new password"
                                placeholderTextColor="#52525b"
                                secureTextEntry
                            />
                            <Text className="text-zinc-500 text-xs mt-1.5 font-medium">
                                * Password must be at least 6 characters
                            </Text>
                        </View>

                        {/* Confirm New Password */}
                        <View className="mb-5">
                            <Text className="text-zinc-400 font-bold text-xs uppercase tracking-wider mb-2">
                                Confirm New Password
                            </Text>
                            <TextInput
                                value={passwordForm.confirmPassword}
                                editable={!loading}
                                onChangeText={(value) =>
                                    setPasswordForm((prev) => ({
                                        ...prev,
                                        confirmPassword: value,
                                    }))
                                }
                                className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800 text-white font-semibold focus:border-orange-500"
                                placeholder="Confirm new password"
                                placeholderTextColor="#52525b"
                                secureTextEntry
                            />
                        </View>
                    </View>

                    <View className="bg-zinc-900 p-5 rounded-2xl mt-8 border border-zinc-800">
                        <View className="flex-row items-center mb-3">
                            <MaterialIcons name="security" size={20} color="#f97316" />
                            <Text className="text-orange-500 font-bold ml-2 text-sm uppercase tracking-wider">
                                Security Tips
                            </Text>
                        </View>
                        <Text className="text-zinc-400 text-xs leading-5 font-semibold">
                            • Use a mix of uppercase and lowercase letters{'\n'}
                            • Include numbers and special characters (@, #, $){'\n'}
                            • Avoid common words or personal information{'\n'}
                            • Make it at least 8 characters long for maximum safety
                        </Text>
                    </View>

                </ScrollView>
            </SafeAreaView>
        </Modal>
    );
};

export default ChangePasswordModal;