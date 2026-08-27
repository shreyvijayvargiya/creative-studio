import { useEffect, useMemo, useRef, useState } from 'react'
import { Check, ChevronsUpDown, Search } from 'lucide-react'

import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { cn } from '#/lib/utils'
import type { LandingThemeMeta } from '#/types/creative-studio'

interface LandingThemeDropdownProps {
  themes: LandingThemeMeta[]
  value: string
  onChange: (id: string) => void
  className?: string
}

function ThemeSwatches({
  colors,
  size = 'sm',
}: {
  colors: string[]
  size?: 'sm' | 'md'
}) {
  return (
    <span
      className={cn(
        'flex shrink-0 overflow-hidden rounded-md border border-black/10 shadow-sm',
        size === 'sm' ? 'h-8 w-12' : 'h-10 w-14',
      )}
      aria-hidden
    >
      {colors.slice(0, 4).map((hex) => (
        <span key={hex} className="h-full flex-1" style={{ backgroundColor: hex }} title={hex} />
      ))}
    </span>
  )
}

export function LandingThemeDropdown({
  themes,
  value,
  onChange,
  className,
}: LandingThemeDropdownProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const rootRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  const selected = themes.find((theme) => theme.id === value) ?? themes[0]

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return themes
    return themes.filter((theme) => {
      const haystack = [theme.name, theme.tagline, theme.id, ...theme.previewColors]
        .join(' ')
        .toLowerCase()
      return haystack.includes(q)
    })
  }, [query, themes])

  useEffect(() => {
    if (!open) return

    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
        setQuery('')
      }
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
        setQuery('')
      }
    }

    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => searchRef.current?.focus())
    }
  }, [open])

  const selectTheme = (theme: LandingThemeMeta) => {
    onChange(theme.id)
    setOpen(false)
    setQuery('')
  }

  if (!selected) {
    return (
      <p className="text-sm text-muted-foreground">No design themes found in prompts/</p>
    )
  }

  return (
    <div ref={rootRef} className={cn('relative space-y-2', className)}>
      <Label htmlFor="landing-theme-trigger">Theme</Label>
      <Button
        id="landing-theme-trigger"
        type="button"
        variant="outline"
        role="combobox"
        aria-expanded={open}
        className="h-auto w-full justify-between gap-3 px-3 py-2.5 font-normal"
        onClick={() => setOpen((prev) => !prev)}
      >
        <span className="flex min-w-0 flex-1 items-center gap-3 text-left">
          <ThemeSwatches colors={selected.previewColors} size="md" />
          <span className="min-w-0">
            <span className="block truncate text-sm font-medium">{selected.name}</span>
            <span className="block truncate text-xs text-muted-foreground">
              {selected.tagline}
            </span>
          </span>
        </span>
        <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
      </Button>

      {open ? (
        <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-lg border bg-popover text-popover-foreground shadow-md">
          <div className="flex items-center gap-2 border-b px-3 py-2">
            <Search className="size-4 shrink-0 text-muted-foreground" />
            <Input
              ref={searchRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search themes…"
              className="h-8 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
              aria-label="Search landing page themes"
            />
          </div>
          <ul className="max-h-72 overflow-y-auto p-1" role="listbox">
            {filtered.length === 0 ? (
              <li className="px-3 py-6 text-center text-sm text-muted-foreground">
                No themes match “{query}”
              </li>
            ) : (
              filtered.map((theme) => {
                const active = theme.id === value
                return (
                  <li key={theme.id}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={active}
                      className={cn(
                        'flex w-full items-start gap-3 rounded-md px-2.5 py-2 text-left text-sm transition-colors hover:bg-accent',
                        active && 'bg-accent',
                      )}
                      onClick={() => selectTheme(theme)}
                    >
                      <ThemeSwatches colors={theme.previewColors} />
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center justify-between gap-2">
                          <span className="font-medium">{theme.name}</span>
                          {active ? <Check className="size-4 shrink-0" /> : null}
                        </span>
                        <span className="mt-0.5 block text-xs text-muted-foreground">
                          {theme.tagline}
                        </span>
                      </span>
                    </button>
                  </li>
                )
              })
            )}
          </ul>
        </div>
      ) : null}
    </div>
  )
}
