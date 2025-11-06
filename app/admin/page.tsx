import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default async function AdminPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  return (
    <main className="container mx-auto px-4 py-10 md:py-14">
      <Card>
        <CardHeader>
          <CardTitle>Admin Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Join requests are now handled via Google Forms. Use the links below to manage site content.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/admin/announcements"
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-primary-foreground hover:opacity-90"
            >
              Manage Announcements
            </Link>
            <Link href="/admin/clubs" className="inline-flex items-center justify-center rounded-md border px-4 py-2">
              Manage Clubs
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
