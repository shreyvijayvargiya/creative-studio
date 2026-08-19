import { useCallback, useEffect, useMemo, useRef, useState, type DragEvent } from 'react'
import { useMutation } from '@tanstack/react-query'
import {
  ImageIcon,
  Instagram,
  Loader2,
  Pin,
  Plus,
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
import { Textarea } from '#/components/ui/textarea'
import { useStableServerFn } from '#/hooks/use-stable-server-fn'
import {
  CREATIVE_DIMENSIONS,
  CREATIVE_PLATFORMS,
  DEFAULT_ASSET_COUNT,
  DEFAULT_DIMENSION_ID,
  DEFAULT_PALETTE_ID,
  MAX_ASSET_COUNT,
  MAX_DIMENSION_PX,
  MAX_PROMPT_CHARS,
  MAX_REFERENCE_IMAGES,
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

interface UploadItem {
  id: string
  file: File
  previewUrl: string
}

export function CreativeStudioDashboard() {
  const generateFn = useStableServerFn(generateCreatives)

  const [uploads, setUploads] = useState<UploadItem[]>([])
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
  const uploadsRef = useRef(uploads)
  uploadsRef.current = uploads
  const primaryPreview = uploads[0]?.previewUrl ?? null
  const files = uploads.map((item) => item.file)

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
      uploadsRef.current.forEach((item) => URL.revokeObjectURL(item.previewUrl))
    }
  }, [])

  const addFiles = useCallback((incoming: FileList | File[] | undefined) => {
    const candidates = [...(incoming ?? [])].filter((item) =>
      item.type.startsWith('image/'),
    )
    if (candidates.length === 0) {
      toast.error('Please upload PNG, JPG, or WebP images')
      return
    }

    const room = MAX_REFERENCE_IMAGES - uploads.length
    if (room <= 0) {
      toast.error(`You can upload up to ${MAX_REFERENCE_IMAGES} images`)
      return
    }

    const accepted = candidates.slice(0, room)
    if (candidates.length > room) {
      toast.error(`Only ${MAX_REFERENCE_IMAGES} images are allowed — extra files were skipped`)
    }

    setUploads((prev) => [
      ...prev,
      ...accepted.map((file) => ({
        id: `${file.name}-${file.size}-${file.lastModified}-${crypto.randomUUID()}`,
        file,
        previewUrl: URL.createObjectURL(file),
      })),
    ])
    setResults([])
  }, [uploads.length])

  const removeUpload = (id: string) => {
    setUploads((prev) => {
      const next = prev.filter((item) => item.id !== id)
      const removed = prev.find((item) => item.id === id)
      if (removed) URL.revokeObjectURL(removed.previewUrl)
      return next
    })
    setResults([])
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
      if (uploads.length === 0) throw new Error('Upload at least one product photo')
      if (!resolvedDimension) throw new Error('Choose a valid dimension')

      const images = await Promise.all(
        uploads.map(async (item) => ({
          fileName: item.file.name,
          imageBase64: await fileToBase64(item.file),
          mimeType: item.file.type || 'image/jpeg',
        })),
      )

      return generateFn({
        data: {
          images,
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
    addFiles(e.dataTransfer.files)
  }

  const canGenerate =
    uploads.length > 0 &&
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
          description="Upload 1–3 product photos, write a prompt, and generate marketplace creatives."
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[400px_1fr]">
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Product photos</CardTitle>
              <CardDescription>
                Upload 1–{MAX_REFERENCE_IMAGES} PNG, JPG, or WebP images (max 8MB each). The AI
                combines them into one creative.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {uploads.length > 0 ? (
                <div className="grid grid-cols-3 gap-2">
                  {uploads.map((item, index) => (
                    <div
                      key={item.id}
                      className="relative overflow-hidden rounded-xl border bg-muted"
                    >
                      <img
                        src={item.previewUrl}
                        alt={item.file.name}
                        className="h-24 w-full object-cover"
                      />
                      <span className="absolute left-1.5 top-1.5 rounded bg-black/65 px-1.5 py-0.5 text-[10px] font-medium text-white">
                        {index === 0 ? 'Primary' : `Ref ${index + 1}`}
                      </span>
                      <Button
                        type="button"
                        size="icon"
                        variant="secondary"
                        className="absolute right-1.5 top-1.5 size-7 rounded-full bg-black/60 text-white hover:bg-black/80"
                        onClick={() => removeUpload(item.id)}
                        aria-label={`Remove ${item.file.name}`}
                      >
                        <X className="size-3.5" />
                      </Button>
                    </div>
                  ))}
                  {uploads.length < MAX_REFERENCE_IMAGES ? (
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
                        'flex h-24 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed text-center transition-colors',
                        dragActive
                          ? 'border-primary bg-primary/5'
                          : 'border-muted-foreground/25 bg-muted/30 hover:border-muted-foreground/40',
                      )}
                    >
                      <Plus className="mb-1 size-4 text-muted-foreground" />
                      <span className="text-[11px] text-muted-foreground">Add image</span>
                    </button>
                  ) : null}
                </div>
              ) : (
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
                  <p className="text-sm font-medium">Drop 1–3 images, or click to upload</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Extra angles or companion shots help the AI
                  </p>
                </button>
              )}
              <input
                ref={inputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                multiple
                className="hidden"
                onChange={(e) => {
                  addFiles(e.target.files ?? undefined)
                  e.target.value = ''
                }}
              />
              {uploads.length > 0 ? (
                <p className="text-[11px] text-muted-foreground">
                  {uploads.length}/{MAX_REFERENCE_IMAGES} images · first photo is the primary
                  product
                </p>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Prompt</CardTitle>
              <CardDescription>
                Tell the AI how to combine the photos — scene, lighting, props, and what to keep.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Label htmlFor="product-prompt" className="sr-only">
                Detailed prompt
              </Label>
              <Textarea
                id="product-prompt"
                value={productNotes}
                onChange={(e) => setProductNotes(e.target.value)}
                placeholder="e.g. Place the mug from photo 1 on a linen table using the wood texture from photo 2. Soft morning light, keep the blue glaze, gift-ready, extra space on the left for a headline."
                maxLength={MAX_PROMPT_CHARS}
                rows={6}
              />
              <p className="text-right text-[11px] text-muted-foreground">
                {productNotes.length}/{MAX_PROMPT_CHARS}
              </p>
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

            {results.length > 0 && primaryPreview && files.length > 0 && !generateMutation.isPending ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {results.map((variant) => (
                  <CreativeVariantCard
                    key={`${variant.formatId}-${variant.index}`}
                    variant={variant}
                    beforeUrl={primaryPreview}
                    files={files}
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
