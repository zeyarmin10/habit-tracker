import React, { useState, useEffect } from "react";
import { StyleSheet, View, ActivityIndicator } from "react-native";

import { Button, Text, useTheme, Card, Avatar } from "react-native-paper";
import { router, Stack } from "expo-router";
import { ref, get } from "firebase/database";

import { useAuth } from "../hooks/useAuthService";
import { database } from "../../lib/firebase"; // Adjust path as needed

// Define a type for user profile data
interface UserProfile {
  name?: string;
  email: string;
  createdAt?: string;
}

const SettingsScreen = () => {
  const { user, handleSignOut } = useAuth();
  const theme = useTheme();

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Fetch user profile data from Realtime Database
  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        try {
          const userRef = ref(database, `users/${user.uid}/profile`);
          const snapshot = await get(userRef);
          if (snapshot.exists()) {
            setUserProfile({ email: user.email, ...snapshot.val() });
          } else {
            setUserProfile({ email: user.email }); // Fallback with just email
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
          setUserProfile({ email: user.email }); // Fallback on error
        } finally {
          setLoadingProfile(false);
        }
      }
    };
    fetchProfile();
  }, [user]);

  const onSignOut = async () => {
    await handleSignOut();
    router.replace("/"); // Navigate back to the login screen after logout
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "Settings",
          headerShown: true,
          headerStyle: { backgroundColor: theme.colors.primary },
          headerTintColor: "#fff",
        }}
      />
      <View style={styles.container}>
        <Text style={styles.screenTitle}>User Profile & Settings</Text>

        {loadingProfile ? (
          <ActivityIndicator
            size="large"
            color={theme.colors.primary}
            style={{ marginTop: 20 }}
          />
        ) : (
          <Card style={styles.profileCard}>
            <Card.Content style={styles.profileContent}>
              <Avatar.Icon
                size={64}
                icon="account"
                color={theme.colors.primary}
                style={{ backgroundColor: "#e0e0e0" }}
              />
              <View style={styles.profileTextContainer}>
                <Text style={styles.profileName}>
                  {userProfile?.name || "User"}
                </Text>
                <Text style={styles.profileEmail}>{userProfile?.email}</Text>
                {userProfile?.createdAt && (
                  <Text style={styles.profileDate}>
                    Joined:{" "}
                    {new Date(userProfile.createdAt).toLocaleDateString()}
                  </Text>
                )}
              </View>
            </Card.Content>
          </Card>
        )}

        <Button
          mode="contained"
          onPress={onSignOut}
          style={[styles.button, { backgroundColor: theme.colors.primary }]}
          icon="logout"
        >
          Sign Out
        </Button>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f4f7",
    alignItems: "center",
    padding: 20,
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 25,
    marginTop: 10,
  },
  profileCard: {
    width: "95%",
    maxWidth: 400,
    marginBottom: 30,
    borderRadius: 15,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
  },
  profileContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
  },
  profileTextContainer: {
    marginLeft: 15,
    flexShrink: 1, // Allow text to wrap
  },
  profileName: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
  },
  profileEmail: {
    fontSize: 16,
    color: "#666",
    marginTop: 5,
  },
  profileDate: {
    fontSize: 14,
    color: "#888",
    marginTop: 5,
  },
  button: {
    width: "90%",
    marginTop: 20,
    padding: 5,
    borderRadius: 8,
    marginBottom: 15,
  },
});

export default SettingsScreen;
