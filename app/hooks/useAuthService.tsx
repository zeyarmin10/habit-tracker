import React, { useState, useEffect, useContext, createContext } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  GoogleAuthProvider,
  signInWithCredential,
  User,
} from "firebase/auth";
import { ref, set } from "firebase/database";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";

// Importing auth and database from a separate config file
import { database, auth } from "../../lib/firebase"; // Adjust path if needed

WebBrowser.maybeCompleteAuthSession();

// --- Auth Context and Hook ---
interface AuthContextType {
  user: User | null;
  loading: boolean;
  authError: string | null;
  setAuthError: (error: string | null) => void;
  handleLogin: (email: string, password: string) => Promise<void>;
  handleSignUp: (
    email: string,
    password: string,
    name: string
  ) => Promise<void>;
  handleSignOut: () => Promise<void>;
  promptGoogleSignIn: () => Promise<void>;
  googleRequest: Google.AuthRequest | null;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

// Custom hook to handle all authentication logic
export const useAuthService = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  // Google Sign-In hook from expo-auth-session
  const [googleRequest, googleResponse, promptAsync] = Google.useAuthRequest({
    webClientId: "YOUR_WEB_CLIENT_ID", // Replace with your web client ID from Firebase
    iosClientId: "YOUR_IOS_CLIENT_ID", // Replace with your iOS client ID from Firebase
    androidClientId: "YOUR_ANDROID_CLIENT_ID", // Replace with your Android client ID from Firebase
  });

  // Effect to handle the Google Sign-In response
  useEffect(() => {
    if (googleResponse?.type === "success") {
      const { authentication } = googleResponse;
      const credential = GoogleAuthProvider.credential(authentication.idToken);
      signInWithCredential(auth, credential).catch((error) => {
        setAuthError("Google Sign-In failed: " + error.message);
        console.error("Google Sign-In error:", error);
      });
    } else if (googleResponse?.type === "error") {
      setAuthError("Google Sign-In failed. Please try again.");
    }
  }, [googleResponse]);

  // Effect to listen for changes in Firebase authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      setUser(authUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const handleLogin = async (email: string, password: string) => {
    setAuthError(null);
    try {
      if (!email || !password) {
        setAuthError("Email and password are required.");
        return;
      }
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      if (
        error.code === "auth/wrong-password" ||
        error.code === "auth/user-not-found"
      ) {
        setAuthError("Invalid email or password.");
      } else {
        setAuthError("Login failed: " + error.message);
      }
      console.error("Login error:", error);
    }
  };

  const handleSignUp = async (
    email: string,
    password: string,
    name: string
  ) => {
    setAuthError(null);
    try {
      if (!name || !email || !password) {
        setAuthError("All fields are required.");
        return;
      }
      if (password.length < 6) {
        setAuthError("Password should be at least 6 characters.");
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      await set(ref(database, "users/" + userCredential.user.uid), {
        email: userCredential.user.email,
        name: name,
        createdAt: new Date().toISOString(),
      });
    } catch (error: any) {
      if (error.code === "auth/email-already-in-use") {
        setAuthError("That email address is already in use!");
      } else if (error.code === "auth/invalid-email") {
        setAuthError("That email address is invalid!");
      } else if (error.code === "auth/weak-password") {
        setAuthError("Password should be at least 6 characters.");
      } else {
        setAuthError("Sign up failed: " + error.message);
      }
      console.error("Sign up error:", error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  const promptGoogleSignIn = async () => {
    setAuthError(null);
    await promptAsync();
  };

  return {
    user,
    loading,
    authError,
    setAuthError,
    handleLogin,
    handleSignUp,
    handleSignOut,
    promptGoogleSignIn,
    googleRequest,
  };
};

// Custom hook for consuming the AuthContext (for components that need auth state)
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
