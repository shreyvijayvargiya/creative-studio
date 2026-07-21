/** Client-only image effect IDs applied via canvas. */
export type CreativeImageEffectId =
  | 'none'
  | 'shine'
  | 'tint-warm'
  | 'tint-cool'
  | 'tint-rose'
  | 'opacity'
  | 'blur'
  | 'ascii'

export interface CreativeImageEffectMeta {
  id: CreativeImageEffectId
  label: string
  /** Tiny preview swatch colour (or gradient hint). */
  swatch: string
}

export const CREATIVE_IMAGE_EFFECTS: CreativeImageEffectMeta[] = [
  { id: 'none', label: 'Original', swatch: 'transparent' },
  { id: 'shine', label: 'Shine', swatch: 'linear-gradient(135deg,#fff8,#0000 45%,#fff4)' },
  { id: 'tint-warm', label: 'Warm', swatch: '#f59e0b' },
  { id: 'tint-cool', label: 'Cool', swatch: '#38bdf8' },
  { id: 'tint-rose', label: 'Rose', swatch: '#f472b6' },
  { id: 'opacity', label: 'Opacity', swatch: '#94a3b8' },
  { id: 'blur', label: 'Blur', swatch: '#cbd5e1' },
  { id: 'ascii', label: 'ASCII', swatch: '#0f172a' },
]

const ASCII_CHARS = ' .:-=+*#%@'

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    if (!src.startsWith('data:') && !src.startsWith('blob:')) {
      image.crossOrigin = 'anonymous'
    }
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('Failed to load image for effects'))
    image.src = src
  })
}

/** Prefer a same-origin / blob URL so canvas export is not CORS-tainted. */
async function toDrawableUrl(src: string): Promise<string> {
  if (src.startsWith('data:') || src.startsWith('blob:')) {
    return src
  }

  try {
    const response = await fetch(src)
    if (!response.ok) return src
    const blob = await response.blob()
    return URL.createObjectURL(blob)
  } catch {
    return src
  }
}

function drawTint(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  color: string,
  alpha: number,
) {
  ctx.save()
  ctx.globalCompositeOperation = 'source-atop'
  ctx.fillStyle = color
  ctx.globalAlpha = alpha
  ctx.fillRect(0, 0, width, height)
  ctx.restore()
}

function drawShine(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const gradient = ctx.createLinearGradient(0, 0, width, height)
  gradient.addColorStop(0, 'rgba(255,255,255,0)')
  gradient.addColorStop(0.35, 'rgba(255,255,255,0.55)')
  gradient.addColorStop(0.45, 'rgba(255,255,255,0)')
  gradient.addColorStop(1, 'rgba(255,255,255,0.12)')
  ctx.save()
  ctx.globalCompositeOperation = 'soft-light'
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)
  ctx.restore()
}

function drawAscii(
  source: HTMLCanvasElement,
  target: CanvasRenderingContext2D,
  width: number,
  height: number,
) {
  const sample = document.createElement('canvas')
  const cols = 80
  const rows = Math.max(1, Math.round((cols * height) / width / 1.8))
  sample.width = cols
  sample.height = rows
  const sctx = sample.getContext('2d')
  if (!sctx) return

  sctx.drawImage(source, 0, 0, cols, rows)
  const { data } = sctx.getImageData(0, 0, cols, rows)

  target.fillStyle = '#0b1220'
  target.fillRect(0, 0, width, height)
  target.fillStyle = '#e2e8f0'
  target.font = `${Math.floor(height / rows)}px ui-monospace, SFMono-Regular, Menlo, monospace`
  target.textBaseline = 'top'

  const cellW = width / cols
  const cellH = height / rows

  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < cols; x += 1) {
      const i = (y * cols + x) * 4
      const r = data[i] ?? 0
      const g = data[i + 1] ?? 0
      const b = data[i + 2] ?? 0
      const a = data[i + 3] ?? 0
      if (a < 16) continue
      const brightness = (0.299 * r + 0.587 * g + 0.114 * b) / 255
      const char =
        ASCII_CHARS[
          Math.min(
            ASCII_CHARS.length - 1,
            Math.floor(brightness * (ASCII_CHARS.length - 1)),
          )
        ] ?? ' '
      target.fillText(char, x * cellW, y * cellH)
    }
  }
}

/**
 * Applies a client-only effect and returns a PNG data URL for preview/download.
 */
export async function applyCreativeImageEffect(
  sourceUrl: string,
  effectId: CreativeImageEffectId,
): Promise<string> {
  if (effectId === 'none') {
    return sourceUrl
  }

  const drawableUrl = await toDrawableUrl(sourceUrl)
  const image = await loadImage(drawableUrl)
  const width = image.naturalWidth || image.width
  const height = image.naturalHeight || image.height
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('Canvas is not available in this browser')
  }

  if (effectId === 'blur') {
    ctx.filter = 'blur(6px)'
    ctx.drawImage(image, 0, 0, width, height)
    ctx.filter = 'none'
    return canvas.toDataURL('image/png')
  }

  if (effectId === 'opacity') {
    ctx.clearRect(0, 0, width, height)
    ctx.globalAlpha = 0.55
    ctx.drawImage(image, 0, 0, width, height)
    ctx.globalAlpha = 1
    return canvas.toDataURL('image/png')
  }

  ctx.drawImage(image, 0, 0, width, height)

  if (effectId === 'shine') {
    drawShine(ctx, width, height)
    return canvas.toDataURL('image/png')
  }

  if (effectId === 'tint-warm') {
    drawTint(ctx, width, height, '#f59e0b', 0.28)
    return canvas.toDataURL('image/png')
  }

  if (effectId === 'tint-cool') {
    drawTint(ctx, width, height, '#38bdf8', 0.28)
    return canvas.toDataURL('image/png')
  }

  if (effectId === 'tint-rose') {
    drawTint(ctx, width, height, '#f472b6', 0.28)
    return canvas.toDataURL('image/png')
  }

  if (effectId === 'ascii') {
    const buffer = document.createElement('canvas')
    buffer.width = width
    buffer.height = height
    const bctx = buffer.getContext('2d')
    if (!bctx) {
      throw new Error('Canvas is not available in this browser')
    }
    bctx.drawImage(image, 0, 0, width, height)
    drawAscii(buffer, ctx, width, height)
    return canvas.toDataURL('image/png')
  }

  return canvas.toDataURL('image/png')
}
