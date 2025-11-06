import { Suspense } from "react"
import ClubsManager from "@/components/admin/clubs-manager"

export default function AdminClubsPage() {
  return (
    <main className="max-w-5xl mx-auto p-4 md:p-8">
      <h1 className="text-2xl md:text-3xl font-semibold mb-4 text-foreground">Clubs</h1>
      <p className="text-muted-foreground mb-6">Create and manage clubs shown to students.</p>
      <Suspense fallback={<div>Loading...</div>}>
        <ClubsManager />
      </Suspense>
    </main>
  )
}
