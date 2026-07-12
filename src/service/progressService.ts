import { db, auth } from '@/firebase';
import { collection, addDoc, query, where, onSnapshot, doc, deleteDoc } from 'firebase/firestore';

export interface ProgressPhoto {
    id: string;
    userId: string;
    imageUri: string;
    date: any;
}

export const uploadProgressPhoto = async (base64Image: string) => {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");

    await addDoc(collection(db, 'progress_photos'), {
        userId: user.uid,
        imageUri: `data:image/jpeg;base64,${base64Image}`,
        date: new Date()
    });
};

export const listenToProgressPhotos = (callback: (photos: ProgressPhoto[]) => void) => {
    const user = auth.currentUser;
    if (!user) return () => {};

    const q = query(
        collection(db, 'progress_photos'),
        where('userId', '==', user.uid)
    );

    return onSnapshot(q, (snapshot) => {
        const photos: ProgressPhoto[] = [];
        snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            photos.push({
                id: docSnap.id,
                userId: data.userId,
                imageUri: data.imageUri,
                date: data.date
            });
        });

        const sortedPhotos = photos.sort((a, b) => {
            const tA = a.date?.seconds ? a.date.seconds * 1000 : new Date(a.date).getTime();
            const tB = b.date?.seconds ? b.date.seconds * 1000 : new Date(b.date).getTime();
            return tB - tA;
        });

        callback(sortedPhotos);
    }, (error) => {
        console.error("Firestore Listen Error: ", error);
    });
};

export const deleteProgressPhoto = async (photoId: string) => {
    try {
        const user = auth.currentUser;
        if (!user) throw new Error("User not authenticated");

        const photoRef = doc(db, 'progress_photos', photoId);
        await deleteDoc(photoRef);
        console.log("Deleted successfully from Firestore:", photoId);
    } catch (error) {
        console.error("Firestore Delete Error details:", error);
        throw error;
    }
};