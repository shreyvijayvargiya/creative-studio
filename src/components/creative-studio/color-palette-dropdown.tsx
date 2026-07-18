import { useEffect, useMemo, useRef, useState } from 'react'
import { Check, ChevronsUpDown, Search } from 'lucide-react'

import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { COLOR_PALETTES } from '#/lib/creative-studio/config'
import { cn } from '#/lib/utils'
import type { CreativePaletteId, CreativePaletteMeta } from '#/types/creative-studio'

interface ColorPaletteDropdownProps {
  value: CreativePaletteId
  onChange: (id: CreativePaletteId) => void
  className?: string
}

function PaletteSwatches({ colors, size = 'sm' }: { colors: string[]; size?: 'sm' | 'md' }) {
  return (
    <span className="flex shrink-0 items-center gap-0.5">
      {colors.slice(0, 5).map((hex) => (
        <span
          key={hex}
          className={cn(
            'rounded-full border border-black/10 shadow-sm',
            size === 'sm' ? 'size-3.5' : 'size-4',
          )}
          style={{ backgroundColor: hex }}
          title={hex}
        />
      ))}
    </span>
  )
}

export function ColorPaletteDropdown({
  value,
  onChange,
  className,
}: ColorPaletteDropdownProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const rootRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  const selected = COLOR_PALETTES.find((p) => p.id === value) ?? COLOR_PALETTES[0]!

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return COLOR_PALETTES
    return COLOR_PALETTES.filter((palette) => {
      const haystack = [
        palette.label,
        palette.description,
        ...palette.keywords,
        ...palette.colors,
      ]
        .join(' ')
        .toLowerCase()
      return haystack.includes(q)
    })
  }, [query])

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

  const selectPalette = (palette: CreativePaletteMeta) => {
    onChange(palette.id)
    setOpen(false)
    setQuery('')
  }

  return (
    <div ref={rootRef} className={cn('relative space-y-2', className)}>
      <Label htmlFor="color-palette-trigger">Colour palette</Label>
      <Button
        id="color-palette-trigger"
        type="button"
        variant="outline"
        role="combobox"
        aria-expanded={open}
        className="h-auto w-full justify-between gap-3 px-3 py-2.5 font-normal"
        onClick={() => setOpen((prev) => !prev)}
      >
        <span className="flex min-w-0 flex-1 items-center gap-3 text-left">
          <PaletteSwatches colors={selected.colors} size="md" />
          <span className="min-w-0">
            <span className="block truncate text-sm font-medium">{selected.label}</span>
            <span className="block truncate text-xs text-muted-foreground">
              {selected.description}
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
              placeholder="Search palettes…"
              className="h-8 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
              aria-label="Search colour palettes"
            />
          </div>
          <ul className="max-h-64 overflow-y-auto p-1" role="listbox">
            {filtered.length === 0 ? (
              <li className="px-3 py-6 text-center text-sm text-muted-foreground">
                No palettes match “{query}”
              </li>
            ) : (
              filtered.map((palette) => {
                const active = palette.id === value
                return (
                  <li key={palette.id}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={active}
                      className={cn(
                        'flex w-full items-start gap-3 rounded-md px-2.5 py-2 text-left text-sm transition-colors hover:bg-accent',
                        active && 'bg-accent',
                      )}
                      onClick={() => selectPalette(palette)}
                    >
                      <PaletteSwatches colors={palette.colors} />
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center justify-between gap-2">
                          <span className="font-medium">{palette.label}</span>
                          {active ? <Check className="size-4 shrink-0" /> : null}
                        </span>
                        <span className="mt-0.5 block text-xs text-muted-foreground">
                          {palette.description}
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
