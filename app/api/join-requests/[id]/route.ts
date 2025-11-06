import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const id = params?.id
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 })

  const supabase = await createClient()
  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser()
  if (authErr || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  let payload: any
  try {
    payload = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const status = payload?.status
  const admin_notes = payload?.admin_notes ?? null
  if (!["pending", "accepted", "rejected"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 })
  }

  const { data, error } = await supabase
    .from("join_requests")
    .update({ status, admin_notes })
    .eq("id", id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data }, { status: 200 })
}
