import { Moon, Sun } from 'lucide-react'

import { useTheme } from '#/components/layout/theme-provider'
import { Button } from '#/components/ui/button'
import { cn } from '#/lib/utils'

interface ThemeToggleButtonProps {
  className?: string
}

export function ThemeToggleButton({ className }: ThemeToggleButtonProps) {
  const { theme, toggleTheme } = useTheme()

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={cn('shrink-0 rounded-full', className)}
      onClick={toggleTheme}
    >
      {theme === 'light' ? (
        <Moon className="size-4" />
      ) : (
        <Sun className="size-4" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
