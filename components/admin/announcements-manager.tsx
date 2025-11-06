"use client"

import useSWR from "swr"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Trash2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function AnnouncementsManager() {
  const { toast } = useToast()
  const { data, mutate, isLoading } = useSWR("/api/announcements", fetcher)
  const [form, setForm] = useState({
    title: "",
    content: "",
    event_date: "",
    location: "",
    club_id: "",
  })
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleteTitle, setDeleteTitle] = useState<string>("")

  async function createAnnouncement() {
    try {
      const res = await fetch("/api/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          event_date: form.event_date ? new Date(form.event_date).toISOString() : null,
          club_id: form.club_id || null,
        }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || "Failed to create announcement")
      }
      setForm({ title: "", content: "", event_date: "", location: "", club_id: "" })
      await mutate()
      toast({ title: "Announcement created" })
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" })
    }
  }

  async function remove(id: string) {
    try {
      const res = await fetch(`/api/announcements/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete")
      await mutate()
      toast({ title: "Announcement deleted successfully" })
      setDeleteId(null)
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" })
    }
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>New Announcement</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3">
          <Input
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          />
          <Textarea
            placeholder="Content"
            value={form.content}
            onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
          />
          <div className="grid md:grid-cols-3 gap-3">
            <Input
              type="datetime-local"
              placeholder="Event Date/Time"
              value={form.event_date}
              onChange={(e) => setForm((f) => ({ ...f, event_date: e.target.value }))}
            />
            <Input
              placeholder="Location (optional)"
              value={form.location}
              onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
            />
            <Input
              placeholder="Club ID (optional)"
              value={form.club_id}
              onChange={(e) => setForm((f) => ({ ...f, club_id: e.target.value }))}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={createAnnouncement} disabled={!form.title || !form.content}>
            Publish
          </Button>
        </CardFooter>
      </Card>

      <div className="grid gap-4">
        {isLoading && <div>Loading...</div>}
        {Array.isArray(data) && data.length === 0 && <div className="text-muted-foreground">No announcements yet.</div>}
        {Array.isArray(data) &&
          data.map((a: any) => (
            <Card key={a.id}>
              <CardHeader className="flex-row items-center justify-between gap-4">
                <CardTitle className="text-balance flex-1">{a.title}</CardTitle>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    setDeleteId(a.id)
                    setDeleteTitle(a.title)
                  }}
                  className="gap-2 whitespace-nowrap"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </Button>
              </CardHeader>
              <CardContent className="text-pretty">
                <p className="mb-2">{a.content}</p>
                <div className="text-sm text-muted-foreground">
                  {a.event_date ? new Date(a.event_date).toLocaleString() : "No date"} {a.location && `• ${a.location}`}
                </div>
              </CardContent>
            </Card>
          ))}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Announcement</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteTitle}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && remove(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
