import { useMemo, useState } from 'react'
import { ChevronDown, Code2, Download, Eye, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '#/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '#/components/ui/dropdown-menu'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '#/components/ui/tabs'
import {
  LANDING_DOWNLOAD_FORMATS,
  downloadLandingVariant,
  injectPreviewAssets,
  type LandingDownloadFormat,
  type LandingExportImage,
} from '#/lib/creative-studio/export-landing'
import { cn } from '#/lib/utils'
import type { GeneratedLandingVariant } from '#/types/creative-studio'

interface LandingVariantCardProps {
  variant: GeneratedLandingVariant
  slug: string
  images: LandingExportImage[]
}

function CodeBlock({ code, empty }: { code?: string; empty: string }) {
  if (!code) {
    return <p className="p-4 text-sm text-muted-foreground">{empty}</p>
  }

  return (
    <pre className="max-h-[480px] overflow-auto p-4 text-[11px] leading-relaxed">
      <code>{code}</code>
    </pre>
  )
}

export function LandingVariantCard({ variant, slug, images }: LandingVariantCardProps) {
  const [pending, setPending] = useState(false)
  const [tab, setTab] = useState('preview')

  const previewHtml = useMemo(() => {
    if (!variant.htmlCode) return ''
    const dataUrls = images.map((image) => ({
      path: image.path,
      dataUrl: image.imageBase64.startsWith('data:')
        ? image.imageBase64
        : `data:image/jpeg;base64,${image.imageBase64}`,
    }))
    return injectPreviewAssets(variant.htmlCode, dataUrls)
  }, [images, variant.htmlCode])

  const handleDownload = async (format: LandingDownloadFormat) => {
    setPending(true)
    try {
      await downloadLandingVariant({
        variant,
        format,
        slug: `${slug}-${variant.layoutId}`,
        images,
      })
      const meta = LANDING_DOWNLOAD_FORMATS.find((item) => item.id === format)
      toast.success(`Downloaded ${meta?.label ?? format}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Download failed')
    } finally {
      setPending(false)
    }
  }

  const copyCode = async (code: string | undefined, label: string) => {
    if (!code) return
    await navigator.clipboard.writeText(code)
    toast.success(`Copied ${label}`)
  }

  const canExport = Boolean(variant.reactCode || variant.htmlCode)

  return (
    <article className="overflow-hidden rounded-xl border border-border/70 bg-card">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b px-3 py-2.5">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">
            {variant.title || variant.label}
          </p>
          <p className="truncate text-[11px] text-muted-foreground">{variant.label}</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 gap-1"
              disabled={!canExport || pending}
            >
              {pending ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Download className="size-3.5" />
              )}
              Download
              <ChevronDown className="size-3.5 opacity-70" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {LANDING_DOWNLOAD_FORMATS.map((item) => (
              <DropdownMenuItem
                key={item.id}
                disabled={
                  (item.id !== 'html' && !variant.reactCode) ||
                  (item.id === 'html' && !variant.htmlCode && !variant.reactCode)
                }
                onClick={() => handleDownload(item.id)}
              >
                <span>
                  <span className="block">{item.label}</span>
                  <span className="block text-[11px] text-muted-foreground">
                    {item.description}
                  </span>
                </span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {variant.error && !canExport ? (
        <p className="p-4 text-sm text-destructive">{variant.error}</p>
      ) : (
        <Tabs value={tab} onValueChange={setTab} className="gap-0">
          <div className="flex items-center justify-between gap-2 border-b px-3 py-1.5">
            <TabsList className="h-8">
              <TabsTrigger value="preview" className="h-6 px-2 text-xs">
                <Eye className="size-3.5" />
                Preview
              </TabsTrigger>
              <TabsTrigger value="react" className="h-6 px-2 text-xs">
                <Code2 className="size-3.5" />
                React
              </TabsTrigger>
              <TabsTrigger value="html" className="h-6 px-2 text-xs">
                HTML
              </TabsTrigger>
            </TabsList>
            {tab === 'react' && variant.reactCode ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={() => copyCode(variant.reactCode, 'React code')}
              >
                Copy
              </Button>
            ) : null}
            {tab === 'html' && variant.htmlCode ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={() => copyCode(variant.htmlCode, 'HTML')}
              >
                Copy
              </Button>
            ) : null}
          </div>
          <TabsContent value="preview" className="mt-0">
            {previewHtml ? (
              <iframe
                title={`${variant.label} preview`}
                sandbox="allow-scripts"
                className="h-[540px] w-full bg-white"
                srcDoc={previewHtml}
              />
            ) : (
              <p className="p-4 text-sm text-muted-foreground">
                No HTML preview for this variant. Open the React tab or download a Vite / Next.js
                repo.
              </p>
            )}
          </TabsContent>
          <TabsContent value="react" className={cn('mt-0 bg-muted/30')}>
            <CodeBlock code={variant.reactCode} empty="No React / Tailwind code returned." />
          </TabsContent>
          <TabsContent value="html" className={cn('mt-0 bg-muted/30')}>
            <CodeBlock code={variant.htmlCode} empty="No HTML conversion returned." />
          </TabsContent>
        </Tabs>
      )}
    </article>
  )
}
