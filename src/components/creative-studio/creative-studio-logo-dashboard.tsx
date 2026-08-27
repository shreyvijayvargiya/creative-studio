import { useCallback, useEffect, useRef, useState, type DragEvent } from 'react'
import { useMutation } from '@tanstack/react-query'
import {
  Hexagon,
  Loader2,
  Plus,
  Sparkles,
  UploadCloud,
  X,
} from 'lucide-react'
import { toast } from 'sonner'

import { CreativeLogoCard } from '#/components/creative-studio/creative-logo-card'
import { StudioPreviewPanel } from '#/components/creative-studio/studio-preview-panel'
import { Button } from '#/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { PageHeader } from '#/components/ui/page-header'
import { Textarea } from '#/components/ui/textarea'
import { useStableServerFn } from '#/hooks/use-stable-server-fn'
import {
  MAX_PROMPT_CHARS,
  MAX_REFERENCE_IMAGES,
} from '#/lib/creative-studio/config'
import { LOGO_GENERATE_COUNT, LOGO_STYLES } from '#/lib/creative-studio/logo-styles'
import { generateCreativeLogosFn } from '#/lib/server/creative-studio-logo'
import { cn } from '#/lib/utils'
import type { GeneratedLogoVariant } from '#/types/creative-studio'

interface UploadItem {
  id: string
  file: File
  previewUrl: string
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
      .replace(/^-|-$/g, '') || 'logo'
  )
}

export function CreativeStudioLogoDashboard() {
  const generateFn = useStableServerFn(generateCreativeLogosFn)
  const [uploads, setUploads] = useState<UploadItem[]>([])
  const [dragActive, setDragActive] = useState(false)
  const [brandName, setBrandName] = useState('')
  const [userPrompt, setUserPrompt] = useState('')
  const [logos, setLogos] = useState<GeneratedLogoVariant[]>([])
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
      const candidates = [...(incoming ?? [])].filter(
        (item) =>
          item.type.startsWith('image/') ||
          item.type === 'image/svg+xml' ||
          item.name.toLowerCase().endsWith('.svg'),
      )
      if (candidates.length === 0) {
        toast.error('Please upload PNG, JPG, WebP, or SVG files')
        return
      }

      const room = MAX_REFERENCE_IMAGES - uploads.length
      if (room <= 0) {
        toast.error(`You can upload up to ${MAX_REFERENCE_IMAGES} references`)
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
      setLogos([])
    },
    [uploads.length],
  )

  const removeUpload = (id: string) => {
    setUploads((prev) => {
      const removed = prev.find((item) => item.id === id)
      if (removed) URL.revokeObjectURL(removed.previewUrl)
      return prev.filter((item) => item.id !== id)
    })
    setLogos([])
  }

  const generateMutation = useMutation({
    mutationFn: async () => {
      const name = brandName.trim()
      const prompt = userPrompt.trim()
      if (!name && !prompt && uploads.length === 0) {
        throw new Error('Add a brand name, a prompt, or a reference image')
      }

      const images = await Promise.all(
        uploads.map(async (item) => ({
          fileName: item.file.name,
          imageBase64: await fileToBase64(item.file),
          mimeType:
            item.file.type ||
            (item.file.name.toLowerCase().endsWith('.svg')
              ? 'image/svg+xml'
              : 'image/png'),
        })),
      )

      return generateFn({
        data: {
          brandName: name || undefined,
          userPrompt: prompt || undefined,
          images,
        },
      })
    },
    onSuccess: (data) => {
      setLogos(data.logos)
      toast.success(`Generated ${data.count} logos`)
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Logo generation failed')
    },
  })

  const onDrop = (e: DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    addFiles(e.dataTransfer.files)
  }

  const canGenerate =
    (brandName.trim().length > 0 ||
      userPrompt.trim().length > 0 ||
      uploads.length > 0) &&
    !generateMutation.isPending

  const brandSlug = slugify(brandName || userPrompt.slice(0, 24) || 'brand')

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Logo Designer"
        description="Describe the brand — we write SVG code for 24 logo styles in parallel."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[400px_1fr]">
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Brand</CardTitle>
              <CardDescription>
                Name plus a short brief. Images are optional — a sketch, old logo, or colour
                cue.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="brand-name">Brand name</Label>
                <Input
                  id="brand-name"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  placeholder="e.g. Northloop"
                  maxLength={80}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="logo-prompt">Prompt</Label>
                <Textarea
                  id="logo-prompt"
                  value={userPrompt}
                  onChange={(e) => setUserPrompt(e.target.value)}
                  placeholder="e.g. Climate analytics SaaS, confident and bright, no globes, think northern light + loop. For a marketing site header and app icon."
                  maxLength={MAX_PROMPT_CHARS}
                  rows={5}
                />
                <p className="text-right text-[11px] text-muted-foreground">
                  {userPrompt.length}/{MAX_PROMPT_CHARS}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Reference (optional)</CardTitle>
              <CardDescription>
                PNG, JPG, WebP, or SVG — up to {MAX_REFERENCE_IMAGES}. The model redraws in
                vector, it does not trace a photo.
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
                  <p className="text-sm font-medium">Drop a sketch or existing logo</p>
                  <p className="mt-1 text-xs text-muted-foreground">Optional</p>
                </button>
              )}
              <input
                ref={inputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
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
              <CardTitle className="text-base">Styles</CardTitle>
              <CardDescription>
                {LOGO_GENERATE_COUNT} formats run in parallel — wordmarks, icons, lockups, and
                more.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-1.5">
                {LOGO_STYLES.map((style) => (
                  <div
                    key={style.id}
                    className="flex items-center gap-2 rounded-md border px-2 py-1.5"
                  >
                    <span
                      className="size-3.5 shrink-0 rounded-full border"
                      style={{
                        background: `linear-gradient(135deg, ${style.previewFrom}, ${style.previewTo})`,
                      }}
                    />
                    <span className="truncate text-[11px] font-medium">{style.label}</span>
                  </div>
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
                    Writing {LOGO_GENERATE_COUNT} SVGs…
                  </>
                ) : (
                  <>
                    <Sparkles />
                    Generate {LOGO_GENERATE_COUNT} logos
                  </>
                )}
              </Button>
              {generateMutation.isError ? (
                <p className="text-xs text-destructive">
                  {generateMutation.error instanceof Error
                    ? generateMutation.error.message
                    : 'Logo generation failed'}
                </p>
              ) : null}
            </CardContent>
          </Card>
        </div>

        <StudioPreviewPanel
          icon={Hexagon}
          emptyLabel="Add a name, prompt, or reference — generated logos show up here."
          loading={generateMutation.isPending}
          loadingLabel={`Writing ${LOGO_GENERATE_COUNT} SVG marks…`}
        >
          {logos.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {logos.map((logo) => (
                <CreativeLogoCard
                  key={logo.styleId}
                  logo={logo}
                  brandSlug={brandSlug}
                />
              ))}
            </div>
          ) : null}
        </StudioPreviewPanel>
      </div>
    </div>
  )
}
