import {
  GoogleSignin,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { deleteItemAsync, getItem, setItem } from "expo-secure-store";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { supabase } from "./supabase";

type User = {
  id: string;
  name: string;
  givenName?: string;
  familyName?: string;
  email: string;
  photo?: string | null;
  idToken: string | null;
};

type UserState = {
  isLoggedIn: boolean;
  onboarding_complete: boolean;
  user: User | null;
  silentSignIn: () => Promise<void>;
  SignIn: () => Promise<void>;
  SignOut: () => Promise<void>;
  checkOnboarding: () => Promise<void>;
};

export const useAuthStore = create<UserState>()(
  persist<UserState>(
    (set, get) => ({
      onboarding_complete: false,
      isLoggedIn: false,
      user: null,

      checkOnboarding: async () => {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) return;

        // ✅ El error era aquí, .single() devuelve { data, error } no { data: { profile } }
        const { data, error } = await supabase
          .from("profiles")
          .select("onboarding_completed")
          .eq("id", session.user.id)
          .single();

        if (error) {
          console.error("Error fetching profile:", error);
          return;
        }

        console.log(data);
        set({ onboarding_complete: data?.onboarding_completed ?? false });
      },

      silentSignIn: async () => {
        try {
          const currentUser = await GoogleSignin.getCurrentUser();
          if (currentUser) {
            const tokens = await GoogleSignin.getTokens();
            const user: User = {
              id: currentUser.user.id,
              name: currentUser.user.name || "",
              email: currentUser.user.email,
              photo: currentUser.user.photo,
              idToken: tokens.idToken,
            };
            set({ isLoggedIn: true, user });
          } else {
            set({ isLoggedIn: false, user: null });
          }
        } catch (error) {
          console.error("Silent sign in error:", error);
          set({ isLoggedIn: false, user: null });
        }
      },

      SignIn: async () => {
        try {
          await GoogleSignin.hasPlayServices();
          const response = await GoogleSignin.signIn();

          if (isSuccessResponse(response)) {
            const user: User = {
              id: response.data.user.id,
              name: response.data.user.name || "",
              email: response.data.user.email,
              photo: response.data.user.photo,
              idToken: response.data.idToken,
            };

            const { data, error } = await supabase.auth.signInWithIdToken({
              provider: "google",
              token: user.idToken!,
            });

            if (error) {
              console.error("Supabase error", error);
              set({ isLoggedIn: false, user: null });
              return;
            }

            // ✅ Checar onboarding después de autenticar
            const { data: profile, error: profileError } = await supabase
              .from("profiles")
              .select("onboarding_completed")
              .eq("id", data.user!.id)
              .single();

            if (profileError) {
              console.error("Error fetching profile:", profileError);
            }

            // ✅ onboarding_complete viene del profile, no de una variable inexistente
            set({
              isLoggedIn: true,
              user,
              onboarding_complete: profile?.onboarding_completed ?? false,
            });
          }
        } catch (error) {
          console.error(error);
        }
      },

      SignOut: async () => {
        try {
          await GoogleSignin.signOut();
        } catch (error) {
          console.error(error);
          if (isErrorWithCode(error)) {
            switch (error.code) {
              case statusCodes.IN_PROGRESS:
                break;
              case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
                break;
              default:
                break;
            }
          }
        }
        set({ isLoggedIn: false, user: null, onboarding_complete: false });
      },
    }),
    {
      name: "auth-store",
      storage: createJSONStorage(() => ({
        getItem,
        setItem,
        removeItem: deleteItemAsync,
      })),
    },
  ),
);
