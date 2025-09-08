import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import {
  getAuth,
  initializeAuth,
  getReactNativePersistence,
} from "firebase/auth"; // Import getAuth
import AsyncStorage, {
  AsyncStorageStatic,
} from "@react-native-async-storage/async-storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD1_ultWriUbbJuk51pzRNrduchdeZmWyg",
  authDomain: "habit-tracker-a100f.firebaseapp.com",
  databaseURL:
    "https://habit-tracker-a100f-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "habit-tracker-a100f",
  storageBucket: "habit-tracker-a100f.firebasestorage.app",
  messagingSenderId: "145216875810",
  appId: "1:145216875810:web:00de9bb46994b1c681c97b",
  measurementId: "G-H7QVQD0CN0",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Realtime Database and get a reference to the service
const database = getDatabase(app);

// Initialize Firebase Authentication and get a reference to the service
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export const webClientId =
  "145216875810-0kj2c34etndhck832dtvm59n22oiijos.apps.googleusercontent.com";
export const iosClientId =
  "145216875810-0kj2c34etndhck832dtvm59n22oiijos.apps.googleusercontent.com";
export const androidClientId =
  "145216875810-gnf7cfd4coa1mahs0t2g11u471emegvk.apps.googleusercontent.com";

export { database, auth }; // Export both database and auth
