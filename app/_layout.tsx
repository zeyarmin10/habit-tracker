import React, { useEffect } from "react";
import { Stack, router } from "expo-router";
import { DefaultTheme, Provider as PaperProvider } from "react-native-paper";
import { AuthContext, useAuthService } from "./hooks/useAuthService";
import AuthLoadingScreen from "./screens/AuthLoadingScreen";
// AuthForm is directly rendered by app/index.tsx, not conditionally here.

// Custom theme for React Native Paper with a primary color
const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: "#a564d3",
    accent: "#f1c40f",
  },
};

export default function RootLayout() {
  const authState = useAuthService();

  // Effect to handle navigation after authentication state changes
  useEffect(() => {
    if (!authState.loading) {
      if (authState.user) {
        // If user is logged in, navigate to the main app (tabs)
        router.replace("/(app)/home");
      } else {
        // If no user, ensure we are on the auth form route
        router.replace("/");
      }
    }
  }, [authState.user, authState.loading]);

  return (
    <PaperProvider theme={theme}>
      <AuthContext.Provider value={authState}>
        {authState.loading ? (
          <AuthLoadingScreen />
        ) : (
          <Stack>
            {/* The index route renders AuthForm (login/register) */}
            <Stack.Screen name="index" options={{ headerShown: false }} />
            {/* The (app) group's _layout.tsx will define the tabs */}
            <Stack.Screen name="(app)" options={{ headerShown: false }} />
            {/* This is the 'create-habit' screen, defined as a modal over the entire app. */}
            <Stack.Screen
              name="(app)/create-habit" // Adjusted name to match the file path
              options={{
                presentation: "modal", // Make it appear as a modal
                headerShown: true, // Show header for this specific modal screen
                title: "Create New Habit",
              }}
            />
          </Stack>
        )}
      </AuthContext.Provider>
    </PaperProvider>
  );
}
