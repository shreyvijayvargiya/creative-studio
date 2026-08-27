import { useCallback, useEffect, useRef, useState, type DragEvent } from 'react'
import { useMutation } from '@tanstack/react-query'
import { LayoutTemplate, Loader2, Plus, Sparkles, UploadCloud, X } from 'lucide-react'
import { toast } from 'sonner'

import { LandingThemeDropdown } from '#/components/creative-studio/landing-theme-dropdown'
import { LandingVariantCard } from '#/components/creative-studio/landing-variant-card'
import { StudioPreviewPanel } from '#/components/creative-studio/studio-preview-panel'
import { Button } from '#/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { Label } from '#/components/ui/label'
import { PageHeader } from '#/components/ui/page-header'
import { Textarea } from '#/components/ui/textarea'
import { useStableServerFn } from '#/hooks/use-stable-server-fn'
import {
  DEFAULT_LANDING_THEME_ID,
  DEFAULT_LANDING_VARIANTS,
  MAX_LANDING_IMAGES,
  MAX_LANDING_PROMPT_CHARS,
  MAX_LANDING_VARIANTS,
  MIN_LANDING_VARIANTS,
} from '#/lib/creative-studio/landing-config'
import type { LandingExportImage } from '#/lib/creative-studio/export-landing'
import { generateLandingPagesFn } from '#/lib/server/creative-studio-landing'
import { cn } from '#/lib/utils'
import type { GeneratedLandingVariant, LandingThemeMeta } from '#/types/creative-studio'

interface UploadItem {
  id: string
  file: File
  previewUrl: string
}

interface CreativeStudioLandingDashboardProps {
  themes: LandingThemeMeta[]
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

function slugify(value: string) {
  return (
    value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'landing-page'
  )
}

export function CreativeStudioLandingDashboard({
  themes,
}: CreativeStudioLandingDashboardProps) {
  const generateFn = useStableServerFn(generateLandingPagesFn)
  const [uploads, setUploads] = useState<UploadItem[]>([])
  const [dragActive, setDragActive] = useState(false)
  const [userPrompt, setUserPrompt] = useState('')
  const [themeId, setThemeId] = useState(
    themes.find((theme) => theme.id === DEFAULT_LANDING_THEME_ID)?.id ?? themes[0]?.id ?? '',
  )
  const [count, setCount] = useState(DEFAULT_LANDING_VARIANTS)
  const [variants, setVariants] = useState<GeneratedLandingVariant[]>([])
  const [exportImages, setExportImages] = useState<LandingExportImage[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const uploadsRef = useRef(uploads)
  uploadsRef.current = uploads

  useEffect(() => {
    return () => {
      uploadsRef.current.forEach((item) => URL.revokeObjectURL(item.previewUrl))
    }
  }, [])

  const addFiles = useCallback(
    (incoming: FileList | File[] | undefined) => {
      const candidates = [...(incoming ?? [])].filter((item) =>
        /^image\/(jpeg|jpg|png|webp)$/i.test(item.type),
      )
      if ((incoming?.length ?? 0) > 0 && candidates.length === 0) {
        toast.error('Please upload PNG, JPG, or WebP files')
        return
      }

      const room = MAX_LANDING_IMAGES - uploads.length
      if (room <= 0) {
        toast.error(`You can upload up to ${MAX_LANDING_IMAGES} images`)
        return
      }

      const accepted = candidates.slice(0, room)
      if (candidates.length > room) {
        toast.error(`Only ${MAX_LANDING_IMAGES} images are allowed — extra files were skipped`)
      }

      setUploads((prev) => [
        ...prev,
        ...accepted.map((file) => ({
          id: `${file.name}-${file.size}-${file.lastModified}-${crypto.randomUUID()}`,
          file,
          previewUrl: URL.createObjectURL(file),
        })),
      ])
      setVariants([])
      setExportImages([])
    },
    [uploads.length],
  )

  const removeUpload = (id: string) => {
    setUploads((prev) => {
      const removed = prev.find((item) => item.id === id)
      if (removed) URL.revokeObjectURL(removed.previewUrl)
      return prev.filter((item) => item.id !== id)
    })
    setVariants([])
    setExportImages([])
  }

  const generateMutation = useMutation({
    mutationFn: async () => {
      const prompt = userPrompt.trim()
      if (prompt.length < 8) {
        throw new Error('Describe the landing page in a bit more detail')
      }
      if (!themeId) {
        throw new Error('Select a design theme')
      }

      const images = await Promise.all(
        uploads.map(async (item) => ({
          fileName: item.file.name,
          imageBase64: await fileToBase64(item.file),
          mimeType: item.file.type || 'image/png',
        })),
      )

      const result = await generateFn({
        data: {
          themeId,
          userPrompt: prompt,
          count,
          images,
        },
      })

      return {
        ...result,
        exportImages: images.map((image, index) => ({
          path: result.imagePaths[index] ?? `/images/ref-${index + 1}.png`,
          imageBase64: `data:${image.mimeType};base64,${image.imageBase64}`,
        })),
      }
    },
    onSuccess: (data) => {
      setVariants(data.variants)
      setExportImages(data.exportImages)
      toast.success(`Generated ${data.count} landing page variants`)
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Landing page generation failed')
    },
  })

  const onDrop = (e: DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    addFiles(e.dataTransfer.files)
  }

  const canGenerate =
    userPrompt.trim().length >= 8 && Boolean(themeId) && !generateMutation.isPending

  const pageSlug = slugify(userPrompt.slice(0, 40))
  const selectedTheme = themes.find((theme) => theme.id === themeId)

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Landing Page Creator"
        description="One brief, one design theme, multiple React + Tailwind pages — download as Vite, Next.js, or HTML."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[400px_1fr]">
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Brief</CardTitle>
              <CardDescription>
                Describe the product, audience, and offer. Optional photos become hero and
                product shots.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="landing-prompt">Prompt</Label>
                <Textarea
                  id="landing-prompt"
                  value={userPrompt}
                  onChange={(e) => setUserPrompt(e.target.value)}
                  placeholder="e.g. Northloop — climate analytics for mid-market manufacturers. Hero should sell a 14-day trial. Mention Scope 3 reporting, live factory dashboards, and a $49 / $199 pricing split."
                  maxLength={MAX_LANDING_PROMPT_CHARS}
                  rows={7}
                />
                <p className="text-right text-[11px] text-muted-foreground">
                  {userPrompt.length}/{MAX_LANDING_PROMPT_CHARS}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Theme</CardTitle>
              <CardDescription>
                {themes.length} design systems from prompts/. The selected theme is injected
                into the generator.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LandingThemeDropdown
                themes={themes}
                value={themeId}
                onChange={(id) => {
                  setThemeId(id)
                  setVariants([])
                  setExportImages([])
                }}
              />
              {selectedTheme ? (
                <p className="mt-2 text-[11px] text-muted-foreground">
                  Injecting {selectedTheme.fileName}
                </p>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Images (optional)</CardTitle>
              <CardDescription>
                PNG, JPG, or WebP — up to {MAX_LANDING_IMAGES}. Used as product / hero
                photography in the generated page.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {uploads.length > 0 ? (
                <div className="grid grid-cols-3 gap-2">
                  {uploads.map((item) => (
                    <div
                      key={item.id}
                      className="relative overflow-hidden rounded-xl border bg-muted"
                    >
                      <img
                        src={item.previewUrl}
                        alt={item.file.name}
                        className="h-24 w-full object-cover"
                      />
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
                  {uploads.length < MAX_LANDING_IMAGES ? (
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
                      <span className="text-[11px] text-muted-foreground">Add</span>
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
                    'flex w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-8 text-center transition-colors',
                    dragActive
                      ? 'border-primary bg-primary/5'
                      : 'border-muted-foreground/25 bg-muted/30 hover:border-muted-foreground/40',
                  )}
                >
                  <UploadCloud className="mb-2 size-7 text-muted-foreground" />
                  <p className="text-sm font-medium">Drop product or brand photos</p>
                  <p className="mt-1 text-xs text-muted-foreground">Optional · up to 10</p>
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
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Variants</CardTitle>
              <CardDescription>
                Generate {MIN_LANDING_VARIANTS}–{MAX_LANDING_VARIANTS} layout variants from the
                same brief and theme.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {Array.from(
                  { length: MAX_LANDING_VARIANTS - MIN_LANDING_VARIANTS + 1 },
                  (_, i) => MIN_LANDING_VARIANTS + i,
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
                    Writing {count} pages…
                  </>
                ) : (
                  <>
                    <Sparkles />
                    Generate {count} landing pages
                  </>
                )}
              </Button>
              {generateMutation.isError ? (
                <p className="text-xs text-destructive">
                  {generateMutation.error instanceof Error
                    ? generateMutation.error.message
                    : 'Landing page generation failed'}
                </p>
              ) : null}
            </CardContent>
          </Card>
        </div>

        <StudioPreviewPanel
          icon={LayoutTemplate}
          emptyLabel="Write a brief and pick a theme — generated landing pages show up here."
          loading={generateMutation.isPending}
          loadingLabel={`Writing ${count} React + Tailwind variants…`}
        >
          {variants.length > 0 ? (
            <div className="space-y-4">
              {variants.map((variant) => (
                <LandingVariantCard
                  key={variant.layoutId}
                  variant={variant}
                  slug={pageSlug}
                  images={exportImages}
                />
              ))}
            </div>
          ) : null}
        </StudioPreviewPanel>
      </div>
    </div>
  )
}
