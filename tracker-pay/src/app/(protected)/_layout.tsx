import Entypo from "@expo/vector-icons/Entypo";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Tabs, useRouter } from "expo-router";
import { useAuthStore } from "../../utils/authStore";
export default function ProtectedLayout() {
  const { isLoggedIn } = useAuthStore();
  const router = useRouter();

  /*  useEffect(() => {
    if (!isLoggedIn) {
      router.replace("/(auth)/login");
    }
  }, [isLoggedIn, router]);
 */
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "teal",
        animation: "fade",
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
          title: "Transactions",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="cash-sync" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="third"
        options={{
          title: "Third",
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
