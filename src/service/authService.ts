import { auth, db } from "@/firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

export const Login = (email: string, password: string) => {
    return signInWithEmailAndPassword(auth, email, password);
};


export const register = async (email: string, password: string, fullName: string, phoneNumber: string) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  console.log("Registered user:", user);
  console.log("Full Name:", fullName);
  console.log("Phone Number:", phoneNumber);

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
}