import React, { useState } from "react";
import { StyleSheet, View, KeyboardAvoidingView, Platform } from "react-native";
import { TextInput, Button, Text, useTheme } from "react-native-paper"; // Import useTheme

import { useAuth } from "../hooks/useAuthService"; // Import useAuth hook
import { MaterialCommunityIcons } from "@expo/vector-icons";

const AuthForm = () => {
  const {
    authError,
    setAuthError,
    handleLogin,
    handleSignUp,
    promptGoogleSignIn,
    googleRequest,
  } = useAuth();
  const theme = useTheme(); // Access the theme here

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);

  // Validation logic for AuthForm
  const validateFormInputs = () => {
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
    setAuthError(null); // Clear error if validation passes
    return true;
  };

  // Handles form submission for both login and signup
  const handleSubmit = async () => {
    if (!validateFormInputs()) {
      return;
    }
    if (isRegistering) {
      await handleSignUp(email, password, name);
    } else {
      await handleLogin(email, password);
    }
  };

  // Clears form fields and error when toggling between login/register
  const handleToggleForm = () => {
    setIsRegistering(!isRegistering);
    setAuthError(null);
    setEmail("");
    setPassword("");
    setName("");
    setConfirmPassword("");
  };

  return (
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
              textShadowColor: "#000", // Keep black for outline
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
            left={<TextInput.Icon icon="account" />}
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
          left={<TextInput.Icon icon="email" />}
        />
        <TextInput
          style={styles.input}
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          mode="outlined"
          left={<TextInput.Icon icon="lock" />}
        />

        {isRegistering && (
          <TextInput
            style={styles.input}
            label="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            mode="outlined"
            left={<TextInput.Icon icon="lock" />}
          />
        )}
      </View>
      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          onPress={handleSubmit}
          style={[styles.button, { backgroundColor: theme.colors.primary }]}
        >
          {isRegistering ? "Sign Up" : "Log In"}
        </Button>
        {!isRegistering && (
          <Button
            mode="outlined"
            onPress={promptGoogleSignIn}
            style={[
              styles.socialButton,
              { borderColor: theme.colors.primary, borderWidth: 1 },
            ]}
            labelStyle={{ color: theme.colors.primary }}
            disabled={!googleRequest}
            icon={() => (
              <MaterialCommunityIcons
                name="google"
                size={20}
                color={theme.colors.primary}
              />
            )}
          >
            Sign in with Google
          </Button>
        )}
      </View>

      <Button onPress={handleToggleForm} style={styles.toggleButton}>
        {isRegistering
          ? "Already have an account? Log In"
          : "Don't have an account? Sign Up"}
      </Button>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f4f7",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
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
    justifyContent: "center",
  },
  button: {
    padding: 5,
    borderRadius: 8,
    marginBottom: 15,
  },
  socialButton: {
    borderRadius: 8,
    padding: 5,
  },
  googleButton: {
    marginTop: 10,
    backgroundColor: "#4285F4", // Google blue color
    color: "#fff",
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

export default AuthForm;
