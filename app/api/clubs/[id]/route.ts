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

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const id = params.id
  const supabase = getSupabase()

  const { data, error } = await supabase.from("clubs").select("*").eq("id", id).single()
  if (error) return NextResponse.json({ error: error.message }, { status: 404 })
  return NextResponse.json(data)
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const id = params.id
  const supabase = getSupabase()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data: adminRow } = await supabase.from("admins").select("user_id").eq("user_id", user.id).maybeSingle()
  if (!adminRow) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const body = await req.json()
  const updates = {
    name: body.name,
    description: body.description ?? null,
    category: body.category ?? null,
    location: body.location ?? null,
    cover_image_url: body.cover_image_url ?? null,
    about: body.about ?? null,
    google_form_url: body.googleFormUrl ?? null,
  }

  const { data, error } = await supabase.from("clubs").update(updates).eq("id", id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data)
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const id = params.id
  const supabase = getSupabase()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data: adminRow } = await supabase.from("admins").select("user_id").eq("user_id", user.id).maybeSingle()
  if (!adminRow) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { error } = await supabase.from("clubs").delete().eq("id", id)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true })
}
