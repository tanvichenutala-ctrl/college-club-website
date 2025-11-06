import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"

function getSupabase() {
  const cookieStore = cookies()
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!, {
    cookies: {
      get: (n) => cookieStore.get(n)?.value,
      set: (n, v, o) => cookieStore.set({ name: n, value: v, ...o }),
      remove: (n, o) => cookieStore.set({ name: n, value: "", ...o, maxAge: 0 }),
    },
  })
}

function getServiceSupabase() {
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

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const id = params.id
  const supabase = getSupabase()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()
  if (userError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data: adminRow, error: adminErr } = await supabase
    .from("admins")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle()

  let isAdmin = Boolean(adminRow && !adminErr)
  if (!isAdmin && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const service = getServiceSupabase()
      const { data: adminSR, error: adminSRErr } = await service
        .from("admins")
        .select("user_id")
        .eq("user_id", user.id)
        .maybeSingle()
      isAdmin = Boolean(adminSR && !adminSRErr)
    } catch {}
  }
  if (!isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const body = await req.json()
  const updates: Record<string, any> = {
    title: body.title,
    content: body.content ?? null,
    location: body.location ?? null,
    event_date: body.event_date ?? null,
    is_event: typeof body.is_event === "boolean" ? body.is_event : Boolean(body.event_date),
    club_id: body.club_id ?? null,
  }

  let updError: any = null
  const { error } = await supabase.from("announcements").update(updates).eq("id", id)
  updError = error

  if (updError && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const service = getServiceSupabase()
    const { error: svcErr } = await service.from("announcements").update(updates).eq("id", id)
    updError = svcErr
  }

  if (updError) return NextResponse.json({ error: updError.message }, { status: 400 })
  return NextResponse.json({ ok: true })
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const id = params.id
  const supabase = getSupabase()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()
  if (userError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data: adminRow, error: adminErr } = await supabase
    .from("admins")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle()

  let isAdmin = Boolean(adminRow && !adminErr)
  if (!isAdmin && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const service = getServiceSupabase()
      const { data: adminSR, error: adminSRErr } = await service
        .from("admins")
        .select("user_id")
        .eq("user_id", user.id)
        .maybeSingle()
      isAdmin = Boolean(adminSR && !adminSRErr)
    } catch {}
  }
  if (!isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  let delError: any = null
  const { error } = await supabase.from("announcements").delete().eq("id", id)
  delError = error

  if (delError && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const service = getServiceSupabase()
    const { error: svcErr } = await service.from("announcements").delete().eq("id", id)
    delError = svcErr
  }

  if (delError) return NextResponse.json({ error: delError.message }, { status: 400 })
  return NextResponse.json({ ok: true })
}
