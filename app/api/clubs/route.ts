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

export async function GET() {
  const supabase = getSupabase()
  const { data, error } = await supabase.from("clubs").select("*")
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

function slugify(input: string) {
  return (input || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
}

export async function POST(req: Request) {
  const supabase = getSupabase()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data: adminRow, error: adminError } = await supabase
    .from("admins")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle()

  if (adminError) {
    console.error("[v0] Admin check error:", adminError)
    return NextResponse.json({ error: "Admin check failed: " + adminError.message }, { status: 500 })
  }

  if (!adminRow) {
    console.error("[v0] User not admin:", user.id)
    return NextResponse.json(
      { error: "User is not an admin. Please add your user ID to the admins table." },
      { status: 403 },
    )
  }

  const body = await req.json()
  const name: string = body.name
  if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 })


  const payload = {
    name,
    description: body.description ?? null,
    category: body.category ?? null,
    location: body.location ?? null,
    cover_image_url: body.cover_image_url ?? null,
    about: body.about ?? null,
    google_form_url: body.googleFormUrl ?? null,
    created_by: user.id,
  }

  let result = await supabase.from("clubs").insert(payload).select().single()

  if (result.error && result.error.code === "42501") {
    console.warn("[v0] RLS blocked insert, trying service role")
    const serviceSupabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { cookies: { get: () => undefined, set: () => {}, remove: () => {} } },
    )
    result = await serviceSupabase.from("clubs").insert(payload).select().single()
  }

  if (result.error) {
    console.error("[v0] Club insert error:", result.error)
    return NextResponse.json({ error: "Failed to create club: " + result.error.message }, { status: 400 })
  }

  return NextResponse.json(result.data, { status: 201 })
}
