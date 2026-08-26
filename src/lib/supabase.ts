import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://wsgqgloccdomkmfvxgbf.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndzZ3FnbG9jY2RvbWttZnZ4Z2JmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc3NTgwMjksImV4cCI6MjEwMzMzNDAyOX0.CZgnQ_y0g7fsWDbbvu40a9Y_A7utT5wsM3j0nSxGbpQ";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
