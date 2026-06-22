import { useTheme } from '#/components/layout/theme-provider'
import { Toaster } from '#/components/ui/sonner'

export function ThemeToaster() {
  const { theme } = useTheme()
  return <Toaster richColors closeButton theme={theme} />
}
