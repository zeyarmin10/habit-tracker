import React from "react";
import { StyleSheet, View, ActivityIndicator } from "react-native";
import { Text, useTheme } from "react-native-paper"; // Import useTheme

const AuthLoadingScreen = () => {
  const theme = useTheme(); // Access the theme here

  return (
    <View style={styles.centered}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
      <Text style={styles.loadingText}>Checking authentication state...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f4f7", // Consistent background
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
});

export default AuthLoadingScreen;
