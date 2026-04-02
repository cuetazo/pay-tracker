import {
  GoogleSignin,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { deleteItemAsync, getItem, setItem } from "expo-secure-store";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type User = {
  id: string;
  name: string;
  givenName?: string;
  familyName?: string;
  email: string;
  photo?: string | null;
};

type UserState = {
  isLoggedIn: boolean;
  user: User | null;
  silentSignIn: () => Promise<void>;
  SignIn: () => Promise<void>;
  SignOut: () => Promise<void>;
};

export const useAuthStore = create<UserState>()(
  persist<UserState>(
    (set, get) => ({
      isLoggedIn: false,
      user: null,
      silentSignIn: async () => {
        try {
          const currentUser = await GoogleSignin.getCurrentUser();
          if (currentUser) {
            const user: User = {
              id: currentUser.user.id,
              name: currentUser.user.name || "",
              email: currentUser.user.email,
              photo: currentUser.user.photo,
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
          console.log("response", response);

          if (isSuccessResponse(response)) {
            const user: User = {
              id: response.data.user.id,
              name: response.data.user.name || "",
              email: response.data.user.email,
              photo: response.data.user.photo,
            };
            set({ isLoggedIn: true, user });
          } else {
            // sign in was cancelled by user
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
                // operation (eg. sign in) already in progress
                break;
              case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
                // Android only, play services not available or outdated
                break;
              default:
              // some other error happened
            }
          } else {
            // an error that's not related to google sign in occurred
          }
        }
        set({ isLoggedIn: false, user: null });
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
