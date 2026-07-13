import { db, auth } from "@/firebase";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where
} from "firebase/firestore";

export interface Exercise {
  id: string;
  name: string;
  icon: string;
}

export interface WorkoutLog {
  id: string;
  type: string;
  caloriesBurned: number;
  durationMinutes: number;
  exercise: Exercise | null;
  notes: string;
  date: Date;
  intensity?: 'Easy' | 'Moderate' | 'Hard';
}

export interface PlannedExercise {
  name: string;
  sets: number;
  reps: number;
}

export interface WorkoutPlan {
  id: string;
  userId: string;
  title: string;
  day: string;
  exercises: PlannedExercise[];
  completed?: boolean;
  lastCompletedAt?: any | null;
  createdAt: Date;
}

// 🛠️ Firestore dates වඩාත් ආරක්ෂිතව JS Date එකකට හැරවීමේ ශ්‍රිතය
const parseFirestoreDate = (dateField: any): Date => {
  if (!dateField) return new Date(); // serverTimestamp() එක තවම ලැබී නැතිනම් වත්මන් වෙලාව ගනී
  if (typeof dateField.toDate === 'function') return dateField.toDate();
  if (dateField.seconds) return new Date(dateField.seconds * 1000);
  if (dateField instanceof Date) return dateField;
  return new Date(dateField);
};

export const addWorkout = async (data: {
  type: string;
  caloriesBurned: number;
  durationMinutes: number;
  exercise: Exercise | null;
  notes: string;
  date: Date;
  intensity: 'Easy' | 'Moderate' | 'Hard';
}) => {
  if (!auth.currentUser) throw new Error("User not logged in");

  const firestoreTimestamp = data.date ? Timestamp.fromDate(data.date) : Timestamp.now();

  return await addDoc(collection(db, "workouts"), {
    userId: auth.currentUser.uid,
    type: data.type ? data.type.trim() : "General",
    caloriesBurned: Number(data.caloriesBurned) || 0,
    durationMinutes: Number(data.durationMinutes) || 0,
    exercise: data.exercise ? {
      id: data.exercise.id || "",
      name: data.exercise.name || "",
      icon: data.exercise.icon || "fitness-center",
    } : null,
    notes: data.notes || "",
    date: firestoreTimestamp,
    intensity: data.intensity || 'Moderate',
    createdAt: serverTimestamp(),
  });
};

export const getAllWorkouts = async (): Promise<WorkoutLog[]> => {
  const user = auth.currentUser;
  if (!user) throw new Error("User not logged in");

  const q = query(
      collection(db, "workouts"),
      where("userId", "==", user.uid)
  );

  const querySnapshot = await getDocs(q);

  const workouts = querySnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      type: data.type || "General",
      caloriesBurned: Number(data.caloriesBurned) || 0,
      durationMinutes: Number(data.durationMinutes) || 0,
      exercise: data.exercise || null,
      notes: data.notes || "",
      date: parseFirestoreDate(data.date),
      intensity: data.intensity,
    };
  });

  return workouts.sort((a, b) => b.date.getTime() - a.date.getTime());
};

export const listenToWorkouts = (callback: (workouts: WorkoutLog[]) => void) => {
  const user = auth.currentUser;
  if (!user) return () => {};

  const q = query(
      collection(db, "workouts"),
      where("userId", "==", user.uid)
  );

  return onSnapshot(q, (snapshot) => {
    const workoutsData = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        type: data.type || "General",
        caloriesBurned: Number(data.caloriesBurned) || 0,
        durationMinutes: Number(data.durationMinutes) || 0,
        exercise: data.exercise || null,
        notes: data.notes || "",
        date: parseFirestoreDate(data.date),
        intensity: data.intensity,
      };
    });

    workoutsData.sort((a, b) => b.date.getTime() - a.date.getTime());
    callback(workoutsData);
  }, (error) => {
    console.error("Firestore listen error:", error);
  });
};

export const updateWorkout = async (
    workoutId: string,
    updatedData: {
      type?: string;
      caloriesBurned?: number;
      durationMinutes?: number;
      notes?: string;
      intensity?: 'Easy' | 'Moderate' | 'Hard';
      date?: Date;
    }
) => {
  const user = auth.currentUser;
  if (!user) throw new Error("User not logged in");

  const workoutRef = doc(db, 'workouts', workoutId);
  const dataToUpdate: any = { ...updatedData };

  if (updatedData.durationMinutes !== undefined) {
    dataToUpdate.durationMinutes = Number(updatedData.durationMinutes) || 0;
  }
  if (updatedData.caloriesBurned !== undefined) {
    dataToUpdate.caloriesBurned = Number(updatedData.caloriesBurned) || 0;
  }
  if (updatedData.date) {
    dataToUpdate.date = Timestamp.fromDate(updatedData.date);
  }

  await updateDoc(workoutRef, dataToUpdate);
};

export const deleteWorkout = async (workoutId: string) => {
  const user = auth.currentUser;
  if (!user) throw new Error("User not logged in");

  const workoutRef = doc(db, 'workouts', workoutId);
  const snapshot = await getDoc(workoutRef);

  if (!snapshot.exists()) throw new Error("Workout log not found");
  if (snapshot.data().userId !== user.uid) throw new Error("Unauthorized");

  await deleteDoc(workoutRef);
  return true;
};

export const addWorkoutPlan = async (data: {
  userId?: string;
  title: string;
  day: string;
  exercises: PlannedExercise[];
  completed?: boolean;
}) => {
  if (!auth.currentUser) throw new Error("User not logged in");

  return await addDoc(collection(db, "workout_plans"), {
    userId: auth.currentUser.uid,
    title: data.title || "",
    day: data.day || "Monday",
    exercises: data.exercises || [],
    completed: data.completed ?? false,
    lastCompletedAt: null,
    createdAt: serverTimestamp(),
  });
};

export const getAllWorkoutPlans = async (): Promise<WorkoutPlan[]> => {
  const user = auth.currentUser;
  if (!user) throw new Error("User not logged in");

  const q = query(collection(db, "workout_plans"), where("userId", "==", user.uid));
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      userId: data.userId,
      title: data.title || "",
      day: data.day || "",
      exercises: data.exercises || [],
      completed: data.completed === true,
      lastCompletedAt: data.lastCompletedAt || null,
      createdAt: parseFirestoreDate(data.createdAt),
    };
  }).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
};

export const listenToWorkoutPlans = (callback: (plans: WorkoutPlan[]) => void) => {
  const user = auth.currentUser;
  if (!user) return () => {};

  const q = query(collection(db, "workout_plans"), where("userId", "==", user.uid));
  return onSnapshot(q, (snapshot) => {
    const plansData = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        userId: data.userId,
        title: data.title || "",
        day: data.day || "",
        exercises: data.exercises || [],
        completed: data.completed === true,
        lastCompletedAt: data.lastCompletedAt || null,
        createdAt: parseFirestoreDate(data.createdAt),
      };
    });
    plansData.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    callback(plansData);
  });
};

export const updateWorkoutPlan = async (
    planId: string,
    updatedData: {
      title?: string;
      day?: string;
      completed?: boolean;
      lastCompletedAt?: Date | null;
      exercises?: PlannedExercise[];
    }
) => {
  const user = auth.currentUser;
  if (!user) throw new Error("User not logged in");

  const planRef = doc(db, "workout_plans", planId);
  const dataToUpdate: any = { ...updatedData };

  // 🛠️ Local State එකෙන් සහ සර්වර් එකෙන් එන Completed data වඩාත් නිවැරදිව Handle කිරීම
  if (updatedData.completed === true) {
    dataToUpdate.lastCompletedAt = serverTimestamp();
  } else if (updatedData.completed === false) {
    dataToUpdate.lastCompletedAt = null;
  } else if (updatedData.lastCompletedAt instanceof Date) {
    dataToUpdate.lastCompletedAt = Timestamp.fromDate(updatedData.lastCompletedAt);
  }

  await updateDoc(planRef, dataToUpdate);
};

export const deleteWorkoutPlan = async (planId: string) => {
  const user = auth.currentUser;
  if (!user) throw new Error("User not logged in");

  const planRef = doc(db, "workout_plans", planId);
  const snapshot = await getDoc(planRef);

  if (!snapshot.exists()) throw new Error("Plan not found");
  if (snapshot.data().userId !== user.uid) throw new Error("Unauthorized");

  await deleteDoc(planRef);
  return true;
};