import { db } from "@/firebase";
import { doc, getDoc } from "firebase/firestore";

export const getUserProfile = async (uid: string) => {
  const userDocRef = doc(db, "users", uid);
  const snap = await getDoc(userDocRef);
  if (snap.exists()) {
    const data = snap.data();
    return {
      name: data.name,
      email: data.email,
      phone: data.phone,
      avatar: data.avatar,
      joinDate: data.joinDate?.toDate() || new Date(),
      currency: data.currency,
      language: data.language,
    };
  } else {
    throw new Error("User profile not found");
  }
};