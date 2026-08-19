export type CreativeDownloadFormat = 'png' | 'jpeg' | 'gif' | 'svg'

export interface CreativeDownloadFormatMeta {
  id: CreativeDownloadFormat
  label: string
  extension: string
}

export const CREATIVE_DOWNLOAD_FORMATS: CreativeDownloadFormatMeta[] = [
  { id: 'png', label: 'PNG', extension: 'png' },
  { id: 'jpeg', label: 'JPEG', extension: 'jpg' },
  { id: 'gif', label: 'GIF', extension: 'gif' },
  { id: 'svg', label: 'SVG', extension: 'svg' },
]

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    if (!src.startsWith('data:') && !src.startsWith('blob:')) {
      image.crossOrigin = 'anonymous'
    }
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('Failed to load image for download'))
    image.src = src
  })
}

async function toDrawableUrl(src: string): Promise<{ url: string; revoke: () => void }> {
  if (src.startsWith('data:') || src.startsWith('blob:')) {
    return { url: src, revoke: () => undefined }
  }

  const response = await fetch(src)
  if (!response.ok) throw new Error('Could not fetch image for download')
  const blob = await response.blob()
  const url = URL.createObjectURL(blob)
  return { url, revoke: () => URL.revokeObjectURL(url) }
}

function drawCover(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  width: number,
  height: number,
) {
  const sourceWidth = image.naturalWidth || image.width
  const sourceHeight = image.naturalHeight || image.height
  const scale = Math.max(width / sourceWidth, height / sourceHeight)
  const drawWidth = sourceWidth * scale
  const drawHeight = sourceHeight * scale
  ctx.drawImage(
    image,
    (width - drawWidth) / 2,
    (height - drawHeight) / 2,
    drawWidth,
    drawHeight,
  )
}

async function rasterizeExact(
  sourceUrl: string,
  widthPx: number,
  heightPx: number,
): Promise<HTMLCanvasElement> {
  const drawable = await toDrawableUrl(sourceUrl)
  try {
    const image = await loadImage(drawable.url)
    const canvas = document.createElement('canvas')
    canvas.width = widthPx
    canvas.height = heightPx
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Canvas is not available in this browser')
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, widthPx, heightPx)
    drawCover(ctx, image, widthPx, heightPx)
    return canvas
  } finally {
    drawable.revoke()
  }
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality?: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Could not encode image'))
          return
        }
        resolve(blob)
      },
      type,
      quality,
    )
  })
}

/** Uncompressed GIF89a so we can export a still without extra libraries. */
function encodeGif(width: number, height: number, rgba: Uint8ClampedArray): Blob {
  const bytes: number[] = []
  const put = (...values: number[]) => {
    for (const value of values) bytes.push(value & 0xff)
  }
  const put16 = (value: number) => {
    put(value & 0xff, (value >> 8) & 0xff)
  }

  put(0x47, 0x49, 0x46, 0x38, 0x39, 0x61)
  put16(width)
  put16(height)
  put(0xf7, 0x00, 0x00)

  for (let i = 0; i < 256; i += 1) {
    put(
      Math.round(((i >> 5) & 7) * (255 / 7)),
      Math.round(((i >> 2) & 7) * (255 / 7)),
      Math.round((i & 3) * (255 / 3)),
    )
  }

  put(0x2c)
  put16(0)
  put16(0)
  put16(width)
  put16(height)
  put(0x00, 0x08)

  const clear = 256
  const eoi = 257
  const codeSize = 9
  const stream: number[] = []
  let bitBuf = 0
  let bitCount = 0

  const emit = (code: number, size: number) => {
    bitBuf |= code << bitCount
    bitCount += size
    while (bitCount >= 8) {
      stream.push(bitBuf & 0xff)
      bitBuf >>= 8
      bitCount -= 8
    }
  }

  emit(clear, codeSize)
  let sinceClear = 0
  const pixelCount = width * height
  for (let i = 0; i < pixelCount; i += 1) {
    const offset = i * 4
    const r = rgba[offset] ?? 0
    const g = rgba[offset + 1] ?? 0
    const b = rgba[offset + 2] ?? 0
    const index = ((r >> 5) << 5) | ((g >> 5) << 2) | (b >> 6)
    emit(index, codeSize)
    sinceClear += 1
    if (sinceClear >= 128) {
      emit(clear, codeSize)
      sinceClear = 0
    }
  }
  emit(eoi, codeSize)
  if (bitCount > 0) stream.push(bitBuf & 0xff)

  for (let i = 0; i < stream.length; ) {
    const length = Math.min(255, stream.length - i)
    put(length)
    for (let j = 0; j < length; j += 1) put(stream[i + j]!)
    i += length
  }
  put(0x00, 0x3b)

  return new Blob([Uint8Array.from(bytes)], { type: 'image/gif' })
}

function triggerDownload(blob: Blob, fileName: string) {
  const objectUrl = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = objectUrl
  anchor.download = fileName
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(objectUrl)
}

export async function downloadCreativeImage(input: {
  sourceUrl: string
  fileName: string
  format: CreativeDownloadFormat
  widthPx: number
  heightPx: number
}): Promise<void> {
  const canvas = await rasterizeExact(input.sourceUrl, input.widthPx, input.heightPx)

  if (input.format === 'svg') {
    const pngUrl = canvas.toDataURL('image/png')
    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${input.widthPx}" height="${input.heightPx}" viewBox="0 0 ${input.widthPx} ${input.heightPx}">
  <image href="${pngUrl}" width="${input.widthPx}" height="${input.heightPx}"/>
</svg>`
    triggerDownload(new Blob([svg], { type: 'image/svg+xml' }), input.fileName)
    return
  }

  if (input.format === 'gif') {
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Canvas is not available in this browser')
    const { data } = ctx.getImageData(0, 0, input.widthPx, input.heightPx)
    triggerDownload(encodeGif(input.widthPx, input.heightPx, data), input.fileName)
    return
  }

  const mime = input.format === 'jpeg' ? 'image/jpeg' : 'image/png'
  const blob = await canvasToBlob(canvas, mime, input.format === 'jpeg' ? 0.92 : undefined)
  triggerDownload(blob, input.fileName)
}
