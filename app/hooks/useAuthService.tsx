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
import { ref, set, get, child } from "firebase/database";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";

// Importing auth and database from a separate config file
import {
  database,
  auth,
  webClientId,
  iosClientId,
  androidClientId,
} from "../../lib/firebase"; // Adjust path if needed

import {
  GoogleSignin,
  GoogleSigninButton,
  statusCodes,
} from "@react-native-google-signin/google-signin";

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

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// --- Auth Provider ---
export const useAuthService = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: webClientId,
      offlineAccess: true,
      forceCodeForRefreshToken: true,
    });
  }, []);

  // Use the Expo-Auth-Session hook to get the request and promptAsync function
  //   const [googleRequest, googleResponse, promptAsync] = Google.useAuthRequest({
  //     webClientId: webClientId,
  //     iosClientId: iosClientId,
  //     androidClientId: androidClientId,
  //   });

  // Effect to handle the Google sign-in response
  //   useEffect(() => {
  //     const handleGoogleSignIn = async () => {
  //       if (googleResponse?.type === "success") {
  //         setAuthError(null);
  //         try {
  //           const { idToken } = googleResponse.authentication!;
  //           const credential = GoogleAuthProvider.credential(idToken);
  //           await signInWithCredential(auth, credential);
  //         } catch (error: any) {
  //           setAuthError("Google sign-in failed: " + error.message);
  //           console.error("Google sign-in error:", error);
  //         }
  //       } else if (googleResponse?.type === "error") {
  //         setAuthError(
  //           "Google sign-in failed. Please check your network and try again."
  //         );
  //         console.error("Google sign-in response error:", googleResponse.error);
  //       }
  //     };
  //     handleGoogleSignIn();
  //   }, [googleResponse]);

  // Effect to handle Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      setUser(authUser);
      if (authUser) {
        // Create user profile in the database if it doesn't exist
        const userProfileRef = ref(database, `users/${authUser.uid}/profile`);
        const snapshot = await get(userProfileRef);
        if (!snapshot.exists()) {
          // Check if the user has a display name from Google, otherwise use a generic name
          const name = authUser.displayName || "New User";
          await set(userProfileRef, {
            email: authUser.email,
            name: name,
            createdAt: new Date().toISOString(),
          });
        }
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async (email: string, password: string) => {
    setAuthError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      if (error.code === "auth/invalid-credential") {
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
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      // Create a user profile entry in the database
      await set(
        ref(database, "users/" + userCredential.user.uid + "/profile"),
        {
          email: userCredential.user.email,
          name: name,
          createdAt: new Date().toISOString(),
        }
      );
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
    // await promptAsync();
    try {
      await GoogleSignin.hasPlayServices();
      await GoogleSignin.signOut(); // clear previous session
      const userInfo = await GoogleSignin.signIn();
      console.log("User Info:", userInfo);

      const idToken = userInfo.idToken || userInfo.data?.idToken;

      console.log("idToken : ", idToken);

      if (!idToken) {
        throw new Error("No ID Token provided from Google.");
      }

      const googleCredential = GoogleAuthProvider.credential(idToken);
      await signInWithCredential(auth, googleCredential);

      // Check if user profile already exists, if not, create one
      const userRef = ref(
        database,
        "users/" + userInfo.data?.user.id + "/profile"
      );
      const userSnapshot = await get(userRef);

      if (!userSnapshot.exists()) {
        await set(userRef, {
          email: userInfo.data?.user.email,
          name: userInfo.data?.user.name,
          createdAt: new Date().toISOString(),
        });
      }
    } catch (error: any) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log("User cancelled sign in");
      } else if (error.code === statusCodes.IN_PROGRESS) {
        console.log("Sign in in progress");
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        console.log("Play services not available");
      } else {
        console.error("Google sign-in error:", error);
        setAuthError("Google Sign-In failed: " + error.message);
      }
    }
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
    // googleRequest,
  };
};
