import { useState } from 'react'
import { MoveHorizontal } from 'lucide-react'

import { Badge } from '#/components/ui/badge'
import { cn } from '#/lib/utils'

interface CompareSliderProps {
  before: string
  after: string
  className?: string
}

export function CompareSlider({ before, after, className }: CompareSliderProps) {
  const [pos, setPos] = useState(50)

  return (
    <div
      className={cn(
        'relative aspect-square w-full select-none overflow-hidden rounded-xl bg-muted',
        className,
      )}
    >
      <img
        src={after}
        alt="Generated"
        className="absolute inset-0 h-full w-full object-cover"
        draggable={false}
      />
      <div
        className="absolute inset-0 h-full overflow-hidden"
        style={{ width: `${pos}%` }}
      >
        <img
          src={before}
          alt="Original"
          className="h-full w-full object-cover"
          style={{ width: `${100 / (pos / 100)}%`, maxWidth: 'none' }}
          draggable={false}
        />
      </div>
      <div
        className="absolute inset-y-0 flex items-center"
        style={{ left: `${pos}%`, transform: 'translateX(-50%)' }}
      >
        <div className="h-full w-0.5 bg-background/90 shadow" />
        <div className="absolute -translate-x-1/2 rounded-full border bg-background p-1.5 shadow-md">
          <MoveHorizontal className="size-3.5 text-muted-foreground" />
        </div>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={pos}
        onChange={(e) => setPos(Number(e.target.value))}
        className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
        aria-label="Compare original and generated image"
      />
      <Badge
        variant="secondary"
        className="absolute left-2 top-2 bg-black/60 text-[10px] text-white hover:bg-black/60"
      >
        original
      </Badge>
      <Badge className="absolute right-2 top-2 text-[10px]">generated</Badge>
    </div>
  )
}
