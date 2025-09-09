import React, { useState } from "react";
import { StyleSheet, View, Alert, ScrollView } from "react-native";
import {
  Button,
  TextInput,
  Text,
  useTheme,
  SegmentedButtons,
  PaperProvider,
} from "react-native-paper";
import { router, Stack } from "expo-router";
import { ref, push, set } from "firebase/database";

import { useAuth } from "../hooks/useAuthService";
import { database } from "../../lib/firebase";
import { Background } from "@react-navigation/elements";

const CreateHabitScreen = () => {
  const { user } = useAuth();
  const theme = useTheme();

  const [habitName, setHabitName] = useState("");
  const [description, setDescription] = useState("");
  const [frequency, setFrequency] = useState("daily");
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
        description: description.trim(),
        frequency: frequency,
        createdAt: new Date().toISOString(),
      });
      Alert.alert("Success", "Habit created successfully!", [
        {
          text: "OK",
          onPress: () => {
            // A slight delay can help if router.back() is too fast
            // However, the error usually indicates a deeper router state issue.
            // Let's try router.pop() which is more explicit for closing current screen.
            router.back(); // Using router.back() is generally correct for modals
          },
        },
      ]);
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
        options={{
          title: "Create New Habit",
          headerShown: true,
          headerStyle: {
            backgroundColor: theme.colors.primary,
          },
          headerTintColor: "#fff", // This makes the title and back button white
          headerTitleStyle: {
            fontWeight: "bold",
          },
        }}
      />
      <ScrollView contentContainerStyle={styles.container}>
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

        <TextInput
          label="Description (Optional)"
          value={description}
          onChangeText={setDescription}
          mode="outlined"
          multiline
          numberOfLines={4}
          style={[styles.input, styles.descriptionInput]}
          placeholder="Add more details about your habit"
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
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
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
  descriptionInput: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  frequencyLabel: {
    fontSize: 16,
    color: "#666",
    marginBottom: 10,
    alignSelf: "flex-start",
    marginLeft: "10%",
  },
  segmentedButtons: {
    width: "90%",
    marginBottom: 30,
  },
  button: {
    width: "90%",
    padding: 5,
    borderRadius: 8,
    marginBottom: 15,
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginBottom: 15,
  },
});

export default CreateHabitScreen;
