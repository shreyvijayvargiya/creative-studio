import { useEffect, useState } from 'react'
import { ChevronDown, Download, Loader2, Sparkles, Wand2 } from 'lucide-react'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'

import { CompareSlider } from '#/components/creative-studio/compare-slider'
import { Button } from '#/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '#/components/ui/dropdown-menu'
import { Input } from '#/components/ui/input'
import { Skeleton } from '#/components/ui/skeleton'
import { useStableServerFn } from '#/hooks/use-stable-server-fn'
import {
  CREATIVE_DOWNLOAD_FORMATS,
  downloadCreativeImage,
  type CreativeDownloadFormat,
} from '#/lib/creative-studio/export-image'
import {
  CREATIVE_IMAGE_EFFECTS,
  applyCreativeImageEffect,
  type CreativeImageEffectId,
} from '#/lib/creative-studio/image-effects'
import { regenerateCreative } from '#/lib/server/creative-studio'
import { cn } from '#/lib/utils'
import type {
  CreativeDimensionId,
  CreativeFormatId,
  CreativePaletteId,
  CreativePlatformId,
  CreativeStyleId,
  CreativeVariant,
} from '#/types/creative-studio'

interface CreativeVariantCardProps {
  variant: CreativeVariant
  beforeUrl: string
  files: File[]
  platformId: CreativePlatformId
  formatId: CreativeFormatId
  dimensionId: CreativeDimensionId
  widthPx: number
  heightPx: number
  styleId: CreativeStyleId
  paletteId: CreativePaletteId
  count: number
  productNotes: string
  disabled?: boolean
  onVariantUpdated: (variant: CreativeVariant) => void
}

export function CreativeVariantCard({
  variant,
  beforeUrl,
  files,
  platformId,
  formatId,
  dimensionId,
  widthPx,
  heightPx,
  styleId,
  paletteId,
  count,
  productNotes,
  disabled = false,
  onVariantUpdated,
}: CreativeVariantCardProps) {
  const regenerateFn = useStableServerFn(regenerateCreative)
  const [aiEditOpen, setAiEditOpen] = useState(false)
  const [editPrompt, setEditPrompt] = useState('')
  const [effectId, setEffectId] = useState<CreativeImageEffectId>('none')
  const [effectUrl, setEffectUrl] = useState(variant.url)
  const [effectPending, setEffectPending] = useState(false)
  const [downloadPending, setDownloadPending] = useState(false)

  const outputWidth = variant.widthPx || widthPx
  const outputHeight = variant.heightPx || heightPx

  useEffect(() => {
    let cancelled = false
    setEffectPending(true)

    void applyCreativeImageEffect(variant.url, effectId)
      .then((url) => {
        if (!cancelled) setEffectUrl(url)
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setEffectUrl(variant.url)
          const message =
            error instanceof Error ? error.message : 'Could not apply effect'
          toast.error(message)
        }
      })
      .finally(() => {
        if (!cancelled) setEffectPending(false)
      })

    return () => {
      cancelled = true
    }
  }, [effectId, variant.url])

  const regenerateMutation = useMutation({
    mutationFn: async () => {
      const images = await Promise.all(
        files.map(async (item) => {
          const buffer = await item.arrayBuffer()
          const bytes = new Uint8Array(buffer)
          let binary = ''
          for (let i = 0; i < bytes.length; i += 1) {
            binary += String.fromCharCode(bytes[i]!)
          }
          return {
            fileName: item.name,
            imageBase64: btoa(binary),
            mimeType: item.type || 'image/jpeg',
          }
        }),
      )

      return regenerateFn({
        data: {
          images,
          platformId,
          formatId,
          dimensionId,
          widthPx: outputWidth,
          heightPx: outputHeight,
          styleId,
          paletteId,
          count,
          variantIndex: variant.index,
          productNotes: productNotes.trim() || undefined,
          editPrompt: editPrompt.trim(),
          previousVariantUrl: variant.url.startsWith('data:')
            ? variant.url.length < 4_000_000
              ? variant.url
              : undefined
            : variant.url,
        },
      })
    },
    onSuccess: (data) => {
      onVariantUpdated(data.variant)
      setEffectId('none')
      setAiEditOpen(false)
      toast.success(`Variant ${variant.index + 1} regenerated`)
    },
    onError: (error) => {
      const message =
        error instanceof Error ? error.message : 'Regeneration failed'
      toast.error(message)
    },
  })

  const handleDownload = async (format: CreativeDownloadFormat) => {
    const meta = CREATIVE_DOWNLOAD_FORMATS.find((item) => item.id === format)
    const fileName = `${platformId}-${dimensionId}-${variant.index + 1}${
      effectId === 'none' ? '' : `-${effectId}`
    }.${meta?.extension ?? format}`

    setDownloadPending(true)
    try {
      await downloadCreativeImage({
        sourceUrl: effectUrl,
        fileName,
        format,
        widthPx: outputWidth,
        heightPx: outputHeight,
      })
      toast.success(`Downloaded ${meta?.label ?? format}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not download image')
    } finally {
      setDownloadPending(false)
    }
  }

  return (
    <div className="space-y-2 rounded-xl border border-border/70 p-2">
      {regenerateMutation.isPending ? (
        <div className="space-y-2">
          <Skeleton
            className="w-full rounded-xl"
            style={{ aspectRatio: `${outputWidth} / ${outputHeight}` }}
          />
          <p className="text-center text-xs text-muted-foreground">
            Regenerating with your edit…
          </p>
        </div>
      ) : (
        <CompareSlider
          before={beforeUrl}
          after={effectUrl}
          widthPx={outputWidth}
          heightPx={outputHeight}
        />
      )}

      <div className="flex flex-wrap items-center justify-between gap-2 px-1">
        <span className="text-xs font-medium text-muted-foreground">
          Variant {variant.index + 1} · {outputWidth}×{outputHeight}
        </span>
        <div className="flex flex-wrap items-center gap-1">
          <Button
            type="button"
            variant={aiEditOpen ? 'secondary' : 'ghost'}
            size="sm"
            className="h-8 gap-1 px-2 text-xs"
            disabled={disabled || regenerateMutation.isPending}
            onClick={() => setAiEditOpen((open) => !open)}
          >
            <Wand2 className="size-3.5" />
            AI edit
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 gap-1 px-2 text-xs"
                disabled={
                  effectPending ||
                  regenerateMutation.isPending ||
                  downloadPending
                }
              >
                {downloadPending ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Download className="size-3.5" />
                )}
                Download
                <ChevronDown className="size-3.5 opacity-70" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                {outputWidth}×{outputHeight}px
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {CREATIVE_DOWNLOAD_FORMATS.map((item) => (
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

      <div className="space-y-1.5 px-1">
        <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          Effects
        </p>
        <div className="flex flex-wrap gap-1.5">
          {CREATIVE_IMAGE_EFFECTS.map((effect) => {
            const active = effectId === effect.id
            return (
              <button
                key={effect.id}
                type="button"
                disabled={regenerateMutation.isPending}
                onClick={() => setEffectId(effect.id)}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full border px-2 py-1 text-[11px] transition-colors',
                  active
                    ? 'border-primary bg-primary/10 text-foreground'
                    : 'border-border bg-background text-muted-foreground hover:border-muted-foreground/40',
                )}
                title={effect.label}
              >
                <span
                  className="size-3 shrink-0 rounded-full border border-black/10"
                  style={{
                    background:
                      effect.id === 'none'
                        ? 'conic-gradient(from 90deg, #fff, #cbd5e1)'
                        : effect.swatch,
                  }}
                />
                {effect.label}
              </button>
            )
          })}
        </div>
      </div>

      {aiEditOpen ? (
        <div className="space-y-2 rounded-lg bg-muted/40 p-2">
          <Input
            value={editPrompt}
            onChange={(e) => setEditPrompt(e.target.value)}
            placeholder="e.g. warmer light, add soft linen backdrop, tighter crop"
            maxLength={2000}
            disabled={regenerateMutation.isPending}
          />
          <Button
            type="button"
            size="sm"
            className="w-full"
            disabled={
              disabled ||
              regenerateMutation.isPending ||
              editPrompt.trim().length === 0
            }
            onClick={() => regenerateMutation.mutate()}
          >
            {regenerateMutation.isPending ? (
              <>
                <Loader2 className="animate-spin" />
                Regenerating…
              </>
            ) : (
              <>
                <Sparkles />
                Regenerate this image
              </>
            )}
          </Button>
        </div>
      ) : null}
    </div>
  )
}
