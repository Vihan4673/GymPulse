import { auth, db } from "@/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  deleteUser,
  EmailAuthProvider,
  reauthenticateWithCredential
} from "firebase/auth";
import { doc, setDoc, serverTimestamp, deleteDoc } from "firebase/firestore";

export const Login = (email: string, password: string) => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const register = async (email: string, password: string, fullName: string, phoneNumber: string) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  await updateProfile(user, {
    displayName: fullName,
  });

  await setDoc(doc(db, "users", user.uid), {
    name: fullName,
    email: email,
    phone: phoneNumber,
    joinDate: serverTimestamp(),
    language: "English",
  });

  return user;
};

export const logout = () => {
  return signOut(auth);
};

export const deleteUserAccount = async (password: string) => {
  const currentUser = auth.currentUser;

  if (!password || password.trim() === "") {
    const error = new Error("Password is missing");
    (error as any).code = "auth/missing-password";
    throw error;
  }

  if (!currentUser || !currentUser.email) {
    throw new Error("No authenticated user found");
  }

  const userId = currentUser.uid;

  try {
    const credential = EmailAuthProvider.credential(currentUser.email, password);
    await reauthenticateWithCredential(currentUser, credential);
    await deleteDoc(doc(db, "users", userId));
    await deleteUser(currentUser);

  } catch (error) {
    console.error("Error inside deleteUserAccount service:", error);
    throw error;
  }
};