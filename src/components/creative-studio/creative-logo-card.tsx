import { useState } from 'react'
import { ChevronDown, Download, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '#/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '#/components/ui/dropdown-menu'
import {
  LOGO_DOWNLOAD_FORMATS,
  downloadLogoFile,
  type LogoDownloadFormat,
} from '#/lib/creative-studio/export-logo'
import type { GeneratedLogoVariant } from '#/types/creative-studio'

interface CreativeLogoCardProps {
  logo: GeneratedLogoVariant
  brandSlug: string
}

export function CreativeLogoCard({ logo, brandSlug }: CreativeLogoCardProps) {
  const [pending, setPending] = useState(false)

  const handleDownload = async (format: LogoDownloadFormat) => {
    if (!logo.svg) return
    const meta = LOGO_DOWNLOAD_FORMATS.find((item) => item.id === format)
    const fileName = `${brandSlug}-${logo.styleId}.${meta?.extension ?? 'svg'}`
    setPending(true)
    try {
      await downloadLogoFile({ svg: logo.svg, fileName, format })
      toast.success(`Downloaded ${meta?.label ?? format}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Download failed')
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="space-y-2 rounded-xl border border-border/70 p-2">
      <div className="flex aspect-square items-center justify-center overflow-hidden rounded-lg bg-[linear-gradient(45deg,#e5e5e5_25%,transparent_25%,transparent_75%,#e5e5e5_75%),linear-gradient(45deg,#e5e5e5_25%,transparent_25%,transparent_75%,#e5e5e5_75%)] bg-[length:16px_16px] bg-[position:0_0,8px_8px] dark:bg-[linear-gradient(45deg,#262626_25%,transparent_25%,transparent_75%,#262626_75%),linear-gradient(45deg,#262626_25%,transparent_25%,transparent_75%,#262626_75%)]">
        {logo.svg ? (
          <div
            className="h-[88%] w-[88%] [&_svg]:h-full [&_svg]:w-full"
            dangerouslySetInnerHTML={{ __html: logo.svg }}
          />
        ) : (
          <p className="px-3 text-center text-[11px] text-destructive">
            {logo.error ?? 'Failed'}
          </p>
        )}
      </div>
      <div className="flex items-center justify-between gap-1 px-0.5">
        <span className="truncate text-[11px] font-medium text-muted-foreground">
          {logo.label}
        </span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 gap-1 px-2 text-[11px]"
              disabled={!logo.svg || pending}
            >
              {pending ? (
                <Loader2 className="size-3 animate-spin" />
              ) : (
                <Download className="size-3" />
              )}
              Save
              <ChevronDown className="size-3 opacity-70" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-36">
            {LOGO_DOWNLOAD_FORMATS.map((item) => (
              <DropdownMenuItem
                key={item.id}
                className="cursor-pointer"
                onClick={() => void handleDownload(item.id)}
              >
                {item.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
