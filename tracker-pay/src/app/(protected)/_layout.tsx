import { Redirect, Slot } from "expo-router";

export const settings = {
  initialRouteName: "(protected)",
};

const isLoggedIn = false; // Replace with actual authentication logic

export default function ProtectedLayout() {
  if (!isLoggedIn) {
    // Redirect to login screen or show an unauthorized message
    return <Redirect href="/login" />;
  }
  return <Slot />;
}
