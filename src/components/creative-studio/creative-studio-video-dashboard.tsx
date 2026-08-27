import { useCallback, useEffect, useRef, useState, type DragEvent } from 'react'
import { useMutation } from '@tanstack/react-query'
import {
  Clapperboard,
  Download,
  Loader2,
  Plus,
  Sparkles,
  UploadCloud,
  X,
} from 'lucide-react'
import { toast } from 'sonner'

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
  MAX_PROMPT_CHARS,
  MAX_REFERENCE_IMAGES,
} from '#/lib/creative-studio/config'
import {
  DEFAULT_VIDEO_FORMAT_ID,
  VIDEO_FORMATS,
  type VideoFormatId,
} from '#/lib/creative-studio/video-formats'
import { generateCreativeVideoFn } from '#/lib/server/creative-studio-video'
import { cn } from '#/lib/utils'
import type { GenerateCreativeVideoResult, VideoFormatMeta } from '#/types/creative-studio'

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

function FormatStoryboard({ format }: { format: VideoFormatMeta }) {
  const landscape = format.aspectRatio === '16:9'
  const square = format.aspectRatio === '1:1'

  return (
    <div
      className={cn(
        'relative mx-auto overflow-hidden rounded-md border bg-black/80',
        landscape ? 'w-full' : square ? 'w-[72%]' : 'w-[42%]',
      )}
      style={{ aspectRatio: format.aspectRatio.replace(':', ' / ') }}
    >
      <div
        className="absolute inset-0 opacity-80"
        style={{
          background: `linear-gradient(145deg, ${format.previewFrom}, ${format.previewTo})`,
        }}
      />
      <div className="absolute inset-0 flex">
        {format.beats.map((beat, index) => (
          <div
            key={beat}
            className={cn(
              'flex flex-1 flex-col items-center justify-end pb-1.5',
              index > 0 && 'border-l border-white/25',
            )}
          >
            <span className="rounded bg-black/55 px-1 py-0.5 text-[9px] font-medium text-white">
              {beat}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function CreativeStudioVideoDashboard() {
  const generateFn = useStableServerFn(generateCreativeVideoFn)
  const [uploads, setUploads] = useState<UploadItem[]>([])
  const [dragActive, setDragActive] = useState(false)
  const [formatId, setFormatId] = useState<VideoFormatId>(DEFAULT_VIDEO_FORMAT_ID)
  const [userPrompt, setUserPrompt] = useState('')
  const [result, setResult] = useState<GenerateCreativeVideoResult | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const uploadsRef = useRef(uploads)
  uploadsRef.current = uploads

  const selectedFormat =
    VIDEO_FORMATS.find((item) => item.id === formatId) ?? VIDEO_FORMATS[0]!

  useEffect(() => {
    return () => {
      uploadsRef.current.forEach((item) => URL.revokeObjectURL(item.previewUrl))
    }
  }, [])

  const addFiles = useCallback(
    (incoming: FileList | File[] | undefined) => {
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
      setResult(null)
    },
    [uploads.length],
  )

  const removeUpload = (id: string) => {
    setUploads((prev) => {
      const removed = prev.find((item) => item.id === id)
      if (removed) URL.revokeObjectURL(removed.previewUrl)
      return prev.filter((item) => item.id !== id)
    })
    setResult(null)
  }

  const generateMutation = useMutation({
    mutationFn: async () => {
      if (uploads.length === 0) throw new Error('Upload at least one reference image')
      const prompt = userPrompt.trim()
      if (!prompt) throw new Error('Write a prompt for the video')

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
          formatId,
          userPrompt: prompt,
        },
      })
    },
    onSuccess: (data) => {
      setResult(data)
      toast.success('Video ready')
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Video generation failed')
    },
  })

  const onDrop = (e: DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    addFiles(e.dataTransfer.files)
  }

  const canGenerate =
    uploads.length > 0 &&
    userPrompt.trim().length > 0 &&
    !generateMutation.isPending

  const handleDownload = () => {
    if (!result) return
    const anchor = document.createElement('a')
    anchor.href = result.url
    anchor.download = `creative-studio-${result.formatId}.mp4`
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
    toast.success('Video downloaded')
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Product Video"
        description="Pick a video format, add reference photos, and generate one short clip."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[400px_1fr]">
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Reference photos</CardTitle>
              <CardDescription>
                1–{MAX_REFERENCE_IMAGES} images. The first is the opening frame; extras
                become last-frame or style cues.
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
                        {index === 0 ? 'First' : index === uploads.length - 1 && uploads.length > 1 ? 'Last' : `Ref ${index + 1}`}
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
                    Product shots work best as the first frame
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
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Video format</CardTitle>
              <CardDescription>
                Each card previews how the clip is structured. The AI gets a detailed format
                brief for the one you pick.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-1 gap-2">
                {VIDEO_FORMATS.map((format) => {
                  const active = format.id === formatId
                  return (
                    <button
                      key={format.id}
                      type="button"
                      onClick={() => {
                        setFormatId(format.id as VideoFormatId)
                        setResult(null)
                      }}
                      className={cn(
                        'rounded-lg border p-2.5 text-left transition-colors',
                        active
                          ? 'border-primary bg-primary/5'
                          : 'border-border bg-background hover:border-muted-foreground/30',
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-[88px] shrink-0">
                          <FormatStoryboard format={format} />
                        </div>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center justify-between gap-2">
                            <span className="text-sm font-medium">{format.label}</span>
                            <span className="shrink-0 font-mono text-[10px] text-muted-foreground">
                              {format.aspectRatio} · {format.durationSeconds}s
                            </span>
                          </span>
                          <span className="mt-0.5 block text-[11px] text-muted-foreground">
                            {format.tagline}
                          </span>
                        </span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Prompt</CardTitle>
              <CardDescription>
                What should happen in the clip. Combined with the {selectedFormat.label} format
                brief on the server.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Label htmlFor="video-prompt" className="sr-only">
                Video prompt
              </Label>
              <Textarea
                id="video-prompt"
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
                placeholder="e.g. Ceramic mug on a sunny kitchen counter, steam rising, slow push-in, keep the blue glaze, no text on screen."
                maxLength={MAX_PROMPT_CHARS}
                rows={6}
              />
              <p className="text-right text-[11px] text-muted-foreground">
                {userPrompt.length}/{MAX_PROMPT_CHARS}
              </p>
              <Button
                className="w-full"
                disabled={!canGenerate}
                onClick={() => generateMutation.mutate()}
              >
                {generateMutation.isPending ? (
                  <>
                    <Loader2 className="animate-spin" />
                    Generating {selectedFormat.durationSeconds}s clip…
                  </>
                ) : (
                  <>
                    <Sparkles />
                    Generate video
                  </>
                )}
              </Button>
              {generateMutation.isError ? (
                <p className="text-xs text-destructive">
                  {generateMutation.error instanceof Error
                    ? generateMutation.error.message
                    : 'Video generation failed'}
                </p>
              ) : null}
              <p className="text-[11px] text-muted-foreground">
                One video per run · {selectedFormat.label} · {selectedFormat.aspectRatio} ·{' '}
                {selectedFormat.durationSeconds}s
              </p>
            </CardContent>
          </Card>
        </div>

        <StudioPreviewPanel
          icon={Clapperboard}
          emptyLabel="Pick a format and generate — the clip plays here."
          loading={generateMutation.isPending}
          loadingLabel="Generating a short clip. This can take a minute or two…"
        >
          {result ? (
            <div className="space-y-3">
              <div className="overflow-hidden rounded-xl border bg-black">
                <video
                  src={result.url}
                  controls
                  playsInline
                  className="mx-auto max-h-[640px] w-full"
                  style={{
                    aspectRatio: result.aspectRatio.replace(':', ' / '),
                    maxWidth: result.aspectRatio === '9:16' ? 360 : '100%',
                  }}
                />
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs text-muted-foreground">
                  {result.formatId} · {result.aspectRatio} · {result.durationSeconds}s
                </p>
                <Button type="button" size="sm" onClick={handleDownload}>
                  <Download className="size-3.5" />
                  Download MP4
                </Button>
              </div>
            </div>
          ) : null}
        </StudioPreviewPanel>
      </div>
    </div>
  )
}
