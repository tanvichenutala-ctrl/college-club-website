import { ClubDetail } from "@/components/club-detail"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function ClubPage({ params }: { params: { id: string } }) {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Link href="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Clubs
          </Button>
        </Link>
        <ClubDetail clubId={params.id} />
      </div>
    </div>
  )
}
