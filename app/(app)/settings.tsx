import React from "react";
import { StyleSheet, View } from "react-native";
import { Stack } from "expo-router";
import { useTheme } from "react-native-paper";
import { Text } from "react-native";

const SettingsScreen = () => {
  const theme = useTheme();

  return (
    <>
      <Stack.Screen
        options={{
          title: "Settings",
          headerShown: true, // Show header for this specific tab screen
          headerStyle: { backgroundColor: theme.colors.primary }, // Apply theme color to header
          headerTintColor: "#fff", // White text for header title
        }}
      />
      <View style={styles.container}>
        <Text style={styles.text}>Settings content will go here.</Text>
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
  text: {
    fontSize: 20,
    color: "#333",
  },
});

export default SettingsScreen;
