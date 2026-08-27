export type LogoDownloadFormat = 'svg' | 'png' | 'jpeg' | 'simple'

export const LOGO_DOWNLOAD_FORMATS: Array<{
  id: LogoDownloadFormat
  label: string
  extension: string
}> = [
  { id: 'svg', label: 'SVG', extension: 'svg' },
  { id: 'png', label: 'PNG', extension: 'png' },
  { id: 'jpeg', label: 'JPEG', extension: 'jpg' },
  { id: 'simple', label: 'Simple', extension: 'svg' },
]

export function toSimpleLogoSvg(svg: string): string {
  return svg
    .replace(/fill="(?!none|transparent)[^"]*"/gi, 'fill="#111111"')
    .replace(/stroke="(?!none|transparent)[^"]*"/gi, 'stroke="#111111"')
    .replace(/stop-color="[^"]*"/gi, 'stop-color="#111111"')
    .replace(/fill:\s*(?!none|transparent)[^;}"]+/gi, 'fill: #111111')
    .replace(/stroke:\s*(?!none|transparent)[^;}"]+/gi, 'stroke: #111111')
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

function svgToImage(svg: string): Promise<HTMLImageElement> {
  const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' })
  const url = URL.createObjectURL(blob)

  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => {
      URL.revokeObjectURL(url)
      resolve(image)
    }
    image.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Could not rasterize SVG'))
    }
    image.src = url
  })
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

export async function downloadLogoFile(input: {
  svg: string
  fileName: string
  format: LogoDownloadFormat
  sizePx?: number
}): Promise<void> {
  const markup = input.format === 'simple' ? toSimpleLogoSvg(input.svg) : input.svg

  if (input.format === 'svg' || input.format === 'simple') {
    triggerDownload(new Blob([markup], { type: 'image/svg+xml;charset=utf-8' }), input.fileName)
    return
  }

  const size = input.sizePx ?? 1024
  const image = await svgToImage(markup)
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas is not available in this browser')

  if (input.format === 'jpeg') {
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, size, size)
  }

  ctx.drawImage(image, 0, 0, size, size)
  const mime = input.format === 'jpeg' ? 'image/jpeg' : 'image/png'
  const blob = await canvasToBlob(canvas, mime, input.format === 'jpeg' ? 0.92 : undefined)
  triggerDownload(blob, input.fileName)
}
