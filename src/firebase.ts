import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD6w5njNyz1NdKbvyK15F8oAQxvIHVvTIQ",
  authDomain: "gympluse-39b27.firebaseapp.com",
  projectId: "gympluse-39b27",
  storageBucket: "gympluse-39b27.firebasestorage.app",
  messagingSenderId: "583277088239",
  appId: "1:583277088239:web:2c529fd0d25344ee41ba1a",
  measurementId: "G-MP9MMX5X0M"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager(),
  }),
});