"use client"
import useSWR from "swr"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Calendar } from "lucide-react"

const fetcher = (url: string) => fetch(url).then((res) => res.json())
const GOOGLE_FORM_URL = process.env.NEXT_PUBLIC_JOIN_FORM_URL || "https://forms.gle/your-form-id"

interface Club {
  id: string
  name: string
  description: string
  category: string
  location: string
  cover_image_url?: string
  about?: string
  googleFormUrl?: string
}

interface Announcement {
  id: string
  title: string
  content: string
  event_date: string
  is_event: boolean
  club_id: string
}

export function ClubDetail({ clubId }: { clubId: string }) {
  const { data: club, isLoading: clubLoading, error: clubError } = useSWR<Club>(`/api/clubs/${clubId}`, fetcher)

  const { data: allAnnouncements = [], isLoading: annLoading } = useSWR<Announcement[]>("/api/announcements", fetcher)

  const clubAnnouncements = allAnnouncements.filter((ann) => ann.club_id === clubId)

  const now = new Date()
  const upcomingAnnouncements = clubAnnouncements.filter((ann) => {
    const eventDate = new Date(ann.event_date)
    return eventDate >= now
  })

  const previousActivities = clubAnnouncements.filter((ann) => {
    const eventDate = new Date(ann.event_date)
    return eventDate < now
  })

  if (clubLoading) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">Loading club details...</p>
      </div>
    )
  }

  if (clubError || !club) {
    return (
      <div className="py-12 text-center">
        <p className="text-destructive">Failed to load club details.</p>
      </div>
    )
  }

  const joinUrl = club.googleFormUrl || GOOGLE_FORM_URL

  return (
    <div className="space-y-8">
      {/* About Section */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle className="text-3xl">{club.name}</CardTitle>
              <CardDescription className="text-base mt-2">{club.description}</CardDescription>
            </div>
            <Badge variant="secondary" className="text-sm">
              {club.category}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-5 w-5" />
            <span className="text-lg">{club.location}</span>
          </div>
          {club.about && (
            <div className="mt-4 pt-4 border-t">
              <h4 className="font-semibold mb-2">About</h4>
              <p className="text-muted-foreground whitespace-pre-wrap">{club.about}</p>
            </div>
          )}
          <Button asChild className="w-full md:w-auto">
            <a href={joinUrl} target="_blank" rel="noopener noreferrer">
              Join Club
            </a>
          </Button>
        </CardContent>
      </Card>

      {/* Upcoming Announcements */}
      <div>
        <h3 className="text-2xl font-bold mb-4">Upcoming Announcements & Events</h3>
        {upcomingAnnouncements.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">No upcoming announcements for this club.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {upcomingAnnouncements.map((ann) => (
              <Card key={ann.id}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <CardTitle className="text-lg">{ann.title}</CardTitle>
                    {ann.is_event && <Badge>Event</Badge>}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-muted-foreground">{ann.content}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(ann.event_date).toLocaleDateString()}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Previous Activities */}
      <div>
        <h3 className="text-2xl font-bold mb-4">Previous Activities</h3>
        {previousActivities.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">No previous activities for this club.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {previousActivities.map((ann) => (
              <Card key={ann.id} className="opacity-75">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <CardTitle className="text-lg">{ann.title}</CardTitle>
                    {ann.is_event && <Badge variant="outline">Past Event</Badge>}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-muted-foreground">{ann.content}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(ann.event_date).toLocaleDateString()}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
