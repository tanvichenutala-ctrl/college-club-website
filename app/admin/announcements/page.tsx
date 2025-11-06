import { Suspense } from "react"
import AnnouncementsManager from "@/components/admin/announcements-manager"

export default function AdminAnnouncementsPage() {
  return (
    <main className="max-w-5xl mx-auto p-4 md:p-8">
      <h1 className="text-2xl md:text-3xl font-semibold mb-4 text-foreground">Announcements</h1>
      <p className="text-muted-foreground mb-6">Create and manage announcements visible to all students.</p>
      <Suspense fallback={<div>Loading...</div>}>
        <AnnouncementsManager />
      </Suspense>
    </main>
  )
}
