import React, { useEffect } from "react";
import { Stack, router } from "expo-router";
import { DefaultTheme, Provider as PaperProvider } from "react-native-paper";
import { AuthContext, useAuthService } from "./hooks/useAuthService";
import AuthLoadingScreen from "./screens/AuthLoadingScreen";
import { SafeAreaProvider } from "react-native-safe-area-context";

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

  useEffect(() => {
    if (!authState.loading) {
      if (authState.user) {
        router.replace("/(app)/home");
      } else {
        router.replace("/");
      }
    }
  }, [authState.user, authState.loading]);

  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <AuthContext.Provider value={authState}>
          {authState.loading ? (
            <AuthLoadingScreen />
          ) : (
            <Stack>
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen name="(app)" options={{ headerShown: false }} />
              {/* UPDATED PATH HERE for the create-habit modal */}
              <Stack.Screen
                name="modals/create-habit" // Changed path
                options={{
                  presentation: "modal",
                  headerShown: true,
                  title: "Create New Habit",
                }}
              />
            </Stack>
          )}
        </AuthContext.Provider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
