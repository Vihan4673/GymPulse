import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, ActivityIndicator, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { uploadProgressPhoto, listenToProgressPhotos, ProgressPhoto } from '@/service/progressService';
import Toast from 'react-native-toast-message';

const ProgressGallery = () => {
    const [photos, setPhotos] = useState<ProgressPhoto[]>([]);
    const [loading, setLoading] = useState(false);
    const [showPickerModal, setShowPickerModal] = useState(false);

    useEffect(() => {
        const unsubscribe = listenToProgressPhotos((data) => {
            setPhotos(data);
        });
        return () => unsubscribe();
    }, []);

    // Image Upload Logic handler
    const handleImagePicked = async (result: ImagePicker.ImagePickerResult) => {
        if (!result.canceled && result.assets[0].base64) {
            setShowPickerModal(false);
            setLoading(true);
            try {
                await uploadProgressPhoto(result.assets[0].base64);
                Toast.show({ type: 'success', text1: 'Photo Saved!', text2: 'Transformation logged successfully.' });
            } catch (error) {
                Toast.show({ type: 'error', text1: 'Upload Failed', text2: 'Something went wrong.' });
            } finally {
                setLoading(false);
            }
        }
    };

    const openCamera = async () => {
        const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
        if (permissionResult.granted === false) {
            Toast.show({ type: 'error', text1: 'Permission Denied', text2: 'Camera access is required.' });
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [4, 5],
            quality: 0.4,
            base64: true,
        });

        await handleImagePicked(result);
    };

    const openGallery = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (permissionResult.granted === false) {
            Toast.show({ type: 'error', text1: 'Permission Denied', text2: 'Gallery access is required.' });
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            allowsEditing: true,
            aspect: [4, 5],
            quality: 0.4,
            base64: true,
        });

        await handleImagePicked(result);
    };

    const parseSafeDate = (dateField: any): string => {
        if (!dateField) return '';
        const d = dateField.seconds ? new Date(dateField.seconds * 1000) : new Date(dateField);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    return (
        <SafeAreaView className="flex-1 bg-zinc-950 px-4">
            {/* Header */}
            <View className="flex-row justify-between items-center my-6">
                <View>
                    <Text className="text-2xl font-black text-white uppercase tracking-tight">Transformation</Text>
                    <Text className="text-zinc-400 text-sm">Track your body progress</Text>
                </View>
                <TouchableOpacity
                    onPress={() => setShowPickerModal(true)}
                    disabled={loading}
                    className="bg-orange-500 px-4 py-3 rounded-full flex-row items-center"
                >
                    {loading ? (
                        <ActivityIndicator color="black" size="small" />
                    ) : (
                        <>
                            <MaterialIcons name="add-a-photo" size={20} color="black" />
                            <Text className="text-black font-bold ml-2">Add Photo</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>

            {/* Grid Gallery */}
            <FlatList
                data={photos}
                numColumns={2}
                keyExtractor={(item) => item.id}
                columnWrapperStyle={{ justifyContent: 'space-between' }}
                renderItem={({ item }) => (
                    <View className="bg-zinc-900 border border-zinc-800 rounded-3xl p-2 w-[48%] mb-4">
                        <Image
                            source={{ uri: item.imageUri }}
                            className="w-full h-48 rounded-2xl bg-zinc-950"
                            resizeMode="cover"
                        />
                        <View className="bg-zinc-950/50 py-1.5 px-2 rounded-xl mt-2 flex-row items-center justify-center">
                            <MaterialIcons name="event" size={12} color="#a1a1aa" />
                            <Text className="text-zinc-400 text-xs font-bold text-center ml-1">
                                {parseSafeDate(item.date)}
                            </Text>
                        </View>
                    </View>
                )}
                ListEmptyComponent={
                    <View className="items-center justify-center py-20">
                        <MaterialIcons name="photo-library" size={64} color="#3f3f46" />
                        <Text className="text-zinc-500 font-bold mt-4">No progress photos yet.</Text>
                        <Text className="text-zinc-600 text-xs text-center mt-1 px-10">
                            Add your first snapshot today to compare your fitness journey!
                        </Text>
                    </View>
                }
            />

            {/* Camera / Gallery Selection Bottom Modal */}
            <Modal
                visible={showPickerModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowPickerModal(false)}
            >
                <View className="flex-1 justify-end bg-black/70">
                    <View className="bg-zinc-900 p-6 rounded-t-3xl border-t border-zinc-800">
                        <View className="flex flex-row justify-between items-center mb-6">
                            <Text className="text-white font-black text-lg uppercase tracking-wider">Select Source</Text>
                            <TouchableOpacity onPress={() => setShowPickerModal(false)}>
                                <MaterialIcons name="close" size={24} color="#fff" />
                            </TouchableOpacity>
                        </View>

                        {/* Camera Button */}
                        <TouchableOpacity
                            onPress={openCamera}
                            className="bg-zinc-950 p-4 rounded-2xl flex-row items-center border border-zinc-800 mb-3 active:bg-zinc-800"
                        >
                            <View className="bg-orange-500/10 p-2 rounded-xl">
                                <MaterialIcons name="photo-camera" size={24} color="#f97316" />
                            </View>
                            <Text className="text-white font-bold text-base ml-4">Take a Photo (Camera)</Text>
                        </TouchableOpacity>

                        {/* Gallery Button */}
                        <TouchableOpacity
                            onPress={openGallery}
                            className="bg-zinc-950 p-4 rounded-2xl flex-row items-center border border-zinc-800 mb-6 active:bg-zinc-800"
                        >
                            <View className="bg-orange-500/10 p-2 rounded-xl">
                                <MaterialIcons name="image" size={24} color="#f97316" />
                            </View>
                            <Text className="text-white font-bold text-base ml-4">Choose from Gallery</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

export default ProgressGallery;