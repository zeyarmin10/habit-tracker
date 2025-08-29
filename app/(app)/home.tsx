import React, { useState, useEffect, useCallback } from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  FlatList, // Keep FlatList if you need its specific methods, otherwise SwipeListView is enough
} from "react-native";
import { Button, Text, useTheme, Card } from "react-native-paper";
import { router, Stack } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { onValue, ref, remove, set } from "firebase/database";

import { useAuth } from "../hooks/useAuthService";
import { database } from "../../lib/firebase";

// Import SwipeListView and SwipeRow
import { SwipeListView, SwipeRow } from "react-native-swipe-list-view";

interface Habit {
  id: string;
  name: string;
  description?: string;
  frequency: string;
  createdAt: string;
  completed?: { [date: string]: boolean };
}

const HomeScreen = () => {
  const { user } = useAuth();
  const theme = useTheme();

  const [habits, setHabits] = useState<Habit[]>([]);
  const [loadingHabits, setLoadingHabits] = useState(true);

  useEffect(() => {
    if (user) {
      const habitsRef = ref(database, `users/${user.uid}/habits`);
      const unsubscribe = onValue(
        habitsRef,
        (snapshot) => {
          const data = snapshot.val();
          const loadedHabits: Habit[] = [];
          for (const key in data) {
            loadedHabits.push({
              id: key,
              ...data[key],
            });
          }
          setHabits(loadedHabits);
          setLoadingHabits(false);
        },
        (error) => {
          console.error("Error fetching habits:", error);
          setLoadingHabits(false);
          Alert.alert("Error", "Failed to load habits.");
        }
      );

      return () => unsubscribe();
    }
  }, [user]);

  const handleNavigateToCreateHabit = () => {
    router.push("/modals/create-habit");
  };

  const handleDeleteHabit = useCallback(
    async (habitId: string) => {
      if (!user) return;
      Alert.alert(
        "Delete Habit",
        "Are you sure you want to delete this habit?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: async () => {
              try {
                await remove(
                  ref(database, `users/${user.uid}/habits/${habitId}`)
                );
              } catch (error) {
                console.error("Error deleting habit:", error);
                Alert.alert("Error", "Failed to delete habit.");
              }
            },
          },
        ]
      );
    },
    [user]
  );

  const handleCompleteHabit = useCallback(
    async (habitId: string) => {
      if (!user) return;
      const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
      try {
        const habitRef = ref(
          database,
          `users/${user.uid}/habits/${habitId}/completed/${today}`
        );
        await set(habitRef, true); // Mark as completed for today
        Alert.alert("Success", "Habit marked as complete!");
      } catch (error) {
        console.error("Error completing habit:", error);
        Alert.alert("Error", "Failed to mark habit as complete.");
      }
    },
    [user]
  );

  // Renders the hidden actions for a swiped item
  const renderHiddenItem = ({ item }: { item: Habit }) => (
    <View style={styles.rowBack}>
      {/* Left Action (Complete) */}
      <TouchableOpacity
        style={[styles.backBtn, styles.backBtnLeft]}
        onPress={() => handleCompleteHabit(item.id)}
      >
        <MaterialCommunityIcons name="check" size={25} color="white" />
        <Text style={styles.backBtnText}>Complete</Text>
      </TouchableOpacity>

      {/* Right Action (Delete) */}
      <TouchableOpacity
        style={[styles.backBtn, styles.backBtnRight]}
        onPress={() => handleDeleteHabit(item.id)}
      >
        <MaterialCommunityIcons name="delete" size={25} color="white" />
        <Text style={styles.backBtnText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  // Renders the foreground item (the habit card itself)
  const renderItem = ({ item }: { item: Habit }) => (
    // The TouchableOpacity and Card make up the visible part of the row
    <TouchableOpacity
      activeOpacity={1} // Prevents extra opacity change on press
      onPress={() => console.log("Habit pressed:", item.name)} // Optional: add navigation or detail view
      style={styles.rowFront}
    >
      <Card style={styles.habitCard}>
        <Card.Title
          title={item.name}
          subtitle={item.description || "No description"}
          left={() => (
            <MaterialCommunityIcons
              name={
                item.frequency === "daily"
                  ? "calendar-today"
                  : item.frequency === "weekly"
                  ? "calendar-week"
                  : "calendar-month"
              }
              size={24}
              color={theme.colors.primary}
            />
          )}
          right={() => {
            const today = new Date().toISOString().split("T")[0];
            const isCompletedToday = item.completed && item.completed[today];
            return isCompletedToday ? (
              <MaterialCommunityIcons
                name="check-circle"
                size={24}
                color="green"
                style={{ marginRight: 10 }}
              />
            ) : null;
          }}
        />
        <Card.Content>
          <Text>Frequency: {item.frequency}</Text>
          <Text style={styles.dateText}>
            Created: {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  return (
    // No need for GestureHandlerRootView directly here if it's already at root (_layout.tsx)
    <View style={{ flex: 1 }}>
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
        {loadingHabits ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.loadingText}>Loading habits...</Text>
          </View>
        ) : habits.length === 0 ? (
          <View style={styles.centered}>
            <Text style={styles.welcomeMessageTitle}>
              Welcome to Habit Tracker!
            </Text>
            <Text style={styles.welcomeMessageSubtitle}>
              It looks like you haven't created any habits yet.
            </Text>
            <Text style={styles.welcomeMessageSubtitle}>
              Tap "New" in the top right to get started.
            </Text>
            <MaterialCommunityIcons
              name="star-outline"
              size={80}
              color={theme.colors.primary}
              style={{ marginTop: 20 }}
            />
          </View>
        ) : (
          <SwipeListView
            data={habits}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            renderHiddenItem={renderHiddenItem}
            leftOpenValue={75} // How much to open on left swipe (for "Complete")
            rightOpenValue={-75} // How much to open on right swipe (for "Delete")
            previewRowKey={"0"} // Optional: key of row to show preview swipe
            previewOpenValue={-40} // Optional: initial preview open value
            previewOpenDelay={3000} // Optional: delay for preview
            disableLeftSwipe={false} // Enable left swipe
            disableRightSwipe={false} // Enable right swipe
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.habitListContent}
            // Ensure the rows are kept open briefly on action
            closeOnRowPress={true} // Closes row when pressing the foreground
            tension={30} // Adjust tension for swipe feel
            friction={7} // Adjust friction for swipe feel
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f4f7",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  welcomeMessageTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
    textAlign: "center",
  },
  welcomeMessageSubtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 5,
  },
  habitListContent: {
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  // New styles for react-native-swipe-list-view
  rowFront: {
    // This style is applied to the visible part of the list item
    alignItems: "center",
    backgroundColor: "#CCC", // Will be overridden by Card's background
    justifyContent: "center",
    height: "auto", // Allow card to define height
    marginBottom: 8, // Space between items
    borderRadius: 10,
  },
  habitCard: {
    // This is the actual card style, inside rowFront
    width: "100%", // Make card take full width of rowFront
    borderRadius: 10,
    elevation: 2, // For Android shadow
    shadowColor: "#000", // For iOS shadow
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    backgroundColor: "#fff",
  },
  dateText: {
    fontSize: 12,
    color: "#999",
    marginTop: 5,
  },
  rowBack: {
    alignItems: "center",
    backgroundColor: "#DDD", // Background behind the swiped item
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8, // Match rowFront/habitCard marginBottom
    borderRadius: 10,
    overflow: "hidden", // Ensures rounded corners
  },
  backBtn: {
    alignItems: "center",
    bottom: 0,
    justifyContent: "center",
    position: "absolute",
    top: 0,
    width: 75, // Matches leftOpenValue/rightOpenValue
  },
  backBtnLeft: {
    backgroundColor: "#4CAF50", // Green for complete
    left: 0,
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
  },
  backBtnRight: {
    backgroundColor: "#F44336", // Red for delete
    right: 0,
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
  },
  backBtnText: {
    color: "white",
    fontSize: 12,
    marginTop: 5,
  },
});

export default HomeScreen;
