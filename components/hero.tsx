import Link from "next/link"

export function Hero() {
  return (
    <section className="border-b border-border bg-card">
      <div className="container mx-auto grid gap-6 px-4 py-12 md:grid-cols-2 md:items-center md:py-20">
        <div className="space-y-5">
          <h1 className="text-balance text-4xl font-bold tracking-tight md:text-5xl">Explore. Connect. Create.</h1>
          <p className="text-pretty text-muted-foreground md:text-lg">
            Discover student clubs, join upcoming events, and grow with a community that matches your interests.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="#clubs"
              className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
            >
              Browse Clubs
            </Link>
            <Link
              href="#announcements"
              className="rounded-md border border-border px-4 py-2 text-sm font-semibold text-foreground"
            >
              See Announcements
            </Link>
          </div>
        </div>
        <div className="rounded-lg border border-border bg-secondary p-6">
          <ul className="grid gap-3 text-sm text-muted-foreground md:grid-cols-2">
            <li className="rounded-md bg-background p-4">
              <span className="block text-xs font-semibold text-foreground/70">Upcoming</span>
              <span className="text-base font-semibold text-foreground">Campus Events</span>
            </li>
            <li className="rounded-md bg-background p-4">
              <span className="block text-xs font-semibold text-foreground/70">Categories</span>
              <span className="text-base font-semibold text-foreground">Technology to Arts</span>
            </li>
            <li className="rounded-md bg-background p-4">
              <span className="block text-xs font-semibold text-foreground/70">Join Requests</span>
              <span className="text-base font-semibold text-foreground">Fast & Simple</span>
            </li>
            <li className="rounded-md bg-background p-4">
              <span className="block text-xs font-semibold text-foreground/70">Admin</span>
              <span className="text-base font-semibold text-foreground">Moderate Easily</span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  )
}
