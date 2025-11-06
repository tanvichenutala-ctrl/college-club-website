"use client"

import type * as React from "react"
import { Button } from "@/components/ui/button"

type JoinClubModalProps = {
  // Optional props to support different usages in the app
  googleFormUrl?: string
  className?: string
  children?: React.ReactNode
  club?: {
    id?: string
    name?: string
    googleFormUrl?: string
  }
  clubId?: string
  clubName?: string
}

// NOTE: Replace this with your actual Google Form URL.
// You can also pass a per-club URL via props.googleFormUrl or props.club.googleFormUrl.
const DEFAULT_GOOGLE_FORM_URL = process.env.NEXT_PUBLIC_JOIN_FORM_URL || "https://forms.gle/your-form-id"

function resolveFormUrl(props: JoinClubModalProps) {
  return props.googleFormUrl || props.club?.googleFormUrl || DEFAULT_GOOGLE_FORM_URL
}

// Named export to match existing imports elsewhere in the codebase.
export function JoinClubModal(props: JoinClubModalProps) {
  const href = resolveFormUrl(props)

  // If you want to pre-fill fields in your Google Form, map them here by
  // adding the right query params (entry.<field-id>=value). Left as a placeholder.
  // Example:
  // const params = new URLSearchParams()
  // if (props.clubName || props.club?.name) {
  //   params.set('entry.123456', props.clubName || props.club?.name || '')
  // }
  // const finalHref = params.size ? `${href}?${params.toString()}` : href

  const finalHref = href

  return (
    <a
      href={finalHref}
      target="_blank"
      rel="noopener noreferrer"
      className={props.className}
      aria-label="Join club (opens Google Form)"
    >
      {/* If parent passes a custom trigger, render it; otherwise show a default button */}
      {props.children ? props.children : <Button variant="default">Join Club</Button>}
    </a>
  )
}
