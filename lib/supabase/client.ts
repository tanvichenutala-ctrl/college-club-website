import { createClient as createSupabaseClient } from "@supabase/supabase-js"

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    console.error("[v0] Missing Supabase environment variables")
    // Return a dummy client that won't crash
    return createSupabaseClient("https://placeholder.supabase.co", "placeholder-key")
  }

  return createSupabaseClient(url, anonKey)
}
