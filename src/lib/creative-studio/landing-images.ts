import { getSupabaseAdmin } from '#/lib/supabase/admin'
import type { LandingStoredImage } from '#/types/creative-studio'

export const LANDING_IMAGE_BUCKET = 'documents'
export const MAX_LANDING_IMAGE_BYTES = 8 * 1024 * 1024

export function imagePublicPath(
  index: number,
  fileName: string,
  mimeType: string,
): string {
  const fromName = fileName.match(/\.(png|jpe?g|webp)$/i)?.[1]?.toLowerCase()
  const fromMime = mimeType.replace('image/', '').replace('jpeg', 'jpg')
  const ext = fromName === 'jpeg' ? 'jpg' : (fromName ?? fromMime)
  return `/images/ref-${index + 1}.${ext}`
}

export function landingStoragePath(input: {
  ownerId: string
  batchId: string
  index: number
  fileName: string
  mimeType: string
}): string {
  const publicPath = imagePublicPath(input.index, input.fileName, input.mimeType)
  const ext = publicPath.split('.').pop() ?? 'png'
  const owner = input.ownerId.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 80) || 'guest'
  const batch = input.batchId.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 80) || 'batch'
  return `landing/${owner}/${batch}/ref-${input.index + 1}.${ext}`
}

export function isLandingStoragePath(path: string): boolean {
  return /^landing\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+\/ref-\d+\.(png|jpe?g|webp)$/i.test(
    path,
  )
}

export function decodeLandingImageBase64(imageBase64: string): Buffer {
  const cleaned = imageBase64.replace(/^data:[^;]+;base64,/i, '')
  const buffer = Buffer.from(cleaned, 'base64')
  if (buffer.byteLength === 0) {
    throw new Error('Image file is empty')
  }
  if (buffer.byteLength > MAX_LANDING_IMAGE_BYTES) {
    throw new Error('Image is too large (max 8MB)')
  }
  return buffer
}

export async function storeLandingImages(input: {
  ownerId: string
  images: Array<{ imageBase64: string; mimeType: string; fileName: string }>
}): Promise<LandingStoredImage[]> {
  const batchId = crypto.randomUUID().replace(/-/g, '')
  const supabase = getSupabaseAdmin()

  return Promise.all(
    input.images.map(async (image, index) => {
      const buffer = decodeLandingImageBase64(image.imageBase64)
      const storagePath = landingStoragePath({
        ownerId: input.ownerId,
        batchId,
        index,
        fileName: image.fileName,
        mimeType: image.mimeType,
      })

      const { error } = await supabase.storage
        .from(LANDING_IMAGE_BUCKET)
        .upload(storagePath, buffer, {
          contentType: image.mimeType,
          upsert: true,
        })

      if (error) {
        throw new Error(`Failed to store landing image: ${error.message}`)
      }

      return {
        storagePath,
        publicPath: imagePublicPath(index, image.fileName, image.mimeType),
        fileName: image.fileName,
        mimeType: image.mimeType,
      }
    }),
  )
}

export async function loadLandingImages(
  stored: LandingStoredImage[],
): Promise<Array<{ imageBase64: string; mimeType: string; fileName: string }>> {
  const supabase = getSupabaseAdmin()

  return Promise.all(
    stored.map(async (image) => {
      if (!isLandingStoragePath(image.storagePath)) {
        throw new Error('Invalid landing image storage path')
      }

      const { data, error } = await supabase.storage
        .from(LANDING_IMAGE_BUCKET)
        .download(image.storagePath)

      if (error) {
        throw new Error(error.message)
      }

      const buffer = Buffer.from(await data.arrayBuffer())
      return {
        imageBase64: buffer.toString('base64'),
        mimeType: image.mimeType,
        fileName: image.fileName,
      }
    }),
  )
}
