import Link from "next/link"

export function Footer() {
  return (
    <footer className="mt-16 border-t border-border">
      <div className="container mx-auto grid gap-6 px-4 py-10 md:grid-cols-3">
        <div>
          <div className="text-lg font-semibold">MVGR Clubs</div>
          <p className="mt-2 text-sm text-muted-foreground">
            A student-led portal to explore clubs, events, and opportunities.
          </p>
        </div>
        <nav className="grid gap-2 text-sm">
          <Link href="#announcements" className="text-muted-foreground hover:text-foreground">
            Announcements
          </Link>
          <Link href="#clubs" className="text-muted-foreground hover:text-foreground">
            Clubs
          </Link>
          <Link href="/admin" className="text-muted-foreground hover:text-foreground">
            Admin
          </Link>
        </nav>
        <div className="text-sm text-muted-foreground md:text-right">
          © {new Date().getFullYear()} MVGR. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
