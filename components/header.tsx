import Link from "next/link"

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="text-xl font-semibold tracking-tight text-foreground">
            MVGR Clubs
          </Link>
          <nav className="flex items-center gap-2 md:gap-6">
            <Link
              href="#announcements"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Announcements
            </Link>
            <Link
              href="#clubs"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Clubs
            </Link>
            <Link
              href="/auth/login"
              aria-label="Admin Login"
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted-foreground hover:text-foreground md:hidden"
              title="Admin Login"
            >
              {/* simple profile icon */}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="opacity-80">
                <path
                  d="M12 12c2.761 0 5-2.239 5-5s-2.239-5-5-5-5 2.239-5 5 2.239 5 5 5Zm0 2c-4.418 0-8 2.239-8 5v1h16v-1c0-2.761-3.582-5-8-5Z"
                  fill="currentColor"
                />
              </svg>
            </Link>
            <Link
              href="/admin"
              className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-foreground md:inline-block"
            >
              Admin
            </Link>
            <Link
              href="#clubs"
              className="rounded-md bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground md:text-sm"
            >
              Browse Clubs
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}
