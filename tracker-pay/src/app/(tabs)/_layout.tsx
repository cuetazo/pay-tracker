import { Colors } from "@/constants/theme";
import { useAppColors } from "@/hooks/useAppColors";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Tabs, useRouter } from "expo-router";
import { useEffect } from "react";
import { useAuthStore } from "../../stores/authStore";
export default function ProtectedLayout() {
  const { isLoggedIn } = useAuthStore();
  const router = useRouter();
  const c = useAppColors();

  useEffect(() => {
    if (!isLoggedIn) {
      router.replace("/(auth)/login");
    }
  }, [isLoggedIn, router]);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: c.primary.main,
        animation: "fade",
        sceneStyle: {
          backgroundColor: c.primary.background,
        },
        headerStyle: {},
        tabBarStyle: {
          borderTopWidth: 0.8,
          borderTopColor: c.neutral.gray200,
          backgroundColor: c.neutral.white === "#0F172A" ? "#0F172A" : Colors.neutral.white,
        },
        tabBarInactiveTintColor: c.neutral.gray400,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarBadge: 3,
          tabBarBadgeStyle: { backgroundColor: "teal", color: "white" },
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="home" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="transactions"
        options={{
          title: "Transacciones",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="cash-sync" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="budgets"
        options={{
          title: "consumo",
          tabBarIcon: ({ color, size }) => (
            <FontAwesome5 name="piggy-bank" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: "Cuenta",
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="user" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
