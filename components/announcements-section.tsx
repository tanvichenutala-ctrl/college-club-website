"use client"

import useSWR from "swr"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin } from "lucide-react"

type APIAnnouncement = {
  id: string | number
  title?: string
  content?: string
  description?: string
  event_date?: string // preferred field from API/DB
  date?: string // fallback if API uses 'date'
  location?: string
  category?: string
  club_name?: string
}

const fetcher = (url: string) =>
  fetch(url, { cache: "no-store" })
    .then((res) => {
      if (!res.ok) throw new Error("Failed to fetch")
      return res.json()
    })
    .catch(() => {
      return []
    })

export function AnnouncementsSection() {
  const { data, error, isLoading } = useSWR<APIAnnouncement[]>("/api/announcements", fetcher, {
    revalidateOnFocus: false,
  })

  const items = Array.isArray(data) ? data : []

  // Normalize fields for UI consumption
  const normalized = items.map((a) => {
    const date = a.event_date ?? a.date ?? null
    return {
      id: a.id,
      title: a.title ?? "Untitled",
      description: a.description ?? a.content ?? "",
      date,
      location: a.location ?? "TBA",
      badge: a.category ?? a.club_name ?? "General",
    }
  })

  // Split into upcoming vs previous based on date, defaulting no-date to upcoming
  const now = new Date()
  const upcoming = normalized.filter((n) => !n.date || new Date(n.date) >= now)
  const previous = normalized.filter((n) => n.date && new Date(n.date) < now)

  return (
    <section id="announcements" className="mb-16 scroll-mt-20">
      <div className="mb-6">
        <h2 className="text-balance text-3xl font-bold tracking-tight md:text-4xl">Announcements</h2>
        <p className="text-pretty text-sm text-muted-foreground md:text-base">
          Stay updated with upcoming events and activities
        </p>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="grid gap-4 md:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-3">
                <div className="h-6 w-3/4 rounded bg-muted" />
              </CardHeader>
              <CardContent className="space-y-3 pt-0">
                <div className="h-4 w-full rounded bg-muted" />
                <div className="h-4 w-2/3 rounded bg-muted" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Error state */}
      {error && !isLoading && (
        <div className="text-sm text-destructive">Failed to load announcements. Please try again later.</div>
      )}

      {/* Upcoming */}
      {!isLoading && !error && (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            {upcoming.map((announcement) => (
              <Card key={announcement.id} className="transition-all hover:shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <CardTitle className="text-balance text-xl md:text-2xl">{announcement.title}</CardTitle>
                    <Badge variant="secondary" className="shrink-0">
                      {announcement.badge}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 pt-0">
                  {announcement.description && (
                    <p className="text-pretty text-sm text-muted-foreground md:text-base">{announcement.description}</p>
                  )}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    {announcement.date && (
                      <div className="inline-flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {new Date(announcement.date).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                    )}
                    {announcement.location && (
                      <div className="inline-flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>{announcement.location}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Empty state */}
          {upcoming.length === 0 && previous.length === 0 && (
            <div className="text-sm text-muted-foreground">No announcements yet. Check back soon.</div>
          )}

          {/* Previous Activities */}
          {previous.length > 0 && (
            <div className="mt-10">
              <h3 className="mb-3 text-balance text-2xl font-semibold tracking-tight">Previous Activities</h3>
              <div className="grid gap-4 md:grid-cols-2">
                {previous.map((announcement) => (
                  <Card key={announcement.id} className="transition-all hover:shadow-sm">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-4">
                        <CardTitle className="text-balance text-xl md:text-2xl">{announcement.title}</CardTitle>
                        <Badge variant="outline" className="shrink-0">
                          {announcement.badge}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3 pt-0">
                      {announcement.description && (
                        <p className="text-pretty text-sm text-muted-foreground md:text-base">
                          {announcement.description}
                        </p>
                      )}
                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        {announcement.date && (
                          <div className="inline-flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {new Date(announcement.date).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </span>
                          </div>
                        )}
                        {announcement.location && (
                          <div className="inline-flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            <span>{announcement.location}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </section>
  )
}
