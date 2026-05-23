import AvatarMenu from "@/components/AvatarMenu";
import { Colors } from "@/constants/theme_test";
import Entypo from "@expo/vector-icons/Entypo";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Tabs, useRouter } from "expo-router";
import { useEffect } from "react";
import { useAuthStore } from "../../utils/authStore";
export default function ProtectedLayout() {
  const { isLoggedIn } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isLoggedIn) {
      router.replace("/(auth)/login");
    }
  }, [isLoggedIn, router]);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary.main,
        animation: "fade",
        sceneStyle: {
          //backgroundColor: Colors.neutral.gray100,
        },
        headerStyle: {},
        tabBarStyle: {
          borderTopWidth: 0.8,
        },
        headerRight: () => <AvatarMenu />,
        tabBarInactiveTintColor: Colors.neutral.gray500,
        //tabBarActiveBackgroundColor: "teal",
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
        name="fourth"
        options={{
          //headerStyle: styles.container,
          title: "Fourth",
          tabBarIcon: ({ color, size }) => (
            <Entypo name="credit-card" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
