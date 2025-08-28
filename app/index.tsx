import React from "react";
import AuthForm from "./screens/AuthForm"; // Import AuthForm

// This file serves as the entry point for the unauthenticated state ('/')
// when using Expo Router. It simply renders the AuthForm.
export default function App() {
  return <AuthForm />;
}
