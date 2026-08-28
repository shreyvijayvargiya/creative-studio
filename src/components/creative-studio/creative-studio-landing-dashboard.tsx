import { useCallback, useEffect, useRef, useState } from 'react'
import type { DragEvent } from 'react'
import { useMutation } from '@tanstack/react-query'
import { ArrowLeft, Loader2, Plus, Sparkles, UploadCloud, X } from 'lucide-react'
import { toast } from 'sonner'

import { LandingThemeDropdown } from '#/components/creative-studio/landing-theme-dropdown'
import {
  LandingUpdateChat,
  createLandingChatId,
  landingReadyMessage,
} from '#/components/creative-studio/landing-update-chat'
import type { LandingChatMessage } from '#/components/creative-studio/landing-update-chat'
import { LandingVariantCard } from '#/components/creative-studio/landing-variant-card'
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
  MAX_LANDING_IMAGES,
  MAX_LANDING_PROMPT_CHARS,
  MIN_LANDING_IMAGES,
} from '#/lib/creative-studio/landing-config'
import type { LandingExportImage } from '#/lib/creative-studio/export-landing'
import {
  generateLandingPagesFn,
  reviseLandingPageFn,
} from '#/lib/server/creative-studio-landing'
import { cn } from '#/lib/utils'
import type {
  GeneratedLandingVariant,
  LandingStoredImage,
  LandingThemeMeta,
} from '#/types/creative-studio'

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
  for (const byte of bytes) {
    binary += String.fromCharCode(byte)
  }
  return btoa(binary)
}

function uploadsSignature(items: UploadItem[]) {
  return items.map((item) => `${item.file.name}:${item.file.size}:${item.file.lastModified}`).join('|')
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
  const reviseFn = useStableServerFn(reviseLandingPageFn)
  const [uploads, setUploads] = useState<UploadItem[]>([])
  const [dragActive, setDragActive] = useState(false)
  const [userPrompt, setUserPrompt] = useState('')
  const [themeId, setThemeId] = useState(
    themes.find((theme) => theme.id === DEFAULT_LANDING_THEME_ID)?.id ?? themes[0].id,
  )
  const [variants, setVariants] = useState<GeneratedLandingVariant[]>([])
  const [exportImages, setExportImages] = useState<LandingExportImage[]>([])
  const [storedImages, setStoredImages] = useState<LandingStoredImage[]>([])
  const [storedSignature, setStoredSignature] = useState('')
  const [phase, setPhase] = useState<'form' | 'results'>('form')
  const [chatMessages, setChatMessages] = useState<LandingChatMessage[]>([])
  const [briefSnapshot, setBriefSnapshot] = useState('')
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
    },
    [uploads.length],
  )

  const removeUpload = (id: string) => {
    setUploads((prev) => {
      const removed = prev.find((item) => item.id === id)
      if (removed) URL.revokeObjectURL(removed.previewUrl)
      return prev.filter((item) => item.id !== id)
    })
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
      if (uploads.length < MIN_LANDING_IMAGES || uploads.length > MAX_LANDING_IMAGES) {
        throw new Error(`Upload ${MIN_LANDING_IMAGES}–${MAX_LANDING_IMAGES} images`)
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
          images,
        },
      })

      return {
        ...result,
        exportImages: images.map((image, index) => ({
          path: result.imagePaths[index] ?? `/images/ref-${index + 1}.png`,
          imageBase64: `data:${image.mimeType};base64,${image.imageBase64}`,
        })),
        signature: uploadsSignature(uploads),
      }
    },
    onSuccess: (data) => {
      setVariants(data.variants)
      setExportImages(data.exportImages)
      setStoredImages(data.storedImages)
      setStoredSignature(data.signature)
      setChatMessages([landingReadyMessage()])
      setPhase('results')
      setBriefSnapshot(userPrompt.trim())
      toast.success('Landing page ready')
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Landing page generation failed')
    },
  })

  const reviseMutation = useMutation({
    mutationFn: async (editPrompt: string) => {
      const selected = variants[0]
      if (!selected.reactCode && !selected.htmlCode) {
        throw new Error('Generate a page before asking for updates')
      }

      const signature = uploadsSignature(uploads)
      const canReuseStored =
        storedImages.length >= MIN_LANDING_IMAGES && signature === storedSignature

      if (
        !canReuseStored &&
        (uploads.length < MIN_LANDING_IMAGES || uploads.length > MAX_LANDING_IMAGES)
      ) {
        throw new Error(`Upload ${MIN_LANDING_IMAGES}–${MAX_LANDING_IMAGES} images`)
      }

      const images = canReuseStored
        ? undefined
        : await Promise.all(
            uploads.map(async (item) => ({
              fileName: item.file.name,
              imageBase64: await fileToBase64(item.file),
              mimeType: item.file.type || 'image/png',
            })),
          )

      const result = await reviseFn({
        data: {
          themeId,
          userPrompt: briefSnapshot || userPrompt.trim(),
          editPrompt,
          layoutId: selected.layoutId,
          previousTitle: selected.title,
          previousReactCode: selected.reactCode,
          previousHtmlCode: selected.htmlCode,
          images,
          storedImages: canReuseStored ? storedImages : undefined,
          chatHistory: [
            ...chatMessages.slice(-5).map((item) => ({
              role: item.role,
              content: item.content.slice(0, 2000),
            })),
            { role: 'user' as const, content: editPrompt },
          ],
        },
      })

      return { ...result, signature }
    },
    onSuccess: (data) => {
      setVariants((prev) => [
        {
          ...prev[0],
          title: data.variant.title,
          reactCode: data.variant.reactCode,
          htmlCode: data.variant.htmlCode,
          error: undefined,
        },
      ])
      setStoredImages(data.storedImages)
      setStoredSignature(data.signature)
      setChatMessages((prev) => [
        ...prev,
        {
          id: createLandingChatId(),
          role: 'assistant',
          content: data.chatReply,
        },
      ])
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Could not update the page')
      setChatMessages((prev) => [
        ...prev,
        {
          id: createLandingChatId(),
          role: 'assistant',
          content:
            error instanceof Error
              ? `I could not apply that update: ${error.message}`
              : 'I could not apply that update. Try again.',
        },
      ])
    },
  })

  const onDrop = (e: DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    addFiles(e.dataTransfer.files)
  }

  const canGenerate =
    userPrompt.trim().length >= 8 &&
    Boolean(themeId) &&
    uploads.length >= MIN_LANDING_IMAGES &&
    uploads.length <= MAX_LANDING_IMAGES &&
    !generateMutation.isPending

  const pageSlug = slugify(userPrompt.slice(0, 40))
  const selectedTheme = themes.find((theme) => theme.id === themeId)
  const selectedVariant = variants[0]
  const view = generateMutation.isPending
    ? 'loading'
    : phase === 'results' && variants.length > 0
      ? 'results'
      : 'form'

  const handleChatSend = (text: string) => {
    setChatMessages((prev) => [
      ...prev,
      { id: createLandingChatId(), role: 'user', content: text },
    ])
    reviseMutation.mutate(text)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Landing Page Creator"
        description="Write a brief, add 3–10 photos, generate one page, then chat to update it."
      />

      {view === 'loading' ? (
        <div className="flex min-h-[420px] flex-col items-center justify-center gap-3 rounded-xl border bg-card px-6 py-20 text-center">
          <Loader2 className="size-8 animate-spin text-blue-600" />
          <p className="max-w-xs text-sm text-muted-foreground">
            Writing your React + Tailwind page…
          </p>
        </div>
      ) : null}

      {view === 'form' ? (
        <div className="mx-auto w-full max-w-2xl space-y-4">
          {variants.length > 0 ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setPhase('results')}
            >
              Back to generated page
            </Button>
          ) : null}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Brief</CardTitle>
              <CardDescription>
                Describe the product, audience, and offer. Photos are required and become
                hero and product shots.
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
                  setStoredImages([])
                  setStoredSignature('')
                  setPhase('form')
                  setChatMessages([])
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
              <CardTitle className="text-base">Images</CardTitle>
              <CardDescription>
                PNG, JPG, or WebP — {MIN_LANDING_IMAGES} to {MAX_LANDING_IMAGES} photos.
                Stored on generate and injected into the page as hero and product shots.
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
                  <p className="text-sm font-medium">Drop {MIN_LANDING_IMAGES}–{MAX_LANDING_IMAGES} product photos</p>
                  <p className="mt-1 text-xs text-muted-foreground">Required · PNG, JPG, or WebP</p>
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
              <p className="text-[11px] text-muted-foreground">
                {uploads.length}/{MAX_LANDING_IMAGES} images
                {uploads.length < MIN_LANDING_IMAGES
                  ? ` · add ${MIN_LANDING_IMAGES - uploads.length} more`
                  : ''}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <Button
                className="w-full"
                disabled={!canGenerate}
                onClick={() => generateMutation.mutate()}
              >
                {generateMutation.isPending ? (
                  <>
                    <Loader2 className="animate-spin" />
                    Writing page…
                  </>
                ) : (
                  <>
                    <Sparkles />
                    Generate landing page
                  </>
                )}
              </Button>
              {generateMutation.isError ? (
                <p className="mt-3 text-xs text-destructive">
                  {generateMutation.error instanceof Error
                    ? generateMutation.error.message
                    : 'Landing page generation failed'}
                </p>
              ) : null}
            </CardContent>
          </Card>
        </div>
      ) : null}

      {view === 'results' ? (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setPhase('form')}
            >
              <ArrowLeft />
              Edit brief
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px] lg:items-start">
            <LandingVariantCard
              key={selectedVariant.layoutId}
              variant={selectedVariant}
              slug={pageSlug}
              images={exportImages}
            />
            <div className="lg:sticky lg:top-4">
              <LandingUpdateChat
                messages={chatMessages}
                pending={reviseMutation.isPending}
                disabled={!selectedVariant.reactCode && !selectedVariant.htmlCode}
                onSend={handleChatSend}
              />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
