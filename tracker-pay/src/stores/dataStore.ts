// stores/dataStore.ts
import { Database } from "@/services/db/schema";
import { supabase } from "@/stores/supabase";
import { create } from "zustand";

type Transaction = Database["public"]["Tables"]["transactions"]["Row"];
type Category = Database["public"]["Tables"]["category"]["Row"];
type Profile = {
  monthly_income: number;
  monthly_spending_limit: number;
  current_month_spending: number;
  onboarding_completed: boolean;
};

interface DataState {
  transactions: Transaction[];
  categories: Category[];
  profile: Profile | null;
  loadingTransactions: boolean;
  loadingCategories: boolean;
  loadingProfile: boolean;
  // No userId param — each fetcher reads the session internally
  fetchTransactions: () => Promise<void>;
  fetchCategories: () => Promise<void>;
  fetchProfile: () => Promise<void>;
  fetchAll: () => Promise<void>;
  reset: () => void;
}

/** Resolves the current user id from the active Supabase session. */
const getUserId = async (): Promise<string | null> => {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.user?.id ?? null;
};

export const useDataStore = create<DataState>((set) => ({
  transactions: [],
  categories: [],
  profile: null,
  loadingTransactions: false,
  loadingCategories: false,
  loadingProfile: false,

  fetchTransactions: async () => {
    const userId = await getUserId();
    if (!userId) return;
    set({ loadingTransactions: true });
    const { data } = await supabase
      .from("transactions")
      .select("*")
      .eq("userId", userId)
      .order("created_at", { ascending: false });
    set({ transactions: data ?? [], loadingTransactions: false });
  },

  fetchCategories: async () => {
    const userId = await getUserId();
    if (!userId) return;
    set({ loadingCategories: true });
    const { data } = await supabase
      .from("category")
      .select("*")
      .eq("userId", userId);
    set({ categories: data ?? [], loadingCategories: false });
  },

  fetchProfile: async () => {
    const userId = await getUserId();
    if (!userId) return;
    set({ loadingProfile: true });
    const { data } = await supabase
      .from("profiles")
      .select(
        "monthly_income, monthly_spending_limit, current_month_spending, onboarding_completed",
      )
      .eq("id", userId)
      .single();
    set({ profile: data ?? null, loadingProfile: false });
  },

  fetchAll: async () => {
    const userId = await getUserId();
    if (!userId) return;

    set({
      loadingTransactions: true,
      loadingCategories: true,
      loadingProfile: true,
    });

    const [txRes, catRes, profileRes] = await Promise.all([
      supabase
        .from("transactions")
        .select("*")
        .eq("userId", userId)
        .order("created_at", { ascending: false }),
      supabase.from("category").select("*").eq("userId", userId),
      supabase
        .from("profiles")
        .select(
          "monthly_income, monthly_spending_limit, current_month_spending, onboarding_completed",
        )
        .eq("id", userId)
        .single(),
    ]);

    set({
      transactions: txRes.data ?? [],
      categories: catRes.data ?? [],
      profile: profileRes.data ?? null,
      loadingTransactions: false,
      loadingCategories: false,
      loadingProfile: false,
    });
  },

  reset: () =>
    set({
      transactions: [],
      categories: [],
      profile: null,
      loadingTransactions: false,
      loadingCategories: false,
      loadingProfile: false,
    }),
}));
