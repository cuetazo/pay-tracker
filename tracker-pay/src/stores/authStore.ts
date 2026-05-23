// utils/authStore.ts
import {
  GoogleSignin,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { Session } from "@supabase/supabase-js";
import { deleteItemAsync, getItem, setItem } from "expo-secure-store";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { useDataStore } from "./dataStore";
import { supabase } from "./supabase";

type User = {
  id: string;
  googleId?: string;
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
  isLoading: boolean;
  user: User | null;
  session: Session | null;
  silentSignIn: () => Promise<void>;
  SignIn: () => Promise<void>;
  SignOut: () => Promise<void>;
  checkOnboarding: () => Promise<void>;
  refreshData: () => Promise<void>;
};

export const useAuthStore = create<UserState>()(
  persist(
    (set, get) => ({
      onboarding_complete: false,
      isLoggedIn: false,
      isLoading: true,
      user: null,
      session: null,

      // Single entry point to refresh all shared data across screens
      refreshData: async () => {
        await useDataStore.getState().fetchAll();
      },

      checkOnboarding: async () => {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) return;

        const { data, error } = await supabase
          .from("profiles")
          .select("onboarding_completed")
          .eq("id", session.user.id)
          .single();

        if (error) {
          console.error("Error fetching profile:", error);
          return;
        }
        set({ onboarding_complete: data?.onboarding_completed ?? false });
      },

      silentSignIn: async () => {
        try {
          set({ isLoading: true });

          const {
            data: { session },
          } = await supabase.auth.getSession();

          if (session) {
            set({
              session,
              isLoggedIn: true,
              user: {
                id: session.user.id,
                name:
                  session.user.user_metadata?.full_name ||
                  session.user.email?.split("@")[0] ||
                  "",
                email: session.user.email || "",
                photo: session.user.user_metadata?.avatar_url,
                idToken: null,
              },
            });
            await get().checkOnboarding();
            // Hydrate all screens after session is confirmed
            await get().refreshData();
            set({ isLoading: false });
            return;
          }

          const currentUser = await GoogleSignin.getCurrentUser();
          if (currentUser) {
            const tokens = await GoogleSignin.getTokens();
            const { data, error } = await supabase.auth.signInWithIdToken({
              provider: "google",
              token: tokens.idToken,
            });

            if (error) throw error;

            if (data.session) {
              set({
                session: data.session,
                isLoggedIn: true,
                user: {
                  id: data.user.id,
                  googleId: currentUser.user.id,
                  name: currentUser.user.name || "",
                  email: currentUser.user.email,
                  photo: currentUser.user.photo,
                  idToken: tokens.idToken,
                },
              });
              await get().checkOnboarding();
              await get().refreshData();
            }
          } else {
            set({ isLoggedIn: false, user: null, session: null });
          }
        } catch (error) {
          console.error("Silent sign in error:", error);
          set({ isLoggedIn: false, user: null, session: null });
        } finally {
          set({ isLoading: false });
        }
      },

      SignIn: async () => {
        try {
          set({ isLoading: true });
          await GoogleSignin.hasPlayServices();
          const response = await GoogleSignin.signIn();

          if (isSuccessResponse(response)) {
            const { data, error } = await supabase.auth.signInWithIdToken({
              provider: "google",
              token: response.data.idToken!,
            });

            if (error) {
              console.error("Supabase error", error);
              set({ isLoggedIn: false, user: null, session: null });
              return;
            }

            if (data.session) {
              const user: User = {
                id: data.user.id,
                googleId: response.data.user.id,
                name: response.data.user.name || "",
                email: response.data.user.email,
                photo: response.data.user.photo,
                idToken: response.data.idToken,
              };

              const { data: profile, error: profileError } = await supabase
                .from("profiles")
                .select("onboarding_completed")
                .eq("id", data.user.id)
                .single();

              if (profileError && profileError.code !== "PGRST116") {
                console.error("Error fetching profile:", profileError);
              }

              set({
                isLoggedIn: true,
                user,
                session: data.session,
                onboarding_complete: profile?.onboarding_completed ?? false,
              });

              // Hydrate all screens right after sign in
              await get().refreshData();
            }
          }
        } catch (error) {
          console.error("SignIn error:", error);
          if (isErrorWithCode(error)) {
            switch (error.code) {
              case statusCodes.SIGN_IN_CANCELLED:
                console.log("Usuario canceló el login");
                break;
              case statusCodes.IN_PROGRESS:
                console.log("Login en progreso");
                break;
              case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
                console.log("Play Services no disponible");
                break;
              default:
                console.log("Error desconocido:", error);
            }
          }
        } finally {
          set({ isLoading: false });
        }
      },

      SignOut: async () => {
        try {
          set({ isLoading: true });
          await GoogleSignin.signOut();
          await supabase.auth.signOut();
        } catch (error) {
          console.error("SignOut error:", error);
        } finally {
          // Wipe all shared data when the user logs out
          useDataStore.getState().reset();
          set({
            isLoggedIn: false,
            user: null,
            session: null,
            onboarding_complete: false,
            isLoading: false,
          });
        }
      },
    }),
    {
      name: "auth-store",
      storage: createJSONStorage(() => ({
        getItem: async (name: string) => {
          const value = await getItem(name);
          return value ? JSON.parse(value) : null;
        },
        setItem: async (name: string, value: any) => {
          await setItem(name, JSON.stringify(value));
        },
        removeItem: async (name: string) => {
          await deleteItemAsync(name);
        },
      })),
      partialize: (state) => {
        const { user, onboarding_complete } = state;
        return { user, onboarding_complete };
      },
    },
  ),
);
