import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const clubName = body.clubName ?? body.club_name ?? body.club
    const studentName = body.studentName ?? body.student_name ?? body.name
    const email = body.email ?? body.student_email
    const phone = body.phone ?? body.contact ?? body.phone_number
    const reason = body.reason ?? body.message ?? null

    if (!clubName || !studentName || !email || !phone) {
      return new NextResponse("Missing required fields", { status: 400 })
    }

    const supabase = await createClient()
    const { error } = await supabase.from("join_requests").insert({
      club_name: clubName,
      student_name: studentName,
      email,
      phone,
      reason,
      status: "pending",
    })
    if (error) return new NextResponse(error.message, { status: 500 })
    return NextResponse.json({ ok: true })
  } catch {
    return new NextResponse("Invalid request", { status: 400 })
  }
}

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser()
  if (authErr || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data, error } = await supabase
    .from("join_requests")
    .select("id, created_at, club_name, student_name, email, phone, reason, status")
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ data }, { status: 200 })
}
