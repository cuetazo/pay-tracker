import { Slot, useRouter } from "expo-router";
import { useEffect } from "react";
import { useAuthStore } from "../../utils/authStore";

export default function AuthLayout() {
  const { isLoggedIn } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (isLoggedIn) {
      router.replace("/(protected)");
    }
  }, [isLoggedIn, router]);

  return <Slot />;
}
