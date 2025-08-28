import React, { useState } from "react";
import { StyleSheet, View, Alert } from "react-native";
import {
  Button,
  TextInput,
  Text,
  useTheme,
  SegmentedButtons,
} from "react-native-paper";
import { router, Stack } from "expo-router";
import { ref, push, set } from "firebase/database";

import { useAuth } from "../hooks/useAuthService"; // Adjust path as needed
import { database } from "../../lib/firebase"; // Adjust path as needed

const CreateHabitScreen = () => {
  const { user } = useAuth();
  const theme = useTheme();

  const [habitName, setHabitName] = useState("");
  const [frequency, setFrequency] = useState("daily"); // 'daily', 'weekly', 'monthly'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSaveHabit = async () => {
    if (!user) {
      setError("You must be logged in to create a habit.");
      return;
    }
    if (!habitName.trim()) {
      setError("Habit name cannot be empty.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const newHabitRef = push(ref(database, `users/${user.uid}/habits`));
      await set(newHabitRef, {
        name: habitName.trim(),
        frequency: frequency,
        createdAt: new Date().toISOString(),
      });
      Alert.alert("Success", "Habit created successfully!");
      router.back(); // Go back to the habits list
    } catch (e: any) {
      setError("Failed to create habit: " + e.message);
      console.error("Error creating habit:", e);
      Alert.alert("Error", "Failed to create habit. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{ title: "Create New Habit", headerShown: true }}
      />
      <View style={styles.container}>
        <Text style={styles.title}>Define Your New Habit</Text>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <TextInput
          label="Habit Name"
          value={habitName}
          onChangeText={setHabitName}
          mode="outlined"
          style={styles.input}
          placeholder="e.g., Drink water, Read a book"
        />

        <Text style={styles.frequencyLabel}>Frequency</Text>
        <SegmentedButtons
          value={frequency}
          onValueChange={setFrequency}
          buttons={[
            { value: "daily", label: "Daily" },
            { value: "weekly", label: "Weekly" },
            { value: "monthly", label: "Monthly" },
          ]}
          style={styles.segmentedButtons}
        />

        <Button
          mode="contained"
          onPress={handleSaveHabit}
          loading={loading}
          disabled={loading}
          style={[styles.button, { backgroundColor: theme.colors.primary }]}
        >
          Save Habit
        </Button>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f4f7",
    padding: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 30,
    color: "#333",
  },
  input: {
    width: "100%",
    marginBottom: 20,
  },
  frequencyLabel: {
    fontSize: 16,
    color: "#666",
    marginBottom: 10,
    alignSelf: "flex-start",
    marginLeft: "10%", // Align with input
  },
  segmentedButtons: {
    width: "90%", // Adjust width to be similar to input
    marginBottom: 30,
  },
  button: {
    width: "90%",
    padding: 10,
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginBottom: 15,
  },
});

export default CreateHabitScreen;
