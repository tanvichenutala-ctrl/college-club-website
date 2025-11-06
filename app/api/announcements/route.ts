import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"

function getSupabase() {
  const cookieStore = cookies()
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options: any) {
        cookieStore.set({ name, value, ...options })
      },
      remove(name: string, options: any) {
        cookieStore.set({ name, value: "", ...options, maxAge: 0 })
      },
    },
  })
}

function getServiceSupabase() {
  // Use service role only on the server after verifying admin
  // Note: This does not use cookies
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    cookies: {
      get() {
        return undefined
      },
      set() {},
      remove() {},
    },
  })
}

export async function GET() {
  const supabase = getSupabase()
  const { data, error } = await supabase.from("announcements").select("*").order("created_at", { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: Request) {
  const supabase = getSupabase()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()
  if (userError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  // Try admin check with user client first (depends on admins RLS allowing self-read)
  const { data: adminRow, error: adminErr } = await supabase
    .from("admins")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle()

  let isAdmin = Boolean(adminRow && !adminErr)

  // Fallback to service-role for admin check if RLS blocks the read
  if (!isAdmin && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const service = getServiceSupabase()
      const { data: adminSR, error: adminSRErr } = await service
        .from("admins")
        .select("user_id")
        .eq("user_id", user.id)
        .maybeSingle()
      isAdmin = Boolean(adminSR && !adminSRErr)
    } catch {
      // swallow service errors; will result in Forbidden
    }
  }
  if (!isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const body = await req.json()
  // Only include commonly-present columns to reduce schema mismatch risk
  const payload: Record<string, any> = {
    title: body.title,
    content: body.content ?? null,
    location: body.location ?? null,
    event_date: body.event_date ?? null, // ISO string or null
    club_id: body.club_id ?? null,
    is_event: typeof body.is_event === "boolean" ? body.is_event : Boolean(body.event_date),
  }

  // Prefer user client; if RLS blocks write, fallback to service after admin verification
  let insertError: any = null
  const { error } = await supabase.from("announcements").insert(payload)
  insertError = error

  if (insertError && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const service = getServiceSupabase()
    const { error: svcErr } = await service.from("announcements").insert(payload)
    insertError = svcErr
  }

  if (insertError) return NextResponse.json({ error: insertError.message }, { status: 400 })

  // Avoid select to prevent RLS select failures; ask client to revalidate list
  return NextResponse.json({ ok: true }, { status: 201 })
}
