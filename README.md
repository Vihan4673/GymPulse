# 💪 GymPulse Mobile App

GymPulse is an all-in-one universal mobile application designed to help users manage their daily workout routines, monitor body statistics, and stay on track with smart daily workout reminders.

This project is built using the **Expo (React Native)** framework integrated with **Firebase** services.

---

## 🚀 Key Features

*   **🔒 Secure Authentication:** Safe user sign-up, log-in, and log-out capabilities powered by Firebase Auth.
*   **👤 Dynamic User Profile:** Track and update crucial body metrics such as age, height, and weight directly saved to the cloud.
*   **⏰ Smart Workout Reminders:** A robust notification system built with `expo-notifications` and `AsyncStorage` to schedule custom daily workout alerts.
*   **🌐 Cross-Platform Support:** Fully optimized codebase running smoothly across Android, iOS, and Web (with native-guard fallbacks).
*   **📱 File-Based Routing:** Modern navigation architecture utilizing Expo Router (`app` directory structure).

---

## 🛠️ Tech Stack

*   **Framework:** React Native (Expo SDK)
*   **Routing & Navigation:** Expo Router
*   **Backend & Database:** Firebase Auth & Firestore
*   **Local Storage:** `@react-native-async-storage/async-storage`
*   **Notifications:** `expo-notifications`
*   **Styling:** NativeWind (TailwindCSS) / Custom Zinc Dark Theme

---

## 💻 Getting Started

### 1. Install Dependencies
Open your terminal in the root project directory and run the following command to install all necessary packages:

```bash
npm install

## 📂 Project Folder Structure

Below is the directory structure for the core components of the application:

```text
GymPulse/
├── src/
│   ├── app/                    # Expo Router - File-based routing
│   │   ├── (dashboard)/        # Protected dashboard layout group
│   │   │   ├── _layout.tsx     # Dashboard layout configuration
│   │   │   └── reports.tsx     # 📊 Analytics & Reports Dashboard Screen
│   │   ├── _layout.tsx         # App Root layout (LogBox & Providers)
│   │   └── index.tsx           # App Entry point / Welcome Screen
│   │
│   ├── components/             # Reusable UI Components
│   │   └── ui/                 # Custom global UI elements (Buttons, Cards)
│   │
│   ├── service/                # Business logic & Data layer
│   │   └── workoutService.ts   # 📡 Realtime workout data snapshot listener
│   │
│   └── types/                  # Global TypeScript type definitions
│
├── assets/                     # Images, Fonts, and Static files
├── package.json                # Project dependencies and scripts
└── tailwind.config.js          # NativeWind / Tailwind configuration
