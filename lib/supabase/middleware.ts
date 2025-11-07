import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  const supabaseResponse = NextResponse.next({
    request,
  })

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // If env vars are missing, skip auth check and let the page load
  if (!url || !anonKey) {
    console.warn("[v0] Supabase env vars missing, skipping auth check")
    return supabaseResponse
  }

  const supabase = createSupabaseClient(url, anonKey)

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user && request.nextUrl.pathname.startsWith("/admin")) {
      const url = request.nextUrl.clone()
      url.pathname = "/auth/login"
      return NextResponse.redirect(url)
    }
  } catch (error) {
    console.warn("[v0] Auth check failed:", error)
    // Continue without auth if it fails - let the page load
  }

  return supabaseResponse
}
