import React from "react";
import { StyleSheet, View } from "react-native";
import { Stack } from "expo-router"; // Import Stack for header configuration
import { Text } from "react-native";

const SettingsScreen = () => {
  return (
    <>
      <Stack.Screen options={{ title: "Settings", headerShown: true }} />
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
