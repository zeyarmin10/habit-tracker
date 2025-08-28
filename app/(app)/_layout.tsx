import React from "react";
import { Tabs } from "expo-router"; // Only Tabs is needed for the default export here
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "react-native-paper";

// This is the main layout for the authenticated part of your app.
// It directly exports the Tabs navigator, so the tab bar is always visible.
export default function AuthenticatedTabsLayout() {
  // Renamed for clarity
  const theme = useTheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary, // Active tab color
        tabBarInactiveTintColor: "gray", // Inactive tab color
        tabBarStyle: {
          backgroundColor: "#ffffff", // Background color of the tab bar
          height: 60, // Give some height to the tab bar
        },
        tabBarLabelStyle: {
          fontSize: 12, // Adjust label font size
          marginBottom: 5, // Space between icon and label
        },
        headerShown: false, // Hide header on tab screens by default; specific screens can override
      }}
    >
      <Tabs.Screen
        name="home" // Corresponds to app/(app)/home.tsx
        options={{
          title: "Habits",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="statistics" // NEW TAB: Corresponds to app/(app)/statistics.tsx
        options={{
          title: "Stats",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="chart-bar"
              color={color}
              size={size}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings" // Corresponds to app/(app)/settings.tsx
        options={{
          title: "Settings",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="cog" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
