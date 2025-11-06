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

export default function ClubsManager() {
  const { toast } = useToast()
  const { data, mutate, isLoading, error } = useSWR("/api/clubs", fetcher)
  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "",
    location: "",
    cover_image_url: "",
    about: "",
    googleFormUrl: "",
  })
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleteClubName, setDeleteClubName] = useState<string>("")

  const clubs = Array.isArray(data) ? data : data?.data || []

  async function createClub() {
    try {
      const res = await fetch("/api/clubs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || "Failed to create club")
      }
      setForm({
        name: "",
        description: "",
        category: "",
        location: "",
        cover_image_url: "",
        about: "",
        googleFormUrl: "",
      })
      await mutate()
      toast({ title: "Club created" })
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" })
    }
  }

  async function remove(id: string) {
    try {
      const res = await fetch(`/api/clubs/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete")
      await mutate()
      toast({ title: "Club deleted successfully" })
      setDeleteId(null)
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" })
    }
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>New Club</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3">
          <Input
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
          <Textarea
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />
          <Textarea
            placeholder="About"
            value={form.about}
            onChange={(e) => setForm((f) => ({ ...f, about: e.target.value }))}
          />
          <Input
            placeholder="Google Form URL (optional)"
            value={form.googleFormUrl}
            onChange={(e) => setForm((f) => ({ ...f, googleFormUrl: e.target.value }))}
          />
          <div className="grid md:grid-cols-3 gap-3">
            <Input
              placeholder="Category"
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
            />
            <Input
              placeholder="Location"
              value={form.location}
              onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
            />
            <Input
              placeholder="Cover Image URL"
              value={form.cover_image_url}
              onChange={(e) => setForm((f) => ({ ...f, cover_image_url: e.target.value }))}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={createClub} disabled={!form.name}>
            Create
          </Button>
        </CardFooter>
      </Card>

      <div className="grid gap-4">
        {isLoading && <div>Loading...</div>}
        {error && <div className="text-destructive">Error loading clubs</div>}
        {clubs.length === 0 && !isLoading && <div className="text-muted-foreground">No clubs yet.</div>}
       <CardContent className="text-pretty">
  <div className="text-sm text-muted-foreground">
    {c.category || "Uncategorized"}
    {c.location ? ` • ${c.location}` : ""}
  </div>
  <p className="mt-2">{c.description}</p>

  {/* ✅ Add this section */}
  {c.googleFormUrl && (
    <a
      href={c.googleFormUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-block mt-3 text-blue-600 hover:underline"
    >
      Fill Registration Form →
    </a>
  )}
</CardContent>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Club</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteClubName}"? This action cannot be undone.
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
