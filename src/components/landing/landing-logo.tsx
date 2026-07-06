import { Link } from '@tanstack/react-router'

export function LandingLogo({ className }: { className?: string }) {
  return (
    <Link to="/" className={className}>
      <span className="inline-flex items-center gap-2">
        <span className="flex size-8 items-center justify-center rounded-lg bg-blue-600 text-white">
          <span className="text-xs font-semibold">▲</span>
        </span>
        <span className="text-sm font-semibold tracking-tight text-foreground max-[380px]:text-xs">
          Finance CRM
        </span>
      </span>
    </Link>
  )
}
