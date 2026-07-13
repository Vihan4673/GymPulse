import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, ActivityIndicator, Modal, Dimensions, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { uploadProgressPhoto, listenToProgressPhotos, ProgressPhoto, deleteProgressPhoto } from '@/service/progressService';
import Toast from 'react-native-toast-message';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

const ProgressGallery = () => {
    const navigation = useRouter();
    const [rawPhotos, setRawPhotos] = useState<ProgressPhoto[]>([]);
    const [loading, setLoading] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const [selectedPhotos, setSelectedPhotos] = useState<ProgressPhoto[]>([]);
    const [isCompareMode, setIsCompareMode] = useState(false);
    const [showCompareModal, setShowCompareModal] = useState(false);

    useEffect(() => {
        const unsubscribe = listenToProgressPhotos((data) => {
            if (data) {
                setRawPhotos(data);
            }
        });
        return () => unsubscribe();
    }, []);

    const sortedPhotos = useMemo(() => {
        return [...rawPhotos].sort((a, b) => {
            const tA = a.date?.seconds ? a.date.seconds * 1000 : new Date(a.date).getTime();
            const tB = b.date?.seconds ? b.date.seconds * 1000 : new Date(b.date).getTime();
            return tB - tA;
        });
    }, [rawPhotos]);

    const oldestPhotoId = useMemo(() => {
        if (rawPhotos.length === 0) return null;
        const sortedOldest = [...rawPhotos].sort((a, b) => {
            const tA = a.date?.seconds ? a.date.seconds * 1000 : new Date(a.date).getTime();
            const tB = b.date?.seconds ? b.date.seconds * 1000 : new Date(b.date).getTime();
            return tA - tB;
        });
        return sortedOldest[0].id;
    }, [rawPhotos]);

    const pickAndUploadImage = async () => {
        Alert.alert(
            "Select Photo Source",
            "Choose how you want to add your progress photo:",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Open Camera 📸",
                    onPress: () => handleImageSelection('camera')
                },
                {
                    text: "Choose from Gallery 🖼️",
                    onPress: () => handleImageSelection('gallery')
                }
            ]
        );
    };

    const handleImageSelection = async (source: 'camera' | 'gallery') => {
        let result;

        try {
            if (source === 'camera') {
                const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
                if (!permissionResult.granted) {
                    Toast.show({ type: 'error', text1: 'Permission Denied', text2: 'Camera access is required.' });
                    return;
                }
                result = await ImagePicker.launchCameraAsync({
                    allowsEditing: true,
                    aspect: [4, 5],
                    quality: 0.4,
                    base64: true,
                });
            } else {
                const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
                if (!permissionResult.granted) {
                    Toast.show({ type: 'error', text1: 'Permission Denied', text2: 'Gallery access is required.' });
                    return;
                }
                result = await ImagePicker.launchImageLibraryAsync({
                    allowsEditing: true,
                    aspect: [4, 5],
                    quality: 0.4,
                    base64: true,
                });
            }

            if (result && !result.canceled && result.assets[0].base64) {
                setLoading(true);
                await uploadProgressPhoto(result.assets[0].base64);
                Toast.show({ type: 'success', text1: 'Photo Saved!', text2: 'Transformation logged successfully.' });
            }
        } catch (error) {
            console.error(error);
            Toast.show({ type: 'error', text1: 'Upload Failed', text2: 'Something went wrong.' });
        } finally {
            setLoading(false);
        }
    };

    const handleDeletePhoto = (photoId: string) => {
        Alert.alert(
            "Delete Photo",
            "Are you sure you want to permanently delete this progress photo?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        setDeletingId(photoId);
                        try {
                            await deleteProgressPhoto(photoId);
                            Toast.show({ type: 'success', text1: 'Deleted', text2: 'Photo removed successfully.' });
                            setSelectedPhotos(prev => prev.filter(p => p.id !== photoId));
                        } catch (error) {
                            Toast.show({ type: 'error', text1: 'Error', text2: 'Could not delete photo.' });
                        } finally {
                            setDeletingId(null);
                        }
                    }
                }
            ]
        );
    };

    const parseSafeDate = (dateField: any): string => {
        if (!dateField) return '';
        const d = dateField.seconds ? new Date(dateField.seconds * 1000) : new Date(dateField);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const handlePhotoPress = (photo: ProgressPhoto) => {
        if (!isCompareMode) return;

        const isSelected = selectedPhotos.some(p => p.id === photo.id);
        if (isSelected) {
            setSelectedPhotos(selectedPhotos.filter(p => p.id !== photo.id));
        } else {
            if (selectedPhotos.length >= 2) {
                Toast.show({ type: 'info', text1: 'Limit Reached', text2: 'You can only compare 2 photos.' });
                return;
            }
            setSelectedPhotos([...selectedPhotos, photo]);
        }
    };

    const triggerComparison = () => {
        if (selectedPhotos.length !== 2) {
            Toast.show({ type: 'error', text1: 'Selection Missing', text2: 'Please select exactly 2 photos to compare.' });
            return;
        }
        setShowCompareModal(true);
    };

    return (
        <SafeAreaView className="flex-1 bg-zinc-950 px-4">

            {/* Header */}
            <View className="flex-row justify-between items-center mt-4 mb-2">
                <TouchableOpacity onPress={() => navigation.back()} className="p-2 bg-zinc-900 rounded-full border border-zinc-800">
                    <MaterialIcons name="arrow-back" size={20} color="white" />
                </TouchableOpacity>
                <View className="items-center flex-1">
                    <Text className="text-xl font-black text-white uppercase tracking-tight">Timeline Gallery</Text>
                </View>
                <TouchableOpacity
                    onPress={pickAndUploadImage}
                    disabled={loading}
                    className="bg-orange-500 w-10 h-10 rounded-full items-center justify-center"
                >
                    {loading ? <ActivityIndicator color="black" size="small" /> : <MaterialIcons name="add-photo-alternate" size={22} color="black" />}
                </TouchableOpacity>
            </View>

            <View className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3 flex-row justify-between items-center mb-4">
                <View className="flex-1 pr-2">
                    <Text className="text-white text-xs font-bold uppercase tracking-wider">
                        {isCompareMode ? `Selected (${selectedPhotos.length}/2)` : "Visual Progress Tracker"}
                    </Text>
                    <Text className="text-zinc-400 text-[11px] mt-0.5">
                        {isCompareMode ? "Select two different dates to see changes" : "Tap Compare to select before/after images"}
                    </Text>
                </View>

                {isCompareMode ? (
                    <View className="flex-row items-center gap-2">
                        <TouchableOpacity
                            onPress={() => { setIsCompareMode(false); setSelectedPhotos([]); }}
                            className="bg-zinc-800 border border-zinc-700 px-3 py-2 rounded-xl"
                        >
                            <Text className="text-zinc-300 text-xs font-bold">Cancel</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={triggerComparison}
                            disabled={selectedPhotos.length !== 2}
                            className={`px-4 py-2 rounded-xl flex-row items-center ${selectedPhotos.length === 2 ? 'bg-orange-500' : 'bg-orange-500/20'}`}
                        >
                            <Text className={`text-xs font-black uppercase ${selectedPhotos.length === 2 ? 'text-black' : 'text-orange-500/40'}`}>Compare</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <TouchableOpacity
                        onPress={() => setIsCompareMode(true)}
                        className="bg-orange-500/10 border border-orange-500/20 px-3 py-2 rounded-xl flex-row items-center"
                    >
                        <MaterialCommunityIcons name="compare" size={16} color="#f97316" className="mr-1" />
                        <Text className="text-orange-500 text-xs font-bold uppercase ml-1">Compare</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Timeline List Design */}
            <FlatList
                data={sortedPhotos}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                renderItem={({ item, index }) => {
                    const isSelected = selectedPhotos.some(p => p.id === item.id);
                    const isDeleting = deletingId === item.id;
                    const isStartingPoint = item.id === oldestPhotoId;

                    return (
                        <View className="flex-row">
                            <View className="items-center mr-4 w-8">
                                <View className={`w-3 h-3 rounded-full border-2 ${isSelected ? 'bg-orange-500 border-orange-500' : 'bg-zinc-950 border-zinc-700'}`} />
                                {index !== sortedPhotos.length - 1 && <View className="w-[1.5px] bg-zinc-800 flex-1 my-1" />}
                            </View>

                            <TouchableOpacity
                                activeOpacity={0.8}
                                onPress={() => handlePhotoPress(item)}
                                className={`flex-1 bg-zinc-900 border rounded-3xl p-3 mb-4 ${
                                    isSelected ? 'border-orange-500 bg-orange-500/5' : 'border-zinc-800'
                                }`}
                            >
                                <View className="flex-row items-center justify-between mb-2">
                                    <View className="flex-row items-center">
                                        <MaterialIcons name="calendar-today" size={12} color="#a1a1aa" />
                                        <Text className="text-white font-bold text-xs ml-1.5">{parseSafeDate(item.date)}</Text>
                                    </View>

                                    <View className="flex-row items-center gap-2">
                                        {isStartingPoint && (
                                            <View className="bg-zinc-800 px-2 py-0.5 rounded-md border border-zinc-700 mr-1">
                                                <Text className="text-orange-500 text-[9px] font-black uppercase tracking-wide">Starting Point</Text>
                                            </View>
                                        )}

                                        {/* ⚡ Delete Button */}
                                        {!isCompareMode && (
                                            <TouchableOpacity
                                                onPress={() => handleDeletePhoto(item.id)}
                                                disabled={isDeleting}
                                                className="p-1 bg-zinc-950 border border-zinc-800 rounded-lg active:opacity-70"
                                            >
                                                {isDeleting ? (
                                                    <ActivityIndicator size="small" color="#ef4444" />
                                                ) : (
                                                    <MaterialIcons name="delete-outline" size={16} color="#ef4444" />
                                                )}
                                            </TouchableOpacity>
                                        )}

                                        {isCompareMode && (
                                            <MaterialIcons
                                                name={isSelected ? "check-circle" : "radio-button-unchecked"}
                                                size={20}
                                                color={isSelected ? "#f97316" : "#52525b"}
                                            />
                                        )}
                                    </View>
                                </View>

                                <Image
                                    source={{ uri: item.imageUri }}
                                    className="w-full h-64 rounded-2xl bg-zinc-950"
                                    resizeMode="cover"
                                />
                            </TouchableOpacity>
                        </View>
                    );
                }}
                ListEmptyComponent={
                    <View className="items-center justify-center py-20">
                        <MaterialIcons name="photo-library" size={64} color="#3f3f46" />
                        <Text className="text-zinc-500 font-bold mt-4">No progress photos yet.</Text>
                        <Text className="text-zinc-600 text-xs text-center mt-1 px-10">
                            Take your first snapshot today to compare your fitness journey!
                        </Text>
                    </View>
                }
            />

            <Modal visible={showCompareModal} animationType="slide" transparent={false}>
                <SafeAreaView className="flex-1 bg-zinc-950 px-4 justify-between py-4">
                    <View>
                        <View className="flex-row justify-between items-center mb-6">
                            <Text className="text-xl font-black text-white uppercase">Side-By-Side View</Text>
                            <TouchableOpacity
                                onPress={() => setShowCompareModal(false)}
                                className="p-2 bg-zinc-900 border border-zinc-800 rounded-full"
                            >
                                <MaterialIcons name="close" size={20} color="white" />
                            </TouchableOpacity>
                        </View>

                        <View className="flex-row justify-between w-full h-[70vh]">
                            {selectedPhotos.map((photo, i) => (
                                <View key={photo.id} className="w-[49%] h-full bg-zinc-900 border border-zinc-800 rounded-3xl p-2 justify-between">
                                    <View className="bg-zinc-950 px-2 py-1 rounded-lg items-center mb-2">
                                        <Text className="text-orange-500 text-[10px] font-black uppercase tracking-widest">
                                            {i === 0 ? "Past Photo" : "Recent Photo"}
                                        </Text>
                                        <Text className="text-white text-xs font-bold mt-0.5">{parseSafeDate(photo.date)}</Text>
                                    </View>

                                    <Image
                                        source={{ uri: photo.imageUri }}
                                        className="flex-1 rounded-2xl bg-zinc-950"
                                        resizeMode="cover"
                                    />
                                </View>
                            ))}
                        </View>
                    </View>

                    <TouchableOpacity
                        onPress={() => { setShowCompareModal(false); setIsCompareMode(false); setSelectedPhotos([]); }}
                        className="bg-orange-500 w-full py-4 rounded-2xl items-center justify-center"
                    >
                        <Text className="text-black font-black uppercase tracking-wider">Finish Comparison</Text>
                    </TouchableOpacity>
                </SafeAreaView>
            </Modal>
        </SafeAreaView>
    );
};

export default ProgressGallery;