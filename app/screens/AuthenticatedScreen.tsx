import React from "react";
import { StyleSheet, View } from "react-native";
import { Button, Text, useTheme } from "react-native-paper";

import { useAuth } from "../hooks/useAuthService"; // Import useAuth hook

const AuthenticatedScreen = () => {
  const { user, handleSignOut } = useAuth(); // Using the simplified useAuth hook
  const theme = useTheme(); // Access theme for consistent styling

  return (
    <View style={styles.container}>
      <Text style={styles.welcomeText}>Welcome, {user?.email}!</Text>
      <Text style={styles.subtitle}>You are successfully logged in.</Text>
      <Button
        mode="contained"
        onPress={handleSignOut}
        style={[styles.button, { backgroundColor: theme.colors.primary }]}
      >
        Sign Out
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f4f7", // Consistent background
    alignItems: "center",
    justifyContent: "center",
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
  button: {
    padding: 10,
  },
});

export default AuthenticatedScreen;
