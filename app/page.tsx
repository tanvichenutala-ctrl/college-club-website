import { Header } from "@/components/header"
import { Hero } from "@/components/hero"
import { AnnouncementsSection } from "@/components/announcements-section"
import { ClubsSection } from "@/components/clubs-section"
import { Footer } from "@/components/footer"

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Header />
      <Hero />
      <main className="container mx-auto px-4 py-8 md:py-12">
        <AnnouncementsSection />
        <ClubsSection />
      </main>
      <Footer />
    </div>
  )
}
