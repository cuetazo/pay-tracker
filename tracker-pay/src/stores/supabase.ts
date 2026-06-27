import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.EXPO_PUBLIC_VITE_SUPABASE_URL;
const supabaseKey =
  process.env.EXPO_PUBLIC_VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

//export const supabase = createClient(supabaseUrl, supabaseKey);
export const supabase = createClient(supabaseUrl!, supabaseKey!);
