import React from "react";
import { StyleSheet, View } from "react-native";
import { Button, Text, useTheme } from "react-native-paper";
import { router, Stack } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { useAuth } from "../hooks/useAuthService";

const HomeScreen = () => {
  const { user, handleSignOut } = useAuth();
  const theme = useTheme();

  const handleLogout = async () => {
    await handleSignOut();
    router.replace("/");
  };

  const handleNavigateToCreateHabit = () => {
    // UPDATED PATH HERE
    router.push("/modals/create-habit"); // Changed path
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "My Habits",
          headerShown: true,
          headerStyle: { backgroundColor: theme.colors.primary },
          headerTintColor: "#fff",
          headerRight: () => (
            <Button
              onPress={handleNavigateToCreateHabit}
              icon={({ color, size }) => (
                <MaterialCommunityIcons
                  name="plus-circle-outline"
                  color="#fff"
                  size={size}
                />
              )}
              textColor="#fff"
            >
              New
            </Button>
          ),
        }}
      />
      <View style={styles.container}>
        <Text style={styles.welcomeText}>Welcome, {user?.email}!</Text>
        <Text style={styles.subtitle}>This is your Habits overview.</Text>
        <Text style={{ marginBottom: 20 }}>
          List of habits will appear here.
        </Text>
        <Button
          mode="contained"
          onPress={handleLogout}
          style={[styles.button, { backgroundColor: theme.colors.primary }]}
        >
          Sign Out
        </Button>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f4f7",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
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
    textAlign: "center",
  },
  button: {
    padding: 10,
  },
});

export default HomeScreen;
