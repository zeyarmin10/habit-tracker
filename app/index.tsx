import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import { ref, set } from "firebase/database";
import {
  DefaultTheme,
  Provider as PaperProvider,
  TextInput,
  Button,
  Text,
} from "react-native-paper";

// Importing auth and database from a separate config file
import { database, auth } from "../lib/firebase";

// Custom theme for React Native Paper with a magenta primary color
const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: "#a564d3", // Changed to #a564d3
    accent: "#f1c40f",
  },
};

// The main application component
export default function App() {
  // State for user authentication, loading status, and form inputs
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [authError, setAuthError] = useState("");

  // Effect to listen for changes in authentication state
  useEffect(() => {
    // onAuthStateChanged returns an unsubscribe function
    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      setUser(authUser);
      setLoading(false); // Authentication state has been checked
    });
    // Cleanup function to unsubscribe from the listener
    return unsubscribe;
  }, []);

  // Function to validate form inputs
  const validateInputs = () => {
    if (isRegistering) {
      if (!name) {
        setAuthError("Name is required.");
        return false;
      }
      if (password !== confirmPassword) {
        setAuthError("Passwords do not match.");
        return false;
      }
    }

    if (!email || !password) {
      setAuthError("Email and password are required.");
      return false;
    }
    if (password.length < 6) {
      setAuthError("Password should be at least 6 characters.");
      return false;
    }

    setAuthError("");
    return true;
  };

  // Function to handle user sign-up
  const handleSignUp = async () => {
    if (!validateInputs()) return;

    try {
      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      // Add user details (name) to the database
      await set(ref(database, "users/" + userCredential.user.uid), {
        email: userCredential.user.email,
        name: name,
        createdAt: new Date().toISOString(),
      });
    } catch (error) {
      // Handle various authentication errors
      if (error.code === "auth/email-already-in-use") {
        setAuthError("That email address is already in use!");
      } else if (error.code === "auth/invalid-email") {
        setAuthError("That email address is invalid!");
      } else {
        setAuthError("Sign up failed: " + error.message);
      }
      console.error("Sign up error:", error);
    }
  };

  // Function to handle user sign-in
  const handleLogin = async () => {
    setAuthError("");
    try {
      if (!email || !password) {
        setAuthError("Email and password are required.");
        return;
      }
      // Sign in user with email and password
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      // Handle common login errors
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

  // Function to handle user sign-out
  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  // Show a loading spinner while the auth state is being checked
  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Checking authentication state...</Text>
      </View>
    );
  }

  // If a user is logged in, show the main app screen
  if (user) {
    return (
      <View style={styles.container}>
        <Text style={styles.welcomeText}>Welcome, {user.email}!</Text>
        <Text style={styles.subtitle}>You are successfully logged in.</Text>
        <Button mode="contained" onPress={handleSignOut} style={styles.button}>
          Sign Out
        </Button>
      </View>
    );
  }

  // If no user is logged in, show the login/signup screen
  return (
    <PaperProvider theme={theme}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <View style={styles.inputContainer}>
          <Text
            style={[
              styles.title,
              {
                color: theme.colors.primary,
                textShadowColor: "#000",
                textShadowOffset: { width: 1, height: 1 },
                textShadowRadius: 1,
              },
            ]}
          >
            Habit Tracker
          </Text>
          {authError ? <Text style={styles.errorText}>{authError}</Text> : null}

          {isRegistering && (
            <TextInput
              style={styles.input}
              label="Name"
              value={name}
              onChangeText={setName}
              mode="outlined"
            />
          )}

          <TextInput
            style={styles.input}
            label="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            mode="outlined"
          />
          <TextInput
            style={styles.input}
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            mode="outlined"
          />

          {isRegistering && (
            <TextInput
              style={styles.input}
              label="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              mode="outlined"
            />
          )}
        </View>
        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={isRegistering ? handleSignUp : handleLogin}
            style={styles.button}
          >
            {isRegistering ? "Sign Up" : "Log In"}
          </Button>
        </View>

        <Button
          onPress={() => {
            setIsRegistering(!isRegistering);
            setAuthError("");
            setEmail("");
            setPassword("");
            setName("");
            setConfirmPassword("");
          }}
          style={styles.toggleButton}
        >
          {isRegistering
            ? "Already have an account? Log In"
            : "Don't have an account? Sign Up"}
        </Button>
      </KeyboardAvoidingView>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f4f7",
    alignItems: "center",
    justifyContent: "center",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  inputContainer: {
    width: "80%",
  },
  input: {
    marginTop: 15,
  },
  buttonContainer: {
    width: "80%",
    marginTop: 30,
  },
  button: {
    padding: 10,
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginBottom: 10,
  },
  toggleButton: {
    marginTop: 20,
  },
});
