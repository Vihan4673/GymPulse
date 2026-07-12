import { db, auth } from '@/firebase';
import { collection, addDoc, query, where, orderBy, onSnapshot } from 'firebase/firestore';

export interface ProgressPhoto {
    id: string;
    userId: string;
    imageUri: string;
    date: any;
}

// 1. Save Photo
export const uploadProgressPhoto = async (base64Image: string) => {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");

    await addDoc(collection(db, 'progress_photos'), {
        userId: user.uid,
        imageUri: `data:image/jpeg;base64,${base64Image}`,
        date: new Date()
    });
};

// 2. Real-time Listen to Photos
export const listenToProgressPhotos = (callback: (photos: ProgressPhoto[]) => void) => {
    const user = auth.currentUser;
    if (!user) return () => {};

    const q = query(
        collection(db, 'progress_photos'),
        where('userId', '==', user.uid),
        orderBy('date', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
        const photos: ProgressPhoto[] = [];
        snapshot.forEach((doc) => {
            const data = doc.data();
            photos.push({
                id: doc.id,
                userId: data.userId,
                imageUri: data.imageUri,
                date: data.date
            });
        });
        callback(photos);
    });
};