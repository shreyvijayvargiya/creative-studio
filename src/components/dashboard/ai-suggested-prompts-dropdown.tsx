import { ChevronDown, Lightbulb } from 'lucide-react'

import { AI_PROMPT_CATEGORIES } from '#/lib/ai/ai-prompts'
import { Button } from '#/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '#/components/ui/dropdown-menu'

interface AiSuggestedPromptsDropdownProps {
  onSelect: (prompt: string) => void
  disabled?: boolean
}

export function AiSuggestedPromptsDropdown({
  onSelect,
  disabled,
}: AiSuggestedPromptsDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled}
          className="mb-3 h-9 w-full justify-between gap-2 px-3 text-xs font-normal text-muted-foreground"
        >
          <span className="flex min-w-0 items-center gap-2">
            <Lightbulb className="size-3.5 shrink-0 text-primary" />
            <span className="truncate">Suggested prompts</span>
          </span>
          <ChevronDown className="size-3.5 shrink-0 opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="max-h-[min(20rem,50vh)] w-[var(--radix-dropdown-menu-trigger-width)] overflow-y-auto"
      >
        {AI_PROMPT_CATEGORIES.map((category, categoryIndex) => (
          <div key={category.label}>
            {categoryIndex > 0 ? <DropdownMenuSeparator /> : null}
            <DropdownMenuLabel className="text-[11px] uppercase tracking-wide text-muted-foreground">
              {category.label}
            </DropdownMenuLabel>
            {category.prompts.map((item) => (
              <DropdownMenuItem
                key={item.label}
                className="cursor-pointer text-xs leading-5"
                onClick={() => onSelect(item.prompt)}
              >
                {item.label}
              </DropdownMenuItem>
            ))}
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
