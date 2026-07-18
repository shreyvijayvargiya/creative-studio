import { getObjectBlob } from '@better-upload/server/helpers'

import { getS3BucketName, getS3Client } from '#/lib/s3/client'

export async function downloadS3ObjectBuffer(key: string): Promise<Buffer> {
  const result = await getObjectBlob(getS3Client(), {
    bucket: getS3BucketName(),
    key,
  })

  const arrayBuffer = await result.blob.arrayBuffer()
  return Buffer.from(arrayBuffer)
}
