import { db } from "@/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { getAuth, updateEmail, updateProfile } from "firebase/auth";

export const getUserProfile = async (uid: string) => {
  try {
    const userDocRef = doc(db, "users", uid);
    const docSnap = await getDoc(userDocRef);
    if (docSnap.exists()) {
      return docSnap.data();
    }
    return null;
  } catch (error) {
    console.error("Error fetching user profile from Firestore:", error);
    throw error;
  }
};

export const updateUserProfile = async (
    uid: string,
    updatedData: {
      name: string;
      email: string;
      phone: string;
      age?: string | number;
      height?: string | number;
      weight?: string | number;
    }
): Promise<boolean> => {
  try {
    const auth = getAuth();
    const currentUser = auth.currentUser;

    if (!currentUser) throw new Error("No authenticated user found");


    if (updatedData.name && updatedData.name.trim() !== currentUser.displayName) {
      await updateProfile(currentUser, { displayName: updatedData.name.trim() });
      console.log("Auth Display Name Updated");
    }

    const inputEmail = updatedData.email ? updatedData.email.trim().toLowerCase() : "";
    const currentAuthEmail = currentUser.email ? currentUser.email.toLowerCase() : "";

    if (inputEmail && inputEmail !== currentAuthEmail) {
      await updateEmail(currentUser, inputEmail);
      console.log("Auth Email Updated");
    }

    const userDocRef = doc(db, "users", currentUser.uid);

    const firestoreData = {
      name: updatedData.name ? String(updatedData.name).trim() : "",
      email: inputEmail,
      phone: updatedData.phone ? String(updatedData.phone).trim() : "",
      age: updatedData.age !== undefined && updatedData.age !== null ? String(updatedData.age).trim() : "",
      height: updatedData.height !== undefined && updatedData.height !== null ? String(updatedData.height).trim() : "",
      weight: updatedData.weight !== undefined && updatedData.weight !== null ? String(updatedData.weight).trim() : "",
    };

    await setDoc(userDocRef, firestoreData, { merge: true });
    console.log("Firestore Profile Data Updated successfully!");

    return true;
  } catch (error: any) {
    console.error("Error updating user profile:", error);

    if (error.code === 'auth/requires-recent-login') {
      throw new Error("Security Alert: Please sign out and sign in again to change your email address.");
    }
    throw error;
  }
};