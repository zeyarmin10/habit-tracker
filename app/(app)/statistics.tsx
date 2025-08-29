import React, { useState, useEffect } from "react";
import { StyleSheet, View, ScrollView, ActivityIndicator } from "react-native";
import { Stack } from "expo-router";
import { useTheme, Card } from "react-native-paper";
import { Text } from "react-native";
import { onValue, ref } from "firebase/database";

import { useAuth } from "../hooks/useAuthService";
import { database } from "../../lib/firebase";
import MaterialCommunityIcons from "@expo/vector-icons/build/MaterialCommunityIcons";

interface Habit {
  id: string;
  name: string;
  description?: string;
  frequency: string;
  createdAt: string;
  completed?: { [date: string]: boolean };
}

interface HabitStreakData {
  habitId: string;
  habitName: string;
  currentStreak: number;
  longestStreak: number;
}

const calculateStreaks = (
  habits: Habit[]
): {
  totalCurrentStreak: number;
  totalLongestStreak: number;
  mostStreakHabit: HabitStreakData | null;
  leastStreakHabit: HabitStreakData | null;
  individualHabitStreaks: HabitStreakData[];
} => {
  let totalCurrentStreak = 0;
  let totalLongestStreak = 0;
  let mostStreakHabit: HabitStreakData | null = null;
  let leastStreakHabit: HabitStreakData | null = null;
  const individualHabitStreaks: HabitStreakData[] = [];

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (const habit of habits) {
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    // Convert completion dates to an array and sort them
    const completionDates = habit.completed
      ? Object.keys(habit.completed).sort()
      : [];

    for (let i = 0; i < completionDates.length; i++) {
      const date = new Date(completionDates[i]);
      date.setHours(0, 0, 0, 0);

      if (i === 0) {
        tempStreak = 1;
      } else {
        const prevDate = new Date(completionDates[i - 1]);
        prevDate.setHours(0, 0, 0, 0);
        const diffDays = Math.round(
          Math.abs(
            (date.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
          )
        );

        if (diffDays === 1) {
          // Consecutive days
          tempStreak++;
        } else if (diffDays > 1) {
          // Gap in streak
          tempStreak = 1;
        }
      }
      if (tempStreak > longestStreak) {
        longestStreak = tempStreak;
      }
    }

    // Calculate current streak considering today or yesterday
    if (completionDates.length > 0) {
      let consecutiveDays = 0;
      for (let i = completionDates.length - 1; i >= 0; i--) {
        const date = new Date(completionDates[i]);
        date.setHours(0, 0, 0, 0);

        const diffToday = Math.round(
          Math.abs((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
        );

        if (
          diffToday === consecutiveDays ||
          diffToday === consecutiveDays + 1
        ) {
          consecutiveDays++;
          currentStreak++;
        } else {
          break;
        }
      }
      // If the last completion was not today or yesterday, reset current streak
      if (completionDates.length > 0) {
        const lastCompletion = new Date(
          completionDates[completionDates.length - 1]
        );
        lastCompletion.setHours(0, 0, 0, 0);
        const diffLastCompletion = Math.round(
          Math.abs(
            (today.getTime() - lastCompletion.getTime()) / (1000 * 60 * 60 * 24)
          )
        );
        if (diffLastCompletion > 1) {
          // Not today or yesterday
          currentStreak = 0;
        } else if (diffLastCompletion === 1) {
          // Yesterday's completion counts
          // currentStreak already calculated, no change needed
        } else if (diffLastCompletion === 0) {
          // Today's completion counts
          // currentStreak already calculated, no change needed
        }
      } else {
        currentStreak = 0;
      }

      // Special handling for today's completion if no previous
      if (
        completionDates.length === 1 &&
        new Date(completionDates[0]).toISOString().split("T")[0] ===
          today.toISOString().split("T")[0]
      ) {
        currentStreak = 1;
      }
    }

    // Adjust currentStreak if habit was completed yesterday but not today, and today is not in completionDates
    if (currentStreak > 0 && completionDates.length > 0) {
      const lastCompletionDate = new Date(
        completionDates[completionDates.length - 1]
      );
      lastCompletionDate.setHours(0, 0, 0, 0);
      const diffDaysFromToday = Math.round(
        Math.abs(
          (today.getTime() - lastCompletionDate.getTime()) /
            (1000 * 60 * 60 * 24)
        )
      );
      // If the last completion was yesterday and not completed today, current streak ends
      if (diffDaysFromToday > 1) {
        currentStreak = 0;
      } else if (diffDaysFromToday === 1) {
        // Completed yesterday, check if completed today
        // This logic is tricky. If current streak includes yesterday, and today is not marked,
        // it should technically be 0 unless the streak continued up to yesterday.
        // Simpler approach: current streak is defined as consecutive completions *ending today or yesterday*.
        const isCompletedToday =
          habit.completed?.[today.toISOString().split("T")[0]];
        if (!isCompletedToday) {
          // If not completed today, and last was yesterday, streak carries through yesterday
          // But if we're asking for *current* ending today, and today is missed, it's broken.
          // This needs to be robust for the definition of current streak.
          // For now, let's keep the consecutiveDays logic.
        }
      }
    }

    const habitStreakData: HabitStreakData = {
      habitId: habit.id,
      habitName: habit.name,
      currentStreak: currentStreak,
      longestStreak: longestStreak,
    };
    individualHabitStreaks.push(habitStreakData);

    totalCurrentStreak += currentStreak;
    if (longestStreak > totalLongestStreak) {
      totalLongestStreak = longestStreak;
    }

    if (!mostStreakHabit || currentStreak > mostStreakHabit.currentStreak) {
      mostStreakHabit = habitStreakData;
    }
    if (!leastStreakHabit || currentStreak < leastStreakHabit.currentStreak) {
      leastStreakHabit = habitStreakData;
    }
  }

  return {
    totalCurrentStreak,
    totalLongestStreak,
    mostStreakHabit,
    leastStreakHabit,
    individualHabitStreaks,
  };
};

const StatisticsScreen = () => {
  const { user } = useAuth();
  const theme = useTheme();

  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<{
    totalCurrentStreak: number;
    totalLongestStreak: number;
    mostStreakHabit: HabitStreakData | null;
    leastStreakHabit: HabitStreakData | null;
    individualHabitStreaks: HabitStreakData[];
  } | null>(null);

  useEffect(() => {
    if (user) {
      setLoading(true);
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
          setStats(calculateStreaks(loadedHabits));
          setLoading(false);
        },
        (error) => {
          console.error("Error fetching habits for stats:", error);
          setLoading(false);
        }
      );

      return () => unsubscribe();
    }
  }, [user]);

  return (
    <>
      <Stack.Screen
        options={{
          title: "Stats",
          headerShown: true,
          headerStyle: { backgroundColor: theme.colors.primary },
          headerTintColor: "#fff",
        }}
      />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Your Habit Statistics</Text>

        {loading ? (
          <ActivityIndicator
            size="large"
            color={theme.colors.primary}
            style={styles.loader}
          />
        ) : habits.length === 0 ? (
          <Text style={styles.noHabitsText}>
            You haven't created any habits yet. Create some to see your stats!
          </Text>
        ) : (
          <View style={styles.statsContent}>
            <Card style={styles.statsCard}>
              <Card.Title
                title="Overall Streaks"
                titleStyle={styles.cardTitle}
                left={() => (
                  <MaterialCommunityIcons
                    name="trophy-outline"
                    size={24}
                    color={theme.colors.primary}
                  />
                )}
              />
              <Card.Content>
                <Text style={styles.statText}>
                  Current Total Streak:{" "}
                  <Text style={styles.statValue}>
                    {stats?.totalCurrentStreak || 0} days
                  </Text>
                </Text>
                <Text style={styles.statText}>
                  Longest Total Streak:{" "}
                  <Text style={styles.statValue}>
                    {stats?.totalLongestStreak || 0} days
                  </Text>
                </Text>
              </Card.Content>
            </Card>

            {stats?.mostStreakHabit && (
              <Card style={styles.statsCard}>
                <Card.Title
                  title="Highest Current Streak"
                  titleStyle={styles.cardTitle}
                  left={() => (
                    <MaterialCommunityIcons
                      name="crown-outline"
                      size={24}
                      color={theme.colors.primary}
                    />
                  )}
                />
                <Card.Content>
                  <Text style={styles.statText}>
                    Habit:{" "}
                    <Text style={styles.statValue}>
                      {stats.mostStreakHabit.habitName}
                    </Text>
                  </Text>
                  <Text style={styles.statText}>
                    Streak:{" "}
                    <Text style={styles.statValue}>
                      {stats.mostStreakHabit.currentStreak} days
                    </Text>
                  </Text>
                </Card.Content>
              </Card>
            )}

            {stats?.leastStreakHabit && (
              <Card style={styles.statsCard}>
                <Card.Title
                  title="Lowest Current Streak"
                  titleStyle={styles.cardTitle}
                  left={() => (
                    <MaterialCommunityIcons
                      name="target-variant"
                      size={24}
                      color={theme.colors.primary}
                    />
                  )}
                />
                <Card.Content>
                  <Text style={styles.statText}>
                    Habit:{" "}
                    <Text style={styles.statValue}>
                      {stats.leastStreakHabit.habitName}
                    </Text>
                  </Text>
                  <Text style={styles.statText}>
                    Streak:{" "}
                    <Text style={styles.statValue}>
                      {stats.leastStreakHabit.currentStreak} days
                    </Text>
                  </Text>
                </Card.Content>
              </Card>
            )}

            <Text style={styles.sectionTitle}>Individual Habit Streaks</Text>
            {stats?.individualHabitStreaks &&
            stats.individualHabitStreaks.length > 0 ? (
              stats.individualHabitStreaks.map((habitStat) => (
                <Card key={habitStat.habitId} style={styles.habitStatCard}>
                  <Card.Content>
                    <Text style={styles.habitStatName}>
                      {habitStat.habitName}
                    </Text>
                    <Text>
                      Current Streak:{" "}
                      <Text style={styles.statValue}>
                        {habitStat.currentStreak} days
                      </Text>
                    </Text>
                    <Text>
                      Longest Streak:{" "}
                      <Text style={styles.statValue}>
                        {habitStat.longestStreak} days
                      </Text>
                    </Text>
                  </Card.Content>
                </Card>
              ))
            ) : (
              <Text style={styles.noHabitsText}>
                No individual habit data to display.
              </Text>
            )}
          </View>
        )}
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
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 30,
    color: "#333",
    textAlign: "center",
  },
  loader: {
    marginTop: 50,
  },
  noHabitsText: {
    fontSize: 18,
    color: "#666",
    textAlign: "center",
    marginTop: 30,
    paddingHorizontal: 20,
  },
  statsContent: {
    width: "100%",
    alignItems: "center",
  },
  statsCard: {
    width: "100%",
    maxWidth: 400,
    marginBottom: 20,
    borderRadius: 15,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  statText: {
    fontSize: 16,
    color: "#555",
    marginBottom: 5,
  },
  statValue: {
    fontWeight: "bold",
    color: "#000",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginTop: 20,
    marginBottom: 15,
    alignSelf: "flex-start",
    paddingLeft: 10,
  },
  habitStatCard: {
    width: "100%",
    maxWidth: 400,
    marginBottom: 10,
    borderRadius: 10,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 1.0,
  },
  habitStatName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 5,
    color: "#333",
  },
});

export default StatisticsScreen;
