import { useCallback, useEffect, useMemo, useRef, useState, type DragEvent } from 'react'
import { useMutation } from '@tanstack/react-query'
import {
  ImageIcon,
  Instagram,
  Loader2,
  Pin,
  RefreshCcw,
  ShoppingBag,
  Sparkles,
  Store,
  UploadCloud,
  X,
} from 'lucide-react'
import { toast } from 'sonner'

// DEMO: generation is open — auth only via navbar Sign in
// import { useAuth } from '#/components/auth/auth-provider'
// import { useLoginModal } from '#/components/auth/login-modal-provider'
import { ColorPaletteDropdown } from '#/components/creative-studio/color-palette-dropdown'
import { CreativeVariantCard } from '#/components/creative-studio/creative-variant-card'
import { Button } from '#/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { Checkbox } from '#/components/ui/checkbox'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { PageHeader } from '#/components/ui/page-header'
import { Skeleton } from '#/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '#/components/ui/tabs'
import { useStableServerFn } from '#/hooks/use-stable-server-fn'
import {
  CREATIVE_DIMENSIONS,
  CREATIVE_PLATFORMS,
  DEFAULT_ASSET_COUNT,
  DEFAULT_DIMENSION_ID,
  DEFAULT_PALETTE_ID,
  MAX_ASSET_COUNT,
  MAX_DIMENSION_PX,
  MIN_ASSET_COUNT,
  MIN_DIMENSION_PX,
  formatsForPlatform,
  resolveCreativeDimension,
} from '#/lib/creative-studio/config'
import { generateCreatives } from '#/lib/server/creative-studio'
import { cn } from '#/lib/utils'
import type {
  CreativeDimensionId,
  CreativeFormatId,
  CreativePaletteId,
  CreativePlatformId,
  CreativeVariant,
} from '#/types/creative-studio'

const PLATFORM_ICONS = {
  etsy: Store,
  shopify: ShoppingBag,
  instagram: Instagram,
  pinterest: Pin,
} as const

function RatioPreview({ widthPx, heightPx }: { widthPx: number; heightPx: number }) {
  const max = 28
  const ratio = widthPx / heightPx
  const boxWidth = ratio >= 1 ? max : Math.max(10, max * ratio)
  const boxHeight = ratio >= 1 ? Math.max(10, max / ratio) : max

  return (
    <span
      className="shrink-0 rounded-[3px] border border-foreground/20 bg-muted"
      style={{ width: boxWidth, height: boxHeight }}
      aria-hidden
    />
  )
}

async function fileToBase64(file: File): Promise<string> {
  const buffer = await file.arrayBuffer()
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]!)
  }
  return btoa(binary)
}

export function CreativeStudioDashboard() {
  const generateFn = useStableServerFn(generateCreatives)

  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [platformId, setPlatformId] = useState<CreativePlatformId>('etsy')
  const [formatId, setFormatId] = useState<CreativeFormatId>('etsy-listing')
  const [dimensionId, setDimensionId] = useState<CreativeDimensionId>(DEFAULT_DIMENSION_ID)
  const [customWidth, setCustomWidth] = useState(1080)
  const [customHeight, setCustomHeight] = useState(1080)
  // Scene style fixed for demo UI (palette dropdown is the visible control)
  const styleId = 'studio' as const
  const [paletteId, setPaletteId] = useState<CreativePaletteId>(DEFAULT_PALETTE_ID)
  const [count, setCount] = useState(DEFAULT_ASSET_COUNT)
  const [productNotes, setProductNotes] = useState('')
  const [results, setResults] = useState<CreativeVariant[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  const resolvedDimension = useMemo(() => {
    try {
      return resolveCreativeDimension(
        dimensionId,
        dimensionId === 'custom' ? customWidth : undefined,
        dimensionId === 'custom' ? customHeight : undefined,
      )
    } catch {
      return null
    }
  }, [customHeight, customWidth, dimensionId])

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  const handleFile = useCallback((next: File | undefined) => {
    if (!next || !next.type.startsWith('image/')) {
      toast.error('Please upload a PNG, JPG, or WebP image')
      return
    }
    setFile(next)
    setResults([])
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return URL.createObjectURL(next)
    })
  }, [])

  const clearFile = () => {
    setFile(null)
    setResults([])
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return null
    })
  }

  const onPlatformChange = (next: string) => {
    const id = next as CreativePlatformId
    setPlatformId(id)
    const formats = formatsForPlatform(id)
    const first = formats[0]
    if (first) setFormatId(first.id)
    setResults([])
  }

  const generateMutation = useMutation({
    mutationFn: async () => {
      if (!file) throw new Error('Upload a product photo first')
      if (!resolvedDimension) throw new Error('Choose a valid dimension')

      const imageBase64 = await fileToBase64(file)
      return generateFn({
        data: {
          fileName: file.name,
          imageBase64,
          mimeType: file.type || 'image/jpeg',
          platformId,
          formatId,
          dimensionId,
          widthPx: resolvedDimension.widthPx,
          heightPx: resolvedDimension.heightPx,
          styleId,
          paletteId,
          count,
          productNotes: productNotes.trim() || undefined,
        },
      })
    },
    onSuccess: (data) => {
      setResults(data.variants)
      toast.success(`Generated ${data.variants.length} creatives`)
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Generation failed'
      toast.error(message)
    },
  })

  const onDrop = (e: DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    handleFile(e.dataTransfer.files?.[0])
  }

  const canGenerate =
    Boolean(file) &&
    Boolean(resolvedDimension) &&
    count >= MIN_ASSET_COUNT &&
    count <= MAX_ASSET_COUNT &&
    !generateMutation.isPending

  const handleVariantUpdated = useCallback((next: CreativeVariant) => {
    setResults((prev) =>
      prev.map((item) => (item.index === next.index ? next : item)),
    )
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <PageHeader
          title="Creative Studio"
          description="One product photo in — Etsy, Shopify, Instagram, and Pinterest creatives out."
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[400px_1fr]">
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Product photo</CardTitle>
              <CardDescription>PNG, JPG, or WebP — max 8MB</CardDescription>
            </CardHeader>
            <CardContent>
              {!previewUrl ? (
                <button
                  type="button"
                  onDragOver={(e) => {
                    e.preventDefault()
                    setDragActive(true)
                  }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={onDrop}
                  onClick={() => inputRef.current?.click()}
                  className={cn(
                    'flex w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors',
                    dragActive
                      ? 'border-primary bg-primary/5'
                      : 'border-muted-foreground/25 bg-muted/30 hover:border-muted-foreground/40',
                  )}
                >
                  <UploadCloud className="mb-2 size-7 text-muted-foreground" />
                  <p className="text-sm font-medium">Drop an image, or click to upload</p>
                  <p className="mt-1 text-xs text-muted-foreground">Clear product shot works best</p>
                  <input
                    ref={inputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    onChange={(e) => handleFile(e.target.files?.[0])}
                  />
                </button>
              ) : (
                <div className="relative overflow-hidden rounded-xl border">
                  <img
                    src={previewUrl}
                    alt="Uploaded product"
                    className="h-48 w-full object-cover"
                  />
                  <Button
                    type="button"
                    size="icon"
                    variant="secondary"
                    className="absolute right-2 top-2 size-8 rounded-full bg-black/60 text-white hover:bg-black/80"
                    onClick={clearFile}
                    aria-label="Remove image"
                  >
                    <X className="size-3.5" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Platform</CardTitle>
              <CardDescription>
                Marketplace context for the prompt — size is chosen separately below.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Tabs value={platformId} onValueChange={onPlatformChange}>
                <TabsList className="grid h-auto w-full grid-cols-2 gap-1 sm:grid-cols-4">
                  {CREATIVE_PLATFORMS.map((platform) => {
                    const Icon = PLATFORM_ICONS[platform.id]
                    return (
                      <TabsTrigger
                        key={platform.id}
                        value={platform.id}
                        className="flex flex-col gap-1 px-2 py-2 sm:flex-row"
                      >
                        <Icon className="size-4" />
                        <span className="text-xs sm:text-sm">{platform.label}</span>
                      </TabsTrigger>
                    )
                  })}
                </TabsList>

                {CREATIVE_PLATFORMS.map((platform) => (
                  <TabsContent key={platform.id} value={platform.id}>
                    <p className="text-xs text-muted-foreground">{platform.description}</p>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Dimension</CardTitle>
              <CardDescription>
                The API generates this exact pixel size. Pick a preset or enter a custom canvas.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                {CREATIVE_DIMENSIONS.map((dimension) => {
                  const active = dimensionId === dimension.id
                  const preview =
                    dimension.id === 'custom' && resolvedDimension
                      ? resolvedDimension
                      : dimension
                  return (
                    <button
                      key={dimension.id}
                      type="button"
                      onClick={() => {
                        setDimensionId(dimension.id)
                        setResults([])
                      }}
                      className={cn(
                        'flex items-start gap-2 rounded-lg border px-3 py-2.5 text-left text-sm transition-colors',
                        active
                          ? 'border-primary bg-primary/5'
                          : 'border-border bg-background hover:border-muted-foreground/30',
                      )}
                    >
                      <Checkbox
                        checked={active}
                        className="mt-0.5"
                        tabIndex={-1}
                        aria-hidden
                      />
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center justify-between gap-2">
                          <span className="font-medium">{dimension.label}</span>
                          <RatioPreview widthPx={preview.widthPx} heightPx={preview.heightPx} />
                        </span>
                        <span className="mt-0.5 block text-[11px] text-muted-foreground">
                          {dimension.id === 'custom'
                            ? 'Any width × height'
                            : `${dimension.widthPx}×${dimension.heightPx}px`}
                        </span>
                      </span>
                    </button>
                  )
                })}
              </div>

              {dimensionId === 'custom' ? (
                <div className="grid grid-cols-2 gap-3 rounded-lg border bg-muted/30 p-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="custom-width">Width (px)</Label>
                    <Input
                      id="custom-width"
                      type="number"
                      min={MIN_DIMENSION_PX}
                      max={MAX_DIMENSION_PX}
                      value={customWidth}
                      onChange={(e) => {
                        setCustomWidth(Number.parseInt(e.target.value, 10) || 0)
                        setResults([])
                      }}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="custom-height">Height (px)</Label>
                    <Input
                      id="custom-height"
                      type="number"
                      min={MIN_DIMENSION_PX}
                      max={MAX_DIMENSION_PX}
                      value={customHeight}
                      onChange={(e) => {
                        setCustomHeight(Number.parseInt(e.target.value, 10) || 0)
                        setResults([])
                      }}
                    />
                  </div>
                  <p className="col-span-2 text-[11px] text-muted-foreground">
                    {MIN_DIMENSION_PX}–{MAX_DIMENSION_PX}px. Output is forced to this canvas.
                  </p>
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Style</CardTitle>
              <CardDescription>
                Scene mood plus a searchable colour palette for the AI brief.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ColorPaletteDropdown
                value={paletteId}
                onChange={(id) => {
                  setPaletteId(id)
                  setResults([])
                }}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">How many assets?</CardTitle>
              <CardDescription>
                Generate {MIN_ASSET_COUNT}–{MAX_ASSET_COUNT} variants per run (distinct angles /
                layouts).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {Array.from(
                  { length: MAX_ASSET_COUNT - MIN_ASSET_COUNT + 1 },
                  (_, i) => MIN_ASSET_COUNT + i,
                ).map((n) => (
                  <Button
                    key={n}
                    type="button"
                    size="sm"
                    variant={count === n ? 'default' : 'outline'}
                    className="min-w-9"
                    onClick={() => setCount(n)}
                  >
                    {n}
                  </Button>
                ))}
              </div>

              <div className="space-y-2">
                <Label htmlFor="product-notes">Seller notes (optional)</Label>
                <Input
                  id="product-notes"
                  value={productNotes}
                  onChange={(e) => setProductNotes(e.target.value)}
                  placeholder="e.g. ceramic mug, keep blue glaze, gift-ready"
                  maxLength={500}
                />
              </div>

              <Button
                className="w-full"
                disabled={!canGenerate}
                onClick={() => generateMutation.mutate()}
              >
                {generateMutation.isPending ? (
                  <>
                    <Loader2 className="animate-spin" />
                    Generating {count} assets…
                  </>
                ) : (
                  <>
                    <Sparkles />
                    Generate {count} creatives
                  </>
                )}
              </Button>

              {generateMutation.isError ? (
                <p className="text-xs text-destructive">
                  {generateMutation.error instanceof Error
                    ? generateMutation.error.message
                    : 'Generation failed'}
                </p>
              ) : null}

              <p className="text-[11px] text-muted-foreground">
                Active canvas:{' '}
                <span className="font-medium text-foreground">
                  {resolvedDimension?.label ?? 'Invalid size'}
                </span>
                {resolvedDimension
                  ? ` · ${resolvedDimension.widthPx}×${resolvedDimension.heightPx}px · ${resolvedDimension.aspectRatio}`
                  : ` · enter ${MIN_DIMENSION_PX}–${MAX_DIMENSION_PX}px`}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="min-h-[420px]">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Results</CardTitle>
            <CardDescription>
              Compare original vs generated, apply effects, then download as PNG, JPEG, GIF, or SVG.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {results.length === 0 && !generateMutation.isPending ? (
              <div className="flex min-h-[320px] flex-col items-center justify-center rounded-xl border border-dashed text-center">
                <ImageIcon className="mb-2 size-8 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">
                  Generated creatives will appear here
                </p>
              </div>
            ) : null}

            {generateMutation.isPending ? (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Generating {count} creative{count > 1 ? 's' : ''} for{' '}
                  {CREATIVE_PLATFORMS.find((p) => p.id === platformId)?.label}…
                </p>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {Array.from({ length: count }, (_, i) => (
                    <div key={`loader-${i}`} className="space-y-2">
                      <Skeleton
                        className="w-full rounded-xl"
                        style={{
                          aspectRatio: resolvedDimension
                            ? `${resolvedDimension.widthPx} / ${resolvedDimension.heightPx}`
                            : '1 / 1',
                        }}
                      />
                      <div className="flex items-center justify-between gap-2">
                        <Skeleton className="h-3 w-20" />
                        <Skeleton className="h-7 w-20" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {results.length > 0 && previewUrl && file && !generateMutation.isPending ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {results.map((variant) => (
                  <CreativeVariantCard
                    key={`${variant.formatId}-${variant.index}`}
                    variant={variant}
                    beforeUrl={previewUrl}
                    file={file}
                    platformId={platformId}
                    formatId={formatId}
                    dimensionId={dimensionId}
                    widthPx={variant.widthPx || resolvedDimension?.widthPx || 1080}
                    heightPx={variant.heightPx || resolvedDimension?.heightPx || 1080}
                    styleId={styleId}
                    paletteId={paletteId}
                    count={count}
                    productNotes={productNotes}
                    disabled={generateMutation.isPending}
                    onVariantUpdated={handleVariantUpdated}
                  />
                ))}
                <Button
                  type="button"
                  variant="outline"
                  className="border-dashed sm:col-span-2"
                  onClick={() => generateMutation.mutate()}
                  disabled={!canGenerate}
                >
                  <RefreshCcw className="size-3.5" />
                  Regenerate all
                </Button>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
