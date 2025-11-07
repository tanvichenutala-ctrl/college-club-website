"use client"

import { useState } from "react"
import useSWR from "swr"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin } from "lucide-react"

const categories = ["All", "Technology", "Arts", "Sports", "Social Service", "Training", "Cultural", "Entrepreneurship"]

const GOOGLE_FORM_URL = process.env.NEXT_PUBLIC_JOIN_FORM_URL || "https://forms.gle/your-form-id"

const fetcher = (url: string) =>
  fetch(url)
    .then((res) => {
      if (!res.ok) throw new Error("Failed to fetch")
      return res.json()
    })
    .catch(() => {
      return []
    })

export function ClubsSection() {
  const [selectedCategory, setSelectedCategory] = useState("All")

  const { data: clubs = [], isLoading, error } = useSWR("/api/clubs", fetcher)
  const staticClubs = [
    {
      id: "MVGR Glug",
      name: "Tech Club",
      description: "A club for tech enthusiasts and innovators.",
      category: "Technology",
      location: "Library",
      about: "We conduct hackathons, coding events, and workshops to foster innovation.",
      googleFormUrl:
        "https://docs.google.com/forms/d/e/1FAIpQLSdF8zx5gkzfKBpw36iNvXVrr1w8CFPUiU7QIPE7ILtTrAKuww/viewform?usp=header", // optional
    },
  ]
  const allClubs = [...staticClubs, ...(Array.isArray(clubs) ? clubs : clubs?.data || [])]

  const filteredClubs =
    selectedCategory === "All" ? allClubs : allClubs.filter((club: any) => club.category === selectedCategory)

  return (
    <section id="clubs" className="scroll-mt-20">
           {" "}
      <div className="mb-8">
                <h2 className="text-3xl font-bold text-balance mb-2">Clubs</h2>       {" "}
        <p className="text-muted-foreground text-pretty">Discover and join student organizations</p>     {" "}
      </div>
           {" "}
      <div className="mb-6 flex flex-wrap gap-2">
               {" "}
        {categories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(category)}
            className="rounded-full"
          >
                        {category}         {" "}
          </Button>
        ))}
             {" "}
      </div>
           {" "}
      {isLoading && (
        <div className="py-12 text-center">
                    <p className="text-muted-foreground">Loading clubs...</p>       {" "}
        </div>
      )}
           {" "}
      {error && (
        <div className="py-12 text-center">
                    <p className="text-destructive">Failed to load clubs. Please try again.</p>       {" "}
        </div>
      )}
           {" "}
      {!isLoading && !error && (
        <>
                   {" "}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                       {" "}
            {filteredClubs.map((club: any) => (
              <Card key={club.id} className="flex flex-col transition-all hover:shadow-sm">
                               {" "}
                <CardHeader>
                                   {" "}
                  <div className="flex items-start justify-between gap-4">
                                        <CardTitle className="text-xl text-balance">{club.name}</CardTitle>             
                          <Badge variant="secondary">{club.category}</Badge>                 {" "}
                  </div>
                                    <CardDescription className="text-pretty">{club.description}</CardDescription>       
                         {" "}
                </CardHeader>
                               {" "}
                <CardContent className="mt-auto space-y-4">
                                   {" "}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <MapPin className="h-4 w-4" />                    <span>{club.location}</span> 
                                   {" "}
                  </div>
                                   {" "}
                  <Button asChild className="w-full">
                                       {" "}
                    <a href={GOOGLE_FORM_URL} target="_blank" rel="noopener noreferrer">
                                            Join Club                    {" "}
                    </a>
                                     {" "}
                  </Button>
                                   {" "}
                  <Button asChild variant="outline" className="w-full bg-transparent">
                                        <a href={`/clubs/${club.id}`}>View Details</a>                 {" "}
                  </Button>
                                 {" "}
                </CardContent>
                             {" "}
              </Card>
            ))}
                     {" "}
          </div>
                   {" "}
          {filteredClubs.length === 0 && (
            <div className="py-12 text-center">
                            <p className="text-muted-foreground">No clubs found in this category.</p>           {" "}
            </div>
          )}
                 {" "}
        </>
      )}
         {" "}
    </section>
  )
}
